// SPDX-License-Identifier: MIT

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
  error VeVoteInvalidStartTime(uint48 startTime);

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
   * @param startTime The timestamp when voting starts.
   * @param voteDuration The duration of the voting period in seconds.
   * @param choices The available choices for the proposal.
   * @param maxSelection The maximum number of choices a voter can select.
   * @param minSelection The minimum number of choices a voter must select.
   */
  event VeVoteProposalCreated(
    uint256 indexed proposalId,
    address indexed proposer,
    string description,
    uint48 startTime,
    uint48 voteDuration,
    bytes32[] choices,
    uint8 maxSelection,
    uint8 minSelection
  );

  /**
   * @dev Emitted when a proposal is canceled.
   */
  event ProposalCanceled(uint256 proposalId);

  /**
   * @dev Emitted when a proposal is executed.
   */
  event VeVoteProposalExecuted(uint256 proposalId);

  // ------------------------------- Functions -------------------------------
  // ------------------------------- Setter Functions -------------------------------
  /**
   * @notice Proposes a new governance action.
   * @dev Creates a new proposal, validates its parameters, and stores it in the contract.
   * @param self The storage reference for the GovernorStorage.
   * @param description The IPFS CID containing the proposal details.
   * @param startTime The timestamp when the proposal starts.
   * @param voteDuration The duration of the proposal in seconds.
   * @param choices The voting choices available.
   * @param maxSelection The maximum number of choices a voter can select.
   * @param minSelection The minimum number of choices a voter must select.
   * @return proposalId The unique identifier of the proposal.
   */
  function propose(
    VeVoteStorageTypes.VeVoteStorage storage self,
    string memory description,
    uint48 startTime,
    uint48 voteDuration,
    bytes32[] memory choices,
    uint8 maxSelection,
    uint8 minSelection
  ) external returns (uint256) {
    // Validate the proposal parameters.
    address proposer = msg.sender;

    uint256 proposalId = hashProposal(
      proposer,
      startTime,
      voteDuration,
      choices,
      keccak256(bytes(description)),
      maxSelection,
      minSelection
    );

    validateProposeParams(self, description, startTime, voteDuration, choices, maxSelection, minSelection, proposalId);

    // Create the proposal objectd
    VeVoteTypes.ProposalCore memory proposal;
    proposal.proposer = proposer;
    proposal.voteStart = startTime;
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
      startTime,
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
   * @param self The storage reference for the GovernorStorage.
   * @param account The address of the account attempting to cancel the proposal.
   * @param admin Flag indicating if the caller is an admin.
   * @param proposalId The ID of the proposal to cancel.
   * @return The proposal ID.
   */
  function cancel(
    VeVoteStorageTypes.VeVoteStorage storage self,
    address account,
    bool admin,
    uint256 proposalId
  ) external returns (uint256) {
    // Cache the proposer
    address proposer = proposalProposer(self, proposalId);

    // Ensure only the proposer or an admin can cancel
    if (account != proposer && !admin) {
      revert UnauthorizedAccess(account);
    }

    // Validate that the proposal is not already canceled or executed
    VeVoteTypes.ProposalState currentState = VeVoteStateLogic.validateStateBitmap(
      self,
      proposalId,
      VeVoteStateLogic.encodeStateBitmap(VeVoteTypes.ProposalState.Pending) |
        VeVoteStateLogic.encodeStateBitmap(VeVoteTypes.ProposalState.Active)
    );

    // If the proposer is canceling, ensure it's still in a pending state
    if (account == proposer && currentState != VeVoteTypes.ProposalState.Pending) {
      revert VeVoteUnexpectedProposalState(
        proposalId,
        currentState,
        bytes32(uint256(VeVoteTypes.ProposalState.Pending))
      );
    }

    // Mark the proposal as canceled
    self.proposals[proposalId].canceled = true;

    // Emit event for tracking proposal cancellation
    emit ProposalCanceled(proposalId);

    return proposalId;
  }

  /**
   * @notice Marks a proposal as executed.
   * @dev Allows an admin to mark a proposal as executed.
   * @param self The storage reference for the GovernorStorage.
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
  }

  // ------------------------------- Getter Functions -------------------------------

  /**
   * @notice Returns the hash of a proposal.
   * @dev Hashes the proposal parameters to produce a unique proposal ID.
   * @param proposer The address of the proposer.
   * @param startTime The time when the proposal starts.
   * @param voteDuration The duration of the proposal.
   * @param choices The voting choices for the proposal.
   * @param descriptionHash The hash of the proposal description.
   * @param maxSelection The maximum number of choices a voter can select.
   * @param minSelection The minimum number of choices a voter must select.
   * @return The proposal ID.
   */
  function hashProposal(
    address proposer,
    uint48 startTime,
    uint48 voteDuration,
    bytes32[] memory choices,
    bytes32 descriptionHash,
    uint8 maxSelection,
    uint8 minSelection
  ) internal pure returns (uint256) {
    return
      uint256(
        keccak256(abi.encode(proposer, startTime, voteDuration, choices, descriptionHash, maxSelection, minSelection))
      );
  }

  /**
   * @notice Returns the start time of a proposal.
   * @param self The storage reference for the GovernorStorage.
   * @param proposalId The unique identifier of the proposal.
   * @return The start time of the proposal.
   */
  function proposalSnapshot(
    VeVoteStorageTypes.VeVoteStorage storage self,
    uint256 proposalId
  ) internal view returns (uint48) {
    return self.proposals[proposalId].voteStart;
  }

  /**
   * @notice Returns the timestamp at which voting ends for the given proposal.
   * @dev Calculates the deadline as voteStart + voteDuration. After this timestamp, the proposal is no longer active.
   * @param self The storage reference for the VeVoteStorage.
   * @param proposalId The unique identifier of the proposal.
   * @return deadline The UNIX timestamp when the proposal voting period ends.
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
   * @param self The storage reference for the GovernorStorage.
   * @param description The proposal description (IPFS CID).
   * @param startTime The start time of the proposal.
   * @param voteDuration The duration of the voting period.
   * @param choices The available voting choices.
   * @param maxSelection The maximum number of choices that can be selected.
   * @param minSelection The minimum number of choices that must be selected.
   * @param proposalId The unique ID of the proposal.
   */
  function validateProposeParams(
    VeVoteStorageTypes.VeVoteStorage storage self,
    string memory description,
    uint48 startTime,
    uint48 voteDuration,
    bytes32[] memory choices,
    uint8 maxSelection,
    uint8 minSelection,
    uint256 proposalId
  ) private view {
    // Start time must be in the future and at least minVotingDelay seconds from now
    if (startTime <= VeVoteClockLogic.clock() + self.minVotingDelay) {
      revert VeVoteInvalidStartTime(startTime);
    }

    // Voting duration must be at least `minVotingDuration` and at most `maxVotingDuration`
    uint48 minDur = self.minVotingDuration;
    uint48 maxDur = self.maxVotingDuration;
    if (voteDuration < minDur || voteDuration > maxDur) {
      revert VeVoteInvalidVoteDuration(voteDuration, minDur, maxDur);
    }

    // Check description restriction
    if (!isValidIPFSHash(description)) {
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

  /**
   * @dev Validates if a given string is a valid IPFS CID.
   * @param description The proposal description (expected to be an IPFS hash).
   * @return True if the description is a valid IPFS CID, false otherwise.
   * // TODO: DO WE NEED TO VALIDATE THE DESCRIPTION?
   */
  function isValidIPFSHash(string memory description) private pure returns (bool) {
    bytes memory descBytes = bytes(description);
    uint256 len = descBytes.length;

    // CID v0 (46 chars, starts with "Qm")
    if (len == 46 && descBytes[0] == "Q" && descBytes[1] == "m") {
      return true;
    }

    // CID v1 (Base32: starts with "bafk", 59+ chars, lowercase)
    if (len >= 59 && descBytes[0] == "b" && descBytes[1] == "a" && descBytes[2] == "f" && descBytes[3] == "k") {
      return isBase32(descBytes, 0, len);
    }

    return false;
  }

  /**
   * @dev Validates if a given byte array is a valid Base32 string.
   * @param descBytes The byte array to validate.
   * @param startIndex The start index of the Base32 string.
   * @param endIndex The end index of the Base32 string.
   * @return True if the byte array is a valid Base32 string, false otherwise.
   */
  function isBase32(bytes memory descBytes, uint256 startIndex, uint256 endIndex) private pure returns (bool) {
    unchecked {
      for (uint256 i = startIndex; i < endIndex; ++i) {
        uint8 char = uint8(descBytes[i]);

        // Base32 lower-case alphabet: a-z (97-122), 2-7 (50-55)
        bool isLetter = (char >= 97 && char <= 122); // a-z
        bool isDigit = (char >= 50 && char <= 55); // 2-7

        if (!isLetter && !isDigit) {
          return false;
        }
      }
    }
    return true;
  }
}
