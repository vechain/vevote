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

import { IVeVote } from "./interfaces/IVeVote.sol";
import { VeVoteStorage } from "./governance/VeVoteStorage.sol";
import { VeVoteTypes } from "./governance/libraries/VeVoteTypes.sol";
import { VeVoteQuorumLogic } from "./governance/libraries/VeVoteQuorumLogic.sol";
import { VeVoteClockLogic } from "./governance/libraries/VeVoteClockLogic.sol";
import { VeVoteStateLogic } from "./governance/libraries/VeVoteStateLogic.sol";
import { VeVoteVoteLogic } from "./governance/libraries/VeVoteVoteLogic.sol";
import { VeVoteProposalLogic } from "./governance/libraries/VeVoteProposalLogic.sol";
import { VeVoteStorageTypes } from "./governance/libraries/VeVoteStorageTypes.sol";
import { VeVoteConfigurator } from "./governance/libraries/VeVoteConfigurator.sol";
import { INodeManagement } from "./interfaces/INodeManagement.sol";
import { IStargateNFT } from "./interfaces/IStargateNFT.sol";
import { IAuthority } from "./interfaces/IAuthority.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @title VeVote Governance Contract
 * @notice Upgradeable multi-choice voting system for VeChain governance using Stargate NFTs and validator eligibility.
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
 * - Supports multi-choice voting using 32-bit bitmask encoding.
 * - Proposals specify `minSelection` and `maxSelection` constraints for voting flexibility.
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
    VeVoteQuorumLogic.updateQuorumNumerator($, data.quorumPercentage);

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
   * @inheritdoc IVeVote
   */
  function hashProposal(
    address proposer,
    uint48 startBlock,
    uint48 voteDuration,
    bytes32[] memory choices,
    bytes32 descriptionHash,
    uint8 maxSelection,
    uint8 minSelection
  ) external pure returns (uint256) {
    return
      VeVoteProposalLogic.hashProposal(
        proposer,
        startBlock,
        voteDuration,
        choices,
        descriptionHash,
        maxSelection,
        minSelection
      );
  }

  /**
   * @inheritdoc IVeVote
   */
  function proposalSnapshot(uint256 proposalId) external view returns (uint48) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteProposalLogic.proposalSnapshot($, proposalId);
  }

  /**
   * @inheritdoc IVeVote
   */
  function proposalDeadline(uint256 proposalId) external view returns (uint48) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteProposalLogic.proposalDeadline($, proposalId);
  }

  /**
   * @inheritdoc IVeVote
   */
  function proposalProposer(uint256 proposalId) external view returns (address) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteProposalLogic.proposalProposer($, proposalId);
  }

  /**
   * @inheritdoc IVeVote
   */
  function proposalChoices(uint256 proposalId) external view returns (bytes32[] memory) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteProposalLogic.proposalChoices($, proposalId);
  }

  /**
   * @inheritdoc IVeVote
   */
  function proposalSelectionRange(uint256 proposalId) external view returns (uint8, uint8) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteProposalLogic.proposalSelectionRange($, proposalId);
  }

  /**
   * @inheritdoc IVeVote
   */
  function getProposalVotes(
    uint256 proposalId
  ) external view returns (VeVoteTypes.ProposalVoteResult[] memory results) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteVoteLogic.getProposalVotes($, proposalId);
  }

  /**
   * @inheritdoc IVeVote
   */
  function totalVotes(uint256 proposalId) external view returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteVoteLogic.totalVotes($, proposalId);
  }

  /**
   * @inheritdoc IVeVote
   */
  function hasVoted(uint256 proposalId, address account) external view returns (bool) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteVoteLogic.hasVoted($, proposalId, account);
  }

  /**
   * @inheritdoc IVeVote
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
   * @inheritdoc IVeVote
   */
  function getVoteWeight(address account, address masterAddress) external view returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteVoteLogic.getVoteWeight($, account, VeVoteClockLogic.clock(), masterAddress);
  }

  /**
   * @inheritdoc IVeVote
   */
  function getNodeVoteWeight(uint256 nodeId) external view returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteVoteLogic.getNodeVoteWeight($, nodeId);
  }

  /**
   * @inheritdoc IVeVote
   */
  function state(uint256 proposalId) external view returns (VeVoteTypes.ProposalState) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteStateLogic.state($, proposalId);
  }

  /**
   * @inheritdoc IVeVote
   */
  function quorum(uint48 timepoint) external view returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteQuorumLogic.quorum($, timepoint);
  }

  /**
   * @inheritdoc IVeVote
   */
  function quorumNumerator() external view returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteQuorumLogic.quorumNumerator($);
  }

  /**
   * @inheritdoc IVeVote
   */
  function quorumNumerator(uint48 timepoint) external view returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteQuorumLogic.quorumNumerator($, timepoint);
  }

  /**
   * @inheritdoc IVeVote
   */
  function quorumDenominator() external pure returns (uint256) {
    return VeVoteQuorumLogic.quorumDenominator();
  }

  /**
   * @inheritdoc IVeVote
   */
  function isQuorumReached(uint256 proposalId) external view returns (bool) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteQuorumLogic.isQuorumReached($, proposalId);
  }

  /**
   * @inheritdoc IVeVote
   */
  function getMinVotingDelay() external view returns (uint48) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteConfigurator.getMinVotingDelay($);
  }

  /**
   * @inheritdoc IVeVote
   */
  function getMinVotingDuration() external view returns (uint48) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteConfigurator.getMinVotingDuration($);
  }

  /**
   * @inheritdoc IVeVote
   */
  function getMaxVotingDuration() external view returns (uint48) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteConfigurator.getMaxVotingDuration($);
  }

  /**
   * @inheritdoc IVeVote
   */
  function getMaxChoices() external view returns (uint8) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteConfigurator.getMaxChoices($);
  }

  /**
   * @inheritdoc IVeVote
   */
  function getMinStakedAmount() external view returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteConfigurator.getMinStakedAmount($);
  }

  /**
   * @inheritdoc IVeVote
   */
  function getMinStakedAmountAtTimepoint(uint48 timepoint) external view returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteConfigurator.getMinStakedAmountAtTimepoint($, timepoint);
  }

  /**
   * @inheritdoc IVeVote
   */
  function getNodeManagementContract() external view returns (INodeManagement) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteConfigurator.getNodeManagementContract($);
  }

  /**
   * @inheritdoc IVeVote
   */
  function getStargateNFTContract() external view returns (IStargateNFT) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteConfigurator.getStargateNFTContract($);
  }

  /**
   * @inheritdoc IVeVote
   */
  function getValidatorContract() external view returns (IAuthority) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteConfigurator.getValidatorContract($);
  }

  /**
   * @inheritdoc IVeVote
   */
  function levelIdMultiplier(uint8 levelId) external view returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteConfigurator.levelIdMultiplier($, levelId);
  }

  /**
   * @inheritdoc IVeVote
   */
  function clock() external view returns (uint48) {
    return VeVoteClockLogic.clock();
  }

  /**
   * @inheritdoc IVeVote
   */
  // solhint-disable-next-line func-name-mixedcase
  function CLOCK_MODE() external pure returns (string memory) {
    return VeVoteClockLogic.CLOCK_MODE();
  }

  /**
   * @inheritdoc IVeVote
   */
  function version() external pure returns (uint8) {
    return 1;
  }

  // ------------------ SETTERS ------------------ //
  /**
   * @inheritdoc IVeVote
   */
  function propose(
    string calldata description,
    uint48 startBlock,
    uint48 voteDuration,
    bytes32[] calldata choices,
    uint8 maxSelection,
    uint8 minSelection
  ) external onlyRole(WHITELISTED_ROLE) returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteProposalLogic.propose($, description, startBlock, voteDuration, choices, maxSelection, minSelection);
  }

  /**
   * @inheritdoc IVeVote
   */
  function cancel(uint256 proposalId) external returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return
      VeVoteProposalLogic.cancel(
        $,
        hasRole(WHITELISTED_ROLE, _msgSender()),
        hasRole(DEFAULT_ADMIN_ROLE, _msgSender()),
        proposalId,
        ""
      );
  }

  /**
   * @inheritdoc IVeVote
   */
  function cancelWithReason(uint256 proposalId, string calldata reason) external returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return
      VeVoteProposalLogic.cancel(
        $,
        hasRole(WHITELISTED_ROLE, _msgSender()),
        hasRole(DEFAULT_ADMIN_ROLE, _msgSender()),
        proposalId,
        reason
      );
  }

  /**
   * @inheritdoc IVeVote
   */
  function execute(uint256 proposalId) external onlyRole(EXECUTOR_ROLE) returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteProposalLogic.execute($, proposalId, "");
  }

  /**
   * @inheritdoc IVeVote
   */
  function executeWithComment(
    uint256 proposalId,
    string memory comment
  ) external onlyRole(EXECUTOR_ROLE) returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteProposalLogic.execute($, proposalId, comment);
  }

  /**
   * @inheritdoc IVeVote
   */
  function castVote(uint256 proposalId, uint32 choices, address masterAddress) external {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    VeVoteVoteLogic.castVote($, proposalId, choices, "", masterAddress);
  }

  /**
   * @inheritdoc IVeVote
   */
  function castVoteWithReason(
    uint256 proposalId,
    uint32 choices,
    string calldata reason,
    address masterAddress
  ) external {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    VeVoteVoteLogic.castVote($, proposalId, choices, reason, masterAddress);
  }

  /**
   * @inheritdoc IVeVote
   */
  function setMinVotingDelay(uint48 newMinVotingDelay) external onlyRole(SETTINGS_MANAGER_ROLE) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    VeVoteConfigurator.setMinVotingDelay($, newMinVotingDelay);
  }

  /**
   * @inheritdoc IVeVote
   */
  function setMinVotingDuration(uint48 newMinVotingDuration) external onlyRole(SETTINGS_MANAGER_ROLE) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    VeVoteConfigurator.setMinVotingDuration($, newMinVotingDuration);
  }

  /**
   * @inheritdoc IVeVote
   */
  function setMaxVotingDuration(uint48 newMaxVotingDuration) external onlyRole(SETTINGS_MANAGER_ROLE) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    VeVoteConfigurator.setMaxVotingDuration($, newMaxVotingDuration);
  }

  /**
   * @inheritdoc IVeVote
   */
  function setMaxChoices(uint8 newMaxChoices) external onlyRole(SETTINGS_MANAGER_ROLE) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    VeVoteConfigurator.setMaxChoices($, newMaxChoices);
  }

  /**
   * @inheritdoc IVeVote
   */
  function setMinStakedVetAmount(uint256 newMinStake) external onlyRole(NODE_WEIGHT_MANAGER_ROLE) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    VeVoteConfigurator.setMinStakedVetAmount($, newMinStake);
  }

  /**
   * @inheritdoc IVeVote
   */
  function setNodeManagementContract(address nodeManagement) external onlyRole(SETTINGS_MANAGER_ROLE) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    VeVoteConfigurator.setNodeManagementContract($, nodeManagement);
  }

  /**
   * @inheritdoc IVeVote
   */
  function setStargateNFTContract(address stargateNFT) external onlyRole(SETTINGS_MANAGER_ROLE) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    VeVoteConfigurator.setStargateNFTContract($, stargateNFT);
  }

  /**
   * @inheritdoc IVeVote
   */
  function setValidatorContract(address validatorContract) external onlyRole(SETTINGS_MANAGER_ROLE) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    VeVoteConfigurator.setValidatorContract($, validatorContract);
  }

  /**
   * @inheritdoc IVeVote
   */
  function updateLevelIdMultipliers(uint256[] calldata newMultipliers) external onlyRole(NODE_WEIGHT_MANAGER_ROLE) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    VeVoteConfigurator.updateLevelIdMultipliers($, newMultipliers);
  }

  /**
   * @inheritdoc IVeVote
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
    return interfaceId == type(IVeVote).interfaceId || interfaceId == type(IERC165).interfaceId;
  }
}
