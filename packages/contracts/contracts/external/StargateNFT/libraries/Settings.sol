// SPDX-License-Identifier: MIT

//        ✦     *        .         ✶         *        .       ✦       .
//  ✦   _______..___________.    ___      .______        _______      ___   .___________. _______   ✦
//     /       ||           |   /   \     |   _  \      /  _____|    /   \  |           ||   ____|  *
//    |   (----``---|  |----`  /  ^  \    |  |_)  |    |  |  __     /  ^  \ `---|  |----`|  |__      .
//     \   \        |  |      /  /_\  \   |      /     |  | |_ |   /  /_\  \    |  |     |   __|     ✶
// .----)   |       |  |     /  _____  \  |  |\  \----.|  |__| |  /  _____  \   |  |     |  |____   *
// |_______/        |__|    /__/     \__\ | _| `._____| \______| /__/     \__\  |__|     |_______|  ✦
//         *       .      ✦      *      .        ✶       *      ✦       .       *        ✶

pragma solidity 0.8.20;

import { DataTypes } from "./DataTypes.sol";
import { IStargateNFT } from "../../../interfaces/IStargateNFT.sol";
import { IStargateDelegation } from "../../../interfaces/IStargateDelegation.sol";
import { ITokenAuction } from "../../../interfaces/ITokenAuction.sol";
import { Errors } from "./Errors.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Levels } from "./Levels.sol";

/// @title Settings
/// @notice Library for the StargateNFT contract to handle settings and configuration
library Settings {
  // ------------------ Events ------------------ //
  /**
   * @notice Emitted when the admin changes the address of a contract
   * @param oldContractAddress The old contract address
   * @param newContractAddress The new contract address
   */
  event ContractAddressUpdated(address oldContractAddress, address newContractAddress, string contractName);

  /**
   * @notice Emitted when the base URI for the token metadata is updated
   * @param oldBaseURI The old base URI
   * @param newBaseURI The new base URI
   */
  event BaseURIUpdated(string oldBaseURI, string newBaseURI);

  /**
   * @notice Emitted when the VTHO generation end timestamp is updated
   * @param oldVthoGenerationEndTimestamp The old VTHO generation end timestamp
   * @param newVthoGenerationEndTimestamp The new VTHO generation end timestamp
   */
  event VthoGenerationEndTimestampSet(uint48 oldVthoGenerationEndTimestamp, uint48 newVthoGenerationEndTimestamp);

  /**
   * @notice Emitted when a whitelist entry is added
   * @param owner The address of the whitelist entry
   * @param tokenId The token ID of the whitelist entry
   * @param levelId The level ID of the whitelist entry
   */
  event WhitelistEntryAdded(address owner, uint256 tokenId, uint8 levelId);

  /**
   * @notice Emitted when a whitelist entry is removed
   * @param owner The address of the whitelist entry
   */
  event WhitelistEntryRemoved(address owner);

  // ------------------ Setters ------------------ //

  /// @notice Sets the legacy nodes contract address, ie TokenAuction
  /// @dev Only the DEFAULT_ADMIN_ROLE can call this function
  /// @param _legacyNodes - the new legacy nodes address
  function setLegacyNodes(DataTypes.StargateNFTStorage storage $, address _legacyNodes) external {
    if (_legacyNodes == address(0)) {
      revert Errors.AddressCannotBeZero();
    }

    emit ContractAddressUpdated(address($.legacyNodes), _legacyNodes, "legacyNodes");
    $.legacyNodes = ITokenAuction(_legacyNodes);
  }

  /// @notice Sets the stargate delegation contract address
  /// @dev Only the DEFAULT_ADMIN_ROLE can call this function
  /// @param _stargateDelegation - the new stargate delegation address
  function setStargateDelegation(DataTypes.StargateNFTStorage storage $, address _stargateDelegation) external {
    if (_stargateDelegation == address(0)) {
      revert Errors.AddressCannotBeZero();
    }

    emit ContractAddressUpdated(address($.stargateDelegation), _stargateDelegation, "stargateDelegation");
    $.stargateDelegation = IStargateDelegation(_stargateDelegation);
  }

  /// @notice Set the VTHO token address
  /// @param $ Storage pointer
  /// @param _vthoToken The address of the VTHO token contract
  function setVthoToken(DataTypes.StargateNFTStorage storage $, address _vthoToken) public {
    if (_vthoToken == address(0)) {
      revert Errors.AddressCannotBeZero();
    }
    emit ContractAddressUpdated(address($.vthoToken), _vthoToken, "vthoToken");
    $.vthoToken = IERC20(_vthoToken);
  }

  /// @notice Sets the base URI for the token collection metadata
  /// @dev Only the DEFAULT_ADMIN_ROLE can call this function
  /// @dev Metadata is hosted on IPFS, and the base URI is the base path to the collection metadata
  /// @param _baseTokenURI The new base URI
  /// @dev Emits a {IStargateNFT.BaseURIUpdated} event
  function setBaseURI(DataTypes.StargateNFTStorage storage $, string memory _baseTokenURI) external {
    emit BaseURIUpdated($.baseTokenURI, _baseTokenURI);
    $.baseTokenURI = _baseTokenURI;
  }

  /// @notice Set the timestamp when the protocol will stop generating VTHO by holding VET
  /// @dev By default it will be 0, meaning the protocol will keep generating VTHO indefinitely,
  /// once the VeChain foundation will know the exact timestamp when the VTHO generation will stop
  /// we will set this value. It can be set back to 0, but then rewards will be recalculated based on the
  /// current timestamp. So set it back to 0 with caution.
  /// @param _vthoGenerationEndTimestamp The timestamp when the protocol will stop generating VTHO by holding VET
  /// @dev Emits a {IStargateNFT.VthoGenerationEndTimestampUpdated} event
  function setVthoGenerationEndTimestamp(
    DataTypes.StargateNFTStorage storage $,
    uint48 _vthoGenerationEndTimestamp
  ) external {
    uint48 currentVthoGenerationEndTimestamp = $.vthoGenerationEndTimestamp;
    $.vthoGenerationEndTimestamp = _vthoGenerationEndTimestamp;

    emit VthoGenerationEndTimestampSet(currentVthoGenerationEndTimestamp, _vthoGenerationEndTimestamp);
  }

  /// @notice Adds a whitelist entry
  /// @param _owner - The address of the owner of the whitelist entry
  /// @param _tokenId - The token ID of the whitelist entry
  /// @param _levelId - The level ID of the whitelist entry
  /// Emits a {IStargateNFT.WhitelistEntryAdded} event
  function addWhitelistEntry(
    DataTypes.StargateNFTStorage storage $,
    address _owner,
    uint256 _tokenId,
    uint8 _levelId
  ) external {
    if (_owner == address(0)) {
      revert Errors.AddressCannotBeZero();
    }

    if (_tokenId == 0 || _levelId == 0) {
      revert Errors.ValueCannotBeZero();
    }

    // TokenId must be lesser than contract currentTokenId
    if (_tokenId >= $.currentTokenId) {
      revert Errors.InvalidValue(_tokenId);
    }

    // LevelId must exist
    if (_levelId > $.MAX_LEVEL_ID) {
      revert Errors.LevelNotFound(_levelId);
    }

    // Add the whitelist entry
    $.whitelistEntries[_owner] = DataTypes.WhitelistEntry({ tokenId: _tokenId, levelId: _levelId });

    emit WhitelistEntryAdded(_owner, _tokenId, _levelId);
  }

  /// @notice Removes a whitelist entry
  /// @param _owner - The address of the owner of the whitelist entry
  /// Emits a {IStargateNFT.WhitelistEntryRemoved} event
  function removeWhitelistEntry(DataTypes.StargateNFTStorage storage $, address _owner) external {
    if (_owner == address(0)) {
      revert Errors.AddressCannotBeZero();
    }

    DataTypes.WhitelistEntry memory entry = $.whitelistEntries[_owner];
    if (entry.tokenId == 0 && entry.levelId == 0) {
      revert Errors.WhitelistEntryNotFound(_owner);
    }

    delete $.whitelistEntries[_owner];
    emit WhitelistEntryRemoved(_owner);
  }
}
