// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

import { INodeManagement } from "../../interfaces/INodeManagement.sol";
import { ITokenAuction } from "../../interfaces/ITokenAuction.sol";

/// @title VeVoteTypes
/// @notice Defines the core types used in the VeVote governance system.
/// @dev Contains the `ProposalState` enum and the `ProposalCore` struct for managing proposal data.
library VeVoteTypes {
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

  /// @notice Stores the core data for a proposal.
  /// @dev This struct holds key information needed to track a proposal's progress.
  struct ProposalCore {
    /// @notice The address of the proposer who created the proposal.
    address proposer;
    /// @notice The timestamp when voting begins.
    uint48 voteStart;
    /// @notice The duration of the voting period in seconds.
    uint48 voteDuration;
    /// @notice The available choices voters can select.
    bytes32[] choices;
    /// @notice The maximum number of choices a voter can select.
    uint8 maxSelection;
    /// @notice The minimum number of choices a voter must select.
    uint8 minSelection;
    /// @notice Indicates whether the proposal has been executed.
    bool executed;
    /// @notice Indicates whether the proposal has been canceled.
    bool canceled;
  }

  struct InitializationData {
    INodeManagement nodeManagement;
    ITokenAuction tokenAuction;
    uint256 quorumPercentage;
    uint48 initialMinVotingDelay;
    uint48 initialMaxVotingDuration;
    uint48 initialMinVotingDuration;
    uint8 initialMaxChoices;
  }

  struct InitializationRolesData {
    address admin;
    address upgrader;
    address[] whitelist; 
  }
}
