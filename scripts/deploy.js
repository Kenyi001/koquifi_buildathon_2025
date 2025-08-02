const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Iniciando deployment de KoquiFI en Avalanche Fuji...");
    
    // Obtener signers
    const [deployer] = await ethers.getSigners();
    console.log("Deployando con la cuenta:", deployer.address);
    console.log("Balance de la cuenta:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

    // Direcciones de contratos existentes en Avalanche Fuji
    const USDT_ADDRESS = "0x50b7545627a5162F82A992c33b87aDc75187B218"; // USDT.e en Fuji
    const TRADER_JOE_ROUTER = "0x2D99ABD9008Dc933ff5c0CD271B88309593aB921"; // Trader Joe Router en Fuji
    const USDT_PRICE_FEED = "0x7898AcCC83587C3C55116c5230C17a6d441077C9"; // USDT/USD Chainlink en Fuji
    const VRF_COORDINATOR = "0x2eD832Ba664535e5886b75D64C46EB9a228C2610"; // VRF Coordinator en Fuji
    const CHAINLINK_AUTOMATION_REGISTRY = "0x819B58A646CDd8289275A87653a2aA4902b14fe6"; // Automation Registry

    // Key Hash para VRF (500 gwei)
    const KEY_HASH = "0x354d2f95da55398f44b7cff77da56283d9c6c829a4bdf1bbcaf2ad6a4d081f61";
    
    console.log("\n📋 Configuración de deployment:");
    console.log("- USDT.e:", USDT_ADDRESS);
    console.log("- Trader Joe Router:", TRADER_JOE_ROUTER);
    console.log("- USDT Price Feed:", USDT_PRICE_FEED);
    console.log("- VRF Coordinator:", VRF_COORDINATOR);

    // 1. Deploy KoquiCoin (ERC20 Token)
    console.log("\n1️⃣ Deployando KoquiCoin...");
    const KoquiCoin = await ethers.getContractFactory("KoquiCoin");
    const koquiCoin = await KoquiCoin.deploy();
    await koquiCoin.waitForDeployment();
    const koquiCoinAddress = await koquiCoin.getAddress();
    console.log("✅ KoquiCoin deployado en:", koquiCoinAddress);

    // 2. Deploy KoquiPriceOracle
    console.log("\n2️⃣ Deployando KoquiPriceOracle...");
    const KoquiPriceOracle = await ethers.getContractFactory("KoquiPriceOracle");
    const priceOracle = await KoquiPriceOracle.deploy();
    await priceOracle.waitForDeployment();
    const priceOracleAddress = await priceOracle.getAddress();
    console.log("✅ KoquiPriceOracle deployado en:", priceOracleAddress);

    // 3. Deploy KoquiTicketNFT
    console.log("\n3️⃣ Deployando KoquiTicketNFT...");
    const KoquiTicketNFT = await ethers.getContractFactory("KoquiTicketNFT");
    const ticketNFT = await KoquiTicketNFT.deploy(
        koquiCoinAddress,
        "KoquiFI Lottery Ticket",
        "KOQUITICKET"
    );
    await ticketNFT.waitForDeployment();
    const ticketNFTAddress = await ticketNFT.getAddress();
    console.log("✅ KoquiTicketNFT deployado en:", ticketNFTAddress);

    // 4. Deploy KoquiStaking (Lottery System)
    console.log("\n4️⃣ Deployando KoquiStaking...");
    const KoquiStaking = await ethers.getContractFactory("KoquiStaking");
    const staking = await KoquiStaking.deploy(
        koquiCoinAddress,
        ticketNFTAddress,
        VRF_COORDINATOR,
        KEY_HASH,
        1 // subscription ID - necesitarás crear uno en Chainlink VRF
    );
    await staking.waitForDeployment();
    const stakingAddress = await staking.getAddress();
    console.log("✅ KoquiStaking deployado en:", stakingAddress);

    // 5. Deploy KoquiDEX
    console.log("\n5️⃣ Deployando KoquiDEX...");
    const KoquiDEX = await ethers.getContractFactory("KoquiDEX");
    const dex = await KoquiDEX.deploy(
        koquiCoinAddress,
        USDT_ADDRESS,
        TRADER_JOE_ROUTER,
        USDT_PRICE_FEED
    );
    await dex.waitForDeployment();
    const dexAddress = await dex.getAddress();
    console.log("✅ KoquiDEX deployado en:", dexAddress);

    console.log("\n🔧 Configurando permisos y conexiones...");

    // Configurar roles en KoquiCoin
    const MINTER_ROLE = await koquiCoin.MINTER_ROLE();
    const BURNER_ROLE = await koquiCoin.BURNER_ROLE();
    
    // Dar permisos al DEX y Staking para mint/burn
    await koquiCoin.grantRole(MINTER_ROLE, dexAddress);
    await koquiCoin.grantRole(BURNER_ROLE, dexAddress);
    await koquiCoin.grantRole(MINTER_ROLE, stakingAddress);
    await koquiCoin.grantRole(BURNER_ROLE, stakingAddress);
    console.log("✅ Permisos configurados en KoquiCoin");

    // Configurar el staking contract en el NFT
    await ticketNFT.setStakingContract(stakingAddress);
    console.log("✅ Staking contract configurado en NFT");

    // Configurar precios iniciales en el Oracle
    try {
        // Agregar USDT como activo
        await priceOracle.addPriceFeed(
            "USDT",
            USDT_PRICE_FEED,
            10000, // 100% weight
            3600,  // 1 hour heartbeat
            500    // 5% max deviation
        );

        // Agregar AVAX como activo
        await priceOracle.addPriceFeed(
            "AVAX",
            "0x5498BB86BC934c8D34FDA08E81D444153d0D06aD", // AVAX/USD en Fuji
            10000, // 100% weight
            3600,  // 1 hour heartbeat
            1000   // 10% max deviation
        );

        console.log("✅ Feeds de precios configurados en Oracle");
    } catch (error) {
        console.log("⚠️ Error configurando Oracle (puede ser normal en testnet):", error.message);
    }

    // Configurar parámetros iniciales del DEX
    try {
        await dex.setMinLiquidity(
            ethers.parseUnits("100", 6),   // 100 USDT.e mínimo
            ethers.parseUnits("1000", 18)  // 1000 KOQUI mínimo
        );
        console.log("✅ Parámetros del DEX configurados");
    } catch (error) {
        console.log("⚠️ Error configurando DEX:", error.message);
    }

    console.log("\n🎉 ¡Deployment completado exitosamente!");
    console.log("\n📋 Resumen de contratos deployados:");
    console.log("===================================");
    console.log(`🪙 KoquiCoin: ${koquiCoinAddress}`);
    console.log(`🎫 KoquiTicketNFT: ${ticketNFTAddress}`);
    console.log(`🎰 KoquiStaking: ${stakingAddress}`);
    console.log(`💱 KoquiDEX: ${dexAddress}`);
    console.log(`📊 KoquiPriceOracle: ${priceOracleAddress}`);

    console.log("\n🚨 IMPORTANTE - Próximos pasos:");
    console.log("1. Crear suscripción de Chainlink VRF en https://vrf.chain.link/");
    console.log("2. Fondear la suscripción con LINK tokens");
    console.log("3. Agregar el contrato KoquiStaking como consumer");
    console.log("4. Configurar Chainlink Automation para draws automáticos");
    console.log("5. Agregar liquidez inicial al DEX");

    console.log("\n📱 Para el frontend, usar estas direcciones:");
    console.log("===========================================");
    console.log("KOQUI_COIN_ADDRESS=\"" + koquiCoinAddress + "\"");
    console.log("TICKET_NFT_ADDRESS=\"" + ticketNFTAddress + "\"");
    console.log("STAKING_ADDRESS=\"" + stakingAddress + "\"");
    console.log("DEX_ADDRESS=\"" + dexAddress + "\"");
    console.log("PRICE_ORACLE_ADDRESS=\"" + priceOracleAddress + "\"");

    // Verificar balances finales
    const finalBalance = await deployer.provider.getBalance(deployer.address);
    console.log("\n💰 Balance final del deployer:", ethers.formatEther(finalBalance), "AVAX");
    
    return {
        koquiCoin: koquiCoinAddress,
        ticketNFT: ticketNFTAddress,
        staking: stakingAddress,
        dex: dexAddress,
        priceOracle: priceOracleAddress
    };
}

// Función para verificar contratos (opcional)
async function verifyContracts(addresses) {
    console.log("\n🔍 Para verificar contratos en SnowTrace:");
    console.log("npx hardhat verify --network fuji", addresses.koquiCoin);
    console.log("npx hardhat verify --network fuji", addresses.ticketNFT, addresses.koquiCoin, '"KoquiFI Lottery Ticket"', '"KOQUITICKET"');
    console.log("npx hardhat verify --network fuji", addresses.staking, addresses.koquiCoin, addresses.ticketNFT, "0x2eD832Ba664535e5886b75D64C46EB9a228C2610", "0x354d2f95da55398f44b7cff77da56283d9c6c829a4bdf1bbcaf2ad6a4d081f61", "1");
    console.log("npx hardhat verify --network fuji", addresses.dex, addresses.koquiCoin, "0x50b7545627a5162F82A992c33b87aDc75187B218", "0x2D99ABD9008Dc933ff5c0CD271B88309593aB921", "0x7898AcCC83587C3C55116c5230C17a6d441077C9");
    console.log("npx hardhat verify --network fuji", addresses.priceOracle);
}

// Ejecutar deployment
main()
    .then((addresses) => {
        verifyContracts(addresses);
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Error en deployment:", error);
        process.exit(1);
    });
