const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Verificando cuenta en Fuji...");
    
    // Verificar red
    const network = await ethers.provider.getNetwork();
    console.log(`📡 Red: ${network.name} (Chain ID: ${network.chainId})`);
    
    // Obtener cuenta
    const [deployer] = await ethers.getSigners();
    console.log(`👤 Dirección: ${deployer.address}`);
    
    // Verificar balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} AVAX`);
    
    if (balance < ethers.parseEther("0.1")) {
        console.log("\n⚠️ NECESITAS MÁS AVAX:");
        console.log("1. Ve a: https://faucet.avax.network/");
        console.log(`2. Pega tu dirección: ${deployer.address}`);
        console.log("3. Solicita 2 AVAX");
        console.log("4. Espera la confirmación");
    } else {
        console.log("✅ Balance suficiente para deployment");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error.message);
        process.exit(1);
    });
