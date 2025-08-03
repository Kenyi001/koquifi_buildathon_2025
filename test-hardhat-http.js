const fetch = require('node-fetch');

async function testHardhatConnection() {
    try {
        console.log('🧪 Probando conexión HTTP a Hardhat...');
        
        const response = await fetch('http://localhost:8545', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_accounts',
                params: [],
                id: 1
            })
        });
        
        const data = await response.json();
        console.log('📡 Respuesta de Hardhat:', data);
        
        if (data.result && data.result.length > 0) {
            console.log('✅ Hardhat responde correctamente');
            console.log('👥 Cuentas disponibles:', data.result.length);
            console.log('📍 Primera cuenta:', data.result[0]);
        } else {
            console.log('❌ Hardhat no devolvió cuentas');
        }
        
    } catch (error) {
        console.error('❌ Error conectando a Hardhat:', error.message);
    }
}

testHardhatConnection();
