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
  // ------------------------------- Errors -------------------------------
  /**
   * @dev Thrown when the `proposalId` does not exist.
   * @param proposalId The ID of the proposal that does not exist.
   */
  error VeVoteNonexistentProposal(uint256 proposalId);

  /**
   * @dev Thrown when the current state of a proposal does not match the expected state.
   * @param proposalId The ID of the proposal.
   * @param current The current state of the proposal.
   * @param expectedStates The expected states for the proposal.
   */
  error VeVoteUnexpectedProposalState(uint256 proposalId, VeVoteTypes.ProposalState current, bytes32 expectedStates);

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

  // ------------------------------- Internal Functions -------------------------------

  /**
   * @dev Internal function to validate the current state of a proposal against expected states.
   * @param self The storage reference for the VeVoteStorage.
   * @param proposalId The ID of the proposal.
   * @param allowedStates The bitmap of allowed states.
   * @return The current state of the proposal.
   */
  function validateStateBitmap(
    VeVoteStorageTypes.VeVoteStorage storage self,
    uint256 proposalId,
    bytes32 allowedStates
  ) internal view returns (VeVoteTypes.ProposalState) {
    VeVoteTypes.ProposalState currentState = _state(self, proposalId);
    if (encodeStateBitmap(currentState) & allowedStates == bytes32(0)) {
      revert VeVoteUnexpectedProposalState(proposalId, currentState, allowedStates);
    }
    return currentState;
  }

  /**
   * @dev Encodes a `ProposalState` into a `bytes32` representation where each bit enabled corresponds to the underlying position in the `ProposalState` enum.
   * @param proposalState The state to encode.
   * @return The encoded state bitmap.
   */
  function encodeStateBitmap(VeVoteTypes.ProposalState proposalState) internal pure returns (bytes32) {
    return bytes32(1 << uint8(proposalState));
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
    // Cache the proposal and its snapshot
    VeVoteTypes.ProposalCore storage proposal = self.proposals[proposalId];
    uint256 snapshot = proposal.voteStart;
      
    // If there is no snapshot, the proposal does not exist
    if (snapshot == 0) {
      revert VeVoteNonexistentProposal(proposalId);
    }

    // If the proposal has been executed, return Executed state
    if (proposal.executed) {
      return VeVoteTypes.ProposalState.Executed;
    }

    // If the proposal has been canceled, return Canceled state
    if (proposal.canceled) {
      return VeVoteTypes.ProposalState.Canceled;
    }

    // Retrieve the current timepoint
    uint256 currentBlock = VeVoteClockLogic.clock();

    // If the snapshot is in the future, the proposal is stil Pending
    if (snapshot > currentBlock) {
      return VeVoteTypes.ProposalState.Pending;
    }

    // Retrieve the voting deadline for the proposal
    uint256 deadline = VeVoteProposalLogic.proposalDeadline(self, proposalId);

    // If the deadline has not passed, the proposal is still Active
    if (deadline >= currentBlock) {
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
