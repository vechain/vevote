// SPDX-License-Identifier: MIT
// Forked from OpenZeppelin Contracts (last updated v5.0.0) (governance/IGovernor.sol)

pragma solidity 0.8.20;

import { IERC165 } from "@openzeppelin/contracts/interfaces/IERC165.sol";
import { IERC6372 } from "@openzeppelin/contracts/interfaces/IERC6372.sol";
import { VeVoteTypes } from "../vevote/libraries/VeVoteTypes.sol";

interface IVeVote is IERC165, IERC6372 {
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
   * @dev Thrown when an invalid quorum fraction is provided.
   *      - The numerator must be less than or equal to the denominator.
   */
  error VeVoteInvalidQuorumFraction(uint256 quorumNumerator, uint256 quorumDenominator);

  /**
   * @dev Thrown when the `proposalId` does not exist.
   * @param proposalId The ID of the proposal that does not exist.
   */
  error VeVoteNonexistentProposal(uint256 proposalId);

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
   * @notice Emitted when the quorum numerator is updated.
   * @param oldNumerator The previous quorum numerator.
   * @param newNumerator The new quorum numerator.
   */
  event QuorumNumeratorUpdated(uint256 oldNumerator, uint256 newNumerator);

  // ------------------------------- Getter Functions -------------------------------
  /**
   * @notice Returns the hash of a proposal.
   * @param proposer The address of the proposer.
   * @param startTime The time when the proposal starts.
   * @param voteDuration The duration of the proposal.
   * @param choices The voting choices for the proposal.
   * @param descriptionHash The hash of the proposal description.
   * @param maxSelection The maximum number of choices a voter can select.
   * @param minSelection The minimum number of choices a voter must select.
   * @return VeVoteTypes.ProposalCore The core data of the proposal
   */
  function hashProposal(
    address proposer,
    uint48 startTime,
    uint48 voteDuration,
    bytes32[] memory choices,
    bytes32 descriptionHash,
    uint8 maxSelection,
    uint8 minSelection
  ) internal pure returns (uint256);

  /**
   * @notice Returns the start time of a proposal.
   * @param proposalId The ID of the proposal
   * @return The start time of the proposal.
   */
  function proposalSnapshot(uint256 proposalId) internal view returns (uint48);

  /**
   * @notice Returns the deadline timestamp of a proposal.
   * @param proposalId The ID of the proposal
   * @return The deadline of the proposal.
   */
  function proposalDeadline(uint256 proposalId) internal view returns (uint48);

  /**
   * @notice Returns the proposer of a proposal.
   * @param proposalId The id of the proposal.
   * @return The address of the proposer.
   */
  function proposalProposer(uint256 proposalId) internal view returns (address);
  
  /**
   * @notice Retrieves the current state of a proposal.
   * @param proposalId The ID of the proposal.
   * @return The current state of the proposal.
   */
  function state(uint256 proposalId) external view returns (VeVoteTypes.ProposalState);

  /**
   * @notice Calculates the quorum required at a given timepoint based on the total staked VET.
   * @param timepoint The block timestamp or ID to retrieve quorum requirements for.
   * @return The required quorum at the given timepoint.
   */
  function quorum(uint256 timepoint) external view returns (uint256);

  /**
   * @notice Returns the latest recorded quorum numerator.
   * @return The latest quorum numerator.
   */
  function quorumNumerator() external view returns (uint256);

  /**
   * @notice Returns the quorum numerator at a given timepoint.
   * @param timepoint The block timestamp for which to retrieve the quorum numerator.
   * @return The quorum numerator value at the given timepoint.
   */
  function quorumNumerator(uint256 timepoint) external view returns (uint256);

  /**
   * @notice Returns the quorum denominator, which is a constant value.
   * @return The constant quorum denominator (100).
   */
  function quorumDenominator() external pure returns (uint256);

  /**
   * @notice Returns the current timepoint using the block number.
   * @return The current block number as a uint48.
   */
  function clock() external view returns (uint48);

  /**
   * @notice Returns the clock mode description, indicating that timestamps are used.
   * @return The clock mode as a string.
   */
  // solhint-disable-next-line func-name-mixedcase
  function CLOCK_MODE() external pure returns (string memory);

  // ------------------------------- Setter Functions -------------------------------

  /**
   * @notice Proposes a new governance action.
   * @dev Creates a new proposal, validates its parameters, and stores it in the contract.
   * @param description The IPFS CID containing the proposal details.
   * @param startTime The timestamp when the proposal starts.
   * @param voteDuration The duration of the proposal in seconds.
   * @param choices The voting choices available.
   * @param maxSelection The maximum number of choices a voter can select.
   * @param minSelection The minimum number of choices a voter must select.
   * @return proposalId The unique identifier of the proposal.
   */
  function propose(
    string memory description,
    uint48 startTime,
    uint48 voteDuration,
    bytes32[] memory choices,
    uint8 maxSelection,
    uint8 minSelection
  ) external returns (uint256);

  /**
   * @notice Cancels a proposal.
   * @dev Allows the proposer or an admin to cancel a proposal before execution.
   * @param proposalId The ID of the proposal to cancel.
   * @return The proposal ID.
   */
  function cancel(uint256 proposalId) external returns (uint256);
}
