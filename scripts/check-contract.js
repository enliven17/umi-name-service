/* eslint-disable */
const { ethers } = require('hardhat');

async function main() {
  const addr = process.env.NEXT_PUBLIC_UNS_ADDRESS;
  if (!addr) throw new Error('NEXT_PUBLIC_UNS_ADDRESS missing');
  const abi = [
    { type: 'function', name: 'priceWei', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
    { type: 'function', name: 'isAvailable', stateMutability: 'view', inputs: [{ name: 'name', type: 'string' }], outputs: [{ type: 'bool' }] },
  ];
  const c = new ethers.Contract(addr, abi, (await ethers.getSigners())[0]);
  const price = await c.priceWei();
  const name = process.env.NAME || 'deneme';
  const avail = await c.isAvailable(name);
  console.log('priceWei:', price.toString());
  console.log('isAvailable("' + name + '"):', avail);
}

main().catch((e) => { console.error(e); process.exit(1); });


