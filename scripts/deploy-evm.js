const hre = require('hardhat');

async function main() {
  const Factory = await hre.ethers.getContractFactory('DomainPurchase');
  const c = await Factory.deploy();
  await c.waitForDeployment();
  const deployTx = c.deploymentTransaction();
  const receipt = await hre.ethers.provider.getTransactionReceipt(deployTx.hash);
  console.log('tx:', deployTx.hash);
  console.log('contract:', receipt.contractAddress);
}

main().catch((e) => { console.error(e); process.exit(1); });
