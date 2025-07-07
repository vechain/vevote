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
import { INodeManagement } from "../../interfaces/INodeManagement.sol";
import { IStargateNFT } from "../../interfaces/IStargateNFT.sol";
import "@openzeppelin/contracts/utils/structs/Checkpoints.sol";

/// @title GovernorStorageTypes
/// @notice Library for defining storage types used in the Governor contract.
library VeVoteStorageTypes {
  struct VeVoteStorage {
    // ------------------------------- Version 1 -------------------------------
    // ------------------------------- General Storage -------------------------------
    mapping(uint256 proposalId => VeVoteTypes.ProposalCore) proposals;
    /// @notice Minimum delay before a proposal can be voted on after creation (blocks)
    uint48 minVotingDelay;
    /// @notice Minimum duration a vote must remain open (blocks)
    uint48 minVotingDuration;
    /// @notice Maximum duration a vote can remain open (blocks)
    uint48 maxVotingDuration;
    /// @notice Maximum number of choices allowed in a proposal
    uint8 maxChoices;
    // ------------------------------- Quorum Storage -------------------------------
    /// @notice Stores history of quorum numerator changes (blocks)
    Checkpoints.Trace208 quorumNumeratorHistory;
    // ------------------------------- External Contracts Storage -------------------------------
    /// @notice Node Management contract for fetching voter eligibility and node information
    INodeManagement nodeManagement;
    /// @notice Stargate NFT contract
    IStargateNFT stargateNFT;
    /// @notice Builtin Authority contract address. After the Hayabusa mainnet hardfork, this will point to the on-chain staking registry.
    address validatorContract;
    // ------------------------------- Voting Storage -------------------------------
    /// @notice Voting weight multiplier for different stargate NFTs levelIds
    mapping(uint8 => uint256) levelIdMultiplier;
    /// @notice Vote tally for each proposal choice
    mapping(uint256 => mapping(uint8 => uint256)) voteTally;
    /// @notice Stores the votes for each proposal (bitmask representation)
    mapping(uint256 => mapping(address => uint32)) votes;
    /// @notice Stores the total votes for each proposal
    mapping(uint256 => uint256) totalVotes;
    /// @notice Tracks historical minimum staked VET required for normalization
    Checkpoints.Trace208 minStakedVetHistory;
    /// @notice Stores nodes that have voted on a given proposal
    mapping(uint256 => mapping(uint256 => bool)) nodeHasVoted;
    /// @notice Stores validators that have voted on a given proposal
    mapping(uint256 => mapping(address => bool)) validatorHasVoted;
  }
}
