/* eslint-disable */
const { ethers } = require('hardhat');

async function main() {
  const Counter = await ethers.getContractFactory('Counter');
  const contract = await Counter.deploy();
  await contract.waitForDeployment();
  const receipt = await ethers.provider.getTransactionReceipt(
    contract.deploymentTransaction().hash
  );
  console.log('Counter deployed to:', receipt && receipt.contractAddress);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});


