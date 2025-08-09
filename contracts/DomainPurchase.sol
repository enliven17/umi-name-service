// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract DomainPurchase {
    mapping(bytes32 => address) public domains;
    mapping(address => bytes32[]) public userDomains;

    uint256 public constant DOMAIN_PRICE = 0.001 ether;

    event DomainRegistered(bytes32 indexed domainHash, address indexed owner);

    function registerDomain(bytes32 domainHash) public payable {
        require(msg.value >= DOMAIN_PRICE, "Insufficient payment");
        require(domains[domainHash] == address(0), "Domain already registered");

        domains[domainHash] = msg.sender;
        userDomains[msg.sender].push(domainHash);

        emit DomainRegistered(domainHash, msg.sender);
    }

    function isDomainRegistered(bytes32 domainHash) public view returns (bool) {
        return domains[domainHash] != address(0);
    }

    function getDomainOwner(bytes32 domainHash) public view returns (address) {
        require(domains[domainHash] != address(0), "Domain not registered");
        return domains[domainHash];
    }

    function getUserDomains(address user) public view returns (bytes32[] memory) {
        return userDomains[user];
    }

    function getDomainPrice() public pure returns (uint256) {
        return DOMAIN_PRICE;
    }
}
