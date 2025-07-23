// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

contract AuthorityNative {
    function native_executor() public view returns (address) {}
    function native_add(address nodeMaster, address endorsor, bytes32 identity) public returns (bool) {}
    function native_revoke(address nodeMaster) public returns (bool) {}
    function native_get(address nodeMaster) public view returns (bool, address, bytes32, bool) {}
    function native_first() public view returns (address) {}
    function native_next(address nodeMaster) public view returns (address) {}
    function native_isEndorsed(address nodeMaster) public view returns (bool) {}
}

/**
 * @title MockAuthority
 * @notice Mock implementation of the VeChain Authority contract with native_* compatibility for local testing.
 */
contract Authority {
    event Candidate(address indexed nodeMaster, bytes32 action);

    struct ValidatorInfo {
        bool listed;
        address endorsor;
        bytes32 identity;
        bool active;
    }

    // Core data
    mapping(address => ValidatorInfo) internal validators;
    address[] internal orderedValidators;
    mapping(address => uint256) internal validatorIndex;

    address private _executor;

    constructor() {
        _executor = msg.sender;
    }

    // --- Mock Native Compatibility ---

    function native_executor() public view returns (address) {
        return _executor;
    }

    function setExecutor(address executor_) external {
        _executor = executor_;
    }

    function executor() public view returns (address) {
        return native_executor();
    }

    function native_add(address nodeMaster, address endorsor, bytes32 identity) public returns (bool) {
        if (validators[nodeMaster].listed) {
            return false;
        }

        validators[nodeMaster] = ValidatorInfo({
            listed: true,
            endorsor: endorsor,
            identity: identity,
            active: true
        });

        validatorIndex[nodeMaster] = orderedValidators.length;
        orderedValidators.push(nodeMaster);

        return true;
    }

    function native_revoke(address nodeMaster) public returns (bool) {
        if (!validators[nodeMaster].listed) {
            return false;
        }

        validators[nodeMaster].listed = false;
        validators[nodeMaster].active = false;
        validators[nodeMaster].endorsor = address(0);
        validators[nodeMaster].identity = 0;

        return true;
    }

    function native_get(address nodeMaster)
        public
        view
        returns (bool listed, address endorsor, bytes32 identity, bool active)
    {
        ValidatorInfo storage v = validators[nodeMaster];
        return (v.listed, v.endorsor, v.identity, v.active);
    }

    function native_isEndorsed(address nodeMaster) public view returns (bool) {
        return validators[nodeMaster].active && validators[nodeMaster].listed;
    }

    function native_first() public view returns (address) {
        return orderedValidators.length > 0 ? orderedValidators[0] : address(0);
    }

    function native_next(address nodeMaster) public view returns (address) {
        uint256 index = validatorIndex[nodeMaster];
        if (index + 1 < orderedValidators.length) {
            return orderedValidators[index + 1];
        }
        return address(0);
    }

    // --- Entry Points like Real Contract ---

    function add(address nodeMaster, address endorsor, bytes32 identity) public {
        require(nodeMaster != address(0), "builtin: invalid node master");
        require(endorsor != address(0), "builtin: invalid endorsor");
        require(identity != 0, "builtin: invalid identity");
        require(msg.sender == executor(), "builtin: executor required");

        require(native_add(nodeMaster, endorsor, identity), "builtin: already exists");
        emit Candidate(nodeMaster, "added");
    }

    function revoke(address nodeMaster) public {
        require(
            msg.sender == executor() || !native_isEndorsed(nodeMaster),
            "builtin: requires executor or not endorsed"
        );
        require(native_revoke(nodeMaster), "builtin: not listed");
        emit Candidate(nodeMaster, "revoked");
    }

    function get(address nodeMaster)
        public
        view
        returns (bool listed, address endorsor, bytes32 identity, bool active)
    {
        return native_get(nodeMaster);
    }

    function first() public view returns (address) {
        return native_first();
    }

    function next(address nodeMaster) public view returns (address) {
        return native_next(nodeMaster);
    }
}
