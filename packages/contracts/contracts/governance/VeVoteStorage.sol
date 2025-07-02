// SPDX-License-Identifier: MIT

//  8b           d8       8b           d8                            
//  `8b         d8'       `8b         d8'           ,d               
//   `8b       d8'         `8b       d8'            88               
//    `8b     d8' ,adPPYba, `8b     d8' ,adPPYba, MM88MMM ,adPPYba,  
//     `8b   d8' a8P   _d88  `8b   d8' a8"     "8a  88   a8P_____88  
//      `8b d8'  8PP  "PP""   `8b d8'  8b       d8  88   8PP"""""""  
//       `888'   "8b,   ,aa    `888'   "8a,   ,a8"  88,  "8b,   ,aa  
//        `8'     `"Ybbd8"'     `8'     `"YbbdP"'   "Y888 `"Ybbd8"'  

pragma solidity 0.8.20;

import { VeVoteStorageTypes } from "./libraries/VeVoteStorageTypes.sol";
import { VeVoteClockLogic } from "./libraries/VeVoteClockLogic.sol";
import { VeVoteTypes } from "./libraries/VeVoteTypes.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/structs/Checkpoints.sol";

/// @title VeVoteStorage
/// @notice Contract used as storage of the VeVote contract.
/// @dev It defines the storage layout of the VeVote contract.
contract VeVoteStorage is Initializable {
  using Checkpoints for Checkpoints.Trace208;

  // keccak256(abi.encode(uint256(keccak256("VeVoteStorageLocation")) - 1)) & ~bytes32(uint256(0xff))
  bytes32 private constant VeVoteStorageLocation = 0xe4daadd51b0f186722e079c28ae9ded1c74d42eecd2103f7a5ce80c77c626300;

  /// @dev Internal function to access the vevote storage slot.
  function getVeVoteStorage() internal pure returns (VeVoteStorageTypes.VeVoteStorage storage $) {
    assembly {
      $.slot := VeVoteStorageLocation
    }
  }

  /// @dev Initializes the governor storage
  function __VeVoteStorage_init(VeVoteTypes.InitializationData memory initializationData) internal onlyInitializing {
    __VeVoteStorage_init_unchained(initializationData);
  }

  /// @dev Part of the initialization process that configures the governor storage.
  function __VeVoteStorage_init_unchained(
    VeVoteTypes.InitializationData memory initializationData
  ) internal onlyInitializing {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();

    // Validate and set the governor external contracts storage
    require(address(initializationData.nodeManagement) != address(0), "VeVote: NodeManagement address cannot be zero");
    require(address(initializationData.stargateNFT) != address(0), "VeVote: StargateNFT address cannot be zero");
    require(address(initializationData.authorityContract) != address(0), "VeVote: Authority address cannot be zero");
    $.nodeManagement = initializationData.nodeManagement;
    $.stargateNFT = initializationData.stargateNFT;
    $.validatorContract = initializationData.authorityContract;

    // Set the general storage parameters
    $.minVotingDelay = initializationData.initialMinVotingDelay;
    $.minVotingDuration = initializationData.initialMinVotingDuration;
    $.maxVotingDuration = initializationData.initialMaxVotingDuration;
    $.maxChoices = initializationData.initialMaxChoices;

    // Initialize vote normalization base (min stake)
    require(initializationData.initialMinStakedAmount > 0, "VeVote: min stake must be > 0");
    $.minStakedVetHistory.push(VeVoteClockLogic.clock(), SafeCast.toUint208(initializationData.initialMinStakedAmount));

    // LevelId 0 is unused in Stargate, we will take advantage of this to represent Validator multiplier in VeVote. (Scaled by 100).
    $.levelIdMultiplier[0] = 200; // Validator multipler
    // Set the voting weight multipliers for different Stargate NFT level IDs. (Scaled by 100).
    $.levelIdMultiplier[1] = 100; // Strength Node multipler
    $.levelIdMultiplier[2] = 100; // Thunder Node multipler
    $.levelIdMultiplier[3] = 100; // Mjolnir Node multipler
    $.levelIdMultiplier[4] = 150; // VeThor X Node multipler
    $.levelIdMultiplier[5] = 150; // Strength X Node multipler
    $.levelIdMultiplier[6] = 150; // Thunder X Node multipler
    $.levelIdMultiplier[7] = 150; // Mjolnir X Node multipler
    $.levelIdMultiplier[8] = 100; // Dawn Node multipler
    $.levelIdMultiplier[9] = 100; // Lightning Node multipler
    $.levelIdMultiplier[10] = 100; // Flash Node multipler
  }
}
