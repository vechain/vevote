// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

import { VeVoteTypes } from "../vevote/libraries/VeVoteTypes.sol";
import { INodeManagement } from "./INodeManagement.sol";
import { ITokenAuction } from "./ITokenAuction.sol";
import "@openzeppelin/contracts/interfaces/IERC165.sol";
import "@openzeppelin/contracts/interfaces/IERC6372.sol";

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

  /**
   * @dev Thrown when the minimum voting delay is set to an invalid value (zero).
   */
  error InvalidMinVotingDelay();

  /**
   * @dev Thrown when the minimum voting duration is set to an invalid value (zero).
   */
  error InvalidMinVotingDuration();

  /**
   * @dev Thrown when the maximum voting duration is set to an invalid value (zero).
   */
  error InvalidMaxVotingDuration();

  /**
   * @dev Thrown when the maximum number of choices is set to an invalid value (zero).
   */
  error InvalidMaxChoices();

  /**
   * @dev Thrown when an invalid address (zero address) is provided.
   */
  error InvalidAddress();

  /**
   * @dev Thrown when an invalid node is set as the cheapest node.
   */
  error InvalidNode();

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

  /**
   * @notice Emitted when the quorum numerator is updated.
   * @param oldNumerator The previous quorum numerator.
   * @param newNumerator The new quorum numerator.
   */
  event QuorumNumeratorUpdated(uint256 oldNumerator, uint256 newNumerator);

  /**
   * @notice Emitted when the minimum voting delayis updated.
   */
  event MinVotingDelaySet(uint256 oldMinMinVotingDelay, uint256 newMinVotingDelay);

  /**
   * @notice Emitted when the minimum voting duration is updated.
   */
  event MinVotingDurationSet(uint256 oldMinVotingDuration, uint256 newMinVotingDuration);

  /**
   * @notice Emitted when the maximum voting duration is updated.
   */
  event MaxVotingDurationSet(uint256 oldMaxVotingDuration, uint256 newMaxVotingDuration);

  /**
   * @notice Emitted when the maximum number of choices is updated.
   */
  event MaxChoicesSet(uint256 oldMaxChoices, uint256 newMaxChoices);

  /**
   * @notice Emitted when the NodeManagement contract is set.
   */
  event NodeManagementContractSet(address oldContractAddress, address newContractAddress);

  /**
   * @notice Emitted when the TokenAuction contract is set.
   */
  event VechainNodeContractSet(address oldContractAddress, address newContractAddress);

  /**
   * @notice Emitted when a user casts a vote on a proposal.
   * @param voter The address of the voter.
   * @param proposalId The ID of the proposal being voted on.
   * @param choices The bitmask representing the selected vote choices.
   * @param weight The voting weight of the voter.
   * @param reason The reason for the vote.
   */
  event VoteCast(address indexed voter, uint256 indexed proposalId, uint32 choices, uint256 weight, string reason);

  /**
   * @notice Emitted when the VeChain node base level is updated.
   * @param oldBaseLevelNode The previous base level node.
   * @param newBaseLevelNode The new base level node.
   */
  event VechainBaseNodeSet(uint8 oldBaseLevelNode, uint8 newBaseLevelNode);

  // ------------------------------- Structs -------------------------------
  /**
   * @notice Represents the result of a proposal vote.
   * @param choice The label of the choice.
   * @param weight The total votes for that choice.
   */
  struct ProposalVoteResult {
    bytes32 choice;
    uint256 weight;
  }

  // ------------------------------- Getter Functions -------------------------------
  /**
   * @notice Retrieves the votes cast for a proposal.
   * @param proposalId The ID of the proposal.
   */
  function getProposalVotes(uint256 proposalId) external view returns (VeVoteTypes.ProposalVoteResult[] memory results);

  /**
   * @notice Retrieves the total votes for a proposal.
   * @param proposalId The ID of the proposal.
   * @return The total votes for the proposal.
   */
  function totalVotes(uint256 proposalId) external view returns (uint256);

  /**
   * @notice Checks if an account has voted on a specific proposal.
   * @param proposalId The ID of the proposal.
   * @param account The address of the account.
   * @return True if the account has voted, false otherwise.
   */
  function hasVoted(uint256 proposalId, address account) external view returns (bool);

  /**
   * @notice Retrieves the voting weight of an account at a given timepoint.
   * @param account The address of the account.
   * @param timepoint The specific timepoint.
   * @return The voting weight of the account.
   */
  function getVoteWeightAtTimepoint(address account, uint48 timepoint) external view returns (uint256);

  /**
   * @notice Retrieves the voting weight of an account at a current timepoint.
   * @param account The address of the account.
   * @return The voting weight of the account.
   */
  function getVoteWeight(address account) external view returns (uint256);

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
  ) external pure returns (uint256);

  /**
   * @notice Returns the start time of a proposal.
   * @param proposalId The ID of the proposal
   * @return The start time of the proposal.
   */
  function proposalSnapshot(uint256 proposalId) external view returns (uint48);

  /**
   * @notice Returns the deadline timestamp of a proposal.
   * @param proposalId The ID of the proposal
   * @return The deadline of the proposal.
   */
  function proposalDeadline(uint256 proposalId) external view returns (uint48);

  /**
   * @notice Returns the proposer of a proposal.
   * @param proposalId The id of the proposal.
   * @return The address of the proposer.
   */
  function proposalProposer(uint256 proposalId) external view returns (address);

  /**
   * @notice Returns the proposal choices.
   * @param proposalId The ID of the proposal.
   * @return The choices available for the proposal.
   */
  function proposalChoices(uint256 proposalId) external view returns (bytes32[] memory);

  /**
   * @notice Returns the minimum and maximum choices that can be selected for a proposal
   * @param proposalId The id of the proposal.
   * @return The minimum and maximum choices that can be selected.
   */
  function proposalSelectionRange(uint256 proposalId) external view returns (uint8, uint8);

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
   * @notice Returns the minimum voting delay.
   * @return uint48 The minimum voting delay
   */
  function getMinVotingDelay() external view returns (uint48);

  /**
   * @notice Returns the minimum voting duration.
   * @return uint48 The minimum voting duration
   */
  function getMinVotingDuration() external view returns (uint48);

  /**
   * @notice Returns the maximum voting duration.
   * @return uint48 The maximum voting duration
   */
  function getMaxVotingDuration() external view returns (uint48);

  /**
   * @notice Returns the maximum number of choices.
   * @return uint8 The maximum number of choices
   */
  function getMaxChoices() external view returns (uint8);

  /**
   * @notice Returns the base level node for the VeChain Node contract.
   * @return The current base level node.
   */
  function getBaseLevelNode() external view returns (uint8);

  /**
   * @notice Returns the node management contract instance.
   * @return INodeManagement The node management contract
   */
  function getNodeManagementContract() external view returns (INodeManagement);

  /**
   * @notice Returns the vechain node contract instance.
   * @return ITokenAuction The vechain node contract
   */
  function getVechainNodeContract() external view returns (ITokenAuction);

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

  /**
   * @notice Returns the version of the contract.
   * @return The version of the contract.
   */
  function version() external pure returns (string memory);

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

  /**
   * @notice Marks a proposal as executed.
   * @dev Allows an admin to mark a proposal as executed.
   * @param proposalId The ID of the proposal to execute.
   */
  function execute(uint256 proposalId) external returns (uint256);

  /**
   * @notice Updates the minimum voting delay.
   * @param newMinVotingDelay The new minimum voting delay
   */
  function setMinVotingDelay(uint48 newMinVotingDelay) external;

  /**
   * @notice Updates the minimum voting duration.
   * @param newMinVotingDuration The new minimum voting duration
   */
  function setMinVotingDuration(uint48 newMinVotingDuration) external;

  /**
   * @notice Updates the maximum voting duration.
   * @param newMaxVotingDuration The new maximum voting duration
   */
  function setMaxVotingDuration(uint48 newMaxVotingDuration) external;

  /**
   * @notice Updates the maximum number of choices.
   * @param newMaxChoices The new maximum number of choices
   */
  function setMaxChoices(uint8 newMaxChoices) external;

  /**
   * @notice Sets the most basic node level that can be obtained.
   * @param newBaseLevelNode The new base level node to set.
   */
  function setBaseLevelNode(uint8 newBaseLevelNode) external;

  /**
   * @notice Updates the node management contract address.
   * @param nodeManagement The address of the node management contract
   */
  function setNodeManagementContract(address nodeManagement) external;

  /**
   * @notice Updates the Vechain Node Token Auction contract address.
   * @param tokenAuction The address of the token auction contract
   */
  function setVechainNodeContract(address tokenAuction) external;

  /**
   * @notice Updates the quorum numerator.
   * @param newQuorumNumerator The new quorum numerator
   */
  function updateQuorumNumerator(uint256 newQuorumNumerator) external;
}
