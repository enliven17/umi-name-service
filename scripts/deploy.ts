import { ethers } from 'hardhat';

async function main() {
  const priceEth = process.env.PRICE_ETH || '0.01';
  const priceWei = ethers.parseEther(priceEth);

  const UmiNameService = await ethers.getContractFactory('UmiNameService');
  const contract = await UmiNameService.deploy(priceWei);
  await contract.waitForDeployment();
  const receipt = await ethers.provider.getTransactionReceipt(
    contract.deploymentTransaction()?.hash as string
  );
  console.log('UmiNameService deployed to:', receipt?.contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });


