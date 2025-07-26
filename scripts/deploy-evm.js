// scripts/deploy-evm.js
const hre = require("hardhat");

async function main() {
  const DomainPurchase = await hre.ethers.getContractFactory("DomainPurchase");
  const contract = await DomainPurchase.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log("DomainPurchase deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 