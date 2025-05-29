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

import { VeVoteStorageTypes } from "./VeVoteStorageTypes.sol";
import { VeVoteClockLogic } from "./VeVoteClockLogic.sol";
import { VeVoteTypes } from "./VeVoteTypes.sol";
import { INodeManagement } from "../../interfaces/INodeManagement.sol";
import { IStargateNFT } from "../../interfaces/IStargateNFT.sol";
import { IAuthority } from "../../interfaces/IAuthority.sol";
import "@openzeppelin/contracts/utils/structs/Checkpoints.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";

/// @title VeVoteConfigurator
/// @notice Library for configuring governance parameters in VeVote.
/// @dev Provides setter and getter functions for governance configuration settings.
library VeVoteConfigurator {
  using Checkpoints for Checkpoints.Trace208;

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
   * @dev Thrown when an invalid minimum VET staked is set.
   */
  error InvalidMinimumStake();

  // ------------------------------- Events -------------------------------

  /**
   * @notice Emitted when the minimum voting delay is updated.
   * @param oldMinVotingDelay The previous minimum voting delay.
   * @param newMinVotingDelay The new minimum voting delay.
   */
  event MinVotingDelaySet(uint48 oldMinVotingDelay, uint48 newMinVotingDelay);

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
   * @notice Emitted when the Stargate NFT contract address is updated.
   * @param oldContractAddress The previous contract address.
   * @param newContractAddress The new contract address.
   */
  event StargateNFTContractSet(address oldContractAddress, address newContractAddress);

  /**
   * @notice Emitted when the Validator contract address is updated.
   * @param oldContractAddress The previous contract address.
   * @param newContractAddress The new contract address.
   */
  event ValidatorContractSet(address oldContractAddress, address newContractAddress);

  /**
   * @notice Emitted when the minimum VET stake requirement is updated for vote normalization.
   * @param previousMinStake The previous minimum VET stake (used as vote weight denominator).
   * @param newMinStake The new minimum VET stake required.
   */
  event MinStakedAmountUpdated(uint256 previousMinStake, uint256 newMinStake);

  /**
   * @notice Emitted when the voting multipliers are updated in batch.
   * @param updatedMultipliers The updated multipliers by level ID index.
   */
  event VoteMultipliersUpdated(uint256[] updatedMultipliers);

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
    if (newMinVotingDuration == 0 || newMinVotingDuration >= self.maxVotingDuration) revert InvalidMinVotingDuration();

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
    if (newMaxVotingDuration <= self.minVotingDuration) revert InvalidMaxVotingDuration();

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
   * @notice Updates the minimum VET stake required for vote weight normalization.
   * @param self The storage reference for VeVote.
   * @param newMinStake The new minimum stake amount in VET (must be > 0).
   */
  function setMinStakedVetAmount(VeVoteStorageTypes.VeVoteStorage storage self, uint256 newMinStake) external {
    if (newMinStake == 0) revert InvalidMinimumStake();

    uint256 previous = self.minStakedVetHistory.latest();
    self.minStakedVetHistory.push(VeVoteClockLogic.clock(), SafeCast.toUint208(newMinStake));

    emit MinStakedAmountUpdated(previous, newMinStake);
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
   * @notice Sets the Stargate NFT contract adress.
   * @dev Ensures the provided address is not zero before updating.
   * @param self The storage reference for VeVote.
   * @param newContractAddress The new contract address to set.
   */
  function setStargateNFTContract(VeVoteStorageTypes.VeVoteStorage storage self, address newContractAddress) external {
    if (newContractAddress == address(0)) revert InvalidAddress();

    address oldContractAddress = address(self.stargateNFT);
    self.stargateNFT = IStargateNFT(newContractAddress);
    emit StargateNFTContractSet(oldContractAddress, newContractAddress);
  }

  /**
   * @notice Sets the Validator contract address.
   * @dev Ensures the provided address is not zero before updating.
   * @param self The storage reference for VeVote.
   * @param newContractAddress The new contract address to set.
   */
  function setValidatorContract(VeVoteStorageTypes.VeVoteStorage storage self, address newContractAddress) external {
    if (newContractAddress == address(0)) revert InvalidAddress();

    address oldContractAddress = self.validatorContract;
    self.validatorContract = newContractAddress;
    emit ValidatorContractSet(oldContractAddress, newContractAddress);
  }

  /**
   * @notice Updates the Stargate NFT and Validtorvote weight multipliers for each level ID.
   * @dev The index in the array corresponds to the `levelId`. Array length must be <= max level count. (Note: Index 0 = Validator)
   * @param self The storage reference for VeVote.
   * @param newMultipliers Array of new vote multipliers for each levelId (index = levelId).
   */
  function updateLevelIdMultipliers(
    VeVoteStorageTypes.VeVoteStorage storage self,
    uint256[] calldata newMultipliers
  ) external {
    uint256 length = newMultipliers.length;
    for (uint8 i; i < length; ++i) {
      self.levelIdMultiplier[i] = newMultipliers[i];
    }

    emit VoteMultipliersUpdated(newMultipliers);
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
   * @notice Returns the current minimum VET stake required for vote normalization.
   * @param self The storage reference for VeVote.
   * @return The latest checkpointed min stake.
   */
  function getMinStakedAmount(VeVoteStorageTypes.VeVoteStorage storage self) internal view returns (uint256) {
    return self.minStakedVetHistory.latest();
  }

  /**
   * @notice Returns the minimum stake requirement at a given snapshot.
   * @param self The storage reference for VeVote.
   * @param timepoint The snapshot block.
   * @return The min stake at that time.
   */
  function getMinStakedAmountAtTimepoint(
    VeVoteStorageTypes.VeVoteStorage storage self,
    uint48 timepoint
  ) internal view returns (uint256) {
    return self.minStakedVetHistory.upperLookupRecent(timepoint);
  }

  /**
   * @notice Returns the Node Management contract.
   * @param self The storage reference for VeVote.
   * @return The current Node Management contract.
   */
  function getNodeManagementContract(
    VeVoteStorageTypes.VeVoteStorage storage self
  ) internal view returns (INodeManagement) {
    return self.nodeManagement;
  }

  /**
   * @notice Returns the Stargate NFT contract.
   * @param self The storage reference for VeVote.
   * @return The current Stargate NFT contract.
   */
  function getStargateNFTContract(VeVoteStorageTypes.VeVoteStorage storage self) internal view returns (IStargateNFT) {
    return self.stargateNFT;
  }

  /**
   * @notice Returns the builtin Authority contract.
   * @param self The storage reference for VeVote.
   * @return The current builtin validator contract.
   */
  function getValidatorContract(VeVoteStorageTypes.VeVoteStorage storage self) internal view returns (IAuthority) {
    return IAuthority(self.validatorContract);
  }

  /**
   * @notice this function returns the voting multiplier of a Stargate NFT level ID.
   * @dev This value is scaled down by 100 from its stored value.
   * @param levelId The level ID of the Stargate NFT.
   * @return uint256 The voting multiplier score of the node level.
   */
  function levelIdMultiplier(
    VeVoteStorageTypes.VeVoteStorage storage self,
    uint8 levelId
  ) internal view returns (uint256) {
    return self.levelIdMultiplier[levelId];
  }
}
