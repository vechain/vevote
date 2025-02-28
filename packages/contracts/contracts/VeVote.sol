// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity 0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract VeVote is ERC20Upgradeable, OwnableUpgradeable, UUPSUpgradeable {
    function initialize() public initializer { 
        __ERC20_init("VeVote", "VV");
        __Ownable_init(msg.sender);
        _mint(msg.sender, 100000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /// @dev Authorized upgrading of the contract implementation
    /// @dev Only callable by the upgrader role
    /// @param newImplementation Address of the new contract implementation
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    /// @notice Returns the version of the contract
    /// @dev This should be updated every time a new version of implementation is deployed
  /// @return string The version of the contract
function version() public pure virtual returns (string memory) {
    return "1";
  }
}
