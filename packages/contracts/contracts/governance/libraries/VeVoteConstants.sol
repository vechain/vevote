// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import { VeVoteTypes } from "./VeVoteTypes.sol";

/// @title VeVoteConstants
/// @notice Shared constants used across VeVote governance libraries.
library VeVoteConstants {
  // ---------------- Validator Constants ----------------

  /// @dev The total number of Authority Nodes on VeChain.
  uint256 internal constant TOTAL_AUTHORITY_MASTER_NODES = 101;

  /// @dev The minimum staked VET required to become a validator (25 million VET in wei).
  uint256 internal constant VALIDATOR_STAKED_VET_REQUIREMENT = 25_000_000 ether;

  // ---------------- State Bitmap Constants ----------------

  /// @notice Bitmap representing all possible proposal states.
  /// @dev Used for filtering proposal states via bitwise operations.
  bytes32 internal constant ALL_PROPOSAL_STATES_BITMAP =
    bytes32((1 << (uint8(type(VeVoteTypes.ProposalState).max) + 1)) - 1);

  // ---------------- Voting Constants ----------------

  /// @dev Multiplier scale used to normalize weighted voting.
  uint256 internal constant VOTING_MULTIPLIER_SCALE = 100;
}
