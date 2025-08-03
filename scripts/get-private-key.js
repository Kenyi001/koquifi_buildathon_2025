const { ethers } = require("hardhat");

async function main() {
    console.log("🔑 Convirtiendo seed phrase a private key...");
    
    // Tu seed phrase
    const mnemonic = "tone radar lawn donkey turkey snap harvest renew inherit pony pet lyrics flight law behind nuclear kiss gain alcohol lend client tiny vault drift";
    
    try {
        // Crear wallet desde seed phrase
        const wallet = ethers.Wallet.fromPhrase(mnemonic);
        
        console.log("✅ Wallet creado exitosamente:");
        console.log(`👤 Dirección: ${wallet.address}`);
        console.log(`🔑 Private Key: ${wallet.privateKey}`);
        
        console.log("\n📝 COPIA ESTA PRIVATE KEY AL .env:");
        console.log("=================================");
        console.log(`PRIVATE_KEY=${wallet.privateKey}`);
        
        // Verificar balance en Fuji
        console.log("\n🔍 Verificando balance en Fuji...");
        const provider = new ethers.JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc");
        const connectedWallet = wallet.connect(provider);
        
        const balance = await provider.getBalance(wallet.address);
        console.log(`💰 Balance en Fuji: ${ethers.formatEther(balance)} AVAX`);
        
        if (balance >= ethers.parseEther("0.1")) {
            console.log("✅ ¡Perfecto! Tienes AVAX suficiente para deployment");
        } else {
            console.log("⚠️ Balance bajo. Necesitas al menos 0.1 AVAX");
            console.log("🎁 Usa el faucet: https://faucet.avax.network/");
            console.log(`📋 Tu dirección: ${wallet.address}`);
        }
        
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

main()
    .then(() => {
        console.log("\n⚠️ IMPORTANTE:");
        console.log("• Borra este archivo después de copiar la private key");
        console.log("• Nunca compartas tu private key con nadie");
        console.log("• Guarda tu seed phrase en lugar seguro");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Error:", error.message);
        process.exit(1);
    });
