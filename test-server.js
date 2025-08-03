// Test simple del sistema KoquiFi
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

// Middleware básico
app.use(cors());
app.use(express.json());

// Ruta de prueba de salud
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: '🎉 KoquiFi Backend funcionando correctamente!',
        timestamp: new Date().toISOString(),
        port: PORT
    });
});

// Ruta de prueba de API
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: '✅ API funcionando',
        data: {
            platform: 'KoquiFi',
            version: '1.0.0',
            network: 'Hardhat Local'
        }
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`
🚀 ================================
   KoquiFi Backend TEST Server
🚀 ================================

✅ Servidor: http://localhost:${PORT}
✅ Salud: http://localhost:${PORT}/health
✅ API Test: http://localhost:${PORT}/api/test

🎯 ¡Listo para pruebas!
    `);
});
