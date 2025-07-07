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

import { INodeManagement } from "../../interfaces/INodeManagement.sol";
import { IStargateNFT } from "../../interfaces/IStargateNFT.sol";

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
    IStargateNFT stargateNFT;
    address authorityContract;
    uint256 quorumPercentage;
    uint48 initialMinVotingDelay;
    uint48 initialMaxVotingDuration;
    uint48 initialMinVotingDuration;
    uint8 initialMaxChoices;
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

  /**
   * @notice Represents the result of a proposal vote.
   * @param choice The label of the choice.
   * @param weight The total votes for that choice.
   */
  struct ProposalVoteResult {
    bytes32 choice;
    uint256 weight;
  }
}
