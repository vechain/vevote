// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

/// @title Mock Staker Contract (for testing other contracts)
/// @notice This mock implements the same function signatures & events as Staker,
///         but with simplified storage & zero native_* logic.

contract Staker {
  // ============ EVENTS ============
  event ValidationQueued(address indexed validator, address indexed endorser, uint32 period, uint256 stake);
  event ValidationWithdrawn(address indexed validator, uint256 stake);
  event ValidationSignaledExit(address indexed validator);
  event StakeIncreased(address indexed validator, uint256 added);
  event StakeDecreased(address indexed validator, uint256 removed);
  event BeneficiarySet(address indexed validator, address beneficiary);

  event DelegationAdded(address indexed validator, uint256 indexed delegationID, uint256 stake, uint8 multiplier);
  event DelegationWithdrawn(uint256 indexed delegationID, uint256 stake);
  event DelegationSignaledExit(uint256 indexed delegationID);

  // ============ MOCK STORAGE STRUCTS ============
  enum Status {
    NONE,
    QUEUED,
    ACTIVE,
    EXITED
  }

  struct Validation {
    address endorser;
    uint256 stake;
    uint256 weight;
    uint8 status; // 1 = queued, 2 = active, 3 = exited
    uint32 period;
    address beneficiary;
  }

  struct Delegation {
    address validator;
    address delegator;
    uint256 stake;
    uint8 multiplier;
    bool exited;
  }

  // ============ STORAGE ============
  mapping(address => Validation) public validations;
  address[] public validatorList;

  mapping(uint256 => Delegation) public delegations;
  uint256 public nextDelegationId = 1;

  // ============ CORE FUNCTIONS ============

  function addValidation(address validator, uint32 period) external payable {
    Validation storage v = validations[validator];
    if (v.status == uint8(Status.NONE)) {
      validatorList.push(validator);
    }
    v.endorser = msg.sender;
    v.stake += msg.value;
    v.weight = v.stake; // simplified: weight = stake
    v.status = uint8(Status.QUEUED);
    v.period = period;

    emit ValidationQueued(validator, msg.sender, period, msg.value);
  }

  function increaseStake(address validator) external payable {
    Validation storage v = validations[validator];
    v.stake += msg.value;
    v.weight = v.stake;

    emit StakeIncreased(validator, msg.value);
  }

  function decreaseStake(address validator, uint256 amount) external {
    Validation storage v = validations[validator];
    require(v.stake >= amount, "not enough stake");
    v.stake -= amount;
    v.weight = v.stake;

    emit StakeDecreased(validator, amount);
  }

  function withdrawStake(address validator) external {
    Validation storage v = validations[validator];
    uint256 amt = v.stake;
    v.stake = 0;
    v.weight = 0;
    v.status = uint8(Status.EXITED);

    emit ValidationWithdrawn(validator, amt);
  }

  function signalExit(address validator) external {
    Validation storage v = validations[validator];
    v.status = uint8(Status.EXITED);
    emit ValidationSignaledExit(validator);
  }

  function setBeneficiary(address validator, address beneficiary) external {
    validations[validator].beneficiary = beneficiary;
    emit BeneficiarySet(validator, beneficiary);
  }

  // ============ DELEGATION ============

  function addDelegation(address validator, uint8 multiplier) external payable returns (uint256) {
    uint256 id = nextDelegationId++;
    delegations[id] = Delegation({
      validator: validator,
      delegator: msg.sender,
      stake: msg.value,
      multiplier: multiplier,
      exited: false
    });

    emit DelegationAdded(validator, id, msg.value, multiplier);
    return id;
  }

  function signalDelegationExit(uint256 delegationID) external {
    delegations[delegationID].exited = true;
    emit DelegationSignaledExit(delegationID);
  }

  function withdrawDelegation(uint256 delegationID) external {
    uint256 amt = delegations[delegationID].stake;
    delegations[delegationID].stake = 0;

    emit DelegationWithdrawn(delegationID, amt);
  }

  // ============ READ FUNCTIONS (Simplified) ============
  function totalStake() external view returns (uint256 totalStake_, uint256 totalWeight_) {
    for (uint256 i = 0; i < validatorList.length; i++) {
      if (validations[validatorList[i]].status == uint8(Status.ACTIVE)) {
        totalStake_ += validations[validatorList[i]].stake;
        totalWeight_ += validations[validatorList[i]].weight;
      }
    }
  }

  function queuedStake() external view returns (uint256) {
    uint256 qs;
    for (uint256 i = 0; i < validatorList.length; i++) {
      if (validations[validatorList[i]].status == uint8(Status.QUEUED)) {
        qs += validations[validatorList[i]].stake;
      }
    }
    return qs;
  }

  function getValidation(
    address validator
  )
    external
    view
    returns (address endorser, uint256 stake, uint256 weight, uint256 queuedVET, uint8 status, uint32 offlineBlock)
  {
    Validation storage v = validations[validator];
    // if validator is not found, return zero values
    if (v.status == uint8(Status.NONE)) {
      return (address(0), 0, 0, 0, uint8(Status.NONE), 0);
    }
    endorser = v.endorser;
    stake = v.stake;
    weight = v.weight;
    queuedVET = (v.status == uint8(Status.QUEUED)) ? v.stake : 0;
    status = v.status;
    offlineBlock = 0;
  }

  function getValidationPeriodDetails(
    address validator
  ) external view returns (uint32 period, uint32 startBlock, uint32 exitBlock, uint32 completedPeriods) {
    period = validations[validator].period;
    startBlock = 0;
    exitBlock = type(uint32).max;
    completedPeriods = 10;
  }

  // ============ TEST HELPERS FOR MANUAL STATE CONTROL ============
  function mockSetStatus(address validator, uint8 status) external {
    validations[validator].status = status;
  }

  function mockSetStake(address validator, uint256 stake) external {
    validations[validator].stake = stake;
    validations[validator].weight = stake;
  }

  function activateValidator(address validator) external {
    validations[validator].status = uint8(Status.ACTIVE);
  }
}
