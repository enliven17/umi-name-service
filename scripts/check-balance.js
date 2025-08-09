/* eslint-disable */
const { ethers } = require('hardhat');

async function main() {
  const [signer] = await ethers.getSigners();
  const addr = await signer.getAddress();
  const bal = await ethers.provider.getBalance(addr);
  console.log('Signer:', addr);
  console.log('Balance:', bal.toString(), 'wei');
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});


