const blockchainService = require('../services/blockchain');

class BlockchainController {
  // Obtener información general de la blockchain
  async getNetworkInfo(req, res) {
    try {
      const networkInfo = await blockchainService.getNetworkInfo();
      const gasPrice = await blockchainService.getGasPrice();
      
      res.json({
        success: true,
        data: {
          network: networkInfo,
          gasPrice: gasPrice
        }
      });
    } catch (error) {
      console.error('Error en getNetworkInfo:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener información de la red',
        details: error.message
      });
    }
  }

  // Obtener balance de AVAX de una dirección
  async getBalance(req, res) {
    try {
      const { address } = req.params;
      
      if (!blockchainService.isValidAddress(address)) {
        return res.status(400).json({
          success: false,
          error: 'Dirección inválida'
        });
      }

      const balance = await blockchainService.getAvaxBalance(address);
      
      res.json({
        success: true,
        data: {
          address,
          balance: `${balance} AVAX`
        }
      });
    } catch (error) {
      console.error('Error en getBalance:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener balance',
        details: error.message
      });
    }
  }

  // Obtener detalles de una transacción
  async getTransaction(req, res) {
    try {
      const { txHash } = req.params;
      
      const txDetails = await blockchainService.getTransactionDetails(txHash);
      
      res.json({
        success: true,
        data: txDetails
      });
    } catch (error) {
      console.error('Error en getTransaction:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener detalles de transacción',
        details: error.message
      });
    }
  }

  // Validar dirección
  async validateAddress(req, res) {
    try {
      const { address } = req.params;
      const isValid = blockchainService.isValidAddress(address);
      
      res.json({
        success: true,
        data: {
          address,
          isValid
        }
      });
    } catch (error) {
      console.error('Error en validateAddress:', error);
      res.status(500).json({
        success: false,
        error: 'Error al validar dirección',
        details: error.message
      });
    }
  }
}

module.exports = new BlockchainController();
