const { ethers } = require('hardhat');
const { AccountAddress, EntryFunction, FixedBytes, parseTypeTag } = require('@aptos-labs/ts-sdk');
const { TransactionPayloadEntryFunction, TypeTagSigner } = require('@aptos-labs/ts-sdk');

async function main() {
  const contractName = 'name_service';
  const [deployer] = await ethers.getSigners();
  
  console.log('Deploying contract with account:', deployer.address);
  
  // Convert Ethereum address to Move address format
  const moduleAddress = deployer.address.replace('0x', '0x000000000000000000000000');
  
  console.log('Module address:', moduleAddress);
  
  // Deploy the contract
  const NameService = await ethers.getContractFactory(contractName);
  const nameService = await NameService.deploy();
  await nameService.waitForDeployment();
  
  console.log(`Name Service is deployed to: ${deployer.address}::${contractName}`);
  
  // Initialize the contract
  const address = AccountAddress.fromString(moduleAddress);
  const addressBytes = [33, 0, ...address.toUint8Array()];
  const signer = new FixedBytes(new Uint8Array(addressBytes));
  
  const entryFunction = EntryFunction.build(
    `${moduleAddress}::${contractName}`,
    'initialize',
    [], // No type arguments
    [signer]
  );
  
  const transactionPayload = new TransactionPayloadEntryFunction(entryFunction);
  const payload = transactionPayload.bcsToHex();
  
  const request = {
    to: deployer.address,
    data: payload.toString(),
  };
  
  console.log('Sending initialization transaction...');
  await deployer.sendTransaction(request);
  console.log('Initialize transaction sent');
  
  console.log('\n🎉 Deployment completed successfully!');
  console.log('Contract address:', deployer.address);
  console.log('Module path:', `${moduleAddress}::${contractName}`);
  console.log('\nUpdate your config file with this address:');
  console.log(`src/config/umi.ts -> contractAddress: '${deployer.address}'`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Deployment failed:', err);
    process.exit(1);
  }); 