// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

import { VeVoteStorageTypes } from "./VeVoteStorageTypes.sol";
import { INodeManagement } from "../../interfaces/INodeManagement.sol";
import { ITokenAuction } from "../../interfaces/ITokenAuction.sol";
import { VeVoteTypes } from "./VeVoteTypes.sol";
import { VechainNodesDataTypes } from "../../libraries/VechainNodesDataTypes.sol";

/// @title VeVoteConfigurator
/// @notice Library for configuring governance parameters in VeVote.
/// @dev Provides setter and getter functions for governance configuration settings.
library VeVoteConfigurator {
  // ------------------------------- Errors -------------------------------

  /**
   * @dev Thrown when the minimum voting delay is set to an invalid value (zero).
   */
  error InvalidMinVotingDelay();

  /**
   * @dev Thrown when the minimum voting duration is set to an invalid value (zero).
   */
  error InvalidMinVotingDuration();

  /**
   * @dev Thrown when the maximum voting duration is set to an invalid value (zero).
   */
  error InvalidMaxVotingDuration();

  /**
   * @dev Thrown when the maximum number of choices is set to an invalid value (zero).
   */
  error InvalidMaxChoices();

  /**
   * @dev Thrown when an invalid address (zero address) is provided.
   */
  error InvalidAddress();

  /**
   * @dev Thrown when an invalid node is set as the cheapest node.
   */
  error InvalidNode();

  // ------------------------------- Events -------------------------------

  /**
   * @notice Emitted when the minimum voting delay is updated.
   * @param oldMinVotingDelay The previous minimum voting delay.
   * @param newMinVotingDelay The new minimum voting delay.
   */
  event MinVotingDelaySet(uint48 oldMinVotingDelay, uint256 newMinVotingDelay);

  /**
   * @notice Emitted when the minimum voting duration is updated.
   * @param oldMinVotingDuration The previous minimum voting duration.
   * @param newMinVotingDuration The new minimum voting duration.
   */
  event MinVotingDurationSet(uint48 oldMinVotingDuration, uint48 newMinVotingDuration);

  /**
   * @notice Emitted when the maximum voting duration is updated.
   * @param oldMaxVotingDuration The previous maximum voting duration.
   * @param newMaxVotingDuration The new maximum voting duration.
   */
  event MaxVotingDurationSet(uint48 oldMaxVotingDuration, uint48 newMaxVotingDuration);

  /**
   * @notice Emitted when the maximum number of choices is updated.
   * @param oldMaxChoices The previous maximum number of choices.
   * @param newMaxChoices The new maximum number of choices.
   */
  event MaxChoicesSet(uint8 oldMaxChoices, uint8 newMaxChoices);

  /**
   * @notice Emitted when the node management contract address is updated.
   * @param oldContractAddress The previous contract address.
   * @param newContractAddress The new contract address.
   */
  event NodeManagementContractSet(address oldContractAddress, address newContractAddress);

  /**
   * @notice Emitted when the VeChain node contract address is updated.
   * @param oldContractAddress The previous contract address.
   * @param newContractAddress The new contract address.
   */
  event VechainNodeContractSet(address oldContractAddress, address newContractAddress);

  /**
   * @notice Emitted when the VeChain node base level is updated.
   * @param oldBaseLevelNode The previous base level node.
   * @param newBaseLevelNode The new base level node.
   */
  event VechainBaseNodeSet(uint8 oldBaseLevelNode, uint8 newBaseLevelNode);

  /**
   * @notice Emitted when the node multiplier scores are updated.
   * @param nodeMultiplier The updated node multiplier scores.
   */
  event NodeVoteMultipliersUpdated(VeVoteTypes.NodeVoteMultiplier nodeMultiplier);

  /** ------------------ SETTERS ------------------ **/

  /**
   * @notice Sets the minimum voting delay.
   * @dev Ensures the new delay is greater than zero before updating.
   * @param self The storage reference for VeVote.
   * @param newMinVotingDelay The new minimum voting delay to set.
   */
  function setMinVotingDelay(VeVoteStorageTypes.VeVoteStorage storage self, uint48 newMinVotingDelay) external {
    if (newMinVotingDelay == 0) revert InvalidMinVotingDelay();

    uint48 oldMinVotingDelay = self.minVotingDelay;
    self.minVotingDelay = newMinVotingDelay;
    emit MinVotingDelaySet(oldMinVotingDelay, newMinVotingDelay);
  }

  /**
   * @notice Sets the minimum voting duration.
   * @dev Ensures the new duration is greater than zero before updating.
   * @param self The storage reference for VeVote.
   * @param newMinVotingDuration The new minimum voting duration to set.
   */
  function setMinVotingDuration(VeVoteStorageTypes.VeVoteStorage storage self, uint48 newMinVotingDuration) external {
    if (newMinVotingDuration == 0) revert InvalidMinVotingDuration();

    uint48 oldMinVotingDuration = self.minVotingDuration;
    self.minVotingDuration = newMinVotingDuration;
    emit MinVotingDurationSet(oldMinVotingDuration, newMinVotingDuration);
  }

  /**
   * @notice Sets the maximum voting duration.
   * @dev Ensures the new duration is greater than zero before updating.
   * @param self The storage reference for VeVote.
   * @param newMaxVotingDuration The new maximum voting duration to set.
   */
  function setMaxVotingDuration(VeVoteStorageTypes.VeVoteStorage storage self, uint48 newMaxVotingDuration) external {
    if (newMaxVotingDuration == 0) revert InvalidMaxVotingDuration();

    uint48 oldMaxVotingDuration = self.maxVotingDuration;
    self.maxVotingDuration = newMaxVotingDuration;
    emit MaxVotingDurationSet(oldMaxVotingDuration, newMaxVotingDuration);
  }

  /**
   * @notice Sets the maximum number of choices for voting.
   * @dev Ensures the new value is greater than zero before updating.
   * @param self The storage reference for VeVote.
   * @param newMaxChoices The new maximum number of choices allowed.
   */
  function setMaxChoices(VeVoteStorageTypes.VeVoteStorage storage self, uint8 newMaxChoices) external {
    if (newMaxChoices == 0 || newMaxChoices > 32) revert InvalidMaxChoices();

    uint8 oldMaxChoices = self.maxChoices;
    self.maxChoices = newMaxChoices;
    emit MaxChoicesSet(oldMaxChoices, newMaxChoices);
  }

  /**
   * @notice Sets the most basic node level that can be obtained.
   * @dev Ensures the new node level is greater than zero before updating.
   * @param self The storage reference for VeVote.
   * @param baseNodeLevel The new base level node to set.
   */
  function setBaseLevelNode(VeVoteStorageTypes.VeVoteStorage storage self, uint8 baseNodeLevel) external {
    if (baseNodeLevel == 0) revert InvalidNode();

    uint8 oldBaseLevelNode = self.baseLevelNode;
    self.baseLevelNode = baseNodeLevel;
    emit VechainBaseNodeSet(oldBaseLevelNode, baseNodeLevel);
  }

  /**
   * @notice Sets the Node Management contract address.
   * @dev Ensures the provided address is not zero before updating.
   * @param self The storage reference for VeVote.
   * @param newContractAddress The new contract address to set.
   */
  function setNodeManagementContract(
    VeVoteStorageTypes.VeVoteStorage storage self,
    address newContractAddress
  ) external {
    if (newContractAddress == address(0)) revert InvalidAddress();

    address oldContractAddress = address(self.nodeManagement);
    self.nodeManagement = INodeManagement(newContractAddress);
    emit NodeManagementContractSet(oldContractAddress, newContractAddress);
  }

  /**
   * @notice Sets the VeChain Node contract address.
   * @dev Ensures the provided address is not zero before updating.
   * @param self The storage reference for VeVote.
   * @param newContractAddress The new contract address to set.
   */
  function setVechainNodeContract(VeVoteStorageTypes.VeVoteStorage storage self, address newContractAddress) external {
    if (newContractAddress == address(0)) revert InvalidAddress();

    address oldContractAddress = address(self.vechainNodesContract);
    self.vechainNodesContract = ITokenAuction(newContractAddress);
    emit VechainNodeContractSet(oldContractAddress, newContractAddress);
  }

  /**
   * @notice Updates the node multiplier scores for each node level.
   * @param self The storage reference for VeVote.
   * @param updatedNodeMultipliers The new node multiplier scores to set.
   */
  function updateNodeMultipliers(
    VeVoteStorageTypes.VeVoteStorage storage self,
    VeVoteTypes.NodeVoteMultiplier memory updatedNodeMultipliers
  ) external {
    // Set the endorsement score for each node level
    self.nodeMultiplier[VechainNodesDataTypes.NodeStrengthLevel.Strength] = updatedNodeMultipliers.strength; // Strength Node score
    self.nodeMultiplier[VechainNodesDataTypes.NodeStrengthLevel.Thunder] = updatedNodeMultipliers.thunder; // Thunder Node score
    self.nodeMultiplier[VechainNodesDataTypes.NodeStrengthLevel.Mjolnir] = updatedNodeMultipliers.mjolnir; // Mjolnir Node score

    self.nodeMultiplier[VechainNodesDataTypes.NodeStrengthLevel.VeThorX] = updatedNodeMultipliers.veThorX; // VeThor X Node score
    self.nodeMultiplier[VechainNodesDataTypes.NodeStrengthLevel.StrengthX] = updatedNodeMultipliers.strengthX; // Strength X Node score
    self.nodeMultiplier[VechainNodesDataTypes.NodeStrengthLevel.ThunderX] = updatedNodeMultipliers.thunderX; // Thunder X Node score
    self.nodeMultiplier[VechainNodesDataTypes.NodeStrengthLevel.MjolnirX] = updatedNodeMultipliers.mjolnirX; // Mjolnir X Node score

    emit NodeVoteMultipliersUpdated(updatedNodeMultipliers);
  }

  /** ------------------ GETTERS ------------------ **/

  /**
   * @notice Returns the minimum voting delay.
   * @param self The storage reference for VeVote.
   * @return The current minimum voting delay.
   */
  function getMinVotingDelay(VeVoteStorageTypes.VeVoteStorage storage self) internal view returns (uint48) {
    return self.minVotingDelay;
  }

  /**
   * @notice Returns the minimum voting duration.
   * @param self The storage reference for VeVote.
   * @return The current minimum voting duration.
   */
  function getMinVotingDuration(VeVoteStorageTypes.VeVoteStorage storage self) internal view returns (uint48) {
    return self.minVotingDuration;
  }

  /**
   * @notice Returns the maximum voting duration.
   * @param self The storage reference for VeVote.
   * @return The current maximum voting duration.
   */
  function getMaxVotingDuration(VeVoteStorageTypes.VeVoteStorage storage self) internal view returns (uint48) {
    return self.maxVotingDuration;
  }

  /**
   * @notice Returns the maximum number of voting choices.
   * @param self The storage reference for VeVote.
   * @return The current maximum number of choices.
   */
  function getMaxChoices(VeVoteStorageTypes.VeVoteStorage storage self) internal view returns (uint8) {
    return self.maxChoices;
  }

  /**
   * @notice Returns the base level node for the VeChain Node contract.
   * @param self The storage reference for VeVote.
   * @return The current base level node.
   */
  function getBaseLevelNode(VeVoteStorageTypes.VeVoteStorage storage self) internal view returns (uint8) {
    return self.baseLevelNode;
  }

  /**
   * @notice Returns the address of the Node Management contract.
   * @param self The storage reference for VeVote.
   * @return The current Node Management contract address.
   */
  function getNodeManagementContract(
    VeVoteStorageTypes.VeVoteStorage storage self
  ) internal view returns (INodeManagement) {
    return self.nodeManagement;
  }

  /**
   * @notice Returns the address of the VeChain Node contract.
   * @param self The storage reference for VeVote.
   * @return The current VeChain Node contract address.
   */
  function getVechainNodeContract(VeVoteStorageTypes.VeVoteStorage storage self) internal view returns (ITokenAuction) {
    return self.vechainNodesContract;
  }

  /**
   * @notice this function returns the endorsement score of a node level.
   * @dev This value is scaled down by 100 from its stored value.
   * @param nodeLevel The node level of the node ID.
   * @return uint256 The voting multiplier score of the node level.
   */
  function nodeLevelMultiplier(
    VeVoteStorageTypes.VeVoteStorage storage self,
    VechainNodesDataTypes.NodeStrengthLevel nodeLevel
  ) internal view returns (uint256) {
    return self.nodeMultiplier[nodeLevel];
  }
}
