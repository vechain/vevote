// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

import { VeVoteTypes } from "../governance/libraries/VeVoteTypes.sol";
import { INodeManagement } from "./INodeManagement.sol";
import { IStargateNFTV2 } from "./IStargateNFTV2.sol";
import { IAuthority } from "./IAuthority.sol";
import "@openzeppelin/contracts/interfaces/IERC165.sol";
import "@openzeppelin/contracts/interfaces/IERC6372.sol";

interface IVeVoteV1 is IERC165, IERC6372 {
  error VeVoteInvalidStartBlock(uint48 startBlock);
  error VeVoteInvalidVoteDuration(uint48 voteDuration, uint48 minVotingDuration, uint48 maxVotingDuration);
  error VeVoteUnexpectedProposalState(uint256 proposalId, VeVoteTypes.ProposalState state, bytes32 expectedState);
  error VeVoteInvalidProposalDescription();
  error VeVoteInvalidQuorumFraction(uint256 quorumNumerator, uint256 quorumDenominator);
  error MinimumStakeNotSetAtTimepoint(uint48 timepoint);
  error VeVoteNonexistentProposal(uint256 proposalId);
  error UnauthorizedAccess(address user);
  error InvalidMinVotingDelay();
  error InvalidMinVotingDuration();
  error InvalidMaxVotingDuration();
  error InvalidNodeId();
  error InvalidAddress();
  error InvalidMinimumStake();
  error ProposalNotActive();
  error InvalidVoteType();
  error VoterNotEligible();
  error AlreadyVoted();

  event VeVoteProposalCreated(
    uint256 indexed proposalId,
    address indexed proposer,
    string description,
    uint48 startBlock,
    uint48 voteDuration
  );
  event ProposalCanceled(uint256 indexed proposalId, address canceller, string reason);
  event VeVoteProposalExecuted(uint256 indexed proposalId, string comment);
  event QuorumNumeratorUpdated(uint256 oldNumerator, uint256 newNumerator);
  event MinVotingDelaySet(uint48 oldMinVotingDelay, uint48 newMinVotingDelay);
  event MinVotingDurationSet(uint48 oldMinVotingDuration, uint48 newMinVotingDuration);
  event MaxVotingDurationSet(uint48 oldMaxVotingDuration, uint48 newMaxVotingDuration);
  event MaxChoicesSet(uint8 oldMaxChoices, uint8 newMaxChoices);
  event NodeManagementContractSet(address oldContractAddress, address newContractAddress);
  event StargateNFTContractSet(address oldContractAddress, address newContractAddress);
  event ValidatorContractSet(address oldContractAddress, address newContractAddress);
  event VoteCast(
    address indexed voter,
    uint256 indexed proposalId,
    uint8 support,
    uint256 weight,
    string reason,
    uint256[] stargateNFTs,
    address validator
  );
  event MinStakedAmountUpdated(uint256 previousMinStake, uint256 newMinStake);
  event VoteMultipliersUpdated(uint256[] updatedMultipliers);

  function getProposalVotes(
    uint256 proposalId
  ) external view returns (uint256 againstVotes, uint256 forVotes, uint256 abstainVotes);
  function totalVotes(uint256 proposalId) external view returns (uint256);
  function hasVoted(uint256 proposalId, address account) external view returns (bool);
  function getVoteWeightAtTimepoint(
    address account,
    uint48 timepoint,
    address masterAddress
  ) external returns (uint256);
  function getVoteWeight(address account, address masterAddress) external view returns (uint256);
  function getNodeVoteWeight(uint256 nodeId) external view returns (uint256);
  function getValidatorVoteWeight(address endorser, address masterAddress) external view returns (uint256);
  function hashProposal(
    address proposer,
    uint48 startBlock,
    uint48 voteDuration,
    bytes32 descriptionHash
  ) external pure returns (uint256);
  function proposalSnapshot(uint256 proposalId) external view returns (uint48);
  function proposalDeadline(uint256 proposalId) external view returns (uint48);
  function proposalProposer(uint256 proposalId) external view returns (address);
  function state(uint256 proposalId) external view returns (VeVoteTypes.ProposalState);
  function quorum(uint48 timepoint) external view returns (uint256);
  function quorumNumerator() external view returns (uint256);
  function quorumNumerator(uint48 timepoint) external view returns (uint256);
  function quorumDenominator() external pure returns (uint256);
  function isQuorumReached(uint256 proposalId) external view returns (bool);
  function getMinVotingDelay() external view returns (uint48);
  function getMinVotingDuration() external view returns (uint48);
  function getMaxVotingDuration() external view returns (uint48);
  function getMinStakedAmount() external view returns (uint256);
  function getMinStakedAmountAtTimepoint(uint48 timepoint) external view returns (uint256);
  function getNodeManagementContract() external view returns (INodeManagement);
  function getStargateNFTContract() external view returns (IStargateNFTV2);
  function getValidatorContract() external view returns (IAuthority);
  function levelIdMultiplier(uint8 levelId) external view returns (uint256);
  function clock() external view returns (uint48);
  function CLOCK_MODE() external pure returns (string memory);
  function version() external pure returns (uint8);
  function propose(string memory description, uint48 startBlock, uint48 voteDuration) external returns (uint256);
  function cancel(uint256 proposalId) external returns (uint256);
  function cancelWithReason(uint256 proposalId, string calldata reason) external returns (uint256);
  function execute(uint256 proposalId) external returns (uint256);
  function executeWithComment(uint256 proposalId, string memory comment) external returns (uint256);
  function setMinVotingDelay(uint48 newMinVotingDelay) external;
  function setMinVotingDuration(uint48 newMinVotingDuration) external;
  function setMaxVotingDuration(uint48 newMaxVotingDuration) external;
  function setMinStakedVetAmount(uint256 newMinStake) external;
  function setNodeManagementContract(address nodeManagement) external;
  function setStargateNFTContract(address stargateNFT) external;
  function setValidatorContract(address validatorContract) external;
  function updateQuorumNumerator(uint256 newQuorumNumerator) external;
  function updateLevelIdMultipliers(uint256[] calldata newMultipliers) external;
  function castVote(uint256 proposalId, uint8 support, address masterAddress) external;
  function castVoteWithReason(
    uint256 proposalId,
    uint8 support,
    string calldata reason,
    address masterAddress
  ) external;
}
