// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

import { VeVoteStorageTypes } from "./VeVoteStorageTypes.sol";
import { VeVoteStateLogic } from "./VeVoteStateLogic.sol";
import { VeVoteTypes } from "./VeVoteTypes.sol";
import { VechainNodesDataTypes } from "../../libraries/VechainNodesDataTypes.sol";
import { INodeManagement } from "../../interfaces/INodeManagement.sol";
import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";

library VeVoteVoteLogic {
  // ------------------------------- Errors -------------------------------
  /**
   * @dev Thrown when the proposal is not active.
   */
  error ProposalNotActive();

  /**
   * @dev Thrown when the user did not select a valid number of choices.
   */
  error InvalidVoteChoice();

  /**
   * @dev Thrown when the user is not eligible to vote.
   */
  error VoterNotEligible();

  /**
   * @dev Thrown when the user has already voted on the proposal.
   */
  error AlreadyVoted();

  /**
   * @dev Thrown when the voting power calculation overflows.
   */
  error VotePowerOverflow();

  // ------------------------------- Events -------------------------------
  /**
   * @notice Emitted when a user casts a vote on a proposal.
   * @param voter The address of the voter.
   * @param proposalId The ID of the proposal being voted on.
   * @param choices The bitmask representing the selected vote choices.
   * @param weight The voting weight of the voter.
   */
  event VoteCast(address indexed voter, uint256 indexed proposalId, uint32 choices, uint256 weight);

  /**
   * @notice Allows users to cast a vote on an active proposal.
   * @dev Ensures the proposal is active, checks if the user has already voted, and updates the vote tally.
   * @param self The storage reference for the VeVoteStorage.
   * @param proposalId The ID of the proposal being voted on.
   * @param choices The bitmask representing the selected vote choices.
   */
  function castVote(VeVoteStorageTypes.VeVoteStorage storage self, uint256 proposalId, uint32 choices) external {
    VeVoteTypes.ProposalCore storage proposal = self.proposals[proposalId];

    if (VeVoteStateLogic._state(self, proposalId) != VeVoteTypes.ProposalState.Active) {
      revert ProposalNotActive();
    }

    address voter = msg.sender;

    if (self.votes[proposalId][voter] != 0) {
      revert AlreadyVoted();
    }

    // Validate selected choices
    uint8 selectedChoices = _checkChoices(proposal, choices);

    // Calculate vote weight
    uint256 weight = _calculateVoteWeight(self, voter);
    if (weight == 0) {
      revert VoterNotEligible();
    }

    // Store vote
    self.votes[proposalId][voter] = choices;

    unchecked {
      uint256 divisionResult = weight / selectedChoices; // Store division result in memory
      mapping(uint8 => uint256) storage proposalTally = self.voteTally[proposalId]; // Cache storage pointer

      for (uint8 i = 0; i < proposal.choices.length; i++) {
        if ((choices & (1 << i)) != 0) {
          // Add division result to the tally for each selected choice
          proposalTally[i] += divisionResult;
        }
      }
    }

    emit VoteCast(voter, proposalId, choices, weight);
  }

  // ------------------------------- Private Functions -------------------------------

  /**
   * @dev Validates the selected vote choices using a bitmask.
   * @param proposal The proposal containing choice constraints.
   * @param choicesBitmask The bitmask representing selected choices.
   * @return selectedChoices The number of selected choices.
   */
  function _checkChoices(
    VeVoteTypes.ProposalCore storage proposal,
    uint32 choicesBitmask
  ) private view returns (uint8) {
    if (choicesBitmask == 0) {
      revert InvalidVoteChoice();
    }

    uint8 maxOptions = uint8(proposal.choices.length);

    // Mask out any bits that exceed valid options
    uint32 validMask = uint32(1 << maxOptions) - 1;
    if (choicesBitmask & ~validMask != 0) {
      revert InvalidVoteChoice(); // Ensures no out-of-bounds choices
    }

    uint8 selectedChoices = _countSetBits(choicesBitmask);
    if (selectedChoices < proposal.minSelection || selectedChoices > proposal.maxSelection) {
      revert InvalidVoteChoice();
    }

    return selectedChoices;
  }

  /**
   * @dev Counts the number of set bits (1s) in a uint32 bitmask.
   * @param bitmask The bitmask representing selected choices.
   * @return count The number of selected choices.
   */
  function _countSetBits(uint32 bitmask) private pure returns (uint8 count) {
    while (bitmask > 0) {
      count += uint8(bitmask & 1); // Count the last bit
      bitmask >>= 1; // Shift right by 1
    }
  }

  // TODO: This function is incomplete, needs to be improved when new node contract is ready
  // TODO: Add snapshot parameter
  function _calculateVoteWeight(
    VeVoteStorageTypes.VeVoteStorage storage self,
    address voter
  )
    private
    view
    returns (
      //uint48 proposalSnapshot
      uint256 weight
    )
  {
    // Fetch voter's node data -> TODO: Get users snapshot data
    VechainNodesDataTypes.NodeLevelInfo[] memory nodes = self.nodeManagement.getUsersNodesWithLevelInfo(voter);

    // If the user has no nodes, return 0 -> They are not eligible to vote
    uint256 totalNodes = nodes.length;
    if (totalNodes == 0) {
      return 0;
    }

    // TODO: Can wer get this directly from the node management contract? Do we need to store cheapest node
    uint256 cheapestNodeRequirement;
    (cheapestNodeRequirement, , , ) = self.vechainNodesContract.getTokenParams(uint8(self.cheapestNode));

    unchecked {
      for (uint256 i = 0; i < totalNodes; i++) {
        // Skip nodes with no voting power
        if (nodes[i].nodeLevel == VechainNodesDataTypes.NodeStrengthLevel.None) {
          continue;
        }

        // Calculate base voting power
        uint256 baseVotingPower = nodes[i].minBalance / cheapestNodeRequirement;

        // Use tryMul to prevent overflow
        (bool success, uint256 nodeWeight) = Math.tryMul(baseVotingPower, self.nodeMultiplier[nodes[i].nodeLevel]);
        if (!success) {
          revert VotePowerOverflow();
        }
        // Apply node weight to users total voting power
        weight += nodeWeight;
      }
    }
  }
}
