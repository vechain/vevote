
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract LegacyDescriptions is AccessControl {
    // Events
    event LegacyVeVoteDescription(string id, string ipfsHash);

    // State to prevent re-registration
    mapping(string => bool) public registered;

    constructor(address admin) {
        // Deployer is DEFAULT_ADMIN_ROLE
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    /// @notice Emit event with (id, ipfsHash) pair. Only allowed once per id.
    function register(string calldata id, string calldata ipfsHash) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!registered[id], "Already registered");
        registered[id] = true;
        emit LegacyVeVoteDescription(id, ipfsHash);
    }

     /// @notice Batch register multiple pairs.
    function registerBatch(string[] calldata ids, string[] calldata ipfsHashes)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(ids.length == ipfsHashes.length, "Length mismatch");

        for (uint256 i = 0; i < ids.length; i++) {
            require(!registered[ids[i]], "Already registered");
            registered[ids[i]] = true;
            emit LegacyVeVoteDescription(ids[i], ipfsHashes[i]);
        }
    }
}