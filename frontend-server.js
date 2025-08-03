const express = require('express');
const path = require('path');

const app = express();
const PORT = 3002;

// Servir archivos estáticos desde la carpeta frontend
app.use(express.static(path.join(__dirname, 'frontend')));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n🎨 Frontend Server iniciado!`);
    console.log(`📡 Puerto: ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`🔗 Backend: http://localhost:3000`);
    console.log(`\n🚀 ¡Abre http://localhost:${PORT} en tu navegador!`);
});
