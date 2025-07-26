// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DomainPurchase {
    event DomainRegistered(address indexed owner, string domain, uint256 expiry);

    struct DomainInfo {
        address owner;
        uint256 expiry;
    }

    mapping(bytes32 => DomainInfo) public domains;
    mapping(address => bytes32[]) public userDomains;

    address public owner;
    uint256 public price = 0.001 ether; // 0.001 ETH

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function registerDomain(string calldata domain) external payable {
        require(msg.value == price, "Incorrect ETH amount");
        require(bytes(domain).length >= 3, "Domain too short");
        require(bytes(domain).length <= 63, "Domain too long");

        bytes32 domainHash = keccak256(abi.encodePacked(domain));
        require(domains[domainHash].owner == address(0), "Domain already registered");

        uint256 expiry = block.timestamp + (365 days); // 1 year

        domains[domainHash] = DomainInfo({
            owner: msg.sender,
            expiry: expiry
        });

        userDomains[msg.sender].push(domainHash);

        emit DomainRegistered(msg.sender, domain, expiry);
        
        // ETH owner'a aktarılır
        payable(owner).transfer(msg.value);
    }

    function isDomainRegistered(string calldata domain) external view returns (bool) {
        bytes32 domainHash = keccak256(abi.encodePacked(domain));
        return domains[domainHash].owner != address(0);
    }

    function getDomainOwner(string calldata domain) external view returns (address) {
        bytes32 domainHash = keccak256(abi.encodePacked(domain));
        require(domains[domainHash].owner != address(0), "Domain not registered");
        return domains[domainHash].owner;
    }

    function getDomainExpiry(string calldata domain) external view returns (uint256) {
        bytes32 domainHash = keccak256(abi.encodePacked(domain));
        require(domains[domainHash].owner != address(0), "Domain not registered");
        return domains[domainHash].expiry;
    }

    function getUserDomains(address user) external view returns (bytes32[] memory) {
        return userDomains[user];
    }

    function setPrice(uint256 newPrice) external onlyOwner {
        price = newPrice;
    }

    function withdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
} 