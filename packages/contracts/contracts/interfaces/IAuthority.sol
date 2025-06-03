// SPDX-License-Identifier: LGPL-3.0

pragma solidity 0.8.20;

interface IAuthority {
  function executor() external view returns (address);

  function add(address _nodeMaster, address _endorsor, bytes32 _identity) external;

  function revoke(address _nodeMaster) external;

  function get(
    address _nodeMaster
  ) external view returns (bool listed, address endorsor, bytes32 identity, bool active);

  function first() external view returns (address);

  function next(address _nodeMaster) external view returns (address);

  event Candidate(address indexed nodeMaster, bytes32 action);
}
