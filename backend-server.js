const express = require('express');
const cors = require('cors');
const { ethers } = require('hardhat');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Contract addresses from .env
const CONTRACT_ADDRESSES = {
    koquiCoin: process.env.KOQUICOIN_ADDRESS,
    ticketNFT: process.env.TICKET_NFT_ADDRESS,
    staking: process.env.STAKING_ADDRESS
};

// Contract instances (will be initialized)
let contracts = {};

// Initialize contracts
async function initializeContracts() {
    try {
        console.log('🔌 Conectando a contratos...');
        
        // Connect to Fuji network
        const provider = new ethers.JsonRpcProvider(process.env.FUJI_RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        
        // Get contract factories
        const KoquiCoin = await ethers.getContractFactory("KoquiCoin");
        const KoquiTicketNFT = await ethers.getContractFactory("KoquiTicketNFT");
        const KoquiStakingDemo = await ethers.getContractFactory("KoquiStakingDemo");
        
        // Connect to deployed contracts
        contracts.koquiCoin = KoquiCoin.attach(CONTRACT_ADDRESSES.koquiCoin).connect(wallet);
        contracts.ticketNFT = KoquiTicketNFT.attach(CONTRACT_ADDRESSES.ticketNFT).connect(wallet);
        contracts.staking = KoquiStakingDemo.attach(CONTRACT_ADDRESSES.staking).connect(wallet);
        
        console.log('✅ Contratos inicializados correctamente');
        console.log('🪙 KoquiCoin:', CONTRACT_ADDRESSES.koquiCoin);
        console.log('🎫 TicketNFT:', CONTRACT_ADDRESSES.ticketNFT);
        console.log('🎰 Staking:', CONTRACT_ADDRESSES.staking);
        
    } catch (error) {
        console.error('❌ Error inicializando contratos:', error.message);
    }
}

// Routes

// 🏠 Health check
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: '🚀 KoquiFI Backend - Buildathon 2025',
        contracts: CONTRACT_ADDRESSES,
        endpoints: [
            'GET /token/info - Información del token',
            'GET /staking/info - Información del staking',
            'GET /staking/cycle/:number - Info de un ciclo específico',
            'POST /staking/buy-ticket - Comprar ticket',
            'GET /user/:address/balance - Balance del usuario',
            'GET /user/:address/tickets/:cycle - Tickets del usuario'
        ]
    });
});

// 🪙 Token endpoints
app.get('/token/info', async (req, res) => {
    try {
        const name = await contracts.koquiCoin.name();
        const symbol = await contracts.koquiCoin.symbol();
        const totalSupply = await contracts.koquiCoin.totalSupply();
        
        res.json({
            name,
            symbol,
            totalSupply: ethers.formatEther(totalSupply),
            contract: CONTRACT_ADDRESSES.koquiCoin
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🎰 Staking endpoints
app.get('/staking/info', async (req, res) => {
    try {
        const currentCycle = await contracts.staking.getCurrentCycle();
        const timeUntilNext = await contracts.staking.getTimeUntilNextCycle();
        const cycleDuration = await contracts.staking.DEMO_CYCLE_DURATION();
        
        res.json({
            currentCycle: currentCycle.toString(),
            timeUntilNextCycle: timeUntilNext.toString(),
            cycleDuration: cycleDuration.toString(),
            contract: CONTRACT_ADDRESSES.staking
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/staking/cycle/:number', async (req, res) => {
    try {
        const cycleNumber = req.params.number;
        const cycleInfo = await contracts.staking.getCycleInfo(cycleNumber);
        const cycleTickets = await contracts.staking.getCycleTickets(cycleNumber);
        
        res.json({
            cycleNumber,
            info: {
                startTime: cycleInfo.startTime.toString(),
                endTime: cycleInfo.endTime.toString(),
                totalTickets: cycleInfo.totalTickets.toString(),
                prizePool: ethers.formatEther(cycleInfo.prizePool),
                isCompleted: cycleInfo.isCompleted,
                winningNumbers: cycleInfo.winningNumbers.map(n => n.toString())
            },
            tickets: cycleTickets.map(t => t.toString())
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 👤 User endpoints
app.get('/user/:address/balance', async (req, res) => {
    try {
        const address = req.params.address;
        
        if (!ethers.isAddress(address)) {
            return res.status(400).json({ error: 'Dirección inválida' });
        }
        
        const balance = await contracts.koquiCoin.balanceOf(address);
        const nftBalance = await contracts.ticketNFT.balanceOf(address);
        
        res.json({
            address,
            koquiBalance: ethers.formatEther(balance),
            nftBalance: nftBalance.toString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/user/:address/tickets/:cycle', async (req, res) => {
    try {
        const address = req.params.address;
        const cycle = req.params.cycle;
        
        if (!ethers.isAddress(address)) {
            return res.status(400).json({ error: 'Dirección inválida' });
        }
        
        const userTickets = await contracts.staking.getUserTickets(cycle, address);
        
        res.json({
            address,
            cycle,
            tickets: userTickets.map(t => t.toString())
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🎫 Buy ticket endpoint (simulación - en frontend real sería llamada directa al contrato)
app.post('/staking/buy-ticket', async (req, res) => {
    try {
        const { numbers, userAddress } = req.body;
        
        if (!numbers || !Array.isArray(numbers) || numbers.length !== 5) {
            return res.status(400).json({ error: 'Se necesitan exactamente 5 números' });
        }
        
        if (!userAddress || !ethers.isAddress(userAddress)) {
            return res.status(400).json({ error: 'Dirección de usuario inválida' });
        }
        
        // En un backend real, esto sería más complejo con autenticación
        // Por ahora solo devolvemos la información necesaria para la transacción
        
        res.json({
            message: 'Información para comprar ticket',
            stakingContract: CONTRACT_ADDRESSES.staking,
            numbers,
            requiredApproval: '1000000000000000000', // 1 KOQUI en wei
            instructions: [
                '1. Aprobar tokens: koquiCoin.approve(stakingAddress, amount)',
                '2. Comprar ticket: staking.buyTicket(numbers)'
            ]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 📊 Dashboard data
app.get('/dashboard', async (req, res) => {
    try {
        // Token info
        const tokenName = await contracts.koquiCoin.name();
        const totalSupply = await contracts.koquiCoin.totalSupply();
        
        // Staking info
        const currentCycle = await contracts.staking.getCurrentCycle();
        const timeUntilNext = await contracts.staking.getTimeUntilNextCycle();
        
        // NFT info
        const nftName = await contracts.ticketNFT.name();
        
        res.json({
            token: {
                name: tokenName,
                totalSupply: ethers.formatEther(totalSupply),
                contract: CONTRACT_ADDRESSES.koquiCoin
            },
            staking: {
                currentCycle: currentCycle.toString(),
                timeUntilNext: timeUntilNext.toString(),
                contract: CONTRACT_ADDRESSES.staking
            },
            nft: {
                name: nftName,
                contract: CONTRACT_ADDRESSES.ticketNFT
            },
            network: {
                name: 'Avalanche Fuji Testnet',
                explorer: 'https://testnet.snowtrace.io/'
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
async function startServer() {
    await initializeContracts();
    
    app.listen(PORT, () => {
        console.log(`\n🚀 KoquiFI Backend Server iniciado!`);
        console.log(`📡 Puerto: ${PORT}`);
        console.log(`🌐 URL: http://localhost:${PORT}`);
        console.log(`📋 Dashboard: http://localhost:${PORT}/dashboard`);
        console.log(`🔗 Snowtrace: https://testnet.snowtrace.io/`);
        console.log(`\n📚 Endpoints disponibles:`);
        console.log(`   GET  / - Health check`);
        console.log(`   GET  /token/info - Info del token`);
        console.log(`   GET  /staking/info - Info del staking`);
        console.log(`   GET  /dashboard - Datos del dashboard`);
    });
}

startServer().catch(console.error);
