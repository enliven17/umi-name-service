// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title UmiNameService
 * @dev Simple ERC-721 based name registry for .umi names. Each unique name maps to one tokenId.
 * Names are stored in lowercase, limited to [a-z0-9-] and length 3..32. Pricing is flat for now.
 */
contract UmiNameService is ERC721, Ownable {
    using Strings for uint256;

    error NameAlreadyRegistered();
    error InvalidName();
    error NotTokenOwner();

    uint256 public nextTokenId = 1;
    uint256 public priceWei;

    // nameHash => tokenId
    mapping(bytes32 => uint256) public nameHashToTokenId;
    // tokenId => name
    mapping(uint256 => string) private tokenIdToName;

    event NameRegistered(address indexed owner, uint256 indexed tokenId, string name);

    constructor() ERC721("Umi Name", ".umi") Ownable() {
        priceWei = 0;
    }

    function setPrice(uint256 newPriceWei) external onlyOwner {
        priceWei = newPriceWei;
    }

    function isAvailable(string memory name) public view returns (bool) {
        bytes32 h = _nameHash(_normalize(name));
        return nameHashToTokenId[h] == 0;
    }

    function getName(uint256 tokenId) external view returns (string memory) {
        return tokenIdToName[tokenId];
    }

    function register(string calldata rawName) external payable returns (uint256 tokenId) {
        string memory name = _normalize(rawName);
        _validate(name);

        if (msg.value < priceWei) revert("InsufficientPayment");

        bytes32 h = _nameHash(name);
        if (nameHashToTokenId[h] != 0) revert NameAlreadyRegistered();

        tokenId = nextTokenId++;
        nameHashToTokenId[h] = tokenId;
        tokenIdToName[tokenId] = name;
        _safeMint(msg.sender, tokenId);

        emit NameRegistered(msg.sender, tokenId, name);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "NonexistentToken");
        string memory name = tokenIdToName[tokenId];
        // Simple on-chain JSON metadata (data: URI)
        string memory json = string(
            abi.encodePacked(
                '{"name":"', name, '.umi","description":"UMI Name Service name NFT",',
                '"attributes":[{"trait_type":"Suffix","value":".umi"}],',
                '"external_url":"https://uminetwork.com",',
                '"image":"', _svgDataUri(name), '"}'
            )
        );
        return string(abi.encodePacked("data:application/json;utf8,", json));
    }

    function _nameHash(string memory name) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(name));
    }

    function _validate(string memory name) internal pure {
        bytes memory b = bytes(name);
        if (b.length < 3 || b.length > 32) revert InvalidName();
        for (uint256 i = 0; i < b.length; i++) {
            bytes1 c = b[i];
            bool isNum = (c >= 0x30 && c <= 0x39);
            bool isLower = (c >= 0x61 && c <= 0x7A);
            bool isDash = (c == 0x2D);
            if (!(isNum || isLower || isDash)) revert InvalidName();
        }
    }

    function _normalize(string memory input) internal pure returns (string memory) {
        bytes memory b = bytes(input);
        for (uint256 i = 0; i < b.length; i++) {
            bytes1 c = b[i];
            if (c >= 0x41 && c <= 0x5A) {
                // uppercase to lowercase
                b[i] = bytes1(uint8(c) + 32);
            }
        }
        return string(b);
    }

    function _svgDataUri(string memory name) internal pure returns (string memory) {
        // Tiny inline SVG with glass-like gradient
        string memory svg = string(
            abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">',
                '<defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#9ae6b4"/><stop offset="1" stop-color="#4fd1c5"/></linearGradient></defs>',
                '<rect width="512" height="512" fill="url(#g)"/>',
                '<text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="48" fill="#111">',
                name,
                '.umi</text></svg>'
            )
        );
        return string(abi.encodePacked("data:image/svg+xml;utf8,", svg));
    }
}


