# Secure Crop Key - Encrypted Soil Moisture Tracking

A privacy-preserving soil moisture tracking system built with FHEVM (Fully Homomorphic Encryption Virtual Machine) that allows farmers to securely record and manage encrypted soil moisture data on-chain. Individual moisture values remain private, and only the user can decrypt and view their data.

## 🌐 Live Demo

**Try it now**: [https://secure-crop-key.vercel.app/](https://secure-crop-key.vercel.app/)

## 📹 Demo Video

Watch the complete demo: [secure-crop-key.mp4](https://github.com/OmarMilton/secure-crop-key/blob/main/secure-crop-key.mp4)

## Features

- **🔒 Encrypted Soil Moisture**: Farmers record soil moisture values (0-100%) that are encrypted before storage
- **➕ FHE Storage**: Contract stores encrypted values on-chain using Fully Homomorphic Encryption
- **🔐 Private Decryption**: Only the user can decrypt and view their moisture values
- **💼 Rainbow Wallet Integration**: Seamless wallet connection using RainbowKit
- **🌐 Multi-Network Support**: Works on local Hardhat network and Sepolia testnet

## Quick Start

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm** or **yarn/pnpm**: Package manager
- **Rainbow Wallet**: Browser extension installed

### Installation

1. **Install dependencies**

   ```bash
   npm install
   cd ui && npm install
   ```

2. **Set up environment variables**

   ```bash
   npx hardhat vars set MNEMONIC

   # Set your Infura API key for network access
   npx hardhat vars set INFURA_API_KEY

   # Optional: Set Etherscan API key for contract verification
   npx hardhat vars set ETHERSCAN_API_KEY
   ```

3. **Compile contracts**

   ```bash
   npm run compile
   npm run typechain
   ```

4. **Deploy to local network**

   ```bash
   # Terminal 1: Start a local FHEVM-ready node
   npx hardhat node

   # Terminal 2: Deploy to local network
   npx hardhat deploy --network localhost
   ```

5. **Configure contract address**

   After deployment, create `ui/.env.local` file:
   
   ```bash
   cd ui
   # Get contract address from deployments/localhost/EncryptedSoilMoisture.json
   # Or from the deploy output
   echo "VITE_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3" > .env.local
   ```
   
   Or manually create `ui/.env.local` with:
   ```
   VITE_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
   ```
   
   **Note**: Replace the address with your actual deployed contract address.

6. **Start frontend**

   ```bash
   cd ui
   npm run dev
   ```

7. **Connect wallet and test**

   - Open the app in your browser
   - Connect wallet to localhost network (Chain ID: 31337)
   - Record soil moisture values
   - Decrypt your moisture to verify encryption/decryption

8. **Deploy to Sepolia Testnet** (after local testing)

   ```bash
   # Deploy to Sepolia
   npx hardhat deploy --network sepolia
   
   # Update VITE_CONTRACT_ADDRESS in ui/.env.local with Sepolia address
   
   # Verify contract on Etherscan
   npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
   ```

## Smart Contract

### EncryptedSoilMoisture.sol

The main smart contract that handles encrypted soil moisture storage using FHEVM.

#### Contract Code

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title EncryptedSoilMoisture - Private Soil Moisture Data Storage
/// @notice Allows farmers to record encrypted soil moisture values privately
/// @dev Uses FHE to store encrypted soil moisture data on-chain
contract EncryptedSoilMoisture is SepoliaConfig {
    // Mapping from user address to their encrypted soil moisture value
    mapping(address => euint32) private _encryptedSoilMoisture;
    
    // Mapping to track if user has initialized their moisture data
    mapping(address => bool) private _hasInitialized;

    // Mapping to store timestamp of last update
    mapping(address => uint256) private _lastUpdateTimestamp;

    event SoilMoistureRecorded(address indexed user, uint256 timestamp);
    event SoilMoistureUpdated(address indexed user, uint256 timestamp);

    /// @notice Record or update soil moisture value
    /// @param encryptedMoisture The encrypted soil moisture value (0-100)
    /// @param inputProof The FHE input proof
    function recordSoilMoisture(externalEuint32 encryptedMoisture, bytes calldata inputProof) external {
        euint32 moisture = FHE.fromExternal(encryptedMoisture, inputProof);
        
        // Initialize if first time
        if (!_hasInitialized[msg.sender]) {
            _encryptedSoilMoisture[msg.sender] = moisture;
            _hasInitialized[msg.sender] = true;
            _lastUpdateTimestamp[msg.sender] = block.timestamp;
            emit SoilMoistureRecorded(msg.sender, block.timestamp);
        } else {
            // Update existing value
            _encryptedSoilMoisture[msg.sender] = moisture;
            _lastUpdateTimestamp[msg.sender] = block.timestamp;
            emit SoilMoistureUpdated(msg.sender, block.timestamp);
        }

        // Grant decryption permissions to the user
        FHE.allowThis(_encryptedSoilMoisture[msg.sender]);
        FHE.allow(_encryptedSoilMoisture[msg.sender], msg.sender);
    }

    /// @notice Get the encrypted soil moisture value for a user
    /// @param user The user address
    /// @return encryptedMoisture The encrypted soil moisture value
    function getEncryptedSoilMoisture(address user) external view returns (euint32 encryptedMoisture) {
        return _encryptedSoilMoisture[user];
    }

    /// @notice Check if a user has initialized their moisture data
    /// @param user The user address
    /// @return Whether the user has initialized
    function hasInitialized(address user) external view returns (bool) {
        return _hasInitialized[user];
    }

    /// @notice Get the timestamp of last update for a user
    /// @param user The user address
    /// @return The timestamp of last update
    function getLastUpdateTimestamp(address user) external view returns (uint256) {
        return _lastUpdateTimestamp[user];
    }
}
```

#### Key Functions

- **`recordSoilMoisture(externalEuint32 encryptedMoisture, bytes calldata inputProof)`**: 
  - Accepts encrypted moisture value and input proof
  - Converts external encrypted value to internal `euint32` using `FHE.fromExternal()`
  - Stores or updates encrypted moisture value
  - Grants decryption permissions to the user with `FHE.allow()`
  - Emits `SoilMoistureRecorded` or `SoilMoistureUpdated` event

- **`getEncryptedSoilMoisture(address user)`**: 
  - Returns the encrypted `euint32` moisture value for a user
  - Can be called by anyone (view function)
  - Returns encrypted handle that only the user can decrypt

- **`hasInitialized(address user)`**: 
  - Checks if a user has recorded moisture at least once
  - Returns `bool` indicating initialization status

- **`getLastUpdateTimestamp(address user)`**: 
  - Returns the timestamp of the last moisture update
  - Useful for tracking data freshness

## Encryption & Decryption Logic

### Encryption Flow

The encryption process happens entirely on the client side before data is sent to the blockchain:

1. **Client-Side Encryption**:
   ```typescript
   // Create encrypted input using FHEVM instance
   const encryptedInput = fhevmInstance.createEncryptedInput(
     contractAddress,
     userAddress
   );
   
   // Add the plaintext value (moisture percentage 0-100)
   encryptedInput.add32(moisture);
   
   // Encrypt and get handle + proof
   const encrypted = await encryptedInput.encrypt();
   // Returns: { handles: string[], inputProof: string }
   ```

2. **On-Chain Submission**:
   ```typescript
   // Submit encrypted handle and proof to contract
   const tx = await contract.recordSoilMoisture(
     encrypted.handles[0],      // Encrypted handle (bytes32)
     encrypted.inputProof      // Cryptographic proof
   );
   ```

3. **Contract Processing**:
   - Contract verifies the input proof using `FHE.fromExternal()`
   - Converts external encrypted value to internal `euint32`
   - Stores the encrypted value in the user's mapping
   - Grants decryption permissions: `FHE.allow(encryptedValue, user)`
   - Emits event for tracking

### Decryption Flow

The decryption process requires the user's wallet signature and FHEVM relayer:

1. **Get Encrypted Handle**:
   ```typescript
   // Fetch latest encrypted moisture from contract
   const encryptedMoisture = await contract.getEncryptedSoilMoisture(userAddress);
   const handle = ethers.hexlify(encryptedMoisture);
   // Handle format: 66 characters (0x + 64 hex characters)
   ```

2. **Generate Decryption Keypair**:
   ```typescript
   // Generate keypair for EIP712 signature
   const keypair = fhevmInstance.generateKeypair();
   // Returns: { publicKey: Uint8Array, privateKey: Uint8Array }
   ```

3. **Create EIP712 Signature**:
   ```typescript
   // Create EIP712 typed data for decryption request
   const eip712 = fhevmInstance.createEIP712(
     keypair.publicKey,
     [contractAddress],
     startTimestamp,
     durationDays
   );
   
   // Sign with user's wallet
   const signature = await signer.signTypedData(
     eip712.domain,
     { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
     eip712.message
   );
   ```

4. **Decrypt**:
   ```typescript
   // For local network, remove "0x" prefix from signature
   const signatureForDecrypt = chainId === 31337 
     ? signature.replace("0x", "") 
     : signature;
   
   // Decrypt using FHEVM instance
   const decryptedResult = await fhevmInstance.userDecrypt(
     [{ handle, contractAddress }],
     keypair.privateKey,
     keypair.publicKey,
     signatureForDecrypt,
     [contractAddress],
     userAddress,
     startTimestamp,
     durationDays
   );
   
   // Extract decrypted value
   const decryptedMoisture = Number(decryptedResult[handle] || 0);
   ```

### Key Encryption/Decryption Details

#### Encryption Type
- **`euint32`**: Encrypted 32-bit unsigned integer (internal contract format)
- **`externalEuint32`**: External format for passing encrypted values as function parameters
- **Handle Format**: 66 characters (0x + 64 hex characters)

#### FHE Operations
- **`FHE.fromExternal()`**: Converts external encrypted value to internal format and verifies input proof
- **`FHE.allow()`**: Grants decryption permissions to specific addresses
- **`FHE.allowThis()`**: Grants decryption permission to the contract itself

#### Permission Model
- Only the contract and the user can decrypt encrypted values
- Permissions are set automatically when data is recorded
- Each encrypted value has its own permission set
- Permissions persist across transactions

#### Network-Specific Behavior
- **Localhost (31337)**: Uses `@fhevm/mock-utils` for local testing
  - Signature format: Remove "0x" prefix
  - No relayer required
  - Fast decryption for development
- **Sepolia (11155111)**: Uses `@zama-fhe/relayer-sdk` with Zama's FHE relayer
  - Signature format: Keep "0x" prefix
  - Requires relayer for decryption
  - Production-ready encryption

## Frontend Usage

### Components

1. **RecordMoistureDialog**: 
   - Input field for moisture value (0-100%)
   - Encrypts and submits to contract
   - Shows transaction status and progress

2. **SoilMoistureCard**: 
   - Displays encrypted moisture (as handle)
   - Decrypt button to view decrypted value
   - Refresh button to reload latest value
   - Shows decrypted percentage when available

### Workflow

1. **Connect Wallet**: Click Rainbow wallet button in top right
2. **Record Moisture**: 
   - Enter moisture percentage (e.g., 65)
   - Click "Record Moisture"
   - Wait for transaction confirmation
   - Encrypted handle is automatically refreshed
3. **View Encrypted Value**: Encrypted handle is displayed (66-character hex string)
4. **Decrypt Moisture**: 
   - Click "Decrypt Moisture" button
   - Sign EIP712 message with wallet
   - View decrypted percentage

## Testing

### Local Network Testing

```bash
# Start local Hardhat node with FHEVM support
npx hardhat node

# In another terminal, run tests
npm run test
```

Tests verify:
- Initialization state
- Encrypted moisture recording
- Moisture value updates
- User isolation (separate data per user)
- Decryption functionality

### Sepolia Testnet Testing

```bash
# Deploy contract first
npx hardhat deploy --network sepolia

# Then run Sepolia-specific tests
npm run test:sepolia
```

## Technical Details

### FHEVM Integration

- **SDK Loading**: Dynamically loads FHEVM Relayer SDK from CDN (`https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.umd.cjs`)
- **Instance Creation**: Creates FHEVM instance based on network (mock for local, relayer for Sepolia)
- **Public Key Storage**: Uses IndexedDB to cache public keys and parameters for performance
- **Decryption Signatures**: Uses in-memory storage for EIP712 signatures

### Security Features

1. **Input Proof Verification**: All encrypted inputs include cryptographic proofs verified by the contract
2. **Access Control**: Only authorized parties (contract and user) can decrypt encrypted values
3. **Privacy Preservation**: Actual moisture values are never revealed on-chain
4. **EIP712 Signatures**: Decryption requests require cryptographic signatures to prevent unauthorized access
5. **User Isolation**: Each user's data is stored separately and can only be decrypted by that user

### Network Support

- **Localhost (31337)**: For development and testing with mock FHEVM
- **Sepolia Testnet (11155111)**: For public testing with Zama FHE relayer
- **Mainnet**: Ready for production deployment (with proper configuration)

## Project Structure

```
secure-crop-key/
├── contracts/                           # Smart contract source files
│   └── EncryptedSoilMoisture.sol        # Main soil moisture contract
├── deploy/                              # Deployment scripts
│   └── 001_deploy_EncryptedSoilMoisture.ts
├── test/                                # Test files
│   ├── EncryptedSoilMoisture.ts        # Local network tests
│   └── EncryptedSoilMoistureSepolia.ts # Sepolia testnet tests
├── ui/                                  # Frontend React application
│   ├── src/
│   │   ├── components/                  # React components
│   │   │   ├── RecordMoistureDialog.tsx # Record moisture component
│   │   │   ├── SoilMoistureCard.tsx    # View and decrypt component
│   │   │   └── ui/                     # shadcn/ui components
│   │   ├── hooks/                      # Custom React hooks
│   │   │   ├── useSoilMoisture.tsx     # Main contract interaction hook
│   │   │   └── useFhevm.tsx            # FHEVM instance management
│   │   ├── fhevm/                      # FHEVM utilities
│   │   │   ├── RelayerSDKLoader.ts     # SDK loader
│   │   │   ├── PublicKeyStorage.ts     # Public key management
│   │   │   └── internal/               # Internal FHEVM logic
│   │   └── pages/                      # Page components
│   └── public/                         # Static assets
│       ├── favicon.svg                 # App icon
│       └── logo.png                    # App logo
├── hardhat.config.ts                   # Hardhat configuration
└── package.json                        # Dependencies and scripts
```

## License

This project is licensed under the BSD-3-Clause-Clear License. See the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using [Zama FHEVM](https://docs.zama.ai/fhevm)**
