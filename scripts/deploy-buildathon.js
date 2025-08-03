const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 ¡Deployment OPTIMIZADO para Buildathon!");
    
    // Verificar la red
    const network = await ethers.provider.getNetwork();
    console.log(`📡 Red detectada: ${network.name} (Chain ID: ${network.chainId})`);
    
    // Obtener cuenta de deployment
    const [deployer] = await ethers.getSigners();
    console.log(`👤 Deployando desde: ${deployer.address}`);
    
    // Verificar balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} AVAX`);

    const deployedContracts = {};

    try {
        // 1. KoquiCoin ya está deployado
        const koquiCoinAddress = "0xa36d6e3A44203d21D92f2d3CA89bE6dF0809aD76";
        deployedContracts.koquiCoin = koquiCoinAddress;
        console.log(`✅ KoquiCoin (ya deployado): ${koquiCoinAddress}`);

        // 2. Deploy KoquiTicketNFT
        console.log("\n2️⃣ Deployando KoquiTicketNFT...");
        const KoquiTicketNFT = await ethers.getContractFactory("KoquiTicketNFT");
        const ticketNFT = await KoquiTicketNFT.deploy();
        await ticketNFT.waitForDeployment();
        const ticketNFTAddress = await ticketNFT.getAddress();
        deployedContracts.ticketNFT = ticketNFTAddress;
        console.log(`✅ KoquiTicketNFT deployed: ${ticketNFTAddress}`);

        // 3. Deploy KoquiStakingDemo (versión simplificada para buildathon)
        console.log("\n3️⃣ Deployando KoquiStakingDemo...");
        const KoquiStakingDemo = await ethers.getContractFactory("KoquiStakingDemo");
        const staking = await KoquiStakingDemo.deploy(
            1, // VRF Subscription ID simplificado para testnet
            "0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE", // VRF Coordinator
            "0xc799bd1e3bd4d1a41cd4968997a4e03dfd2a3c7c04b695881138580163f42887", // VRF Key Hash
            koquiCoinAddress,
            ticketNFTAddress
        );
        await staking.waitForDeployment();
        const stakingAddress = await staking.getAddress();
        deployedContracts.staking = stakingAddress;
        console.log(`✅ KoquiStakingDemo deployed: ${stakingAddress}`);

        // 4. Configurar permisos básicos
        console.log("\n4️⃣ Configurando permisos...");
        
        const KoquiCoin = await ethers.getContractFactory("KoquiCoin");
        const koquiCoin = KoquiCoin.attach(koquiCoinAddress);
        
        const MINTER_ROLE = await koquiCoin.MINTER_ROLE();
        
        console.log("   🔑 Otorgando MINTER_ROLE al Staking...");
        await koquiCoin.grantRole(MINTER_ROLE, stakingAddress);

        console.log("   ✅ Permisos configurados correctamente");

        // 5. Verificación final
        console.log("\n5️⃣ Verificación final...");
        
        const tokenName = await koquiCoin.name();
        const tokenSymbol = await koquiCoin.symbol();
        const totalSupply = await koquiCoin.totalSupply();
        
        console.log(`   🪙 Token: ${tokenName} (${tokenSymbol})`);
        console.log(`   📊 Supply inicial: ${ethers.formatEther(totalSupply)} tokens`);

        // 6. Resumen final
        console.log("\n🎉 ¡DEPLOYMENT BUILDATHON EXITOSO!");
        console.log("===================================");
        console.log(`🌐 Red: ${network.name} (${network.chainId})`);
        console.log(`👤 Deployer: ${deployer.address}`);
        
        console.log("\n📋 CONTRATOS BUILDATHON:");
        console.log("========================");
        console.log(`🪙 KoquiCoin: ${deployedContracts.koquiCoin}`);
        console.log(`🎫 KoquiTicketNFT: ${deployedContracts.ticketNFT}`);
        console.log(`🎰 KoquiStakingDemo: ${deployedContracts.staking}`);

        console.log("\n🔗 ENLACES SNOWTRACE:");
        console.log("=====================");
        console.log(`🪙 KoquiCoin: https://testnet.snowtrace.io/address/${deployedContracts.koquiCoin}`);
        console.log(`🎫 TicketNFT: https://testnet.snowtrace.io/address/${deployedContracts.ticketNFT}`);
        console.log(`🎰 Staking: https://testnet.snowtrace.io/address/${deployedContracts.staking}`);

        console.log("\n📝 ACTUALIZA TU .env:");
        console.log("=====================");
        console.log(`KOQUICOIN_ADDRESS=${deployedContracts.koquiCoin}`);
        console.log(`TICKET_NFT_ADDRESS=${deployedContracts.ticketNFT}`);
        console.log(`STAKING_ADDRESS=${deployedContracts.staking}`);

        return deployedContracts;

    } catch (error) {
        console.error("\n❌ ERROR EN DEPLOYMENT:");
        console.error("========================");
        console.error(error.message);
        throw error;
    }
}

main()
    .then((contracts) => {
        console.log("\n✅ ¡Buildathon contracts deployed exitosamente!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Deployment failed:", error.message);
        process.exit(1);
    });
