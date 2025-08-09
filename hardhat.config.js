require('dotenv').config();
require('@nomicfoundation/hardhat-toolbox');
require('@moved/hardhat-plugin');

module.exports = {
  defaultNetwork: 'devnet',
  networks: {
    devnet: {
      url: 'https://devnet.uminetwork.com',
      chainId: 42069,
      accounts: [process.env.PRIVATE_KEY].filter(Boolean),
    },
  },
  solidity: {
    version: '0.8.28',
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
};
