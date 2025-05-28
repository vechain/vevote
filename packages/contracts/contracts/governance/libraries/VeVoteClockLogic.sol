// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

import "@openzeppelin/contracts/utils/types/Time.sol";

/// @title VeVoteClockLogic Library
/// @notice Library for retrieving the current timepoint using block numbers.
/// @dev This library provides clock functionality as specified in EIP-6372, using block numbers as the time source.
library VeVoteClockLogic {
  /**
   * @notice Returns the current timepoint using the block number.
   * @return The current block number as a uint48.
   */
  function clock() internal view returns (uint48) {
      return Time.blockNumber();
  }

  /**
   * @notice Returns the clock mode description, indicating that timestamps are used.
   * @return The clock mode as a string.
   */
  // solhint-disable-next-line func-name-mixedcase
  function CLOCK_MODE() internal pure returns (string memory) {
      return "mode=blocknumber&from=default";
  }
}
