import { useCallback, useEffect, useState } from "react";
import { useAccount, useChainId, useWalletClient } from "wagmi";
import { ethers } from "ethers";
import { useFhevm } from "@/fhevm/useFhevm";
import { useInMemoryStorage } from "./useInMemoryStorage";

// Contract ABI
const EncryptedSoilMoistureABI = [
  "function recordSoilMoisture(bytes32 encryptedMoisture, bytes calldata inputProof) external",
  "function getEncryptedSoilMoisture(address user) external view returns (bytes32)",
  "function hasInitialized(address user) external view returns (bool)",
  "function getLastUpdateTimestamp(address user) external view returns (uint256)",
  "event SoilMoistureRecorded(address indexed user, uint256 timestamp)",
  "event SoilMoistureUpdated(address indexed user, uint256 timestamp)",
];

interface UseSoilMoistureState {
  contractAddress: string | undefined;
  encryptedMoisture: string | undefined;
  decryptedMoisture: number | undefined;
  isLoading: boolean;
  message: string | undefined;
  recordMoisture: (moisture: number) => Promise<void>;
  decryptMoisture: () => Promise<void>;
  loadEncryptedMoisture: () => Promise<void>;
}

export function useSoilMoisture(contractAddress: string | undefined): UseSoilMoistureState {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();

  const [encryptedMoisture, setEncryptedMoisture] = useState<string | undefined>(undefined);
  const [decryptedMoisture, setDecryptedMoisture] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [ethersSigner, setEthersSigner] = useState<ethers.JsonRpcSigner | undefined>(undefined);
  const [ethersProvider, setEthersProvider] = useState<ethers.JsonRpcProvider | undefined>(undefined);

  // Get EIP1193 provider
  const eip1193Provider = useCallback(() => {
    if (chainId === 31337) {
      return "http://localhost:8545";
    }
    if (walletClient?.transport) {
      const transport = walletClient.transport as any;
      if (transport.value && typeof transport.value.request === "function") {
        return transport.value;
      }
      if (typeof transport.request === "function") {
        return transport;
      }
    }
    if (typeof window !== "undefined" && (window as any).ethereum) {
      return (window as any).ethereum;
    }
    return undefined;
  }, [chainId, walletClient]);

  // Initialize FHEVM
  const { instance: fhevmInstance, status: fhevmStatus } = useFhevm({
    provider: eip1193Provider(),
    chainId,
    initialMockChains: { 31337: "http://localhost:8545" },
    enabled: isConnected && !!contractAddress,
  });

  // Convert walletClient to ethers signer
  useEffect(() => {
    if (!walletClient || !chainId) {
      setEthersSigner(undefined);
      setEthersProvider(undefined);
      return;
    }

    const setupEthers = async () => {
      try {
        const provider = new ethers.BrowserProvider(walletClient as any);
        const signer = await provider.getSigner();
        setEthersProvider(provider as any);
        setEthersSigner(signer);
      } catch (error) {
        console.error("Error setting up ethers:", error);
        setEthersSigner(undefined);
        setEthersProvider(undefined);
      }
    };

    setupEthers();
  }, [walletClient, chainId]);

  const recordMoisture = useCallback(
    async (moisture: number) => {
      console.log("[useSoilMoisture] recordMoisture called", {
        moisture,
        contractAddress,
        hasEthersSigner: !!ethersSigner,
        hasFhevmInstance: !!fhevmInstance,
        address,
        hasEthersProvider: !!ethersProvider,
      });

      if (!contractAddress) {
        const error = new Error("Contract address not configured. Please set VITE_CONTRACT_ADDRESS in .env.local");
        setMessage(error.message);
        console.error("[useSoilMoisture] Missing contract address");
        throw error;
      }

      if (!ethersSigner) {
        const error = new Error("Wallet signer not available. Please ensure your wallet is connected.");
        setMessage(error.message);
        console.error("[useSoilMoisture] Missing ethers signer");
        throw error;
      }

      if (!fhevmInstance) {
        const error = new Error("FHEVM instance not initialized. Please wait for initialization.");
        setMessage(error.message);
        console.error("[useSoilMoisture] Missing FHEVM instance");
        throw error;
      }

      if (!address) {
        const error = new Error("Wallet address not available. Please connect your wallet.");
        setMessage(error.message);
        console.error("[useSoilMoisture] Missing address");
        throw error;
      }

      if (!ethersProvider) {
        const error = new Error("Ethers provider not available.");
        setMessage(error.message);
        console.error("[useSoilMoisture] Missing ethers provider");
        throw error;
      }

      if (moisture < 0 || moisture > 100) {
        const error = new Error("Soil moisture must be between 0 and 100");
        setMessage(error.message);
        throw error;
      }

      try {
        setIsLoading(true);
        setMessage("Encrypting soil moisture value...");
        console.log("[useSoilMoisture] Starting encryption...");

        // Encrypt moisture using FHEVM
        const encryptedInput = fhevmInstance.createEncryptedInput(
          contractAddress as `0x${string}`,
          address as `0x${string}`
        );
        encryptedInput.add32(moisture);
        const encrypted = await encryptedInput.encrypt();
        console.log("[useSoilMoisture] Encryption complete", {
          hasHandles: !!encrypted.handles && encrypted.handles.length > 0,
          hasInputProof: !!encrypted.inputProof && encrypted.inputProof.length > 0,
        });

        setMessage("Submitting to blockchain...");

        // Verify contract is deployed
        const contractCode = await ethersProvider.getCode(contractAddress);
        if (contractCode === "0x" || contractCode.length <= 2) {
          throw new Error(`Contract not deployed at ${contractAddress}. Please deploy the contract first.`);
        }

        const contract = new ethers.Contract(contractAddress, EncryptedSoilMoistureABI, ethersSigner);

        const encryptedMoistureHandle = encrypted.handles[0];
        if (!encryptedMoistureHandle || !encrypted.inputProof || encrypted.inputProof.length === 0) {
          throw new Error("Encryption failed - missing handle or proof");
        }

        console.log("[useSoilMoisture] Submitting transaction...");
        const tx = await contract.recordSoilMoisture(
          encryptedMoistureHandle,
          encrypted.inputProof,
          {
            gasLimit: 5000000,
          }
        );
        console.log("[useSoilMoisture] Transaction sent:", tx.hash);
        const receipt = await tx.wait();
        console.log("[useSoilMoisture] Transaction confirmed, block:", receipt.blockNumber);

        setMessage("Soil moisture recorded successfully. Refreshing encrypted value...");
        
        // Wait a bit for the state to be fully updated and permissions to be set
        console.log("[useSoilMoisture] Waiting for state update and permissions...");
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Reload encrypted moisture after successful addition
        if (contractAddress && ethersProvider && address) {
          try {
            const contractCode = await ethersProvider.getCode(contractAddress);
            if (contractCode && contractCode.length > 2) {
              const contract = new ethers.Contract(contractAddress, EncryptedSoilMoistureABI, ethersProvider);
              const hasInit = await contract.hasInitialized(address);
              if (hasInit) {
                const encrypted = await contract.getEncryptedSoilMoisture(address);
                const handle = typeof encrypted === "string" ? encrypted : ethers.hexlify(encrypted);
                const normalizedHandle = handle.toLowerCase();
                console.log("[useSoilMoisture] ===== Post-Record Refresh =====");
                console.log("[useSoilMoisture] New encrypted moisture handle:", normalizedHandle);
                console.log("[useSoilMoisture] Handle length:", normalizedHandle.length);
                setEncryptedMoisture(normalizedHandle);
                setMessage("Soil moisture recorded successfully! Wait a moment, then you can decrypt your value.");
              } else {
                console.warn("[useSoilMoisture] User not initialized after recording moisture");
                setMessage("Moisture recorded, but initialization check failed. Please try refreshing.");
              }
            }
          } catch (err) {
            console.error("[useSoilMoisture] Error reloading moisture:", err);
            setMessage("Moisture recorded, but failed to refresh value. Please refresh manually.");
          }
        }
      } catch (error: any) {
        const errorMessage = error.reason || error.message || String(error);
        setMessage(`Error: ${errorMessage}`);
        console.error("[useSoilMoisture] Error recording moisture:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [contractAddress, ethersSigner, fhevmInstance, address, ethersProvider]
  );

  const decryptMoisture = useCallback(
    async () => {
      if (!contractAddress || !ethersProvider || !fhevmInstance || !ethersSigner || !address) {
        setMessage("Missing requirements for decryption");
        return;
      }

      try {
        setMessage("Checking permissions and fetching latest encrypted moisture...");

        // First, verify user has initialized and get the latest encrypted moisture from contract
        const contract = new ethers.Contract(contractAddress, EncryptedSoilMoistureABI, ethersProvider);
        const hasInit = await contract.hasInitialized(address);
        
        if (!hasInit) {
          throw new Error("You haven't recorded any soil moisture yet. Please record moisture first before decrypting.");
        }

        // Get the latest encrypted moisture from contract
        const latestEncryptedMoisture = await contract.getEncryptedSoilMoisture(address);
        let handle = typeof latestEncryptedMoisture === "string" ? latestEncryptedMoisture : ethers.hexlify(latestEncryptedMoisture);

        // Normalize handle format
        if (handle && handle.startsWith("0x")) {
          handle = handle.toLowerCase();
        }

        if (!handle || handle === "0x" || handle.length !== 66) {
          throw new Error(`Invalid handle format: ${handle}. Expected 66 characters (0x + 64 hex chars)`);
        }

        console.log("[useSoilMoisture] ===== Decryption Debug Info =====");
        console.log("[useSoilMoisture] Handle from contract:", handle);
        console.log("[useSoilMoisture] Handle length:", handle.length);
        console.log("[useSoilMoisture] Contract address:", contractAddress);
        console.log("[useSoilMoisture] User address:", address);
        console.log("[useSoilMoisture] Chain ID:", chainId);
        
        // Update state with latest handle
        setEncryptedMoisture(handle);

        setMessage("Decrypting soil moisture value...");

        // Prepare handle-contract pairs
        const handleContractPairs = [
          { handle, contractAddress: contractAddress as `0x${string}` },
        ];

        // Generate keypair for EIP712 signature
        let keypair: { publicKey: Uint8Array; privateKey: Uint8Array };
        if (typeof (fhevmInstance as any).generateKeypair === "function") {
          keypair = (fhevmInstance as any).generateKeypair();
        } else {
          keypair = {
            publicKey: new Uint8Array(32).fill(0),
            privateKey: new Uint8Array(32).fill(0),
          };
        }

        // Create EIP712 signature for decryption
        const contractAddresses = [contractAddress as `0x${string}`];
        const startTimestamp = Math.floor(Date.now() / 1000).toString();
        const durationDays = "10";

        let eip712: any;
        if (typeof (fhevmInstance as any).createEIP712 === "function") {
          eip712 = (fhevmInstance as any).createEIP712(
            keypair.publicKey,
            contractAddresses,
            startTimestamp,
            durationDays
          );
        } else {
          eip712 = {
            domain: {
              name: "FHEVM",
              version: "1",
              chainId: chainId,
              verifyingContract: contractAddresses[0],
            },
            types: {
              UserDecryptRequestVerification: [
                { name: "publicKey", type: "bytes" },
                { name: "contractAddresses", type: "address[]" },
                { name: "startTimestamp", type: "string" },
                { name: "durationDays", type: "string" },
              ],
            },
            message: {
              publicKey: ethers.hexlify(keypair.publicKey),
              contractAddresses,
              startTimestamp,
              durationDays,
            },
          };
        }

        // Sign the EIP712 message
        const signature = await ethersSigner.signTypedData(
          eip712.domain,
          { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
          eip712.message
        );

        // For local mock network, signature may need to have "0x" prefix removed
        const signatureForDecrypt = chainId === 31337 
          ? signature.replace("0x", "") 
          : signature;

        console.log("[useSoilMoisture] Decrypting with:", {
          handle,
          contractAddress,
          userAddress: address,
          chainId,
          signatureLength: signature.length,
          signatureForDecryptLength: signatureForDecrypt.length,
        });

        // Decrypt using userDecrypt method
        const decryptedResult = await (fhevmInstance as any).userDecrypt(
          handleContractPairs,
          keypair.privateKey,
          keypair.publicKey,
          signatureForDecrypt,
          contractAddresses,
          address as `0x${string}`,
          startTimestamp,
          durationDays
        );

        const decrypted = Number(decryptedResult[handle] || 0);
        console.log("[useSoilMoisture] Decryption successful:", decrypted);
        setDecryptedMoisture(decrypted);
        setMessage(`Decrypted moisture: ${decrypted}%`);
      } catch (error: any) {
        console.error("[useSoilMoisture] Error decrypting moisture:", error);
        const errorMessage = error.message || String(error);
        
        if (errorMessage.includes("not authorized") || errorMessage.includes("authorized")) {
          setMessage(`Decryption failed: You don't have permission to decrypt this handle. This may happen if:
1. The contract was redeployed and the handle is from an old deployment
2. You haven't recorded moisture yet
3. The transaction hasn't fully confirmed yet

Please try:
1. Record moisture again to get a new handle with proper permissions
2. Wait a few seconds after recording before decrypting
3. Refresh the page and try again`);
        } else {
          setMessage(`Error decrypting: ${errorMessage}`);
        }
        throw error;
      }
    },
    [contractAddress, ethersProvider, fhevmInstance, ethersSigner, address, chainId]
  );

  const loadEncryptedMoisture = useCallback(async () => {
    if (!contractAddress || !ethersProvider || !address) {
      return;
    }

    try {
      setIsLoading(true);

      // Check if we can connect to the provider first
      try {
        await ethersProvider.getBlockNumber();
      } catch (providerError: any) {
        if (chainId === 31337) {
          const errorMsg = "Cannot connect to Hardhat node. Please ensure 'npx hardhat node' is running on http://localhost:8545";
          setMessage(errorMsg);
          console.error("[useSoilMoisture] Hardhat node not accessible:", providerError);
          return;
        } else {
          throw providerError;
        }
      }

      const contractCode = await ethersProvider.getCode(contractAddress);
      if (contractCode === "0x" || contractCode.length <= 2) {
        setMessage(`Contract not deployed at ${contractAddress}. Please deploy the contract first.`);
        setEncryptedMoisture(undefined);
        return;
      }

      const contract = new ethers.Contract(contractAddress, EncryptedSoilMoistureABI, ethersProvider);
      const hasInit = await contract.hasInitialized(address);
      
      if (!hasInit) {
        setEncryptedMoisture(undefined);
        setDecryptedMoisture(undefined);
        return;
      }

      const encrypted = await contract.getEncryptedSoilMoisture(address);
      setEncryptedMoisture(encrypted);
    } catch (error: any) {
      console.error("[useSoilMoisture] Error loading encrypted moisture:", error);
      
      let errorMessage = error.message || String(error);
      
      if (error.code === "UNKNOWN_ERROR" || error.code === -32603) {
        if (chainId === 31337) {
          errorMessage = "Cannot connect to Hardhat node. Please ensure 'npx hardhat node' is running on http://localhost:8545";
        } else {
          errorMessage = `Network error: ${error.message || "Failed to connect to blockchain"}`;
        }
      } else if (error.message?.includes("Failed to fetch")) {
        if (chainId === 31337) {
          errorMessage = "Cannot connect to Hardhat node. Please ensure 'npx hardhat node' is running on http://localhost:8545";
        } else {
          errorMessage = "Network connection failed. Please check your internet connection and try again.";
        }
      }
      
      setMessage(`Error loading moisture: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [contractAddress, ethersProvider, address, chainId]);

  useEffect(() => {
    if (contractAddress && ethersProvider && address) {
      loadEncryptedMoisture();
    }
  }, [contractAddress, ethersProvider, address, loadEncryptedMoisture]);

  return {
    contractAddress,
    encryptedMoisture,
    decryptedMoisture,
    isLoading,
    message,
    recordMoisture,
    decryptMoisture,
    loadEncryptedMoisture,
  };
}

