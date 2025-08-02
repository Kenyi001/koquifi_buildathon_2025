const express = require('express');
const router = express.Router();
const blockchainController = require('../controllers/blockchain');

// Rutas de información de blockchain
router.get('/network', blockchainController.getNetworkInfo);
router.get('/balance/:address', blockchainController.getBalance);
router.get('/transaction/:txHash', blockchainController.getTransaction);
router.get('/validate/:address', blockchainController.validateAddress);

module.exports = router;
