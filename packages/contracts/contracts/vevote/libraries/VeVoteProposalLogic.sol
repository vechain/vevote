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
    string calldata description,
    uint48 startTime,
    uint48 voteDuration,
    bytes32[] calldata choices,
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
    // Cache the proposer and current state to minimize redundant storage reads
    address proposer = proposalProposer(self, proposalId);
    VeVoteTypes.ProposalState currentState = VeVoteStateLogic._state(self, proposalId);

    // Ensure only the proposer or an admin can cancel
    if (account != proposer && !admin) {
      revert UnauthorizedAccess(account);
    }

    // Validate that the proposal is not already canceled or executed
    VeVoteStateLogic.validateStateBitmap(
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
   * @notice Returns the deadline timestamp of a proposal.
   * @dev Determines the timestamp at which the proposal will be considered expired.
   * @param self The storage reference for the GovernorStorage.
   * @param proposalId The id of the proposal.
   * @return The deadline timestamp.
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
    if (startTime <= VeVoteClockLogic.clock() || VeVoteClockLogic.clock() - startTime > self.minVotingDelay) {
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

    // Ensure `minSelection` is not greater than `maxSelection` (logical validation)
    if (minSelection > maxSelection) {
      revert VeVoteInvalidSelectionRange(minSelection, maxSelection);
    }

    // Ensure there are enough choices for voters to pick up to `maxSelection`
    if (choices.length < maxSelection && choices.length < self.maxChoices) {
      revert VeVoteInvalidChoiceCount(choices.length, minSelection, maxSelection);
    }

    // Ensure the proposal does not already exist
    if (self.proposals[proposalId].voteStart != 0) {
      // Proposal already exists
      revert VeVoteUnexpectedProposalState(proposalId, VeVoteStateLogic._state(self, proposalId), bytes32(0));
    }
  }

  /**
   * @dev Checks if the description string ends with a proposer's address suffix.
   * @param proposer The address of the proposer.
   * @param description The description of the proposal.
   * @return True if the suffix matches the proposer's address or if there is no suffix, false otherwise.
   */

  /** 
  function isValidDescriptionForProposer(address proposer, string memory description) private pure returns (bool) {
    uint256 len = bytes(description).length;

    // Length is too short to contain a valid proposer suffix
    if (len < 52) {
      return true;
    }

    // Extract what would be the `#proposer=0x` marker beginning the suffix
    bytes12 marker;
    assembly {
      // Start of the string contents in memory = description + 32
      // First character of the marker = len - 52
      // We read the memory word starting at the first character of the marker:
      // (description + 32) + (len - 52) = description + (len - 20)
      marker := mload(add(description, sub(len, 20)))
    }

    // If the marker is not found, there is no proposer suffix to check
    if (marker != bytes12("#proposer=0x")) {
      return true;
    }

    // Parse the 40 characters following the marker as uint160
    uint160 recovered;
    for (uint256 i = len - 40; i < len; ++i) {
      (bool isHex, uint8 value) = tryHexToUint(bytes(description)[i]);
      // If any of the characters is not a hex digit, ignore the suffix entirely
      if (!isHex) {
        return true;
      }
      recovered = (recovered << 4) | value;
    }

    return recovered == uint160(proposer);
  }
*/

  /**
   * @dev Validates if a given string is a valid IPFS CID.
   * @param description The proposal description (expected to be an IPFS hash with or without "ipfs://").
   * @return True if the description is a valid IPFS CID, false otherwise.
   */
  function isValidIPFSHash(string memory description) private pure returns (bool) {
    bytes memory descBytes = bytes(description);
    uint256 len = descBytes.length;

    // CID v0 (46 chars, starts with "Qm")
    if (len == 46 && descBytes[0] == "Q" && descBytes[1] == "m") {
      return true;
    }

    // CID v1 (59 chars, Base58 encoded)
    if (len == 59 && isBase58(descBytes, 0, 59)) {
      return true;
    }

    // "ipfs://" CID (length at least 53)
    if (len >= 53 && _startsWithIPFS(descBytes)) {
      uint256 cidStart = 7;
      uint256 cidLen = len - cidStart;

      return
        (cidLen == 46 && descBytes[cidStart] == "Q" && descBytes[cidStart + 1] == "m") ||
        (cidLen == 59 && isBase58(descBytes, cidStart, len));
    }

    return false;
  }

  /**
   * @dev Checks if a byte array starts with "ipfs://".
   * @param descBytes The byte array of the input string.
   * @return True if it starts with "ipfs://", false otherwise.
   */
  function _startsWithIPFS(bytes memory descBytes) private pure returns (bool) {
    return
      descBytes.length >= 7 &&
      descBytes[0] == "i" &&
      descBytes[1] == "p" &&
      descBytes[2] == "f" &&
      descBytes[3] == "s" &&
      descBytes[4] == ":" &&
      descBytes[5] == "/" &&
      descBytes[6] == "/";
  }

  /**
   * @dev Checks if a string is valid Base58 encoding.
   * @param descBytes The byte array of the input.
   * @param startIndex The index where the check should start.
   * @param endIndex The index where the check should stop.
   * @return True if the input is valid Base58, false otherwise.
   */
  function isBase58(bytes memory descBytes, uint256 startIndex, uint256 endIndex) private pure returns (bool) {
    unchecked {
      for (uint256 i = startIndex; i < endIndex; ++i) {
        uint8 char = uint8(descBytes[i]);

        // Base58 characters: 1-9, A-Z (except I, O), a-z (except l)
        if (
          (char < 0x31) || // Below '1'
          (char > 0x7A) || // Above 'z'
          (char == 0x30) || // '0'
          (char == 0x4F) || // 'O'
          (char == 0x49) || // 'I'
          (char == 0x6C) // 'l'
        ) {
          return false;
        }
      }
    }
    return true;
  }
}
