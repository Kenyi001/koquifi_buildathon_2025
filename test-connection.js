const { ethers } = require("hardhat");

async function testConnection() {
    console.log("🔗 Probando conexión a la red local...");
    
    try {
        // Conectar a la red local
        const provider = new ethers.JsonRpcProvider("http://localhost:8545");
        
        // Usar la primera cuenta de Hardhat
        const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
        const signer = new ethers.Wallet(privateKey, provider);
        
        console.log("📍 Dirección del usuario:", await signer.getAddress());
        
        // Direcciones de contratos
        const CONTRACT_ADDRESSES = {
            KOQUI_COIN: "0x59b670e9fa9d0a427751af201d676719a970857b",
            TICKET_NFT: "0x322813fd9a801c5507c9de605d63cea4f2ce6c44"
        };
        
        // Conectar a contratos
        const KoquiCoin = await ethers.getContractFactory("KoquiCoin");
        const koquiCoin = KoquiCoin.attach(CONTRACT_ADDRESSES.KOQUI_COIN).connect(signer);
        
        // Verificar balance
        const balance = await koquiCoin.balanceOf(await signer.getAddress());
        console.log("💰 Balance actual:", ethers.formatEther(balance), "KOQUI");
        
        // Verificar total supply
        const totalSupply = await koquiCoin.totalSupply();
        console.log("📊 Total Supply:", ethers.formatEther(totalSupply), "KOQUI");
        
        console.log("✅ ¡Conexión exitosa! El dashboard debería funcionar correctamente.");
        
    } catch (error) {
        console.error("❌ Error de conexión:", error.message);
    }
}

testConnection();
