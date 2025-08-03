const { ethers } = require("hardhat");

async function testDashboardConnection() {
    console.log("🔗 Probando conexión del dashboard...");
    
    try {
        // Misma configuración que el dashboard
        const provider = new ethers.JsonRpcProvider("http://localhost:8545");
        const accounts = await provider.listAccounts();
        
        console.log("👥 Cuentas encontradas:", accounts.length);
        
        if (accounts.length > 0) {
            const signer = provider.getSigner(accounts[0]);
            const address = await signer.getAddress();
            console.log("📍 Dirección activa:", address);
            
            // Probar contratos
            const CONTRACT_ADDRESSES = {
                KOQUI_COIN: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
                TICKET_NFT: "0x0165878A594ca255338adfa4d48449f69242Eb8F"
            };
            
            const KoquiCoin = await ethers.getContractFactory("KoquiCoin");
            const koquiCoin = KoquiCoin.attach(CONTRACT_ADDRESSES.KOQUI_COIN).connect(signer);
            
            const balance = await koquiCoin.balanceOf(address);
            const totalSupply = await koquiCoin.totalSupply();
            
            console.log("💰 Balance:", ethers.formatEther(balance), "KOQUI");
            console.log("📊 Total Supply:", ethers.formatEther(totalSupply), "KOQUI");
            
            console.log("✅ Dashboard debería conectarse correctamente!");
        }
        
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

testDashboardConnection();
