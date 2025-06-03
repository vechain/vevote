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
