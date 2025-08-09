/* eslint-disable */
const { createPublicClient, http } = require('viem');

async function main() {
  const addr = process.env.NEXT_PUBLIC_UNS_ADDRESS;
  if (!addr) throw new Error('NEXT_PUBLIC_UNS_ADDRESS missing');
  const client = createPublicClient({ transport: http(process.env.RPC_URL || 'https://devnet.uminetwork.com') });
  const abi = [
    { type: 'function', name: 'priceWei', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
    { type: 'function', name: 'isAvailable', stateMutability: 'view', inputs: [{ name: 'name', type: 'string' }], outputs: [{ type: 'bool' }] },
  ];
  const price = await client.readContract({ address: addr, abi, functionName: 'priceWei' });
  const name = process.env.NAME || 'deneme';
  const avail = await client.readContract({ address: addr, abi, functionName: 'isAvailable', args: [name] });
  console.log('priceWei:', price.toString());
  console.log(`isAvailable(${name}):`, avail);
}

main().catch((e) => { console.error(e); process.exit(1); });


