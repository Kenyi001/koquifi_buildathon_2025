const { ethers } = require('ethers');
const config = require('../config');

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.initializeProvider();
  }

  initializeProvider() {
    try {
      // Crear proveedor para Avalanche Fuji
      this.provider = new ethers.JsonRpcProvider(config.blockchain.fujiRpcUrl);
      
      // Si hay clave privada válida, crear signer
      if (config.blockchain.privateKey && 
          config.blockchain.privateKey !== 'your_private_key_here' &&
          config.blockchain.privateKey.length === 66) {
        this.signer = new ethers.Wallet(config.blockchain.privateKey, this.provider);
        console.log('✅ Blockchain service inicializado con signer');
        console.log('📍 Dirección del wallet:', this.signer.address);
      } else {
        console.log('⚠️  Blockchain service inicializado sin signer (solo lectura)');
        console.log('💡 Para habilitar transacciones, configura PRIVATE_KEY en .env');
      }
    } catch (error) {
      console.error('❌ Error al inicializar blockchain service:', error.message);
      throw error;
    }
  }

  // Obtener balance de AVAX de una dirección
  async getAvaxBalance(address) {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error al obtener balance AVAX:', error);
      throw error;
    }
  }

  // Obtener información de la red
  async getNetworkInfo() {
    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      
      return {
        name: network.name,
        chainId: Number(network.chainId),
        blockNumber,
        isAvalancheFuji: Number(network.chainId) === 43113
      };
    } catch (error) {
      console.error('Error al obtener información de red:', error);
      throw error;
    }
  }

  // Obtener precio de gas actual
  async getGasPrice() {
    try {
      const gasPrice = await this.provider.getFeeData();
      return {
        gasPrice: ethers.formatUnits(gasPrice.gasPrice, 'gwei'),
        maxFeePerGas: gasPrice.maxFeePerGas ? ethers.formatUnits(gasPrice.maxFeePerGas, 'gwei') : null,
        maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas ? ethers.formatUnits(gasPrice.maxPriorityFeePerGas, 'gwei') : null
      };
    } catch (error) {
      console.error('Error al obtener precio de gas:', error);
      throw error;
    }
  }

  // Validar si una dirección es válida
  isValidAddress(address) {
    try {
      return ethers.isAddress(address);
    } catch (error) {
      return false;
    }
  }

  // Obtener detalles de una transacción
  async getTransactionDetails(txHash) {
    try {
      const tx = await this.provider.getTransaction(txHash);
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      return {
        transaction: tx,
        receipt: receipt,
        confirmations: receipt ? receipt.confirmations : 0,
        status: receipt ? (receipt.status === 1 ? 'success' : 'failed') : 'pending'
      };
    } catch (error) {
      console.error('Error al obtener detalles de transacción:', error);
      throw error;
    }
  }

  // Obtener el signer (requiere clave privada configurada)
  getSigner() {
    if (!this.signer) {
      throw new Error('No hay signer disponible. Configura PRIVATE_KEY en el .env');
    }
    return this.signer;
  }

  // Obtener el provider
  getProvider() {
    return this.provider;
  }
}

// Crear instancia singleton
const blockchainService = new BlockchainService();

module.exports = blockchainService;
