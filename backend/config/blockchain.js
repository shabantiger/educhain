const { ethers } = require('ethers');

const blockchainConfig = {
  networks: {
    base: {
      name: 'Base',
      chainId: 8453,
      rpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
      blockExplorer: 'https://basescan.org',
      nativeCurrency: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18
      }
    },
    baseGoerli: {
      name: 'Base Goerli',
      chainId: 84531,
      rpcUrl: 'https://goerli.base.org',
      blockExplorer: 'https://goerli.basescan.org',
      nativeCurrency: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18
      }
    },
    localhost: {
      name: 'Localhost',
      chainId: 1337,
      rpcUrl: 'http://localhost:8545',
      blockExplorer: null,
      nativeCurrency: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18
      }
    }
  },
  
  contract: {
    address: process.env.CONTRACT_ADDRESS,
    abi: require('../contract-abi.json')
  },

  getProvider: (network = 'base') => {
    const config = blockchainConfig.networks[network];
    if (!config) {
      throw new Error(`Unsupported network: ${network}`);
    }
    return new ethers.providers.JsonRpcProvider(config.rpcUrl);
  },

  getContract: (network = 'base', signer = null) => {
    const provider = blockchainConfig.getProvider(network);
    const contractInstance = new ethers.Contract(
      blockchainConfig.contract.address,
      blockchainConfig.contract.abi,
      signer || provider
    );
    return contractInstance;
  },

  createWallet: (privateKey, network = 'base') => {
    const provider = blockchainConfig.getProvider(network);
    return new ethers.Wallet(privateKey, provider);
  },

  formatEther: ethers.utils.formatEther,
  parseEther: ethers.utils.parseEther,
  isAddress: ethers.utils.isAddress,

  // Gas price settings
  gasSettings: {
    base: {
      gasPrice: ethers.utils.parseUnits('0.1', 'gwei'), // Low gas price for Base
      gasLimit: 500000
    },
    baseGoerli: {
      gasPrice: ethers.utils.parseUnits('1', 'gwei'),
      gasLimit: 500000
    }
  }
};

module.exports = blockchainConfig;
