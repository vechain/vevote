// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

import { VeVoteStorageTypes } from "./libraries/VeVoteStorageTypes.sol";
import { VeVoteTypes } from "./libraries/VeVoteTypes.sol";
import { VechainNodesDataTypes } from "../libraries/VechainNodesDataTypes.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/// @title VeVoteStorage
/// @notice Contract used as storage of the VeVote contract.
/// @dev It defines the storage layout of the VeVote contract.
contract VeVoteStorage is Initializable {
  // keccak256(abi.encode(uint256(keccak256("VeVoteStorageLocation")) - 1)) & ~bytes32(uint256(0xff))
  bytes32 private constant VeVoteStorageLocation = 0xe4daadd51b0f186722e079c28ae9ded1c74d42eecd2103f7a5ce80c77c626300;

  /// @dev Internal function to access the vevote storage slot.
  function getVeVoteStorage() internal pure returns (VeVoteStorageTypes.VeVoteStorage storage $) {
    assembly {
      $.slot := VeVoteStorageLocation
    }
  }

  /// @dev Initializes the governor storage
  function __VeVoteStorage_init(
    VeVoteTypes.InitializationData memory initializationData
  ) internal onlyInitializing {
    __VeVoteStorage_init_unchained(initializationData);
  }

  /// @dev Part of the initialization process that configures the governor storage.
  function __VeVoteStorage_init_unchained(
    VeVoteTypes.InitializationData memory initializationData
  ) internal onlyInitializing {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();

    // Validate and set the governor external contracts storage
    require(address(initializationData.nodeManagement) != address(0), "VeVote: NodeManagement address cannot be zero");
    require(address(initializationData.vechainNodesContract) != address(0), "VeVote: VechainNode address cannot be zero");
    $.nodeManagement = initializationData.nodeManagement;
    $.vechainNodesContract = initializationData.vechainNodesContract;

    // Set the general storage parameters
    $.minVotingDelay = initializationData.initialMinVotingDelay;
    $.minVotingDuration = initializationData.initialMinVotingDuration;
    $.maxVotingDuration = initializationData.initialMaxVotingDuration;
    $.maxChoices = initializationData.initialMaxChoices;

    // Set the base level node
    $.baseLevelNode = initializationData.baseLevelNode;

    // Set the voting weight multipliers for different node levels
    $.nodeMultiplier[VechainNodesDataTypes.NodeStrengthLevel.Strength] = 100; // Strength Node multipler -> Scaled by 100
    $.nodeMultiplier[VechainNodesDataTypes.NodeStrengthLevel.Thunder] = 100; // Thunder Node multipler -> Scaled by 100
    $.nodeMultiplier[VechainNodesDataTypes.NodeStrengthLevel.Mjolnir] = 100; // Mjolnir Node multipler -> Scaled by 100

    $.nodeMultiplier[VechainNodesDataTypes.NodeStrengthLevel.VeThorX] = 150; // VeThor X Node multipler -> Scaled by 150
    $.nodeMultiplier[VechainNodesDataTypes.NodeStrengthLevel.StrengthX] = 150; // Strength X Node multipler -> Scaled by 150
    $.nodeMultiplier[VechainNodesDataTypes.NodeStrengthLevel.ThunderX] = 150; // Thunder X Node multipler -> Scaled by 150
    $.nodeMultiplier[VechainNodesDataTypes.NodeStrengthLevel.MjolnirX] = 150; // Mjolnir X Node multipler -> Scaled by 150

    // TODO: Update these values to the correct values
    $.nodeMultiplier[VechainNodesDataTypes.NodeStrengthLevel.Flash] = 100; // Flash Node multipler -> Scaled by 200
    $.nodeMultiplier[VechainNodesDataTypes.NodeStrengthLevel.Lightning] = 100; // Lightning Node multipler -> Scaled by 200
    $.nodeMultiplier[VechainNodesDataTypes.NodeStrengthLevel.Dawn] = 100; // Dawn Node multipler -> Scaled by 200

    $.nodeMultiplier[VechainNodesDataTypes.NodeStrengthLevel.Validator] = 200; // Validator Node multipler -> Scaled by 300
  }
}
