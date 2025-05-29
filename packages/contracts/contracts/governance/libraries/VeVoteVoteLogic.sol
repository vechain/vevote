// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

import { VeVoteStorageTypes } from "./VeVoteStorageTypes.sol";
import { VeVoteClockLogic } from "./VeVoteClockLogic.sol";
import { VeVoteStateLogic } from "./VeVoteStateLogic.sol";
import { VeVoteTypes } from "./VeVoteTypes.sol";
import { VeVoteConstants } from "./VeVoteConstants.sol";
import { VeVoteConfigurator } from "./VeVoteConfigurator.sol";
import { DataTypes } from "../../external/StargateNFT/libraries/DataTypes.sol";
import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";

/// @title VeVoteVoteLogic
/// @notice Voting logic for VeVote governance system including casting votes, vote weight calculation, and result tallying.
/// @dev This library handles how users interact with proposals through voting and ensures constraints are respected.
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

    // Validate selected choices and get number selected
    uint8 selectedChoicesCount = _checkChoices(proposal, choices);

    // Calculate vote weight
    uint256 weight = _calculateVoteWeight(self, voter, proposal.voteStart, proposalId);
    if (weight == 0) {
      revert VoterNotEligible();
    }

    // Calculate the normalised vote weight
    uint256 normalisedVoteWeight = weight / VeVoteConfigurator.getMinStakedAmountAtTimepoint(self, proposal.voteStart);

    // Store vote
    self.votes[proposalId][voter] = choices;
    self.totalVotes[proposalId] += normalisedVoteWeight;

    uint256 perChoiceWeight = weight / selectedChoicesCount; // Store individual choice weight in memory -> We do not use normalised weight here as there is a chance it could underflow (weight < selectedChoicesCount), we get normalised weight when getting overall results to combat this.
    mapping(uint8 => uint256) storage proposalTally = self.voteTally[proposalId]; // Cache storage pointer

    uint256 len = proposal.choices.length; // Cache number of choices
    for (uint8 i = 0; i < len; i++) {
      // Check if the i-th bit in the choices bitmask is set (i.e., the user selected this choice)
      if ((choices & (1 << i)) != 0) {
        // Add division result to the tally for each selected choice
        proposalTally[i] += perChoiceWeight;
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
  ) external returns (uint256) {
    // Return the vote weight divided by the denominator to normalize it
    return
      _calculateVoteWeight(self, account, timepoint, 0) /
      VeVoteConfigurator.getMinStakedAmountAtTimepoint(self, timepoint);
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
   * @notice Retrieves the voting power of a node.
   * @param self The storage reference for the VeVoteStorage.
   * @param nodeId The ID of the node.
   * @return The voting power of the node.
   */
  function getNodeVoteWeight(
    VeVoteStorageTypes.VeVoteStorage storage self,
    uint256 nodeId
  ) external view returns (uint256) {
    DataTypes.Token memory nodeInfo = self.nodeManagement.getNodeInfo(nodeId);
    if (nodeInfo.levelId == 0) return 0;
    return
      _getNodeWeight(self, nodeInfo.vetAmountStaked, nodeInfo.levelId) / VeVoteConfigurator.getMinStakedAmount(self);
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
    // Cache proposal info
    VeVoteTypes.ProposalCore storage proposal = self.proposals[proposalId];
    bytes32[] storage choices = proposal.choices;
    uint256 numChoices = choices.length;

    uint256 denominator = VeVoteConfigurator.getMinStakedAmountAtTimepoint(self, proposal.voteStart);

    results = new VeVoteTypes.ProposalVoteResult[](numChoices);

    // Iterate over each choice and calculate the normalized weight
    for (uint8 i; i < numChoices; i++) {
      // NOTE: Normalized weights use integer division and may round down to zero for low-weight votes.
      // This is expected and accepted in the current design. // TODO: Should we set to 1 if 0?
      uint256 normalizedWeight = self.voteTally[proposalId][i] / denominator;

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

  /**
   * @dev Calculates the voting weight of a user based on their node holdings.
   * @param self The storage reference for the VeVoteStorage.
   * @param voter The address of the voter.
   * @param snapshot the proposal snapshot.
   * @return weight The voting weight of the voter.
   */
  function _calculateVoteWeight(
    VeVoteStorageTypes.VeVoteStorage storage self,
    address voter,
    uint64 snapshot,
    uint256 proposalId
  ) private returns (uint256 weight) {
    // Fetch voter's stargate NFT info from NodeManagement
    DataTypes.Token[] memory nodes = self.nodeManagement.getUsersNodeInfo(voter);

    // Check if a user is a validator
    weight = _checkIsValidator(self, voter);

    // If the user has no nodes, return validator weight (if any); otherwise, return 0.
    uint256 totalNodes = nodes.length;
    if (totalNodes == 0) {
      return weight;
    }

    for (uint256 i; i < totalNodes; i++) {
      // Skip nodes with no voting power or minted after the snapshot
      if (nodes[i].levelId == 0 || nodes[i].mintedAtBlock > snapshot) {
        continue;
      }

      uint256 nodeWeight = _getNodeWeight(self, nodes[i].vetAmountStaked, nodes[i].levelId);

      // Apply node weight to users total voting power
      weight += nodeWeight;

      // if proposal id is not 0, store tokenId so that it cannot be used again.
      //if(proposalId != 0) self.nodeHasVoted[nodes[i].leve] TODO: Add back in
    }
  }

  /**
   * @dev Computes the voting weight for a node based on its stake and level multiplier.
   * Reverts if the multiplication overflows.
   * @param self The storage reference to VeVoteStorage.
   * @param minStake The amount of VET staked in the node.
   * @param levelId The level ID of the node, used to determine the multiplier.
   * @return The scaled voting weight of the node.
   */
  function _getNodeWeight(
    VeVoteStorageTypes.VeVoteStorage storage self,
    uint256 minStake,
    uint8 levelId
  ) private view returns (uint256) {
    // Use tryMul to prevent overflow
    (bool ok, uint256 nodeWeight) = Math.tryMul(minStake, self.levelIdMultiplier[levelId]);
    if (!ok) {
      revert VotePowerOverflow();
    }

    // Return the node weight divided by the scale
    return nodeWeight / VeVoteConstants.VOTING_MULTIPLIER_SCALE;
  }

  /**
   * @dev Determines whether aƒ voter is an active validator and returns their voting weight if so.
   * @param self The storage reference to VeVoteStorage.
   * @param voter The address of the account being checked.
   * @return The validator voting weight if the voter is an active validator; otherwise, returns 0.
   */
  function _checkIsValidator(
    VeVoteStorageTypes.VeVoteStorage storage self,
    address voter
  ) private view returns (uint256) {
    // Call builtin validator contract
    (bool listed, , , bool active) = VeVoteConfigurator.getValidatorContract(self).get(voter);

    // Return zero weight if not listed or not active
    if (!listed || !active) return 0;

    // Use level 0 multiplier for validators
    uint256 multiplier = self.levelIdMultiplier[0];

    // Use safe multiplication with a comment
    (bool ok, uint256 weightedStake) = Math.tryMul(multiplier, VeVoteConstants.VALIDATOR_STAKED_VET_REQUIREMENT);
    if (!ok) revert VotePowerOverflow();

    return weightedStake / VeVoteConstants.VOTING_MULTIPLIER_SCALE;
  }
}
