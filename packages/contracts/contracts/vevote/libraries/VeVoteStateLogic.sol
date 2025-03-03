// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

import { VeVoteStorageTypes } from "./VeVoteStorageTypes.sol";
import { VeVoteProposalLogic } from "./VeVoteProposalLogic.sol";
import { VeVoteClockLogic } from "./VeVoteClockLogic.sol";
import { VeVoteQuoromLogic } from "./VeVoteQuoromLogic.sol";
import { VeVoteTypes } from "./VeVoteTypes.sol";

/// @title VeVoteStateLogic
/// @notice Handles the state determination of governance proposals in the VeVote system.
/// @dev Provides functions to determine the status of a proposal based on various governance rules.
library VeVoteStateLogic {
  // ------------------------------- Errors -------------------------------f
  /**
   * @dev Thrown when the `proposalId` does not exist.
   * @param proposalId The ID of the proposal that does not exist.
   */
  error VeVoteNonexistentProposal(uint256 proposalId);

  // ------------------------------- External Functions -------------------------------
  /**
   * @notice Retrieves the current state of a proposal.
   * @dev Calls the internal `_state` function to determine the proposal's status.
   * @param self The storage reference for the VeVote system.
   * @param proposalId The ID of the proposal.
   * @return The current state of the proposal.
   */
  function state(
    VeVoteStorageTypes.VeVoteStorage storage self,
    uint256 proposalId
  ) external view returns (VeVoteTypes.ProposalState) {
    return _state(self, proposalId);
  }

  /**
   * @notice Determines the current state of a proposal.
   * @dev This function evaluates whether a proposal is pending, active, succeeded, defeated, executed, or canceled.
   * @param self The storage reference for the VeVote system.
   * @param proposalId The ID of the proposal.
   * @return The computed state of the proposal.
   */
  function _state(
    VeVoteStorageTypes.VeVoteStorage storage self,
    uint256 proposalId
  ) internal view returns (VeVoteTypes.ProposalState) {
    VeVoteTypes.ProposalCore storage proposal = self.proposals[proposalId];

    // If the proposal has been executed, return Executed state
    if (proposal.executed) {
      return VeVoteTypes.ProposalState.Executed;
    }

    // If the proposal has been canceled, return Canceled state
    if (proposal.canceled) {
      return VeVoteTypes.ProposalState.Canceled;
    }

    // Retrieve the proposal's voting snapshot (start time)
    uint256 snapshot = VeVoteProposalLogic.proposalSnapshot(self, proposalId);

    // If there is no snapshot, the proposal does not exist
    if (snapshot == 0) {
      revert VeVoteNonexistentProposal(proposalId);
    }

    uint256 currentTimepoint = VeVoteClockLogic.clock();

    // If the snapshot is in the future, the proposal is still Pending
    if (snapshot >= currentTimepoint) {
      return VeVoteTypes.ProposalState.Pending;
    }

    // Retrieve the voting deadline for the proposal
    uint256 deadline = VeVoteProposalLogic.proposalDeadline(self, proposalId);

    // If the deadline has not passed, the proposal is still Active
    if (deadline >= currentTimepoint) {
      return VeVoteTypes.ProposalState.Active;
    }
    // If the quorum was not reached, the proposal is Defeated
    else if (!VeVoteQuoromLogic._quorumReached(self, proposalId)) {
      return VeVoteTypes.ProposalState.Defeated;
    }
    // Otherwise, the proposal has succeeded
    else {
      return VeVoteTypes.ProposalState.Succeeded;
    }
  }
}
