const express = require('express');
const path = require('path');
const app = express();
const PORT = 3001;

// Servir archivos estáticos
app.use(express.static('.'));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// API endpoints para datos adicionales
app.get('/api/status', (req, res) => {
    res.json({
        status: 'active',
        network: 'localhost',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

app.listen(PORT, () => {
    console.log(`🌐 KoquiFI Dashboard corriendo en: http://localhost:${PORT}`);
    console.log(`📊 Dashboard visual disponible para testing`);
    console.log(`🔗 Conectado a red local Hardhat en puerto 8545`);
});
