// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

library VechainNodesDataTypes {
  /**
   * @dev The strength level of each node.
   * TODO: Ensure this is up to date with the latest node levels.
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
    MjolnirX,
    // New Node levels
    Flash,
    Lightning,
    Dawn,
    // Validator Node levels
    Validator
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
