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

import { INodeManagement } from "../../../interfaces/INodeManagement.sol";
import { IStargateNFTV2 } from "../../../interfaces/IStargateNFTV2.sol";

/// @title VeVoteTypes
/// @notice Defines the core types used in the VeVote governance system.
/// @dev Contains the `ProposalState` enum and the `ProposalCore` struct for managing proposal data.
library VeVoteTypesV1 {
  /// @notice Represents the different states a governance proposal can be in.
  /// @dev Used to track and manage the lifecycle of a proposal.
  enum ProposalState {
    /// @notice The proposal is created but has not yet started.
    Pending,
    /// @notice The proposal is currently open for voting.
    Active,
    /// @notice The proposal was canceled by the proposer or governance system.
    Canceled,
    /// @notice The proposal failed to reach the required quorum or did not pass.
    Defeated,
    /// @notice The proposal successfully passed but has not yet been executed.
    Succeeded,
    /// @notice The proposal has been executed.
    Executed
  }

  /// @notice Encodes the three valid voting options in VeVote governance.
  /// @dev Used to validate and tally participant voting intent.
  enum VoteType {
    /// @notice Vote against the proposal.
    Against,
    /// @notice Vote in favor of the proposal.
    For,
    /// @notice Abstain from voting.
    Abstain
  }

  /// @notice Stores the core data for a proposal.
  /// @dev This struct holds key information needed to track a proposal's progress.
  struct ProposalCore {
    /// @notice The address of the proposer who created the proposal.
    address proposer;
    /// @notice The timestamp when voting begins.
    uint48 voteStart;
    /// @notice The duration of the voting period in seconds.
    uint48 voteDuration;
    /// @notice Indicates whether the proposal has been executed.
    bool executed;
    /// @notice Indicates whether the proposal has been canceled.
    bool canceled;
  }

  struct InitializationData {
    INodeManagement nodeManagement;
    IStargateNFTV2 stargateNFT;
    address authorityContract;
    uint256 quorumPercentage;
    uint48 initialMinVotingDelay;
    uint48 initialMaxVotingDuration;
    uint48 initialMinVotingDuration;
    uint256 initialMinStakedAmount;
  }

  struct InitializationRolesData {
    address admin;
    address upgrader;
    address[] whitelist;
    address settingsManager;
    address nodeWeightManager;
    address executor;   
    address whitelistAdmin;
  }

  /// @notice Tracks voting results and participation state for a proposal.
  /// @dev Mapped by proposal ID to store cumulative vote tallies and participation flags.
  struct ProposalVote {
    /// @notice Total normalized weight of votes against the proposal.
    uint256 againstVotes;
    /// @notice Total normalized weight of votes in favor of the proposal.
    uint256 forVotes;
    /// @notice Total normalized weight of abstention votes.
    uint256 abstainVotes;
    /// @notice Tracks which addresses have already voted to prevent double voting.
    mapping(address => bool) hasVoted;
  }
}
