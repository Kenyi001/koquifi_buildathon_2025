const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Verificando tu Core Wallet en Fuji...");
    
    // Verificar que tenemos private key
    if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === "TU_PRIVATE_KEY_AQUI") {
        console.log("❌ ERROR: Private key no configurada");
        console.log("📝 INSTRUCCIONES:");
        console.log("1. Abre Core Wallet");
        console.log("2. Settings → Advanced → Export Private Key");
        console.log("3. Copia la private key");
        console.log("4. Edita el archivo .env:");
        console.log("   PRIVATE_KEY=0x[tu_private_key_aqui]");
        return;
    }
    
    // Verificar red
    const network = await ethers.provider.getNetwork();
    console.log(`📡 Red: ${network.name} (Chain ID: ${network.chainId})`);
    
    // Obtener cuenta de tu wallet
    const [deployer] = await ethers.getSigners();
    console.log(`👤 Tu dirección: ${deployer.address}`);
    
    // Verificar balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} AVAX`);
    
    if (balance >= ethers.parseEther("0.1")) {
        console.log("✅ ¡Perfecto! Tienes AVAX suficiente para deployment");
        console.log("🚀 Puedes proceder con el deployment");
    } else {
        console.log("⚠️ Balance bajo. Recomendado: al menos 0.1 AVAX");
        console.log("💡 Opciones:");
        console.log("• Transferir AVAX desde otra wallet");
        console.log("• Usar faucet: https://faucet.avax.network/");
    }
    
    // Verificar si es mainnet por error
    if (network.chainId === 43114n) {
        console.log("⚠️ ADVERTENCIA: Estás en MAINNET!");
        console.log("🔄 Cambia a Fuji testnet para pruebas");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error.message);
        if (error.message.includes("invalid private key")) {
            console.log("💡 La private key no es válida. Verifica el formato:");
            console.log("   Debe empezar con 0x seguido de 64 caracteres hexadecimales");
        }
        process.exit(1);
    });
