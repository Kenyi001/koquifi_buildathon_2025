const { ethers } = require("hardhat");

async function main() {
    console.log("🎬 DEMO SIMPLE BUILDATHON");
    console.log("========================");

    try {
        // 1. Deploy contracts directamente
        console.log("📦 Deployando contratos...");
        
        // Deploy KoquiCoin
        const KoquiCoin = await ethers.getContractFactory("KoquiCoin");
        const koquiCoin = await KoquiCoin.deploy();
        await koquiCoin.waitForDeployment();
        const koquiCoinAddress = await koquiCoin.getAddress();
        
        console.log(`✅ KoquiCoin: ${koquiCoinAddress}`);
        
        console.log("✅ Contratos deployados exitosamente");

        // 2. Demo básico - transfer tokens
        const [owner, user1] = await ethers.getSigners();
        
        console.log("\n💰 Transfiriendo tokens...");
        await koquiCoin.transfer(user1.address, ethers.parseEther("100"));
        
        const balance = await koquiCoin.balanceOf(user1.address);
        console.log(`✅ User1 balance: ${ethers.formatEther(balance)} KOQUI`);

        console.log("\n🎉 ¡DEMO EXITOSO!");
        console.log("================");
        console.log("Backend funcionando correctamente");
        console.log("Listo para buildathon");

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("❌ Error:", error.message);
            process.exit(1);
        });
}
