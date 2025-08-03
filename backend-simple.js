// Backend simplificado para pruebas sin Hardhat
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: ['http://localhost:3002', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'koquifi-secret-key-2025',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Passport configuration básica
app.use(passport.initialize());
app.use(passport.session());

// Rutas básicas
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: '🎉 KoquiFi Backend funcionando correctamente!',
        timestamp: new Date().toISOString(),
        port: PORT,
        version: '1.0.0'
    });
});

app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: '✅ API funcionando',
        data: {
            platform: 'KoquiFi',
            version: '1.0.0',
            network: 'Ready for tests'
        }
    });
});

// Mock data for testing
app.get('/api/balances', (req, res) => {
    res.json({
        success: true,
        data: {
            koficoin: 1250.00,
            usdt: 500.00,
            bob: 3456.78
        }
    });
});

app.get('/api/staking', (req, res) => {
    res.json({
        success: true,
        data: {
            staked: 850.00,
            rewards: 12.5,
            apr: 15.2,
            nextDraw: Date.now() + (7 * 24 * 60 * 60 * 1000)
        }
    });
});

// Authentication routes simplificadas
app.get('/auth/google', (req, res) => {
    res.json({
        message: 'Google OAuth endpoint - Redirect to Google Auth',
        redirect: `https://accounts.google.com/oauth/authorize?client_id=${process.env.GOOGLE_CLIENT_ID}&response_type=code&scope=email+profile`
    });
});

app.get('/auth/wallet', (req, res) => {
    res.json({
        message: 'Wallet Connect endpoint - Ready for Web3 connection',
        supported: ['MetaMask', 'Core Wallet', 'WalletConnect']
    });
});

// Authentication routes
// app.use('/auth', authRoutes); // Comentado para versión simplificada

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
🚀 ================================
   KoquiFi Backend Test Server
🚀 ================================

✅ Servidor: http://localhost:${PORT}
✅ Salud: http://localhost:${PORT}/health
✅ API Test: http://localhost:${PORT}/api/test
✅ Balances: http://localhost:${PORT}/api/balances

🎯 ¡Listo para pruebas!
    `);
});
