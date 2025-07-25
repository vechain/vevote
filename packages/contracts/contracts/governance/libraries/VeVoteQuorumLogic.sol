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
import { VeVoteProposalLogic } from "./VeVoteProposalLogic.sol";
import { VeVoteClockLogic } from "./VeVoteClockLogic.sol";
import { VeVoteVoteLogic } from "./VeVoteVoteLogic.sol";
import { VeVoteConstants } from "./VeVoteConstants.sol";
import { VeVoteConfigurator } from "./VeVoteConfigurator.sol";
import { DataTypes } from "../../external/StargateNFT/libraries/DataTypes.sol";
import "@openzeppelin/contracts/utils/structs/Checkpoints.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";

/// @title VeVoteQuorumLogic
/// @notice Library for managing and calculating quorum requirements in the VeVote contract.
/// @dev This library provides functions to track quorum history, update quorum requirements, and determine if quorum has been met for proposals.
library VeVoteQuorumLogic {
  using Checkpoints for Checkpoints.Trace208;

  // ------------------------------- Errors -------------------------------
  /**
   * @dev Thrown when an invalid quorum fraction is provided.
   *      - The numerator must be less than or equal to the denominator.
   */
  error VeVoteInvalidQuorumFraction(uint256 quorumNumerator, uint256 quorumDenominator);

  // ------------------------------- Events -------------------------------
  /**
   * @notice Emitted when the quorum numerator is updated.
   * @param oldNumerator The previous quorum numerator.
   * @param newNumerator The new quorum numerator.
   */
  event QuorumNumeratorUpdated(uint256 oldNumerator, uint256 newNumerator);

  /** ------------------ GETTERS ------------------ **/

  /**
   * @notice Returns the quorum denominator, which is a constant value.
   * @dev This defines the base for quorum calculations. A quorum fraction is expressed as:
   *      `quorumNumerator / quorumDenominator`
   * @return The constant quorum denominator (100).
   */
  function quorumDenominator() internal pure returns (uint256) {
    return 100;
  }

  /**
   * @notice Returns the quorum numerator at a given timepoint.
   * @dev Uses an optimized approach to check the latest quorum numerator before doing a binary search.
   * @param self The storage reference for VeVoteStorage.
   * @param timepoint The block number for which to retrieve the quorum numerator.
   * @return The quorum numerator value at the given timepoint.
   */
  function quorumNumerator(
    VeVoteStorageTypes.VeVoteStorage storage self,
    uint48 timepoint
  ) public view returns (uint256) {
    return _optimisticUpperLookupRecent(self.quorumNumeratorHistory, timepoint);
  }

  /**
   * @notice Returns the latest recorded quorum numerator.
   * @param self The storage reference for VeVoteStorage.
   * @return The latest quorum numerator.
   */
  function quorumNumerator(VeVoteStorageTypes.VeVoteStorage storage self) public view returns (uint256) {
    return self.quorumNumeratorHistory.latest();
  }

  /**
   * @notice Checks if the quorum has been reached for a proposal.
   * @param self The storage reference for the VeVoteStorage.
   * @param proposalId The ID of the proposal.
   * @return True if the quorum has been reached, false otherwise.
   */
  function isQuorumReached(
    VeVoteStorageTypes.VeVoteStorage storage self,
    uint256 proposalId
  ) external view returns (bool) {
    return _quorumReached(self, proposalId);
  }

  /**
   * @notice Calculates the quorum required at a given timepoint.
   * @param self The storage reference for VeVoteStorage.
   * @param timepoint The block number to retrieve quorum requirements for.
   * @return The required quorum at the given timepoint.
   */
  function quorum(VeVoteStorageTypes.VeVoteStorage storage self, uint48 timepoint) external view returns (uint256) {
    return _quorum(self, timepoint);
  }

  /** ------------------ SETTERS ------------------ **/

  /**
   * @notice Updates the quorum numerator to a new value and records it at the current time.
   * @dev This function should only be called from governance actions.
   *      - Ensures the numerator is <= denominator.
   *      - Pushes a new quorum numerator checkpoint.
   * @param self The storage reference for VeVoteStorage.
   * @param newQuorumNumerator The new quorum numerator value.
   */
  function updateQuorumNumerator(VeVoteStorageTypes.VeVoteStorage storage self, uint256 newQuorumNumerator) external {
    uint256 denominator = quorumDenominator();
    uint256 oldQuorumNumerator = quorumNumerator(self);

    if (newQuorumNumerator > denominator) {
      revert VeVoteInvalidQuorumFraction(newQuorumNumerator, denominator);
    }

    self.quorumNumeratorHistory.push(VeVoteClockLogic.clock(), SafeCast.toUint208(newQuorumNumerator));

    emit QuorumNumeratorUpdated(oldQuorumNumerator, newQuorumNumerator);
  }

  /** ------------------ INTERNAL FUNCTIONS ------------------ **/

  /**
   * @dev Internal function to determine if a proposal has met the required quorum.
   * @param self The storage reference for VeVoteStorage.
   * @param proposalId The unique identifier of the proposal.
   * @return True if the proposal has met quorum, false otherwise.
   */
  function _quorumReached(
    VeVoteStorageTypes.VeVoteStorage storage self,
    uint256 proposalId
  ) internal view returns (bool) {
    return
      _quorum(self, VeVoteProposalLogic.proposalSnapshot(self, proposalId)) <=
      VeVoteVoteLogic.totalVotes(self, proposalId);
  }

  /**
   * @notice Internal function to calculate the quorum required at a given timepoint.
   * @param self The storage reference for VeVoteStorage.
   * @param timepoint The block number to retrieve quorum requirements for.
   * @return quorum at the given timepoint.
   */
  function _quorum(VeVoteStorageTypes.VeVoteStorage storage self, uint48 timepoint) internal view returns (uint256) {
    uint208[] memory circulatingSupplies = self.stargateNFT.getLevelsCirculatingSuppliesAtBlock(timepoint);
    DataTypes.Level[] memory stargateLevels = self.stargateNFT.getLevels();

    // Determine total potenial vote weigth from validators
    uint256 validatorStake = VeVoteConstants.VALIDATOR_STAKED_VET_REQUIREMENT;
    uint256 validatorWeight = self.levelIdMultiplier[0];
    uint256 totalScaledWeight = VeVoteConstants.TOTAL_AUTHORITY_MASTER_NODES * validatorStake * validatorWeight;

    // Cache number of levels
    uint256 levelCount = circulatingSupplies.length;
    for (uint8 i; i < levelCount; i++) {
      uint256 supply = circulatingSupplies[i];
      uint256 multiplier = self.levelIdMultiplier[i + 1]; // +1 to skip validator
      uint256 requiredStake = stargateLevels[i].vetAmountRequiredToStake;

      // supply * multiplier * requiredStake
      totalScaledWeight += supply * multiplier * requiredStake;
    }

    // Ensure minimum staked vet to hold stargate NFT is greater than 0
    uint256 minStake = VeVoteConfigurator.getMinStakedAmountAtTimepoint(self, timepoint);

    // Divide by minimum stake to own stargate NFT to determine total potenial weight
    uint256 totalPotentialWeight = totalScaledWeight / minStake;

    // return quorom
    return (totalPotentialWeight * quorumNumerator(self, timepoint)) / quorumDenominator();
  }

  // ------------------ Private functions ------------------
  /**
   * @dev Returns the numerator at a specific timepoint.
   */
  function _optimisticUpperLookupRecent(
    Checkpoints.Trace208 storage ckpts,
    uint48 timepoint
  ) private view returns (uint256) {
    // If trace is empty, key and value are both equal to 0.
    // In that case `key <= timepoint` is true, and it is ok to return 0.
    (, uint48 key, uint208 value) = ckpts.latestCheckpoint();
    return key <= timepoint ? value : ckpts.upperLookupRecent(timepoint);
  }
}
