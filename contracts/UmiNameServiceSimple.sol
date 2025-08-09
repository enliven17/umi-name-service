// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract UmiNameServiceSimple is ERC721, Ownable {
    uint256 public priceWei;
    uint256 public nextTokenId = 1;

    constructor() ERC721("Umi Name", ".umi") Ownable() {
        priceWei = 0;
    }

    function setPrice(uint256 newPriceWei) external onlyOwner {
        priceWei = newPriceWei;
    }

    function mint() external payable returns (uint256 tokenId) {
        require(msg.value >= priceWei, "InsufficientPayment");
        tokenId = nextTokenId++;
        _safeMint(msg.sender, tokenId);
    }
}


