const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 ¡Deployando KoquiFI en Avalanche Fuji Testnet!");
    
    // Verificar la red
    const network = await ethers.provider.getNetwork();
    console.log(`📡 Red detectada: ${network.name} (Chain ID: ${network.chainId})`);
    
    if (network.chainId !== 43113n && network.chainId !== 1337n) {
        console.log("⚠️ ADVERTENCIA: No estás en Fuji testnet ni localhost");
        console.log("   Continúa solo si estás seguro de la red...");
    }
    
    // Obtener cuenta de deployment
    const [deployer] = await ethers.getSigners();
    console.log(`👤 Deployando desde: ${deployer.address}`);
    
    // Verificar balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} AVAX`);
    
    if (balance < ethers.parseEther("0.1")) {
        console.log("⚠️ ADVERTENCIA: Balance bajo. Necesitas al menos 0.1 AVAX para gas");
        if (network.chainId === 43113n) {
            console.log("🎁 Obtén AVAX gratis en: https://faucet.avax.network/");
        }
    }

    // Direcciones reales para Fuji testnet
    const FUJI_ADDRESSES = {
        USDT_E: "0x7898AcCC83587C3C55116c5230C17a6d441077b5",
        TRADER_JOE_ROUTER: "0x5db0735cf88F85E78ed742215090c465979B5006", 
        VRF_COORDINATOR: "0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE",
        VRF_KEY_HASH: "0xc799bd1e3bd4d1a41cd4968997a4e03dfd2a3c7c04b695881138580163f42887"
    };

    // Para localhost usar addresses mock
    const LOCAL_ADDRESSES = {
        USDT_E: "0x1000000000000000000000000000000000000001",
        TRADER_JOE_ROUTER: "0x1000000000000000000000000000000000000002",
        VRF_COORDINATOR: "0x1000000000000000000000000000000000000003",
        VRF_KEY_HASH: "0x354d2f95da55398f44b7cff77da56283d9c6c829a4bdf1bbcaf2ad6a4d081f61"
    };

    const addresses = network.chainId === 43113n ? FUJI_ADDRESSES : LOCAL_ADDRESSES;
    
    console.log("\n🔧 Usando direcciones externas:");
    console.log(`💰 USDT.e: ${addresses.USDT_E}`);
    console.log(`🔄 Trader Joe Router: ${addresses.TRADER_JOE_ROUTER}`);
    console.log(`🎲 VRF Coordinator: ${addresses.VRF_COORDINATOR}`);

    const deployedContracts = {};

    try {
        // 1. Deploy KoquiCoin
        console.log("\n1️⃣ Deployando KoquiCoin...");
        const KoquiCoin = await ethers.getContractFactory("KoquiCoin");
        console.log("   📦 Factory obtenido, enviando transacción...");
        
        const koquiCoin = await KoquiCoin.deploy();
        console.log(`   ⏳ Transacción enviada: ${koquiCoin.deploymentTransaction()?.hash}`);
        
        await koquiCoin.waitForDeployment();
        const koquiCoinAddress = await koquiCoin.getAddress();
        deployedContracts.koquiCoin = koquiCoinAddress;
        console.log(`   ✅ KoquiCoin deployed: ${koquiCoinAddress}`);

        // 2. Deploy KoquiPriceOracle
        console.log("\n2️⃣ Deployando KoquiPriceOracle...");
        const KoquiPriceOracle = await ethers.getContractFactory("KoquiPriceOracle");
        const priceOracle = await KoquiPriceOracle.deploy();
        await priceOracle.waitForDeployment();
        const priceOracleAddress = await priceOracle.getAddress();
        deployedContracts.priceOracle = priceOracleAddress;
        console.log(`   ✅ KoquiPriceOracle deployed: ${priceOracleAddress}`);

        // 3. Deploy KoquiTicketNFT
        console.log("\n3️⃣ Deployando KoquiTicketNFT...");
        const KoquiTicketNFT = await ethers.getContractFactory("KoquiTicketNFT");
        const ticketNFT = await KoquiTicketNFT.deploy();
        await ticketNFT.waitForDeployment();
        const ticketNFTAddress = await ticketNFT.getAddress();
        deployedContracts.ticketNFT = ticketNFTAddress;
        console.log(`   ✅ KoquiTicketNFT deployed: ${ticketNFTAddress}`);

        // 4. Deploy KoquiStaking
        console.log("\n4️⃣ Deployando KoquiStaking...");
        const KoquiStaking = await ethers.getContractFactory("KoquiStaking");
        const staking = await KoquiStaking.deploy(
            network.chainId === 43113n ? 39650578419738586146415071830778224814442955562269021256613850465642893401058n : 1, // VRF Subscription ID
            addresses.VRF_COORDINATOR,
            addresses.VRF_KEY_HASH,
            koquiCoinAddress,
            ticketNFTAddress
        );
        await staking.waitForDeployment();
        const stakingAddress = await staking.getAddress();
        deployedContracts.staking = stakingAddress;
        console.log(`   ✅ KoquiStaking deployed: ${stakingAddress}`);

        // 5. Deploy KoquiDEX
        console.log("\n5️⃣ Deployando KoquiDEX...");
        const KoquiDEX = await ethers.getContractFactory("KoquiDEX");
        const dex = await KoquiDEX.deploy(
            koquiCoinAddress,
            addresses.USDT_E,
            addresses.TRADER_JOE_ROUTER,
            "0x0000000000000000000000000000000000000001" // Mock price feed
        );
        await dex.waitForDeployment();
        const dexAddress = await dex.getAddress();
        deployedContracts.dex = dexAddress;
        console.log(`   ✅ KoquiDEX deployed: ${dexAddress}`);

        // 6. Configurar permisos
        console.log("\n6️⃣ Configurando permisos...");
        
        const MINTER_ROLE = await koquiCoin.MINTER_ROLE();
        const BURNER_ROLE = await koquiCoin.BURNER_ROLE();
        
        console.log("   🔑 Otorgando MINTER_ROLE al DEX...");
        await koquiCoin.grantRole(MINTER_ROLE, dexAddress);
        
        console.log("   🔑 Otorgando BURNER_ROLE al DEX...");
        await koquiCoin.grantRole(BURNER_ROLE, dexAddress);
        
        console.log("   🔑 Otorgando MINTER_ROLE al Staking...");
        await koquiCoin.grantRole(MINTER_ROLE, stakingAddress);

        console.log("   ✅ Permisos configurados correctamente");

        // 7. Verificación final
        console.log("\n7️⃣ Verificación final...");
        
        const tokenName = await koquiCoin.name();
        const tokenSymbol = await koquiCoin.symbol();
        const totalSupply = await koquiCoin.totalSupply();
        
        console.log(`   🪙 Token: ${tokenName} (${tokenSymbol})`);
        console.log(`   📊 Supply inicial: ${ethers.formatEther(totalSupply)} tokens`);

        // 8. Resumen final
        console.log("\n🎉 ¡DEPLOYMENT EXITOSO!");
        console.log("====================================");
        console.log(`🌐 Red: ${network.name} (${network.chainId})`);
        console.log(`👤 Deployer: ${deployer.address}`);
        console.log(`💰 Gas usado: ~${ethers.formatEther(await ethers.provider.getBalance(deployer.address) - balance)} AVAX`);
        
        console.log("\n📋 DIRECCIONES DE CONTRATOS:");
        console.log("============================");
        console.log(`🪙 KoquiCoin: ${deployedContracts.koquiCoin}`);
        console.log(`🎫 KoquiTicketNFT: ${deployedContracts.ticketNFT}`);
        console.log(`🎰 KoquiStaking: ${deployedContracts.staking}`);
        console.log(`💱 KoquiDEX: ${deployedContracts.dex}`);
        console.log(`📊 KoquiPriceOracle: ${deployedContracts.priceOracle}`);

        if (network.chainId === 43113n) {
            console.log("\n🔗 ENLACES ÚTILES (FUJI TESTNET):");
            console.log("================================");
            console.log("🌐 Snowtrace (Fuji): https://testnet.snowtrace.io/");
            console.log(`🪙 KoquiCoin: https://testnet.snowtrace.io/address/${deployedContracts.koquiCoin}`);
            console.log(`🎫 TicketNFT: https://testnet.snowtrace.io/address/${deployedContracts.ticketNFT}`);
            console.log(`💱 DEX: https://testnet.snowtrace.io/address/${deployedContracts.dex}`);
            console.log("\n🎁 Faucets:");
            console.log("• AVAX: https://faucet.avax.network/");
            console.log("• USDT.e: Trader Joe testnet faucet");
        }

        console.log("\n📝 ACTUALIZA TU .ENV:");
        console.log("=====================");
        console.log(`KOQUICOIN_ADDRESS=${deployedContracts.koquiCoin}`);
        console.log(`TICKET_NFT_ADDRESS=${deployedContracts.ticketNFT}`);
        console.log(`STAKING_ADDRESS=${deployedContracts.staking}`);
        console.log(`DEX_ADDRESS=${deployedContracts.dex}`);
        console.log(`PRICE_ORACLE_ADDRESS=${deployedContracts.priceOracle}`);

        return deployedContracts;

    } catch (error) {
        console.error("\n❌ ERROR EN DEPLOYMENT:");
        console.error("========================");
        console.error(error.message);
        
        if (error.message.includes("insufficient funds")) {
            console.log("\n💡 SOLUCIÓN:");
            console.log("• Necesitas más AVAX para gas fees");
            console.log("• Usa el faucet: https://faucet.avax.network/");
            console.log("• Mínimo recomendado: 0.1 AVAX");
        }
        
        if (error.message.includes("nonce")) {
            console.log("\n💡 SOLUCIÓN:");
            console.log("• Espera unos segundos y reintenta");
            console.log("• Problema temporal de nonce");
        }

        throw error;
    }
}

main()
    .then((contracts) => {
        console.log("\n✅ ¡KoquiFI deployed exitosamente!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Deployment failed:", error.message);
        process.exit(1);
    });
