// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity 0.8.20;

import { IVeVote } from "./interfaces/IVeVote.sol";
import { VeVoteStorage } from "./vevote/VeVoteStorage.sol";
import { VeVoteTypes } from "./vevote/libraries/VeVoteTypes.sol";
import { VeVoteQuoromLogic } from "./vevote/libraries/VeVoteQuoromLogic.sol";
import { VeVoteClockLogic } from "./vevote/libraries/VeVoteClockLogic.sol";
import { VeVoteStateLogic } from "./vevote/libraries/VeVoteStateLogic.sol";
import { VeVoteProposalLogic } from "./vevote/libraries/VeVoteProposalLogic.sol";
import { VeVoteStorageTypes } from "./vevote/libraries/VeVoteStorageTypes.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

contract VeVote is IVeVote, VeVoteStorage, AccessControlUpgradeable, UUPSUpgradeable {
  /// @notice The role that can upgrade the contract
  bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
  /// @notice The role that can create proposals
  bytes32 public constant WHITELISTED_ROLE = keccak256("WHITELISTED_ROLE");

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
    VeVoteTypes.InitializationData memory data,
    VeVoteTypes.InitializationRolesData memory rolesData
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

    // Set the whitelist roles
    uint256 whitelistLength = rolesData.whitelist.length;
    for (uint256 i; i < whitelistLength;) {
      _grantRole(WHITELISTED_ROLE, rolesData.whitelist[i]);
      unchecked { ++i; }
    }
  }

  // ------------------ GETTERS ------------------ //

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
   * @param timepoint The timestamp to get the quorum for
   * @return uint256 The quorum
   */
  function quorum(uint256 timepoint) external view returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteQuoromLogic.quorum($, timepoint);
  }

  /**
   * @notice See {IVeVote-quorumNumerator}.
   * @return uint256 The current quorum numerator
   */
  function quorumNumerator() external view returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteQuoromLogic.quorumNumerator($);
  }

  /**
   * @notice See {IVeVote-quorumNumerator}.
   * @param timepoint The timepoint to get the quorum numerator for
   * @return uint256 The quorum numerator at the given timepoint
   */
  function quorumNumerator(uint256 timepoint) external view returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteQuoromLogic.quorumNumerator($, timepoint);
  }

  /**
   * @notice See {IVeVote-quorumDenominator}.
   * @return uint256 The quorum denominator
   */
  function quorumDenominator() external pure returns (uint256) {
    return VeVoteQuoromLogic.quorumDenominator();
  }

  /**
   * @notice See {IVeVote-clock}.
   * @return uint48 The current clock time
   */
  function clock() external view returns (uint48) {
    return VeVoteClockLogic.clock();
  }

  /**
   * @notice See {IVeVote-CLOCK_MODE}.
   * @return string The clock mode
   */
  // solhint-disable-next-line func-name-mixedcase
  function CLOCK_MODE() external pure returns (string memory) {
    return VeVoteClockLogic.CLOCK_MODE();
  }

  // ------------------ SETTERS ------------------ //
  /**
   * @notice See {IVeVote-propose}.
   * Callable only by whitelisted roles.
   * @param description The proposal description
   * @param startTime The start time of the proposal
   * @param voteDuration The duration of the vote
   * @param choices The choices for the proposal
   * @param maxSelection The maximum number of choices that can be selected
   * @param minSelection The minimum number of choices that must be selected
   * @return uint256 The ID of the proposal
   */
  function propose(
    string memory description,
    uint48 startTime,
    uint48 voteDuration,
    bytes32[] memory choices,
    uint8 maxSelection,
    uint8 minSelection
  ) external onlyRole(WHITELISTED_ROLE) returns (uint256) {
    VeVoteStorageTypes.VeVoteStorage storage $ = getVeVoteStorage();
    return VeVoteProposalLogic.propose($, description, startTime, voteDuration, choices, maxSelection, minSelection);
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
