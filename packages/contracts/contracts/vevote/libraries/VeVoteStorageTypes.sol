// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

import { VeVoteTypes } from "./VeVoteTypes.sol";
import { INodeManagement } from "../../interfaces/INodeManagement.sol";
import { ITokenAuction } from "../../interfaces/ITokenAuction.sol";
import "@openzeppelin/contracts/utils/structs/DoubleEndedQueue.sol";
import "@openzeppelin/contracts/utils/structs/Checkpoints.sol";

/// @title GovernorStorageTypes
/// @notice Library for defining storage types used in the Governor contract.
library VeVoteStorageTypes {
  struct VeVoteStorage {
    // ------------------------------- Version 1 -------------------------------
    // ------------------------------- General Storage -------------------------------
    mapping(uint256 proposalId => VeVoteTypes.ProposalCore) proposals;
    // minVotingDelay is the minimum delay between the time a proposal is created and the time it can be voted on
    uint48 minVotingDelay;
    //minVotingDuration is the minimum duration of a vote on a proposal
    uint48 minVotingDuration;
    // maxVotingDuration is the maximum duration of a vote on a proposal
    uint48 maxVotingDuration;
    // maxChoices is the maximum number of choices a proposal can have
    uint8 maxChoices;
    // ------------------------------- Quorum Storage -------------------------------
    // quorum numerator history
    Checkpoints.Trace208 quorumNumeratorHistory;
    // ------------------------------- External Contracts Storage -------------------------------
    // Node Management contract
    INodeManagement nodeManagement; 
    // Vechain Node Token Auction contract
    ITokenAuction tokenAuction; // TODO: Do we need this, or can we just use the nodeManagement contract?
  }
}
