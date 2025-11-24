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

