const { ethers } = require("hardhat");

async function main() {
    console.log("⚡ DEPLOYMENT ULTRA-BARATO para Buildathon!");
    
    // Verificar la red
    const network = await ethers.provider.getNetwork();
    console.log(`📡 Red: ${network.name} (Chain ID: ${network.chainId})`);
    
    // Obtener cuenta
    const [deployer] = await ethers.getSigners();
    console.log(`👤 Deployer: ${deployer.address}`);
    
    // Verificar balance inicial
    const initialBalance = await ethers.provider.getBalance(deployer.address);
    console.log(`💰 Balance inicial: ${ethers.formatEther(initialBalance)} AVAX`);

    const deployedContracts = {};

    try {
        // 1. Deploy KoquiCoinLite (versión ultra-ligera)
        console.log("\n1️⃣ Deployando KoquiCoinLite...");
        const KoquiCoinLite = await ethers.getContractFactory("KoquiCoinLite");
        
        // Estimate gas first
        const deployTx = await KoquiCoinLite.getDeployTransaction();
        const gasEstimate = await ethers.provider.estimateGas(deployTx);
        console.log(`   ⛽ Gas estimado: ${gasEstimate}`);
        
        const koquiCoin = await KoquiCoinLite.deploy();
        await koquiCoin.waitForDeployment();
        const koquiCoinAddress = await koquiCoin.getAddress();
        deployedContracts.koquiCoin = koquiCoinAddress;
        console.log(`   ✅ KoquiCoinLite: ${koquiCoinAddress}`);

        // 2. Deploy KoquiTicketNFT (reutilizar existente)
        console.log("\n2️⃣ Deployando KoquiTicketNFT...");
        const KoquiTicketNFT = await ethers.getContractFactory("KoquiTicketNFT");
        
        const nftDeployTx = await KoquiTicketNFT.getDeployTransaction();
        const nftGasEstimate = await ethers.provider.estimateGas(nftDeployTx);
        console.log(`   ⛽ Gas estimado: ${nftGasEstimate}`);
        
        const ticketNFT = await KoquiTicketNFT.deploy();
        await ticketNFT.waitForDeployment();
        const ticketNFTAddress = await ticketNFT.getAddress();
        deployedContracts.ticketNFT = ticketNFTAddress;
        console.log(`   ✅ KoquiTicketNFT: ${ticketNFTAddress}`);

        // 3. Deploy KoquiStakingDemo con configuración mínima
        console.log("\n3️⃣ Deployando KoquiStakingDemo...");
        const KoquiStakingDemo = await ethers.getContractFactory("KoquiStakingDemo");
        
        const stakingDeployTx = await KoquiStakingDemo.getDeployTransaction(
            1, // VRF Subscription ID
            "0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE", // VRF Coordinator
            "0xc799bd1e3bd4d1a41cd4968997a4e03dfd2a3c7c04b695881138580163f42887", // VRF Key Hash
            koquiCoinAddress,
            ticketNFTAddress
        );
        const stakingGasEstimate = await ethers.provider.estimateGas(stakingDeployTx);
        console.log(`   ⛽ Gas estimado: ${stakingGasEstimate}`);
        
        const staking = await KoquiStakingDemo.deploy(
            1,
            "0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE",
            "0xc799bd1e3bd4d1a41cd4968997a4e03dfd2a3c7c04b695881138580163f42887",
            koquiCoinAddress,
            ticketNFTAddress
        );
        await staking.waitForDeployment();
        const stakingAddress = await staking.getAddress();
        deployedContracts.staking = stakingAddress;
        console.log(`   ✅ KoquiStakingDemo: ${stakingAddress}`);

        // 4. Configurar permisos (solo lo esencial)
        console.log("\n4️⃣ Configurando permisos...");
        
        console.log("   🔑 Transfiriendo ownership del token al staking...");
        await koquiCoin.transferOwnership(stakingAddress);
        console.log("   ✅ Permisos configurados");

        // 5. Calcular costos totales
        const finalBalance = await ethers.provider.getBalance(deployer.address);
        const totalGasUsed = initialBalance - finalBalance;
        
        console.log("\n📊 COSTOS TOTALES:");
        console.log("==================");
        console.log(`💰 Balance inicial: ${ethers.formatEther(initialBalance)} AVAX`);
        console.log(`💰 Balance final: ${ethers.formatEther(finalBalance)} AVAX`);
        console.log(`⛽ Gas total usado: ${ethers.formatEther(totalGasUsed)} AVAX`);
        console.log(`💵 Costo USD aprox: $${(parseFloat(ethers.formatEther(totalGasUsed)) * 30).toFixed(4)}`);

        console.log("\n🎉 ¡DEPLOYMENT ULTRA-BARATO EXITOSO!");
        console.log("=====================================");
        
        console.log("\n📋 CONTRATOS OPTIMIZADOS:");
        console.log("=========================");
        console.log(`🪙 KoquiCoinLite: ${deployedContracts.koquiCoin}`);
        console.log(`🎫 KoquiTicketNFT: ${deployedContracts.ticketNFT}`);
        console.log(`🎰 KoquiStakingDemo: ${deployedContracts.staking}`);

        console.log("\n🔗 SNOWTRACE:");
        console.log("==============");
        console.log(`🪙 Token: https://testnet.snowtrace.io/address/${deployedContracts.koquiCoin}`);
        console.log(`🎫 NFT: https://testnet.snowtrace.io/address/${deployedContracts.ticketNFT}`);
        console.log(`🎰 Staking: https://testnet.snowtrace.io/address/${deployedContracts.staking}`);

        return deployedContracts;

    } catch (error) {
        console.error("\n❌ ERROR:", error.message);
        throw error;
    }
}

main()
    .then((contracts) => {
        console.log("\n✅ ¡Deployment ultra-barato completado!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Error:", error.message);
        process.exit(1);
    });
