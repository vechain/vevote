// SPDX-License-Identifier: MIT

// ####              ###                ####             ####                   ####
// #####           #####                #####           #####                   #####
//  #####          #####                 #####         #####                    #####
//   #####        #####    #########     #####         #####    ##########    ###########    ##########
//   #####        ####   #############    #####       #####   ##############  ###########  ##############
//    #####      ##### #################   ####       ####  ######## ########   #####    #######   #######
//     ####     #####  #####      ######   #####     #####  #####       ######  #####    #####       #####
//     #####    ####  #####    #########    #####   #####  #####         #####  #####    ##################
//      #####  #####  ####     ######  ##   #####   #####  #####          ####  #####   ###################
//      ##### #####   #####     #   #####    ##### #####   #####         #####  #####    ##################
//       ##########    #####       #####      #### ####     #####       ######  #####    #####       #####
//        ########     #################      #########     #######   #######   ######## #######   #######
//        #######        ##############        #######       ###############    #########  ##############
//         ######          #########            #####          ###########        #######   ###########

pragma solidity 0.8.20;

import { VeVoteStorageTypes } from "./VeVoteStorageTypes.sol";
import { VeVoteTypes } from "./VeVoteTypes.sol";
import { VeVoteStateLogic } from "./VeVoteStateLogic.sol";
import { VeVoteClockLogic } from "./VeVoteClockLogic.sol";

/// @title VeVoteProposalLogic
/// @notice Library for managing proposals in the VeVote contract.
/// @dev This library provides functions to create, cancel and validate proposals.
library VeVoteProposalLogic {
  // ------------------------------- Errors -------------------------------
  /**
   * @dev Thrown when the proposal start time is invalid.
   *      - Must be in the future.
   *      - Must be at least `minVotingDelay` seconds from now.
   */
  error VeVoteInvalidStartBlock(uint48 startBlock);

  /**
   * @dev Thrown when the voting duration is outside the allowed range.
   *      - Must be at least `minVotingDuration`.
   *      - Must not exceed `maxVotingDuration`.
   */
  error VeVoteInvalidVoteDuration(uint48 voteDuration, uint48 minVotingDuration, uint48 maxVotingDuration);

  /**
   * @dev Thrown when the number of available choices is less than the allowed selection range.
   */
  error VeVoteInvalidChoiceCount(uint256 choiceCount, uint8 minSelection, uint8 maxSelection);

  /**
   * @dev Thrown when the minSelection is greater than maxSelection.
   */
  error VeVoteInvalidSelectionRange(uint8 minSelection, uint8 maxSelection);

  /**
   * @dev Thrown when a proposal's state does not match the expected state.
   */
  error VeVoteUnexpectedProposalState(uint256 proposalId, VeVoteTypes.ProposalState state, bytes32 expectedState);

  /**
   * @dev Thrown when a proposal description is not a valid IPFS CID.
   */
  error VeVoteInvalidProposalDescription();

  /**
   * @dev Thrown when a user is not authorized to perform an action.
   */
  error UnauthorizedAccess(address user);

  // ------------------------------- Events -------------------------------
  /**
   * @notice Emitted when a new proposal is created.
   * @param proposalId The unique identifier for the proposal.
   * @param proposer The address that created the proposal.
   * @param description The IPFS CID containing the proposal details.
   * @param startBlock The timestamp when voting starts.
   * @param voteDuration The duration of the voting period in seconds.
   * @param choices The available choices for the proposal.
   * @param maxSelection The maximum number of choices a voter can select.
   * @param minSelection The minimum number of choices a voter must select.
   */
  event VeVoteProposalCreated(
    uint256 indexed proposalId,
    address indexed proposer,
    string description,
    uint48 startBlock,
    uint48 voteDuration,
    bytes32[] choices,
    uint8 maxSelection,
    uint8 minSelection
  );

  /**
   * @dev Emitted when a proposal is canceled.
   */
  event ProposalCanceled(uint256 proposalId, address canceller, string reason);

  /**
   * @dev Emitted when a proposal is executed.
   */
  event VeVoteProposalExecuted(uint256 proposalId);

  // ------------------------------- Functions -------------------------------
  // ------------------------------- Setter Functions -------------------------------
  /**
   * @notice Proposes a new governance action.
   * @dev Creates a new proposal, validates its parameters, and stores it in the contract.
   * @param self The storage reference for the VeVoteStorage.
   * @param description The IPFS CID containing the proposal details.
   * @param startBlock The timestamp when the proposal starts.
   * @param voteDuration The duration of the proposal in seconds.
   * @param choices The voting choices available.
   * @param maxSelection The maximum number of choices a voter can select.
   * @param minSelection The minimum number of choices a voter must select.
   * @return proposalId The unique identifier of the proposal.
   */
  function propose(
    VeVoteStorageTypes.VeVoteStorage storage self,
    string memory description,
    uint48 startBlock,
    uint48 voteDuration,
    bytes32[] memory choices,
    uint8 maxSelection,
    uint8 minSelection
  ) external returns (uint256) {
    // Validate the proposal parameters.
    address proposer = msg.sender;

    uint256 proposalId = hashProposal(
      proposer,
      startBlock,
      voteDuration,
      choices,
      keccak256(bytes(description)),
      maxSelection,
      minSelection
    );

    validateProposeParams(self, description, startBlock, voteDuration, choices, maxSelection, minSelection, proposalId);

    // Create the proposal object
    VeVoteTypes.ProposalCore memory proposal;
    proposal.proposer = proposer;
    proposal.voteStart = startBlock;
    proposal.voteDuration = voteDuration;
    proposal.choices = choices;
    proposal.maxSelection = maxSelection;
    proposal.minSelection = minSelection;

    // Save the proposal in the contract storage
    self.proposals[proposalId] = proposal;

    emit VeVoteProposalCreated(
      proposalId,
      proposer,
      description,
      startBlock,
      voteDuration,
      choices,
      maxSelection,
      minSelection
    );

    return proposalId;
  }

  /**
   * @notice Cancels a proposal.
   * @dev Allows the proposer or an admin to cancel a proposal before execution.
   * @param self The storage reference for the VeVoteStorage.
   * @param whitelisted Flag indicating if the caller is whitelisted.
   * @param admin Flag indicating if the caller is an admin.
   * @param proposalId The ID of the proposal to cancel.
   * @return The proposal ID.
   */
  function cancel(
    VeVoteStorageTypes.VeVoteStorage storage self,
    bool whitelisted,
    bool admin,
    uint256 proposalId,
    string memory reason
  ) external returns (uint256) {
    // Ensure only a whitelisted address or the contract admin can cancel a proposal
    if (!admin && !whitelisted) {
      revert UnauthorizedAccess(msg.sender);
    }

    // Validate that the proposal is not already canceled or executed
    VeVoteTypes.ProposalState currentState = VeVoteStateLogic.validateStateBitmap(
      self,
      proposalId,
      VeVoteStateLogic.encodeStateBitmap(VeVoteTypes.ProposalState.Pending) |
        VeVoteStateLogic.encodeStateBitmap(VeVoteTypes.ProposalState.Active)
    );

    // If a whitelisted address is canceling, ensure it's still in a pending state
    if (!admin && currentState != VeVoteTypes.ProposalState.Pending) {
      revert VeVoteUnexpectedProposalState(
        proposalId,
        currentState,
        bytes32(uint256(VeVoteTypes.ProposalState.Pending))
      );
    }

    // Mark the proposal as canceled
    self.proposals[proposalId].canceled = true;

    // Emit event for tracking proposal cancellation
    emit ProposalCanceled(proposalId, msg.sender, reason);

    return proposalId;
  }

  /**
   * @notice Marks a proposal as executed.
   * @dev Allows an admin to mark a proposal as executed.
   * @param self The storage reference for the VeVoteStorage.
   * @param proposalId The ID of the proposal to execute.
   */
  function execute(VeVoteStorageTypes.VeVoteStorage storage self, uint256 proposalId) external returns (uint256) {
    // Validate that proposal is in a succeeded state
    VeVoteStateLogic.validateStateBitmap(
      self,
      proposalId,
      VeVoteStateLogic.encodeStateBitmap(VeVoteTypes.ProposalState.Succeeded)
    );

    // Mark the proposal as executed
    self.proposals[proposalId].executed = true;

    emit VeVoteProposalExecuted(proposalId);

    return proposalId;
  }

  // ------------------------------- Getter Functions -------------------------------

  /**
   * @notice Returns the hash of a proposal.
   * @dev Hashes the proposal parameters to produce a unique proposal ID.
   * @param proposer The address of the proposer.
   * @param startBlock The block when the proposal starts.
   * @param voteDuration The duration of the proposal.
   * @param choices The voting choices for the proposal.
   * @param descriptionHash The hash of the proposal description.
   * @param maxSelection The maximum number of choices a voter can select.
   * @param minSelection The minimum number of choices a voter must select.
   * @return The proposal ID.
   */
  function hashProposal(
    address proposer,
    uint48 startBlock,
    uint48 voteDuration,
    bytes32[] memory choices,
    bytes32 descriptionHash,
    uint8 maxSelection,
    uint8 minSelection
  ) internal pure returns (uint256) {
    return
      uint256(
        keccak256(abi.encode(proposer, startBlock, voteDuration, choices, descriptionHash, maxSelection, minSelection))
      );
  }

  /**
   * @notice Returns the start block of a proposal.
   * @param self The storage reference for the VeVoteStorage.
   * @param proposalId The unique identifier of the proposal.
   * @return The start block of the proposal.
   */
  function proposalSnapshot(
    VeVoteStorageTypes.VeVoteStorage storage self,
    uint256 proposalId
  ) internal view returns (uint48) {
    return self.proposals[proposalId].voteStart;
  }

  /**
   * @notice Returns the block number at which voting ends for the given proposal.
   * @dev Calculates the deadline as voteStart + voteDuration. After this block, the proposal is no longer active.
   * @param self The storage reference for the VeVoteStorage.
   * @param proposalId The unique identifier of the proposal.
   * @return deadline The block number when the proposal voting period ends.
   */
  function proposalDeadline(
    VeVoteStorageTypes.VeVoteStorage storage self,
    uint256 proposalId
  ) internal view returns (uint48) {
    VeVoteTypes.ProposalCore storage proposal = self.proposals[proposalId];
    return proposal.voteStart + proposal.voteDuration;
  }

  /**
   * @notice Returns the proposer of a proposal.
   * @param self The storage reference for the VeVoteStorage.
   * @param proposalId The id of the proposal.
   * @return The address of the proposer.
   */
  function proposalProposer(
    VeVoteStorageTypes.VeVoteStorage storage self,
    uint256 proposalId
  ) internal view returns (address) {
    return self.proposals[proposalId].proposer;
  }

  /**
   * @notice Returns the choices available for a proposal.
   * @param self The storage reference for the VeVoteStorage.
   * @param proposalId The id of the proposal.
   * @return The choices available for the proposal.
   */
  function proposalChoices(
    VeVoteStorageTypes.VeVoteStorage storage self,
    uint256 proposalId
  ) internal view returns (bytes32[] memory) {
    return self.proposals[proposalId].choices;
  }

  /**
   * @notice Returns the minimum and maximum choices that can be selected for a proposal
   * @param self The storage reference for the VeVoteStorage.
   * @param proposalId The id of the proposal.
   * @return The minimum and maximum choices that can be selected.
   */
  function proposalSelectionRange(
    VeVoteStorageTypes.VeVoteStorage storage self,
    uint256 proposalId
  ) internal view returns (uint8, uint8) {
    VeVoteTypes.ProposalCore storage proposal = self.proposals[proposalId];
    return (proposal.minSelection, proposal.maxSelection);
  }

  // ------------------------------- Private Functions -------------------------------

  /**
   * @dev Validates the parameters of a proposal.
   * @param self The storage reference for the VeVoteStorage.
   * @param description The proposal description (IPFS CID).
   * @param startBlock The start time of the proposal.
   * @param voteDuration The duration of the voting period.
   * @param choices The available voting choices.
   * @param maxSelection The maximum number of choices that can be selected.
   * @param minSelection The minimum number of choices that must be selected.
   * @param proposalId The unique ID of the proposal.
   */
  function validateProposeParams(
    VeVoteStorageTypes.VeVoteStorage storage self,
    string memory description,
    uint48 startBlock,
    uint48 voteDuration,
    bytes32[] memory choices,
    uint8 maxSelection,
    uint8 minSelection,
    uint256 proposalId
  ) private view {
    // Start time must be in the future and at least minVotingDelay blocks from now
    if (startBlock <= VeVoteClockLogic.clock() + self.minVotingDelay) {
      revert VeVoteInvalidStartBlock(startBlock);
    }

    // Voting duration must be at least `minVotingDuration` and at most `maxVotingDuration`
    uint48 minDur = self.minVotingDuration;
    uint48 maxDur = self.maxVotingDuration;
    if (voteDuration < minDur || voteDuration > maxDur) {
      revert VeVoteInvalidVoteDuration(voteDuration, minDur, maxDur);
    }

    // Lightweight IPFS description check: description must be at least 32 bytes (CIDv0 = 46, CIDv1 = 59+)
    if (bytes(description).length < 32) {
      revert VeVoteInvalidProposalDescription();
    }

    // Ensure `minSelection` is not greater than `maxSelection` (logical validation) && greater than 0
    if (minSelection > maxSelection || minSelection < 1) {
      revert VeVoteInvalidSelectionRange(minSelection, maxSelection);
    }

    // Ensure there are enough choices for voters to pick up to `maxSelection`
    if (choices.length < maxSelection || choices.length > self.maxChoices) {
      revert VeVoteInvalidChoiceCount(choices.length, minSelection, maxSelection);
    }

    // Ensure the proposal does not already exist
    if (self.proposals[proposalId].voteStart != 0) {
      // Proposal already exists
      revert VeVoteUnexpectedProposalState(proposalId, VeVoteStateLogic._state(self, proposalId), bytes32(0));
    }
  }
}
