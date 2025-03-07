// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

library VechainNodesDataTypes {
  /**
   * @dev The strength level of each node.
   */
  enum NodeStrengthLevel {
    None,
    // Normal Token
    Strength,
    Thunder,
    Mjolnir,
    // X Token
    VeThorX,
    StrengthX,
    ThunderX,
    MjolnirX
  }

  /**
   * @dev The score of a node.
   */
  struct NodeStrengthScores {
    uint256 strength;
    uint256 thunder;
    uint256 mjolnir;
    uint256 veThorX;
    uint256 strengthX;
    uint256 thunderX;
    uint256 mjolnirX;
  }

  /**
   * @dev Node level and minimum balance information for a node.
   */
  struct NodeLevelInfo {
    uint256 nodeId;
    VechainNodesDataTypes.NodeStrengthLevel nodeLevel;
    uint256 minBalance;
  }
}
