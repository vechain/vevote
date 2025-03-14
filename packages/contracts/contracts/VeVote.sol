// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

import { IVeVote } from "./interfaces/IVeVote.sol";
import { VeVoteStorage } from "./vevote/VeVoteStorage.sol";
import { VeVoteTypes } from "./vevote/libraries/VeVoteTypes.sol";
import { VeVoteQuoromLogic } from "./vevote/libraries/VeVoteQuoromLogic.sol";
import { VeVoteClockLogic } from "./vevote/libraries/VeVoteClockLogic.sol";
import { VeVoteStateLogic } from "./vevote/libraries/VeVoteStateLogic.sol";
import { VeVoteVoteLogic } from "./vevote/libraries/VeVoteVoteLogic.sol";
import { VeVoteProposalLogic } from "./vevote/libraries/VeVoteProposalLogic.sol";
import { VeVoteStorageTypes } from "./vevote/libraries/VeVoteStorageTypes.sol";
import { VeVoteConfigurator } from "./vevote/libraries/VeVoteConfigurator.sol";
import { VechainNodesDataTypes } from "./libraries/VechainNodesDataTypes.sol";
import { INodeManagement } from "./interfaces/INodeManagement.sol";
import { ITokenAuction } from "./interfaces/ITokenAuction.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import "hardhat/console.sol";

contract VeVote is IVeVote, VeVoteStorage, AccessControlUpgradeable, UUPSUpgradeable {
  /// @notice The role that can upgrade the contract
  bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
  /// @notice The role that can create proposals
  bytes32 public constant WHITELISTED_ROLE = keccak256("WHITELISTED_ROLE");
    /// @notice The role that can execute proposals
  bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
  /// @notice The role that can update contract settings
  bytes32 public constant SETTINGS_MANAGER_ROLE = keccak256("SETTINGS_MANAGER_ROLE");
  /// @notice The role that can update parms related to node voting weights
  bytes32 public constant NODE_WEIGHT_MANAGER_ROLE = keccak256("NODE_WEIGHT_MANAGER_ROLE");

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  /**
   * @notice Initializes the contract with the initial parameters
   * @dev This function is called only once during the contract deployment
   * @param data Initialization data containing the initial settings for the governor
   */
  function initialize(
    VeVoteTypes.InitializationData calldata data,
    VeVoteTypes.InitializationRolesData calldata rolesData
  ) external initializer {
    __VeVoteStorage_init(data);
    __AccessControl_init();
    __UUPSUpgradeable_init();
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    VeVoteQuoromLogic.updateQuorumNumerator($, data.quorumPercentage);

    // Validate and set the VeVote roles
    require(address(rolesData.admin) != address(0), "VeVote: Admin address cannot be zero");
    _grantRole(DEFAULT_ADMIN_ROLE, rolesData.admin);
    _grantRole(UPGRADER_ROLE, rolesData.upgrader);
    _grantRole(SETTINGS_MANAGER_ROLE, rolesData.settingsManager);
    _grantRole(NODE_WEIGHT_MANAGER_ROLE, rolesData.nodeWeightManager);
    _grantRole(EXECUTOR_ROLE, rolesData.executor);

    // Set the whitelist roles
    uint256 whitelistLength = rolesData.whitelist.length;
    for (uint256 i; i < whitelistLength; ) {
      _grantRole(WHITELISTED_ROLE, rolesData.whitelist[i]);
      unchecked {
        ++i;
      }
    }
  }

  // ------------------ GETTERS ------------------ //

  /**
   * @notice See {IVeVote-getProposal}.
   */
  function hashProposal(
    address proposer,
    uint48 startTime,
    uint48 voteDuration,
    bytes32[] memory choices,
    bytes32 descriptionHash,
    uint8 maxSelection,
    uint8 minSelection
  ) external pure returns (uint256) {
    return
      VeVoteProposalLogic.hashProposal(
        proposer,
        startTime,
        voteDuration,
        choices,
        descriptionHash,
        maxSelection,
        minSelection
      );
  }

  /**
   * @notice See {IVeVote-proposalSnapshot}.
   */
  function proposalSnapshot(uint256 proposalId) external view returns (uint48) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteProposalLogic.proposalSnapshot($, proposalId);
  }

  /**
   * @notice See {IVeVote-proposalDeadline}.
   */
  function proposalDeadline(uint256 proposalId) external view returns (uint48) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteProposalLogic.proposalDeadline($, proposalId);
  }

  /**
   * @notice See {IVeVote-proposalProposer}.
   */
  function proposalProposer(uint256 proposalId) external view returns (address) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteProposalLogic.proposalProposer($, proposalId);
  }

  /**
   * @notice See {IVeVote-proposalChoices}.
   */
  function proposalChoices(uint256 proposalId) external view returns (bytes32[] memory) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteProposalLogic.proposalChoices($, proposalId);
  }

  /**
   * @notice See {IVeVote-proposalSelectionRange}.
   */
  function proposalSelectionRange(uint256 proposalId) external view returns (uint8, uint8) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteProposalLogic.proposalSelectionRange($, proposalId);
  }

  /**
   * @notice See {IVeVote-getProposalVotes}.
   */
  function getProposalVotes(
    uint256 proposalId
  ) external view returns (VeVoteTypes.ProposalVoteResult[] memory results) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteVoteLogic.getProposalVotes($, proposalId);
  }

  /**
   * @notice See {IVeVote-totalVotes}.
   */
  function totalVotes(uint256 proposalId) external view returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteVoteLogic.totalVotes($, proposalId);
  }

  /**
   * @notice See {IVeVote-hasVoted}.
   */
  function hasVoted(uint256 proposalId, address account) external view returns (bool) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteVoteLogic.hasVoted($, proposalId, account);
  }

  /**
   * @notice See {IVeVote-getVoteWeightAtTimepoint}.
   */
  function getVoteWeightAtTimepoint(address account, uint48 timepoint) external view returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteVoteLogic.getVoteWeight($, account, timepoint);
  }

  /**
   * @notice See {IVeVote-getVoteWeight}.
   */
  function getVoteWeight(address account) external view returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteVoteLogic.getVoteWeight($, account, VeVoteClockLogic.clock());
  }

  /**
   * @notice See {IVeVote-state}.
   * @return VeVoteTypes.ProposalState The current state of the proposal
   */
  function state(uint256 proposalId) external view returns (VeVoteTypes.ProposalState) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteStateLogic.state($, proposalId);
  }

  /**
   * @notice See {IVeVote-quorum}.
   */
  function quorum(uint256 timepoint) external view returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteQuoromLogic.quorum($, timepoint);
  }

  /**
   * @notice See {IVeVote-quorumNumerator}.
   */
  function quorumNumerator() external view returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteQuoromLogic.quorumNumerator($);
  }

  /**
   * @notice See {IVeVote-quorumNumerator}.
   */
  function quorumNumerator(uint256 timepoint) external view returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteQuoromLogic.quorumNumerator($, timepoint);
  }

  /**
   * @notice See {IVeVote-quorumDenominator}.
   */
  function quorumDenominator() external pure returns (uint256) {
    return VeVoteQuoromLogic.quorumDenominator();
  }

  /**
   * @notice See {IVeVote-getMinVotingDelay}.
   */
  function getMinVotingDelay() external view returns (uint48) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteConfigurator.getMinVotingDelay($);
  }

  /**
   * @notice See {IVeVote-getMinVotingDuration}.
   */
  function getMinVotingDuration() external view returns (uint48) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteConfigurator.getMinVotingDuration($);
  }

  /**
   * @notice See {IVeVote-getMaxVotingDuration}.
   * @return uint48 The maximum voting duration
   */
  function getMaxVotingDuration() external view returns (uint48) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteConfigurator.getMaxVotingDuration($);
  }

  /**
   * @notice See {IVeVote-getMaxChoices}.
   */
  function getMaxChoices() external view returns (uint8) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteConfigurator.getMaxChoices($);
  }

  /**
   * @notice See {IVeVote-getBaseLevelNode}.
   */
  function getBaseLevelNode() external view returns (uint8) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteConfigurator.getBaseLevelNode($);
  }

  /**
   * @notice See {IVeVote-getNodeManagementContract}.
   */
  function getNodeManagementContract() external view returns (INodeManagement) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteConfigurator.getNodeManagementContract($);
  }

  /**
   * @notice See {IVeVote-getVechainNodeContract}.
   */
  function getVechainNodeContract() external view returns (ITokenAuction) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteConfigurator.getVechainNodeContract($);
  }

  /**
   * @notice this function returns the endorsement score of a node level.
   * @param nodeLevel The node level of the node ID.
   * @return uint256 The voting multiplier score of the node level.
   */
  function nodeLevelMultiplier(
    VechainNodesDataTypes.NodeStrengthLevel nodeLevel
  ) external view returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteConfigurator.nodeLevelMultiplier($, nodeLevel);
  }

  /**
   * @notice See {IVeVote-clock}.
   */
  function clock() external view returns (uint48) {
    return VeVoteClockLogic.clock();
  }

  /**
   * @notice See {IVeVote-CLOCK_MODE}.
   */
  // solhint-disable-next-line func-name-mixedcase
  function CLOCK_MODE() external pure returns (string memory) {
    return VeVoteClockLogic.CLOCK_MODE();
  }

  /**
   * @notice See {IVeVote-version}.
   */
  function version() external pure returns (uint8) {
    return 1;
  }

  // ------------------ SETTERS ------------------ //
  /**
   * @notice See {IVeVote-propose}.
   */
  function propose(
    string calldata description,
    uint48 startTime,
    uint48 voteDuration,
    bytes32[] calldata choices,
    uint8 maxSelection,
    uint8 minSelection
  ) external onlyRole(WHITELISTED_ROLE) returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteProposalLogic.propose($, description, startTime, voteDuration, choices, maxSelection, minSelection);
  }

  /**
   * @notice See {IVeVote-cancel}.
   * @param proposalId The proposal id
   * @return uint256 The proposal id
   */
  function cancel(uint256 proposalId) external returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteProposalLogic.cancel($, hasRole(WHITELISTED_ROLE, _msgSender()), hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), proposalId);
  }

  /**
   * @notice See {IVeVote-execute}.
   */
  function execute(uint256 proposalId) external onlyRole(EXECUTOR_ROLE) returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteProposalLogic.execute($, proposalId);
  }

  /**
   * @notice See {IVeVote-castVote}.
   */
  function castVote(uint256 proposalId, uint32 choices) external {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    VeVoteVoteLogic.castVote($, proposalId, choices, "");
  }

  /**
   * @notice See {IVeVote-castVote}.
   */
  function castVoteWithReason(uint256 proposalId, uint32 choices, string calldata reason) external {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    VeVoteVoteLogic.castVote($, proposalId, choices, reason);
  }

  /**
   * @notice See {IVeVote-setMinVotingDelay}.
   */
  function setMinVotingDelay(uint48 newMinVotingDelay) external onlyRole(SETTINGS_MANAGER_ROLE) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    VeVoteConfigurator.setMinVotingDelay($, newMinVotingDelay);
  }

  /**
   * @notice See {IVeVote-setMinVotingDuration}.
   */
  function setMinVotingDuration(uint48 newMinVotingDuration) external onlyRole(SETTINGS_MANAGER_ROLE) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    VeVoteConfigurator.setMinVotingDuration($, newMinVotingDuration);
  }

  /**
   * @notice See {IVeVote-setMaxVotingDuration}.
   */
  function setMaxVotingDuration(uint48 newMaxVotingDuration) external onlyRole(SETTINGS_MANAGER_ROLE) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    VeVoteConfigurator.setMaxVotingDuration($, newMaxVotingDuration);
  }

  /**
   * @notice See {IVeVote-setMaxChoices}.
   */
  function setMaxChoices(uint8 newMaxChoices) external onlyRole(SETTINGS_MANAGER_ROLE) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    VeVoteConfigurator.setMaxChoices($, newMaxChoices);
  }

  /**
   * @notice See {IVeVote-setBaseLevelNode}.
   */
  function setBaseLevelNode(uint8 newBaseLevelNode) external onlyRole(NODE_WEIGHT_MANAGER_ROLE) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    VeVoteConfigurator.setBaseLevelNode($, newBaseLevelNode);
  }

  /**
   * @notice See {IVeVote-setNodeManagementContract}.
   */
  function setNodeManagementContract(address nodeManagement) external onlyRole(SETTINGS_MANAGER_ROLE) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    VeVoteConfigurator.setNodeManagementContract($, nodeManagement);
  }

  /**
   * @notice See {IVeVote-setVechainNodeContract}.
   */
  function setVechainNodeContract(address tokenAuction) external onlyRole(SETTINGS_MANAGER_ROLE) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    VeVoteConfigurator.setVechainNodeContract($, tokenAuction);
  }

  /**
   * @notice See {IVeVote-updateNodeMultipliers}.
   */
  function updateNodeMultipliers(
    VeVoteTypes.NodeVoteMultiplier memory updatedNodeMultipliers
  ) external onlyRole(NODE_WEIGHT_MANAGER_ROLE) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    VeVoteConfigurator.updateNodeMultipliers($, updatedNodeMultipliers);
  }

  /**
   * @notice See {IVeVote-updateQuorumNumerator}.
   */
  function updateQuorumNumerator(uint256 newQuorumNumerator) external onlyRole(SETTINGS_MANAGER_ROLE) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    VeVoteQuoromLogic.updateQuorumNumerator($, newQuorumNumerator);
  }

  // ------------------ Overrides ------------------ //

  /**
   * @notice Authorizes upgrade to a new implementation
   * @param newImplementation The address of the new implementation
   */
  function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}

  /**
   * @notice Checks if the contract supports a specific interface
   * @param interfaceId The interface id to check
   * @return bool True if the interface is supported, false otherwise
   */
  function supportsInterface(
    bytes4 interfaceId
  ) public pure override(IERC165, AccessControlUpgradeable) returns (bool) {
    return interfaceId == type(IVeVote).interfaceId || interfaceId == type(IERC165).interfaceId;
  }
}
