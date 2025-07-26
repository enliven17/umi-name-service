import { AptosClient, AptosAccount, TxnBuilderTypes, BCS } from "aptos";

const client = new AptosClient("https://devnet.uminetwork.com");

async function deployContract() {
  // Create a new account for deployment
  const account = new AptosAccount();
  
  console.log("Deploying contract with account:", account.address().toString());
  
  // Fund the account (you'll need to get test tokens from faucet)
  console.log("Please fund this account with test tokens from the Umi faucet");
  console.log("Account address:", account.address().toString());
  
  // Read the Move module
  const modulePath = "./contracts/NameService.move";
  const moduleCode = await Bun.file(modulePath).text();
  
  // Create the module payload
  const modulePayload = new TxnBuilderTypes.TransactionPayloadModuleBundle(
    new TxnBuilderTypes.ModuleBundle([
      new TxnBuilderTypes.Module(
        new TextEncoder().encode(moduleCode),
        [],
        []
      )
    ])
  );
  
  // Create the transaction
  const rawTxn = await client.generateTransaction(
    account.address(),
    modulePayload
  );
  
  // Sign and submit the transaction
  const bcsTxn = AptosClient.generateBCSTransaction(account, rawTxn);
  const transactionRes = await client.submitTransaction(bcsTxn);
  
  // Wait for the transaction to be confirmed
  await client.waitForTransaction(transactionRes.hash);
  
  console.log("Contract deployed successfully!");
  console.log("Transaction hash:", transactionRes.hash);
  console.log("Contract address:", account.address().toString());
}

// Run the deployment
deployContract().catch(console.error); 