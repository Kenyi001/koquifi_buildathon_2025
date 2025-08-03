const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3002;

// Habilitar CORS para todas las rutas
app.use(cors({
    origin: '*',
    credentials: true
}));

// Servir archivos estáticos
app.use(express.static(__dirname));

// Crear proxy para Hardhat
const hardhatProxy = createProxyMiddleware({
    target: 'http://localhost:8545',
    changeOrigin: true,
    timeout: 10000,
    onError: (err, req, res) => {
        console.error('❌ Error en proxy:', err.message);
        res.status(500).json({ error: 'Error conectando a Hardhat' });
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log('📡 Proxy request:', req.method, req.originalUrl);
        // Agregar headers CORS
        proxyReq.setHeader('Access-Control-Allow-Origin', '*');
        proxyReq.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        proxyReq.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }
});

// Configurar proxy para /api/hardhat
app.use('/api/hardhat', hardhatProxy);

// Ruta para el dashboard con proxy
app.get('/dashboard-proxy', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard-with-proxy.html'));
});

// Manejar OPTIONS para CORS
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`🌐 Servidor con proxy corriendo en: http://localhost:${PORT}`);
    console.log(`📊 Dashboard con proxy: http://localhost:${PORT}/dashboard-proxy`);
    console.log(`🔗 Proxy Hardhat: http://localhost:${PORT}/api/hardhat`);
});
