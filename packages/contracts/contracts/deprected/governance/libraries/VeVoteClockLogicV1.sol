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

import "@openzeppelin/contracts/utils/types/Time.sol";

/// @title VeVoteClockLogic Library
/// @notice Library for retrieving the current timepoint using block numbers.
/// @dev This library provides clock functionality as specified in EIP-6372, using block numbers as the time source.
library VeVoteClockLogicV1 {
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
