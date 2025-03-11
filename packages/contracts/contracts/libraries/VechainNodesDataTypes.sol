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
   * @dev Node level and minimum balance information for a node.
   */
  struct NodeLevelInfo {
    uint256 nodeId;
    VechainNodesDataTypes.NodeStrengthLevel nodeLevel;
    uint256 minBalance;
  }
}
