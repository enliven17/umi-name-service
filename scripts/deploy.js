/* eslint-disable */
const { ethers } = require('hardhat');

async function main() {
  const Contract = await ethers.getContractFactory('UmiNameService');
  const contract = await Contract.deploy();
  await contract.waitForDeployment();
  const tx = contract.deploymentTransaction();
  const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
  console.log('UmiNameService deployed to:', receipt && receipt.contractAddress);
  console.log('Tx hash:', tx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


