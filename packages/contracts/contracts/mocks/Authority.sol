// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

/**
 * @title Authority
 * @notice A mock implementation of the Authority contract for testing validator logic.
 */
contract Authority {
    struct ValidatorInfo {
        bool listed;
        address endorsor;
        bytes32 identity;
        bool active;
    }

    /// @dev Simulated storage of validators
    mapping(address => ValidatorInfo) internal validators;

    /// @dev Sets the caller as executor
    address public executor;

    constructor() {
        executor = msg.sender;
    }

    /// @notice Sets a validator with arbitrary data for testing.
    function setValidator(
        address nodeMaster,
        bool listed,
        address endorsor,
        bytes32 identity,
        bool active
    ) external {
        validators[nodeMaster] = ValidatorInfo({
            listed: listed,
            endorsor: endorsor,
            identity: identity,
            active: active
        });
    }

    /// @notice Mimics the get function of the real Authority contract.
    function get(address nodeMaster)
        external
        view
        returns (bool listed, address endorsor, bytes32 identity, bool active)
    {
        ValidatorInfo storage v = validators[nodeMaster];
        return (v.listed, v.endorsor, v.identity, v.active);
    }

    /// @notice Sets the executor address (optional).
    function setExecutor(address _executor) external {
        executor = _executor;
    }

    /// @notice Returns the current executor.
    function native_executor() external view returns (address) {
        return executor;
    }
}
