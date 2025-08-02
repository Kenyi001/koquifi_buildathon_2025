require('dotenv').config();

const config = {
  // Configuración del servidor
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development'
  },

  // Configuración de blockchain
  blockchain: {
    fujiRpcUrl: process.env.FUJI_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc',
    privateKey: process.env.PRIVATE_KEY,
    stakingAddress: process.env.STAKING_ADDRESS,
    koquicoinAddress: process.env.KOQUICOIN_ADDRESS
  },

  // Configuración de Chainlink VRF
  chainlink: {
    vrfCoordinator: process.env.VRF_COORDINATOR_ADDRESS || '0x2eD832Ba664535e5886b75D64C46EB9a228C2610',
    keyHash: process.env.VRF_KEY_HASH || '0x354d2f95da55398f44b7cff77da56283d9c6c829a4bdf1bbcaf2ad6a4d081f61',
    subscriptionId: process.env.VRF_SUBSCRIPTION_ID
  },

  // Configuración de base de datos
  database: {
    mongoUri: process.env.MONGODB_URI,
    postgresUrl: process.env.DATABASE_URL
  },

  // API Keys
  apiKeys: {
    etherscan: process.env.ETHERSCAN_API_KEY,
    infura: process.env.INFURA_PROJECT_ID
  }
};

// Validaciones básicas
const validateConfig = () => {
  const requiredFields = [
    'blockchain.fujiRpcUrl'
  ];

  const missingFields = requiredFields.filter(field => {
    const keys = field.split('.');
    let value = config;
    for (const key of keys) {
      value = value[key];
      if (!value) return true;
    }
    return false;
  });

  if (missingFields.length > 0) {
    console.warn('⚠️  Campos de configuración faltantes:', missingFields);
    console.warn('📝 Asegúrate de configurar el archivo .env');
  }
};

// Validar configuración al cargar
validateConfig();

module.exports = config;
