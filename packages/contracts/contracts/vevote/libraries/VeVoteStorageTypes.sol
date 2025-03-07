// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

import { VeVoteTypes } from "./VeVoteTypes.sol";
import { INodeManagement } from "../../interfaces/INodeManagement.sol";
import { ITokenAuction } from "../../interfaces/ITokenAuction.sol";
import { VechainNodesDataTypes } from "../../libraries/VechainNodesDataTypes.sol";
import "@openzeppelin/contracts/utils/structs/DoubleEndedQueue.sol";
import "@openzeppelin/contracts/utils/structs/Checkpoints.sol";

/// @title GovernorStorageTypes
/// @notice Library for defining storage types used in the Governor contract.
library VeVoteStorageTypes {
  struct VeVoteStorage {
    // ------------------------------- Version 1 -------------------------------
    // ------------------------------- General Storage -------------------------------
    mapping(uint256 proposalId => VeVoteTypes.ProposalCore) proposals;
     /// @notice Minimum delay before a proposal can be voted on after creation
    uint48 minVotingDelay;
    /// @notice Minimum duration a vote must remain open
    uint48 minVotingDuration;
    /// @notice Maximum duration a vote can remain open
    uint48 maxVotingDuration;
    /// @notice Maximum number of choices allowed in a proposal
    uint8 maxChoices;
    // ------------------------------- Quorum Storage -------------------------------
    /// @notice Stores history of quorum numerator changes
    Checkpoints.Trace208 quorumNumeratorHistory;
    // ------------------------------- External Contracts Storage -------------------------------
    /// @notice Node Management contract for fetching voter eligibility and node information
    INodeManagement nodeManagement;
    /// @notice Vechain Node Token Auction contract (Optional - Pending Confirmation)
    ITokenAuction vechainNodesContract; // TODO: Do we need this, or can we just use the nodeManagement contract?
    // ------------------------------- Voting Storage -------------------------------
    /// @notice Voting weight multiplier for different node levels
    mapping(VechainNodesDataTypes.NodeStrengthLevel => uint256) nodeMultiplier;
    /// @notice Vote tally for each proposal choice
    mapping(uint256 => mapping(uint8 => uint256)) voteTally;
    /// @notice Stores the votes for each proposal (bitmask representation)
    mapping(uint256 => mapping(address => uint32)) votes;
    /// @notice Stores the cheapest Node a user can obtain
    VechainNodesDataTypes.NodeStrengthLevel cheapestNode;
  }
}
