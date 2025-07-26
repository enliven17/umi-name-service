import { AccountAddress, EntryFunction, FixedBytes, TransactionPayloadEntryFunction } from '@aptos-labs/ts-sdk';
import { bcs } from '@mysten/bcs';
import { createPublicClient, createWalletClient, custom, defineChain } from 'viem';
import { publicActionsL2, walletActionsL2 } from 'viem/op-stack';

export const devnet = defineChain({
  id: 42069,
  sourceId: 42069,
  name: 'Umi',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://devnet.uminetwork.com'],
    },
  },
});

export const getAccount = async () => {
  const [account] = await window.ethereum!.request({
    method: 'eth_requestAccounts',
  });
  return account;
};

export const getMoveAccount = async () => {
  const account = await getAccount();
  const moveAccount = account.slice(0, 2) + '000000000000000000000000' + account.slice(2);
  return moveAccount;
};

export const publicClient = () =>
  createPublicClient({
    chain: devnet,
    transport: custom(window.ethereum!),
  }).extend(publicActionsL2());

export const walletClient = () =>
  createWalletClient({
    chain: devnet,
    transport: custom(window.ethereum!),
  }).extend(walletActionsL2());

// Name Service specific payloads
export const nameServicePayload = async (method: string, args: any[] = []) => {
  const moveAccount = await getMoveAccount();
  const address = method === 'get' ? AccountAddress.fromString(moveAccount) : getSigner(moveAccount);
  
  const entryFunction = EntryFunction.build(
    `${moveAccount}::name_service`,
    method,
    [],
    [address, ...args]
  );
  
  const transactionPayload = new TransactionPayloadEntryFunction(entryFunction);
  return transactionPayload.bcsToHex().toString() as `0x${string}`;
};

// Convert address into serialized signer object
export const getSigner = (address: string) => {
  const addressBytes = [33, 0, ...AccountAddress.fromString(address).toUint8Array()];
  return new FixedBytes(new Uint8Array(addressBytes));
};

export const extractOutput = (data: `0x${string}` | undefined) => {
  if (!data) throw Error('No data found');
  if (typeof data == 'string') throw Error('Data is not an array of bytes');
  
  // Extract output bytes from the complex returned data structure
  return new Uint8Array(bcs.vector(bcs.tuple([bcs.vector(bcs.u8())])).parse(new Uint8Array(data))[0][0]);
};

// BCS schemas for Move structs
export const DomainInfo = bcs.struct('DomainInfo', {
  owner: bcs.address(),
  expiry: bcs.u64(),
  resolver: bcs.address(),
});

export const UserDomains = bcs.struct('UserDomains', {
  domains: bcs.vector(bcs.string()),
}); 