// SPDX-License-Identifier: MIT

//  8b           d8       8b           d8
//  `8b         d8'       `8b         d8'           ,d
//   `8b       d8'         `8b       d8'            88
//    `8b     d8' ,adPPYba, `8b     d8' ,adPPYba, MM88MMM ,adPPYba,
//     `8b   d8' a8P   _d88  `8b   d8' a8"     "8a  88   a8P_____88
//      `8b d8'  8PP  "PP""   `8b d8'  8b       d8  88   8PP"""""""
//       `888'   "8b,   ,aa    `888'   "8a,   ,a8"  88,  "8b,   ,aa
//        `8'     `"Ybbd8"'     `8'     `"YbbdP"'   "Y888 `"Ybbd8"'
//

pragma solidity 0.8.20;

import { VeVoteStorageTypes } from "./VeVoteStorageTypes.sol";
import { VeVoteClockLogic } from "./VeVoteClockLogic.sol";
import { VeVoteStateLogic } from "./VeVoteStateLogic.sol";
import { VeVoteTypes } from "./VeVoteTypes.sol";
import { VeVoteConstants } from "./VeVoteConstants.sol";
import { VeVoteConfigurator } from "./VeVoteConfigurator.sol";
import { IAuthority } from "../../interfaces/IAuthority.sol";
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

  /**
   * @dev Thrown when trying to fetch information for a node id that does not exist.
   */
  error InvalidNodeId();

  // ------------------------------- Events -------------------------------
  /**
   * @notice Emitted when a user casts a vote on a proposal.
   * @param voter The address of the voter.
   * @param proposalId The ID of the proposal being voted on.
   * @param choices The bitmask representing the selected vote choices.
   * @param weight The voting weight of the voter.
   * @param reason The reason for the vote.
   * @param stargateNFTs The list of Stargate node token IDs used.
   * @param validator The validator master address if vote was cast as validator.
   */
  event VoteCast(
    address indexed voter,
    uint256 indexed proposalId,
    uint32 choices,
    uint256 weight,
    string reason,
    uint256[] stargateNFTs,
    address validator
  );

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
    string memory reason,
    address masterAddress
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
    (uint256 weight, uint256[] memory stargateNFTs, address validator) = _calculateVoteWeightWithTracking(
      self,
      voter,
      proposal.voteStart,
      proposalId,
      masterAddress
    );

    if (weight == 0) {
      revert VoterNotEligible();
    }

    // Calculate the normalised vote weight
    uint256 normalisedVoteWeight = weight / VeVoteConfigurator.getMinStakedAmountAtTimepoint(self, proposal.voteStart);

    // Store vote
    self.votes[proposalId][voter] = choices;
    self.totalVotes[proposalId] += normalisedVoteWeight;

    _updateVoteChoices(self, selectedChoicesCount, normalisedVoteWeight, choices, proposalId, proposal.choices.length);

    emit VoteCast(voter, proposalId, choices, normalisedVoteWeight, reason, stargateNFTs, validator);
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
    uint48 timepoint,
    address masterAddress
  ) external view returns (uint256) {
    // Return the vote weight divided by the denominator to normalize it
    return
      _calculateVoteWeight(self, account, timepoint, masterAddress) /
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
    DataTypes.Token memory nodeInfo = _getNodeInfo(self, nodeId);
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
    mapping(uint8 => uint256) storage proposalTally = self.voteTally[proposalId];

    results = new VeVoteTypes.ProposalVoteResult[](numChoices);

    // Iterate over each choice and calculate the normalized weight
    for (uint8 i; i < numChoices; i++) {
      results[i] = VeVoteTypes.ProposalVoteResult({
        choice: choices[i], // The bytes32 label
        weight: proposalTally[i] // The weight of the vote
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
    address masterAddress
  ) private view returns (uint256 weight) {
    // Fetch voter's stargate NFT info from NodeManagement
    DataTypes.Token[] memory nodes = self.nodeManagement.getUserStargateNFTsInfo(voter);

    // Check if a user is a validator
    if (masterAddress != address(0)) weight = _determineValidatorVoteWeight(self, voter, masterAddress);

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
    }
  }

  /**
   * @dev Calculates the voting weight of a user based on validator status and eligible node holdings.
   * @param self The storage reference to VeVoteStorage.
   * @param voter The address of the voter.
   * @param snapshot The proposal snapshot block.
   * @param proposalId The proposal ID being voted on.
   * @param masterAddress The validator master address (if any).
   * @return weight The total voting weight of the voter.
   * @return nfts Array of tokenIds used in the vote (non-empty if node-based vote).
   * @return validator The master address if the voter participated as a validator; otherwise address(0).
   */
  function _calculateVoteWeightWithTracking(
    VeVoteStorageTypes.VeVoteStorage storage self,
    address voter,
    uint64 snapshot,
    uint256 proposalId,
    address masterAddress
  ) private returns (uint256 weight, uint256[] memory nfts, address validator) {
    // Fetch voter's stargate NFT info from NodeManagement
    DataTypes.Token[] memory nodes = self.nodeManagement.getUserStargateNFTsInfo(voter);

    // Check if a user is a validator
    if (masterAddress != address(0)) {
      weight = _checkIsValidator(self, voter, masterAddress, proposalId);
      if (weight > 0) validator = masterAddress;
    }

    // If the user has no nodes, return validator weight (if any); otherwise, return 0.
    uint256 totalNodes = nodes.length;
    if (totalNodes == 0) {
      return (weight, new uint256[](0), validator);
    }

    // Temp array to collect used token IDs (max size = totalNodes)
    uint256[] memory tempTokenIds = new uint256[](totalNodes);
    uint256 count;
    // Iterate through each node to compute voting weight
    for (uint256 i; i < totalNodes; ++i) {
      DataTypes.Token memory node = nodes[i];

      // Skip nodes that are ineligible
      if (node.levelId == 0 || node.mintedAtBlock > snapshot || self.nodeHasVoted[proposalId][node.tokenId]) {
        continue;
      }

      // Compute and add node voting weight
      uint256 nodeWeight = _getNodeWeight(self, node.vetAmountStaked, node.levelId);

      // Apply node weight to users total voting power
      weight += nodeWeight;

      // Mark node as having voted
      self.nodeHasVoted[proposalId][node.tokenId] = true;

      // Collect tokenId for event
      tempTokenIds[count] = node.tokenId;
      unchecked {
        ++count;
      }
    }

    nfts = tempTokenIds;
    if (count < tempTokenIds.length) {
      assembly {
        mstore(nfts, count)
      }
    }

    return (weight, nfts, validator);
  }

  /**
   * @dev Computes the voting weight for a node based on its stake and level multiplier.
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
    // Determine weighted stake
    return minStake * self.levelIdMultiplier[levelId];
  }

  /**
   * @dev Determines whether aƒ voter is an active validator and returns their voting weight if so.
   * @param self The storage reference to VeVoteStorage.
   * @param voter The address of the account being checked.
   * @return voteWeight validator voting weight if the voter is an active validator; otherwise, returns 0.
   */
  function _checkIsValidator(
    VeVoteStorageTypes.VeVoteStorage storage self,
    address voter,
    address masterAddress,
    uint256 proposalId
  ) private returns (uint256) {
    uint256 voteWeight = _determineValidatorVoteWeight(self, voter, masterAddress);

    // If a users vote weight is 0 or if the node has already voted
    if (voteWeight == 0 || self.validatorHasVoted[proposalId][masterAddress]) {
      return 0;
    }

    self.validatorHasVoted[proposalId][masterAddress] = true;

    return voteWeight;
  }

  /**
   * @dev Returns validator vote weight if active, listed, and endorsed by the voter.
   * @param self Storage reference to `VeVoteStorage`.
   * @param voter Address claiming to endorse the validator.
   * @param masterAddress Validator's master address.
   * @return voteWeight Calculated voting weight or 0 if ineligible.
   */
  function _determineValidatorVoteWeight(
    VeVoteStorageTypes.VeVoteStorage storage self,
    address voter,
    address masterAddress
  ) private view returns (uint256 voteWeight) {
    // Load validator authority contract
    IAuthority validatorContract = VeVoteConfigurator.getValidatorContract(self);

    // Fetch validator info
    (bool isListed, address endorser, , bool isActive) = validatorContract.get(masterAddress);

    // Check eligibility
    if (!isListed || !isActive || endorser != voter) {
      return 0;
    }

    // Apply level 0 multiplier
    uint256 multiplier = self.levelIdMultiplier[0];

    // Compute vote weight
    voteWeight = VeVoteConstants.VALIDATOR_STAKED_VET_REQUIREMENT * multiplier;
  }

  /**
   * @dev Updates the vote tally for a proposal based on selected choices and voter weight.
   * @param self Reference to VeVoteStorage.
   * @param selectedChoicesCount The number of choices selected by the voter.
   * @param voteWeight The total voting weight of the voter.
   * @param choices Bitmask representing selected choices.
   * @param proposalId The ID of the proposal being voted on.
   * @param totalChoices Total number of available choices in the proposal.
   */
  function _updateVoteChoices(
    VeVoteStorageTypes.VeVoteStorage storage self,
    uint256 selectedChoicesCount,
    uint256 voteWeight,
    uint32 choices,
    uint256 proposalId,
    uint256 totalChoices
  ) private {
    uint256 perChoiceWeight = voteWeight / selectedChoicesCount; // Store individual choice weight in memory -> This weight is scaled here so there is no chance it could underflow (scale = 100 > max selected choices = 32).
    mapping(uint8 => uint256) storage proposalTally = self.voteTally[proposalId]; // Cache storage pointer

    for (uint8 i; i < totalChoices; i++) {
      // Check if the i-th bit in the choices bitmask is set (i.e., the user selected this choice)
      if ((choices & (1 << i)) != 0) {
        // Add division result to the tally for each selected choice
        proposalTally[i] += perChoiceWeight;
      }
    }
  }

  /**
   * @notice Retrieves detailed information about a specific node.
   * @dev Only valid for nodes that have been migrated to the new Stargate NFT contract.
   * @param nodeId The ID of the node to retrieve information for.
   * @return token The detailed information about the specified node.
   */
  function _getNodeInfo(
    VeVoteStorageTypes.VeVoteStorage storage self,
    uint256 nodeId
  ) private view returns (DataTypes.Token memory token) {
    // Fetch node info from the Stargate NFT contract
    try self.stargateNFT.getToken(nodeId) returns (DataTypes.Token memory tokenInfo) {
      return tokenInfo;
    } catch {
      revert InvalidNodeId();
    }
  }
}
