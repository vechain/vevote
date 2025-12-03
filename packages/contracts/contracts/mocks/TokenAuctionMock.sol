// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ITokenAuction } from "../../contracts/interfaces/ITokenAuction.sol";

contract TokenAuctionMock is ITokenAuction {
    mapping(uint256 => Metadata) private metadata;

    struct Metadata {
        address owner;
        uint8 strengthLevel;
        bool onUpgrade;
        bool isOnAuction;
        uint64 lastTransferTime;
        uint64 createdAt;
        uint64 updatedAt;
    }

    function helper__setMetadata(uint256 tokenId, Metadata memory _metadata) external {
        metadata[tokenId] = _metadata;
    }

    function removeAuctionWhiteList(uint256 _tokenId, address _address) external {}

    function supportsInterface(bytes4 _interfaceId) external view returns (bool) {
        return false;
    }

    function sendBonusTo(address _to, uint256 _amount) external {}

    function name() external view returns (string memory) {
        return "";
    }

    function isNormalToken(address _target) external view returns (bool) {
        return false;
    }

    function getApproved(uint256 _tokenId) external view returns (address) {
        return address(0);
    }

    function approve(address _to, uint256 _tokenId) external {}

    function operators(address) external view returns (bool) {
        return false;
    }

    function totalSupply() external view returns (uint256) {
        return 0;
    }

    function isToken(address _target) external view returns (bool) {
        return false;
    }

    function InterfaceId_ERC165() external view returns (bytes4) {
        return bytes4(0);
    }

    function setTokenMetadataBaseURI(string memory _newBaseURI) external {}

    function transferFrom(address _from, address _to, uint256 _tokenId) external {}

    function getTokenParams(uint8 _level) external view returns (uint256, uint64, uint64, uint64) {
        return (0, 0, 0, 0);
    }

    function auctionCount() external view returns (uint256) {
        return 0;
    }

    function setLeadTime(uint64 _leadtime) external {}

    function createDirectionalSaleAuction(
        uint256 _tokenId,
        uint128 _price,
        uint64 _duration,
        address _toAddress
    ) external {}

    function unpause() external returns (bool) {
        return false;
    }

    function addToBlackList(address _badGuy) external {}

    function bid(uint256 _tokenId) external payable {}

    function blackList(address) external view returns (bool) {
        return false;
    }

    function removeFromBlackList(address _innocent) external {}

    function canTransfer(uint256 _tokenId) external view returns (bool) {
        return false;
    }

    function paused() external view returns (bool) {
        return false;
    }

    function upgradeTo(uint256 _tokenId, uint8 _toLvl) external {}

    function ownerOf(uint256 _tokenId) external view returns (address) {
        return metadata[_tokenId].owner;
    }

    function transferCooldown() external view returns (uint64) {
        return 0;
    }

    function setSaleAuctionAddress(address _address) external {}

    function balanceOf(address _owner) external view returns (uint256) {
        return 0;
    }

    function applyUpgrade(uint8 _toLvl) external {}

    function addToken(
        address _addr,
        uint8 _lvl,
        bool _onUpgrade,
        uint64 _applyUpgradeTime,
        uint64 _applyUpgradeBlockno
    ) external {}

    function pause() external returns (bool) {
        return false;
    }

    function leadTime() external view returns (uint64) {
        return 0;
    }

    function owner() external view returns (address) {
        return address(0);
    }

    function symbol() external view returns (string memory) {
        return "";
    }

    function cancelAuction(uint256 _tokenId) external {}

    function addOperator(address _operator) external {}

    function getMetadata(
        uint256 _tokenId
    ) external view returns (address, uint8, bool, bool, uint64, uint64, uint64) {
        Metadata memory _metadata = metadata[_tokenId];

        return (
            _metadata.owner,
            _metadata.strengthLevel,
            _metadata.onUpgrade,
            _metadata.isOnAuction,
            _metadata.lastTransferTime,
            _metadata.createdAt,
            _metadata.updatedAt
        );
    }

    function transfer(address _to, uint256 _tokenId) external {}

    function removeOperator(address _operator) external {}

    function downgradeTo(uint256 _tokenId, uint8 _toLvl) external {
        metadata[_tokenId].strengthLevel = _toLvl;
        metadata[_tokenId].onUpgrade = false;
        metadata[_tokenId].isOnAuction = false;
        metadata[_tokenId].lastTransferTime = uint64(block.timestamp);
        metadata[_tokenId].createdAt = uint64(block.timestamp);
        metadata[_tokenId].updatedAt = uint64(block.timestamp);
        metadata[_tokenId].owner = address(0);
    }

    function cancelUpgrade(uint256 _tokenId) external {}

    function setTransferCooldown(uint64 _cooldown) external {}

    function createSaleAuction(
        uint256 _tokenId,
        uint128 _startingPrice,
        uint128 _endingPrice,
        uint64 _duration
    ) external {}

    function idToOwner(uint256 tokenId) external view returns (address) {
        return metadata[tokenId].owner;
    }

    function tokenURI(uint256 _tokenId) external view returns (string memory) {
        return "";
    }

    function addAuctionWhiteList(uint256 _tokenId, address _address) external {}

    function xTokenCount() external view returns (uint64) {
        return 0;
    }

    function saleAuction() external view returns (address) {
        return address(0);
    }

    function ownerToId(address) external view returns (uint256) {
        return 0;
    }

    function transferOwnership(address newOwner) external {}

    function normalTokenCount() external view returns (uint64) {
        return 0;
    }

    function isX(address _target) external view returns (bool) {
        return false;
    }
}
