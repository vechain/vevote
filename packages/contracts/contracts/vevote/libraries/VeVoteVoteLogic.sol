// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

import { VeVoteStorageTypes } from "./VeVoteStorageTypes.sol";
import { VeVoteStateLogic } from "./VeVoteStateLogic.sol";
import { VeVoteTypes } from "./VeVoteTypes.sol";
import { VechainNodesDataTypes } from "../../libraries/VechainNodesDataTypes.sol";
import { INodeManagement } from "../../interfaces/INodeManagement.sol";
import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";

library VeVoteVoteLogic {
  // ------------------------------- Constants -------------------------------
  uint256 private constant VOTING_MULTIPLER_SCALE = 100;

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

  /**
   * @dev Thrown when the voting weight denominator is zero.
   */
  error VoteWeightDenominatorZero();

  // ------------------------------- Events -------------------------------
  /**
   * @notice Emitted when a user casts a vote on a proposal.
   * @param voter The address of the voter.
   * @param proposalId The ID of the proposal being voted on.
   * @param choices The bitmask representing the selected vote choices.
   * @param weight The voting weight of the voter.
   * @param reason The reason for the vote.
   */
  event VoteCast(address indexed voter, uint256 indexed proposalId, uint32 choices, uint256 weight, string reason);

  // ------------------------------- Setter Functions -------------------------------
  /**
   * @notice Allows users to cast a vote on an active proposal.
   * @dev Ensures the proposal is active, checks if the user has already voted, and updates the vote tally.
   * @param self The storage reference for the VeVoteStorage.
   * @param proposalId The ID of the proposal being voted on.
   * @param choices The bitmask representing the selected vote choices.
   */
  function castVote(
    VeVoteStorageTypes.VeVoteStorage storage self,
    uint256 proposalId,
    uint32 choices,
    string memory reason
  ) external {
    VeVoteTypes.ProposalCore storage proposal = self.proposals[proposalId];

    // Check that the proposal is active, otherwise revert
    if (VeVoteStateLogic._state(self, proposalId) != VeVoteTypes.ProposalState.Active) {
      revert ProposalNotActive();
    }

    // Cache voter address
    address voter = msg.sender;

    // Check if the user has already voted, if so revert
    if (self.votes[proposalId][voter] != 0) {
      revert AlreadyVoted();
    }

    // Validate selected choices
    uint8 selectedChoices = _checkChoices(proposal, choices);

    // Calculate vote weight
    uint256 weight = _calculateVoteWeight(self, voter, proposal.voteStart);
    if (weight == 0) {
      revert VoterNotEligible();
    }

    // Calculate the normalised vote weight
    uint256 normalisedVoteWeight = weight / _voteWeightDenominator(self, proposal.voteStart);

    // Store vote
    self.votes[proposalId][voter] = choices;
    self.totalVotes[proposalId] += normalisedVoteWeight;

    unchecked {
      // We do not normalize the vote weight here, as it is done in the tally, could cause rounding errors
      uint256 divisionResult = weight / selectedChoices; // Store division result in memory
      mapping(uint8 => uint256) storage proposalTally = self.voteTally[proposalId]; // Cache storage pointer

      for (uint8 i = 0; i < proposal.choices.length; i++) {
        if ((choices & (1 << i)) != 0) {
          // Add division result to the tally for each selected choice
          proposalTally[i] += divisionResult;
        }
      }
    }

    emit VoteCast(voter, proposalId, choices, normalisedVoteWeight, reason);
  }

  // ------------------------------- Getter Functions -------------------------------

  /**
   * @notice Retrieves the voting weight of an account at a given timepoint.
   * @param self The storage reference for the VeVoteStorage.
   * @param account The address of the account.
   * @param timepoint The specific timepoint.
   * @return The voting weight of the account.
   */
  function getVoteWeight(
    VeVoteStorageTypes.VeVoteStorage storage self,
    address account,
    uint48 timepoint
  ) external view returns (uint256) {
    // Return the vote weight divided by the denominator to normalize it
    return _calculateVoteWeight(self, account, timepoint) / _voteWeightDenominator(self, timepoint);
  }

  /**
   * @notice Checks if an account has voted on a specific proposal.
   * @param self The storage reference for the VeVoteStorage.
   * @param proposalId The ID of the proposal.
   * @param account The address of the account.
   * @return True if the account has voted, false otherwise.
   */
  function hasVoted(
    VeVoteStorageTypes.VeVoteStorage storage self,
    uint256 proposalId,
    address account
  ) internal view returns (bool) {
    return self.votes[proposalId][account] != 0;
  }

  /**
   * @notice Retrieves the normalized total votes for a proposal.
   * @param self The storage reference for the VeVoteStorage.
   * @param proposalId The ID of the proposal.
   * @return The total votes for the proposal.
   */
  function totalVotes(
    VeVoteStorageTypes.VeVoteStorage storage self,
    uint256 proposalId
  ) internal view returns (uint256) {
    return self.totalVotes[proposalId];
  }

  /**
   * @notice Retrieves the votes for a proposal.
   * @param self The storage reference for the VeVoteStorage.
   * @param proposalId The ID of the proposal.
   */
  function getProposalVotes(
    VeVoteStorageTypes.VeVoteStorage storage self,
    uint256 proposalId
  ) external view returns (VeVoteTypes.ProposalVoteResult[] memory results) {
    bytes32[] storage choices = self.proposals[proposalId].choices;
    uint256 numChoices = choices.length;

    results = new VeVoteTypes.ProposalVoteResult[](numChoices);

    // Iterate over each choice and calculate the normalized weight
    for (uint8 i = 0; i < numChoices; i++) {
      // Determine the normalized weight of the vote
      uint256 normalizedWeight = self.voteTally[proposalId][i] /
        _voteWeightDenominator(self, self.proposals[proposalId].voteStart);

      // Store the result in the array
      results[i] = VeVoteTypes.ProposalVoteResult({
        choice: choices[i], // <-- The bytes32 label
        weight: normalizedWeight // <-- The weight of the vote
      });
    }

    return results;
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
    // Get the number of valid options
    uint8 maxOptions = uint8(proposal.choices.length);

    // Mask out any bits that exceed valid options
    uint32 validMask = uint32(1 << maxOptions) - 1;
    if (choicesBitmask & ~validMask != 0) {
      revert InvalidVoteChoice(); // Ensures no out-of-bounds choices
    }

    // Count the number of selected choices
    uint8 selectedChoices = _countSetBits(choicesBitmask);
    // Ensure the number of selected choices is within the allowed range
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
  /**
   * @dev Calculates the voting weight of a user based on their node holdings.
   * @param self The storage reference for the VeVoteStorage.
   * @param voter The address of the voter.
   * @return weight The voting weight of the voter.
   */
  function _calculateVoteWeight(
    VeVoteStorageTypes.VeVoteStorage storage self,
    address voter,
    uint48 /* snapshot */
  ) private view returns (uint256 weight) {
    // Fetch voter's node data -> TODO: Get users snapshot data
    VechainNodesDataTypes.NodeLevelInfo[] memory nodes = self.nodeManagement.getUsersNodesWithLevelInfo(voter);

    // If the user has no nodes, return 0 -> They are not eligible to vote
    uint256 totalNodes = nodes.length;
    if (totalNodes == 0) {
      return 0;
    }

    unchecked {
      for (uint256 i = 0; i < totalNodes; i++) {
        // Skip nodes with no voting power
        if (nodes[i].nodeLevel == VechainNodesDataTypes.NodeStrengthLevel.None) {
          continue;
        }

        // Calculate base voting power
        uint256 baseVotingPower = nodes[i].minBalance;

        // Use tryMul to prevent overflow
        (bool success, uint256 nodeWeight) = Math.tryMul(baseVotingPower, self.nodeMultiplier[nodes[i].nodeLevel]);
        if (!success) {
          revert VotePowerOverflow();
        }
        // Apply node weight to users total voting power, divided by the scale
        weight += nodeWeight / VOTING_MULTIPLER_SCALE;
      }
    }
  }

  /**
   * @dev Calculates the denominator for the voting weights.This should be the cheapest node's VET requirement.
   * @param self The storage reference for the VeVoteStorage.
   * @param snapshot The snapshot to use for the calculation.
   * @return The denominator for the voting weights.
   */
  function _voteWeightDenominator(
    VeVoteStorageTypes.VeVoteStorage storage self,
    uint48 snapshot
  ) private view returns (uint256) {
    // TODO: Can we get this directly from the node management contract? Do we need to store cheapest node
    (uint256 baseNodeVetRequirement, , , ) = self.vechainNodesContract.getTokenParams(self.baseLevelNode);
    if (baseNodeVetRequirement == 0) {
      revert VoteWeightDenominatorZero();
    }
    return baseNodeVetRequirement;
  }
}
