// SPDX-License-Identifier: MIT

//  8b           d8       8b           d8
//  `8b         d8'       `8b         d8'           ,d
//   `8b       d8'         `8b       d8'            88
//    `8b     d8' ,adPPYba, `8b     d8' ,adPPYba, MM88MMM ,adPPYba,
//     `8b   d8' a8P   _d88  `8b   d8' a8"     "8a  88   a8P_____88
//      `8b d8'  8PP  "PP""   `8b d8'  8b       d8  88   8PP"""""""
//       `888'   "8b,   ,aa    `888'   "8a,   ,a8"  88,  "8b,   ,aa
//        `8'     `"Ybbd8"'     `8'     `"YbbdP"'   "Y888 `"Ybbd8"'

pragma solidity 0.8.20;

import { IVeVoteV1 } from "../interfaces/IVeVoteV1.sol";
import { VeVoteStorageV1 as VeVoteStorage } from "./governance/VeVoteStorageV1.sol";
import { VeVoteTypesV1 as VeVoteTypes } from "./governance/libraries/VeVoteTypesV1.sol";
import { VeVoteQuorumLogicV1 as VeVoteQuorumLogic } from "./governance/libraries/VeVoteQuorumLogicV1.sol";
import { VeVoteClockLogicV1 as VeVoteClockLogic } from "./governance/libraries/VeVoteClockLogicV1.sol";
import { VeVoteStateLogicV1 as VeVoteStateLogic } from "./governance/libraries/VeVoteStateLogicV1.sol";
import { VeVoteVoteLogicV1 as VeVoteVoteLogic } from "./governance/libraries/VeVoteVoteLogicV1.sol";
import { VeVoteProposalLogicV1 as VeVoteProposalLogic } from "./governance/libraries/VeVoteProposalLogicV1.sol";
import { VeVoteStorageTypesV1 as VeVoteStorageTypes } from "./governance/libraries/VeVoteStorageTypesV1.sol";
import { VeVoteConfiguratorV1 as VeVoteConfigurator } from "./governance/libraries/VeVoteConfiguratorV1.sol";
import { INodeManagement } from "../interfaces/INodeManagement.sol";
import { IStargateNFTV2 } from "../interfaces/IStargateNFTV2.sol";
import { IAuthority } from "../interfaces/IAuthority.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @title VeVote Governance Contract
 * @notice Upgradeable single-choice voting system for VeChain governance using Stargate NFTs and validator eligibility.
 * @dev
 * ## Governance Participation
 * - Only two categories of users can vote:
 *   1. **Stargate NFT Holders**: Voting power is derived from each NFT's `levelId` and `vetAmountStaked`,
 *      scaled by level-specific multipliers and normalized against the current minimum stake requirement.
 *   2. **Validators**: Represented by level ID `0`, validators receive fixed voting power based on
 *      `VALIDATOR_STAKED_VET_REQUIREMENT` and the level `0` multiplier. Only active, listed validators,
 *      as verified via the `Authority` contract, are eligible to participate.
 *
 * ## Voting Model
 * - Supports standard governance voting options - AGAINST, FOR, ABSTAIN.
 *
 * ## Role-Based Access Control
 * - `DEFAULT_ADMIN_ROLE`: Full administrative privileges.
 * - `WHITELISTED_ROLE`: Can create proposals.
 * - `EXECUTOR_ROLE`: Can execute finalized proposals.
 * - `SETTINGS_MANAGER_ROLE`: Can update voting durations, limits, and contract references.
 * - `NODE_WEIGHT_MANAGER_ROLE`: Can modify NFT voting multipliers and staking thresholds.
 * - `UPGRADER_ROLE`: Can perform UUPS-based contract upgrades.
 *
 * ## Upgradeability
 * - Implements the UUPS proxy pattern (`UUPSUpgradeable`) to allow controlled upgrades by trusted entities.
 *
 * ## Contract Structure
 * - Logic is modularized into internal libraries for maintainability:
 *   - `VeVoteProposalLogic`: Proposal creation, cancellation, execution, and hashing.
 *   - `VeVoteVoteLogic`: Voting mechanics and vote weight computation.
 *   - `VeVoteQuorumLogic`: Quorum calculations based on circulating NFT supply and validator weight.
 *   - `VeVoteConfigurator`: Governance configuration setters/getters.
 *   - `VeVoteClockLogic`: Time abstraction for block-based scheduling.
 *   - `VeVoteStorageTypes`: Defines structured storage layout.
 */
contract VeVoteV1 is IVeVoteV1, VeVoteStorage, AccessControlUpgradeable, UUPSUpgradeable {
  /// @notice The role that can upgrade the contract
  bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
  /// @notice The role that can grant the `WHITELISTED_ROLE`
  bytes32 public constant WHITELIST_ADMIN_ROLE = keccak256("WHITELIST_ADMIN_ROLE");
  /// @notice The role that create proposals
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
    VeVoteQuorumLogic.updateQuorumNumerator($, data.quorumPercentage);

    // Set WHITELIST_ADMIN_ROLE as the admin for WHITELISTED_ROLE
    _setRoleAdmin(WHITELISTED_ROLE, WHITELIST_ADMIN_ROLE);

    // Validate and set the VeVote roles
    require(address(rolesData.admin) != address(0), "VeVote: Admin address cannot be zero");
    _grantRole(DEFAULT_ADMIN_ROLE, rolesData.admin);
    _grantRole(UPGRADER_ROLE, rolesData.upgrader);
    _grantRole(SETTINGS_MANAGER_ROLE, rolesData.settingsManager);
    _grantRole(NODE_WEIGHT_MANAGER_ROLE, rolesData.nodeWeightManager);
    _grantRole(EXECUTOR_ROLE, rolesData.executor);
    _grantRole(WHITELIST_ADMIN_ROLE, rolesData.whitelistAdmin);

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
   * @inheritdoc IVeVoteV1
   */
  function hashProposal(
    address proposer,
    uint48 startBlock,
    uint48 voteDuration,
    bytes32 descriptionHash
  ) external pure returns (uint256) {
    return VeVoteProposalLogic.hashProposal(proposer, startBlock, voteDuration, descriptionHash);
  }

  /**
   * @inheritdoc IVeVoteV1
   */
  function proposalSnapshot(uint256 proposalId) external view returns (uint48) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteProposalLogic.proposalSnapshot($, proposalId);
  }

  /**
   * @inheritdoc IVeVoteV1
   */
  function proposalDeadline(uint256 proposalId) external view returns (uint48) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteProposalLogic.proposalDeadline($, proposalId);
  }

  /**
   * @inheritdoc IVeVoteV1
   */
  function proposalProposer(uint256 proposalId) external view returns (address) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteProposalLogic.proposalProposer($, proposalId);
  }

  /**
   * @inheritdoc IVeVoteV1
   */
  function getProposalVotes(
    uint256 proposalId
  ) external view returns (uint256 againstVotes, uint256 forVotes, uint256 abstainVotes) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteVoteLogic.proposalVotes($, proposalId);
  }

  /**
   * @inheritdoc IVeVoteV1
   */
  function totalVotes(uint256 proposalId) external view returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteVoteLogic.totalVotes($, proposalId);
  }

  /**
   * @inheritdoc IVeVoteV1
   */
  function hasVoted(uint256 proposalId, address account) external view returns (bool) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteVoteLogic.hasVoted($, proposalId, account);
  }

  /**
   * @inheritdoc IVeVoteV1
   */   
  function getVoteWeightAtTimepoint(
    address account,
    uint48 timepoint,
    address masterAddress
  ) external view returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteVoteLogic.getVoteWeight($, account, timepoint, masterAddress);
  }

  /**
   * @inheritdoc IVeVoteV1
   */
  function getVoteWeight(address account, address masterAddress) external view returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteVoteLogic.getVoteWeight($, account, VeVoteClockLogic.clock(), masterAddress);
  }

  /**
   * @inheritdoc IVeVoteV1
   */
  function getNodeVoteWeight(uint256 nodeId) external view returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteVoteLogic.getNodeVoteWeight($, nodeId);
  }

  /**
   * @inheritdoc IVeVoteV1
   */
  function getValidatorVoteWeight(address endorser, address masterAddress) external view returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteVoteLogic.getValidatorVoteWeight($, endorser, masterAddress);
  }

  /**
   * @inheritdoc IVeVoteV1
   */
  function state(uint256 proposalId) external view returns (VeVoteTypes.ProposalState) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteStateLogic.state($, proposalId);
  }

  /**
   * @inheritdoc IVeVoteV1
   */
  function quorum(uint48 timepoint) external view returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteQuorumLogic.quorum($, timepoint);
  }

  /**
   * @inheritdoc IVeVoteV1
   */
  function quorumNumerator() external view returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteQuorumLogic.quorumNumerator($);
  }

  /**
   * @inheritdoc IVeVoteV1
   */   
  function quorumNumerator(uint48 timepoint) external view returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteQuorumLogic.quorumNumerator($, timepoint);
  }

  /**
   * @inheritdoc IVeVoteV1
   */
  function quorumDenominator() external pure returns (uint256) {
    return VeVoteQuorumLogic.quorumDenominator();
  }

  /**
   * @inheritdoc IVeVoteV1
   */
  function isQuorumReached(uint256 proposalId) external view returns (bool) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteQuorumLogic.isQuorumReached($, proposalId);
  }

  /**
   * @inheritdoc IVeVoteV1
   */
  function getMinVotingDelay() external view returns (uint48) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteConfigurator.getMinVotingDelay($);
  }

  /**
   * @inheritdoc IVeVoteV1
   */
  function getMinVotingDuration() external view returns (uint48) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteConfigurator.getMinVotingDuration($);
  }

  /**
   * @inheritdoc IVeVoteV1
   */
  function getMaxVotingDuration() external view returns (uint48) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteConfigurator.getMaxVotingDuration($);
  }

  /**
   * @inheritdoc IVeVoteV1
   */
  function getMinStakedAmount() external view returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteConfigurator.getMinStakedAmount($);
  }

  /**
   * @inheritdoc IVeVoteV1
   */
  function getMinStakedAmountAtTimepoint(uint48 timepoint) external view returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteConfigurator.getMinStakedAmountAtTimepoint($, timepoint);
  }

  /**
   * @inheritdoc IVeVoteV1
   */
  function getNodeManagementContract() external view returns (INodeManagement) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteConfigurator.getNodeManagementContract($);
  }

  /**
   * @inheritdoc IVeVoteV1
   */
  function getStargateNFTContract() external view returns (IStargateNFTV2) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteConfigurator.getStargateNFTContract($);
  }

  /**
   * @inheritdoc IVeVoteV1
   */
  function getValidatorContract() external view returns (IAuthority) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteConfigurator.getValidatorContract($);
  }

  /**
   * @inheritdoc IVeVoteV1
   */
  function levelIdMultiplier(uint8 levelId) external view returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteConfigurator.levelIdMultiplier($, levelId);
  }

  /**
   * @inheritdoc IVeVoteV1
   */
  function clock() external view returns (uint48) {
    return VeVoteClockLogic.clock();
  }

  /**
   * @inheritdoc IVeVoteV1
   */
  // solhint-disable-next-line func-name-mixedcase
  function CLOCK_MODE() external pure returns (string memory) {
    return VeVoteClockLogic.CLOCK_MODE();
  }

  /**
   * @inheritdoc IVeVoteV1
   */
  function version() external pure returns (uint8) {
    return 1;
  }

  // ------------------ SETTERS ------------------ //
  /**
   * @inheritdoc IVeVoteV1
   */
  function propose(
    string calldata description,
    uint48 startBlock,
    uint48 voteDuration
  ) external onlyRole(WHITELISTED_ROLE) returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteProposalLogic.propose($, description, startBlock, voteDuration);
  }

  /**
   * @inheritdoc IVeVoteV1
   */
  function cancel(uint256 proposalId) external returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return
      VeVoteProposalLogic.cancel(
        $,
        hasRole(DEFAULT_ADMIN_ROLE, _msgSender()),
        proposalId,
        ""
      );
  }

  /**
   * @inheritdoc IVeVoteV1
   */
  function cancelWithReason(uint256 proposalId, string calldata reason) external returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return
      VeVoteProposalLogic.cancel(
        $,
        hasRole(DEFAULT_ADMIN_ROLE, _msgSender()),
        proposalId,
        reason
      );
  }

  /**
   * @inheritdoc IVeVoteV1
   */
  function execute(uint256 proposalId) external onlyRole(EXECUTOR_ROLE) returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteProposalLogic.execute($, proposalId, "");
  }

  /**
   * @inheritdoc IVeVoteV1
   */
  function executeWithComment(
    uint256 proposalId,
    string memory comment
  ) external onlyRole(EXECUTOR_ROLE) returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteProposalLogic.execute($, proposalId, comment);
  }

  /**
   * @inheritdoc IVeVoteV1
   */
  function castVote(uint256 proposalId, uint8 support, address masterAddress) external {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    VeVoteVoteLogic.castVote($, proposalId, support, "", masterAddress);
  }

  /**
   * @inheritdoc IVeVoteV1
   */
  function castVoteWithReason(
    uint256 proposalId,
    uint8 support,
    string calldata reason,
    address masterAddress
  ) external {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    VeVoteVoteLogic.castVote($, proposalId, support, reason, masterAddress);
  }

  /**
   * @inheritdoc IVeVoteV1
   */
  function setMinVotingDelay(uint48 newMinVotingDelay) external onlyRole(SETTINGS_MANAGER_ROLE) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    VeVoteConfigurator.setMinVotingDelay($, newMinVotingDelay);
  }

  /**
   * @inheritdoc IVeVoteV1
   */
  function setMinVotingDuration(uint48 newMinVotingDuration) external onlyRole(SETTINGS_MANAGER_ROLE) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    VeVoteConfigurator.setMinVotingDuration($, newMinVotingDuration);
  }

  /**
   * @inheritdoc IVeVoteV1
   */
  function setMaxVotingDuration(uint48 newMaxVotingDuration) external onlyRole(SETTINGS_MANAGER_ROLE) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    VeVoteConfigurator.setMaxVotingDuration($, newMaxVotingDuration);
  }

  /**
   * @inheritdoc IVeVoteV1
   */
  function setMinStakedVetAmount(uint256 newMinStake) external onlyRole(NODE_WEIGHT_MANAGER_ROLE) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    VeVoteConfigurator.setMinStakedVetAmount($, newMinStake);
  }

  /**
   * @inheritdoc IVeVoteV1
   */
  function setNodeManagementContract(address nodeManagement) external onlyRole(SETTINGS_MANAGER_ROLE) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    VeVoteConfigurator.setNodeManagementContract($, nodeManagement);
  }

  /**
   * @inheritdoc IVeVoteV1
   */
  function setStargateNFTContract(address stargateNFT) external onlyRole(SETTINGS_MANAGER_ROLE) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    VeVoteConfigurator.setStargateNFTContract($, stargateNFT);
  }

  /**
   * @inheritdoc IVeVoteV1
   */
  function setValidatorContract(address validatorContract) external onlyRole(SETTINGS_MANAGER_ROLE) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    VeVoteConfigurator.setValidatorContract($, validatorContract);
  }

  /**
   * @inheritdoc IVeVoteV1
   */
  function updateLevelIdMultipliers(uint256[] calldata newMultipliers) external onlyRole(NODE_WEIGHT_MANAGER_ROLE) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    VeVoteConfigurator.updateLevelIdMultipliers($, newMultipliers);
  }

  /**
   * @inheritdoc IVeVoteV1
   */
  function updateQuorumNumerator(uint256 newQuorumNumerator) external onlyRole(SETTINGS_MANAGER_ROLE) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    VeVoteQuorumLogic.updateQuorumNumerator($, newQuorumNumerator);
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
    return interfaceId == type(IVeVoteV1).interfaceId || interfaceId == type(IERC165).interfaceId;
  }
}
