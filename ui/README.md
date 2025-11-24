# Secure Crop Key - Encrypted Soil Moisture Tracking

A privacy-preserving soil moisture tracking system built with FHEVM (Fully Homomorphic Encryption Virtual Machine) that allows farmers to securely record and manage encrypted soil moisture data on-chain. Individual moisture values remain private, and only the user can decrypt and view their data.

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

   # Copy the deployed contract address and update ui/.env.local
   # VITE_CONTRACT_ADDRESS=0x...
   ```

5. **Start frontend**

   ```bash
   cd ui
   npm run dev
   ```

6. **Connect wallet and test**

   - Open the app in your browser
   - Connect wallet to localhost network (Chain ID: 31337)
   - Record soil moisture values
   - Decrypt your moisture to verify encryption/decryption

7. **Deploy to Sepolia Testnet** (after local testing)

   ```bash
   # Deploy to Sepolia
   npx hardhat deploy --network sepolia
   
   # Update VITE_CONTRACT_ADDRESS in ui/.env.local with Sepolia address
   
   # Verify contract on Etherscan
   npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
   ```

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

## Smart Contract

### EncryptedSoilMoisture.sol

The main smart contract that handles encrypted soil moisture storage using FHEVM.

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

## Frontend Usage

### Components

1. **RecordMoistureDialog**: 
   - Input field for moisture value (0-100%)
   - Encrypts and submits to contract
   - Shows transaction status

2. **SoilMoistureCard**: 
   - Displays encrypted moisture (as handle)
   - Decrypt button to view decrypted value
   - Refresh button to reload latest value

### Workflow

1. **Connect Wallet**: Click Rainbow wallet button in top right
2. **Record Moisture**: 
   - Enter moisture percentage (e.g., 65)
   - Click "Record Moisture"
   - Wait for transaction confirmation
3. **View Encrypted Value**: Encrypted handle is displayed
4. **Decrypt Moisture**: 
   - Click "Decrypt Moisture" button
   - Sign EIP712 message with wallet
   - View decrypted percentage

## Technical Details

### FHEVM Integration

- **SDK Loading**: Dynamically loads FHEVM Relayer SDK from CDN
- **Instance Creation**: Creates FHEVM instance based on network (mock for local, relayer for Sepolia)
- **Public Key Storage**: Uses IndexedDB to cache public keys and parameters
- **Decryption Signatures**: Uses in-memory storage for EIP712 signatures

### Security Features

1. **Input Proof Verification**: All encrypted inputs include cryptographic proofs verified by the contract
2. **Access Control**: Only authorized parties (contract and user) can decrypt encrypted values
3. **Privacy Preservation**: Actual moisture values are never revealed on-chain
4. **EIP712 Signatures**: Decryption requests require cryptographic signatures to prevent unauthorized access

### Network Support

- **Localhost (31337)**: For development and testing with mock FHEVM
- **Sepolia Testnet (11155111)**: For public testing with Zama FHE relayer
- **Mainnet**: Ready for production deployment (with proper configuration)

## License

This project is licensed under the BSD-3-Clause-Clear License. See the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using [Zama FHEVM](https://docs.zama.ai/fhevm)**
