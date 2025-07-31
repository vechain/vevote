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
   * @dev Thrown when the `support` value is not a valid `VoteType` enum member.
   */
  error InvalidVoteType();

  /**
   * @dev Thrown when the user is not eligible to vote.
   */
  error VoterNotEligible();

  /**
   * @dev Thrown when the user has already voted on the proposal.
   */
  error AlreadyVoted();

  /**
   * @dev Thrown when trying to fetch information for a node id that does not exist.
   */
  error InvalidNodeId();

  // ------------------------------- Events -------------------------------
  /**
   * @notice Emitted when a user casts a vote on a proposal.
   * @param voter The address of the voter.
   * @param proposalId The ID of the proposal being voted on.
   * @param support The selected vote option.
   * @param weight The voting weight of the voter.
   * @param reason The reason for the vote.
   * @param stargateNFTs The list of Stargate node token IDs used.
   * @param validator The validator master address if vote was cast as validator.
   */
  event VoteCast(
    address indexed voter,
    uint256 indexed proposalId,
    uint8 support,
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
   * @param support The selected vote option.
   * @param reason the reason for supporting a proposal.
   * @param masterAddress Required parameter — can be zero address. Used to determine validator voting power, if applicable.
   */
  function castVote(
    VeVoteStorageTypes.VeVoteStorage storage self,
    uint256 proposalId,
    uint8 support,
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
    if (self.proposalVotes[proposalId].hasVoted[voter]) {
      revert AlreadyVoted();
    }

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

    _countVote(self, proposalId, voter, support, normalisedVoteWeight);

    emit VoteCast(voter, proposalId, support, normalisedVoteWeight, reason, stargateNFTs, validator);
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
    return self.proposalVotes[proposalId].hasVoted[account];
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
    VeVoteTypes.ProposalVote storage proposalVote = self.proposalVotes[proposalId];
    return proposalVote.againstVotes + proposalVote.forVotes + proposalVote.abstainVotes;
  }

  /**
   * @notice Returns the current vote counts for a given proposal.
   * @dev Used to retrieve raw vote tallies for all three voting categories.
   * @param self The storage reference to the VeVoteStorage.
   * @param proposalId The ID of the proposal to query.
   * @return againstVotes The total normalized weight of "Against" votes.
   * @return forVotes The total normalized weight of "For" votes.
   * @return abstainVotes The total normalized weight of "Abstain" votes.
   */

  function proposalVotes(
    VeVoteStorageTypes.VeVoteStorage storage self,
    uint256 proposalId
  ) internal view returns (uint256 againstVotes, uint256 forVotes, uint256 abstainVotes) {
    VeVoteTypes.ProposalVote storage proposalVote = self.proposalVotes[proposalId];
    return (proposalVote.againstVotes, proposalVote.forVotes, proposalVote.abstainVotes);
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
   * @notice Computes the normalized voting weight of a validator and its apparent endorser.
   * @param self The storage reference to the VeVoteStorage.
   * @param endorser The address claiming to endorse the validator.
   * @param masterAddress The master address of the validator node.
   * @return weight The normalized voting weight of the validator if eligible, otherwise zero.
   */
  function getValidatorVoteWeight(
    VeVoteStorageTypes.VeVoteStorage storage self,
    address endorser,
    address masterAddress
  ) external view returns (uint256) {
    if (endorser == address(0) || masterAddress == address(0)) return 0;

    uint256 rawWeight = _determineValidatorVoteWeight(self, endorser, masterAddress);
    if (rawWeight == 0) return 0;

    return rawWeight / VeVoteConfigurator.getMinStakedAmount(self);
  }

  /**
   * @notice Checks if a proposal has succeeded based on the vote tally.
   * @dev A proposal is considered to have succeeded if `forVotes > againstVotes`.
   *      Abstain votes are ignored in this calculation.
   * @param self The storage reference to the VeVoteStorage.
   * @param proposalId The ID of the proposal to check.
   * @return True if the proposal has more for votes than against votes, false otherwise.
   */
  function _voteSucceeded(
    VeVoteStorageTypes.VeVoteStorage storage self,
    uint256 proposalId
  ) internal view returns (bool) {
    VeVoteTypes.ProposalVote storage proposalVote = self.proposalVotes[proposalId];

    return proposalVote.forVotes > proposalVote.againstVotes;
  }

  // ------------------------------- Private Functions -------------------------------

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

  /**
   * @notice Internal function to register a vote and update the vote tally for a proposal.
   * @dev Records the user's vote and updates the relevant vote category (For, Against, Abstain).
   *      Reverts if the support value is not a valid `VoteType`.
   * @param self The storage reference to the VeVoteStorage.
   * @param proposalId The ID of the proposal being voted on.
   * @param account The address of the voter.
   * @param support The type of vote: 0 = Against, 1 = For, 2 = Abstain.
   * @param totalWeight The normalized vote weight to apply to the tally.
   */
  function _countVote(
    VeVoteStorageTypes.VeVoteStorage storage self,
    uint256 proposalId,
    address account,
    uint8 support,
    uint256 totalWeight
  ) private {
    VeVoteTypes.ProposalVote storage proposalVote = self.proposalVotes[proposalId];

    // Mark that the user has voted.
    proposalVote.hasVoted[account] = true;

    // Update proposal tallies
    if (support == uint8(VeVoteTypes.VoteType.Against)) {
      proposalVote.againstVotes += totalWeight;
    } else if (support == uint8(VeVoteTypes.VoteType.For)) {
      proposalVote.forVotes += totalWeight;
    } else if (support == uint8(VeVoteTypes.VoteType.Abstain)) {
      proposalVote.abstainVotes += totalWeight;
    } else {
      revert InvalidVoteType();
    }
  }
}
