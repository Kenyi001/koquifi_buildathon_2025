require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000  // Más optimizaciones para gas (era 200)
      },
      viaIR: true  // Habilitar IR para mejor optimización
    }
  },
  
  networks: {
    hardhat: {
      chainId: 1337
    },
    
    fuji: {
      url: process.env.FUJI_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc",
      chainId: 43113,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gas: 2000000,          // Reducido de 2.5M a 2M
      gasPrice: 15000000000, // 15 Gwei (reducido de 25 Gwei)
    },
    
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337
    }
  },
  
  etherscan: {
    apiKey: {
      avalancheFujiTestnet: process.env.ETHERSCAN_API_KEY || ""
    }
  },
  
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  
  mocha: {
    timeout: 40000
  }
};
