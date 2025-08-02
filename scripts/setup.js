const { ethers } = require("hardhat");

// Direcciones de los contratos deployados (actualizar después del deployment)
const CONTRACTS = {
    koquiCoin: "", // Actualizar con la dirección real
    ticketNFT: "", // Actualizar con la dirección real
    staking: "",   // Actualizar con la dirección real
    dex: "",       // Actualizar con la dirección real
    priceOracle: "" // Actualizar con la dirección real
};

async function setupKoquiFI() {
    console.log("🔧 Configurando KoquiFI después del deployment...");
    
    const [deployer] = await ethers.getSigners();
    console.log("Configurando con la cuenta:", deployer.address);

    // Conectar a los contratos
    const koquiCoin = await ethers.getContractAt("KoquiCoin", CONTRACTS.koquiCoin);
    const ticketNFT = await ethers.getContractAt("KoquiTicketNFT", CONTRACTS.ticketNFT);
    const staking = await ethers.getContractAt("KoquiStaking", CONTRACTS.staking);
    const dex = await ethers.getContractAt("KoquiDEX", CONTRACTS.dex);
    const priceOracle = await ethers.getContractAt("KoquiPriceOracle", CONTRACTS.priceOracle);

    console.log("\n1️⃣ Configurando supply inicial y distribución...");
    
    // Mint tokens iniciales para liquidez y pruebas
    const initialMint = ethers.parseUnits("1000000", 18); // 1M tokens para liquidez
    await koquiCoin.mint(deployer.address, initialMint);
    console.log("✅ Minted", ethers.formatUnits(initialMint, 18), "KOQUI para liquidez inicial");

    console.log("\n2️⃣ Configurando parámetros del staking...");
    
    // Configurar precio de ticket (ejemplo: 10 KOQUI)
    const ticketPrice = ethers.parseUnits("10", 18);
    await staking.setTicketPrice(ticketPrice);
    console.log("✅ Precio de ticket configurado:", ethers.formatUnits(ticketPrice, 18), "KOQUI");

    // Configurar premios (50%, 30%, 20% del pool)
    await staking.setPrizeDistribution([5000, 3000, 2000]); // en basis points
    console.log("✅ Distribución de premios configurada");

    console.log("\n3️⃣ Configurando Oracle de precios...");
    
    try {
        // Actualizar precios iniciales
        await priceOracle.updatePrices(["USDT", "AVAX"]);
        console.log("✅ Precios actualizados en Oracle");
    } catch (error) {
        console.log("⚠️ Error actualizando precios:", error.message);
    }

    console.log("\n4️⃣ Configurando DEX...");
    
    // Aprobar tokens para el DEX
    const dexAllowance = ethers.parseUnits("500000", 18); // 500K KOQUI
    await koquiCoin.approve(dex.target, dexAllowance);
    console.log("✅ Aprobación configurada para el DEX");

    console.log("\n5️⃣ Configurando primera semana de lotería...");
    
    try {
        // Iniciar la primera semana
        await staking.startNewWeek();
        console.log("✅ Primera semana de lotería iniciada");
    } catch (error) {
        console.log("⚠️ Error iniciando semana:", error.message);
    }

    console.log("\n6️⃣ Configurando permisos adicionales...");
    
    // Roles para el Oracle
    const ORACLE_UPDATER_ROLE = await priceOracle.ORACLE_UPDATER_ROLE();
    await priceOracle.grantRole(ORACLE_UPDATER_ROLE, deployer.address);
    console.log("✅ Permisos de Oracle configurados");

    console.log("\n7️⃣ Verificando configuración...");
    
    // Verificar balances y configuración
    const koquiBalance = await koquiCoin.balanceOf(deployer.address);
    const totalSupply = await koquiCoin.totalSupply();
    const currentWeek = await staking.currentWeek();
    
    console.log("📊 Estado actual:");
    console.log("- Balance KOQUI del deployer:", ethers.formatUnits(koquiBalance, 18));
    console.log("- Supply total KOQUI:", ethers.formatUnits(totalSupply, 18));
    console.log("- Semana actual de lotería:", currentWeek.toString());

    console.log("\n✅ ¡Configuración completada!");
    
    return {
        koquiBalance: ethers.formatUnits(koquiBalance, 18),
        totalSupply: ethers.formatUnits(totalSupply, 18),
        currentWeek: currentWeek.toString()
    };
}

// Función para testing básico del sistema
async function testBasicFunctionality() {
    console.log("\n🧪 Ejecutando pruebas básicas...");
    
    const [deployer] = await ethers.getSigners();
    
    // Conectar a los contratos
    const koquiCoin = await ethers.getContractAt("KoquiCoin", CONTRACTS.koquiCoin);
    const ticketNFT = await ethers.getContractAt("KoquiTicketNFT", CONTRACTS.ticketNFT);
    const staking = await ethers.getContractAt("KoquiStaking", CONTRACTS.staking);

    try {
        console.log("\n🎫 Comprando ticket de prueba...");
        
        // Aprobar tokens para comprar ticket
        const ticketPrice = await staking.ticketPrice();
        await koquiCoin.approve(staking.target, ticketPrice);
        
        // Comprar un ticket con números [1, 2, 3, 4, 5]
        await staking.buyTicket([1, 2, 3, 4, 5]);
        
        const ticketBalance = await ticketNFT.balanceOf(deployer.address);
        console.log("✅ Ticket comprado. Balance NFT:", ticketBalance.toString());
        
        // Verificar staking
        const stakedAmount = await staking.stakedAmount(deployer.address);
        console.log("✅ Cantidad stakeada:", ethers.formatUnits(stakedAmount, 18), "KOQUI");
        
    } catch (error) {
        console.log("⚠️ Error en prueba:", error.message);
    }
}

// Función para mostrar información útil para el frontend
async function generateFrontendConfig() {
    console.log("\n📱 Configuración para Frontend:");
    console.log("===============================");
    
    const config = {
        contracts: CONTRACTS,
        network: {
            name: "Avalanche Fuji Testnet",
            chainId: 43113,
            rpc: "https://api.avax-test.network/ext/bc/C/rpc",
            explorer: "https://testnet.snowtrace.io"
        },
        tokens: {
            KOQUI: {
                address: CONTRACTS.koquiCoin,
                decimals: 18,
                symbol: "KOQUI"
            },
            USDT: {
                address: "0x50b7545627a5162F82A992c33b87aDc75187B218",
                decimals: 6,
                symbol: "USDT.e"
            }
        }
    };
    
    console.log(JSON.stringify(config, null, 2));
    
    return config;
}

// Script principal
async function main() {
    if (!CONTRACTS.koquiCoin) {
        console.log("❌ Por favor actualiza las direcciones de los contratos en CONTRACTS al inicio del archivo");
        return;
    }
    
    try {
        await setupKoquiFI();
        await testBasicFunctionality();
        await generateFrontendConfig();
        
        console.log("\n🎉 ¡Sistema KoquiFI configurado y listo para usar!");
        
    } catch (error) {
        console.error("❌ Error en configuración:", error);
    }
}

// Función de ayuda para obtener información del sistema
async function getSystemInfo() {
    console.log("📊 Información del Sistema KoquiFI");
    console.log("===================================");
    
    if (!CONTRACTS.koquiCoin) {
        console.log("❌ Contratos no configurados");
        return;
    }
    
    const koquiCoin = await ethers.getContractAt("KoquiCoin", CONTRACTS.koquiCoin);
    const staking = await ethers.getContractAt("KoquiStaking", CONTRACTS.staking);
    const dex = await ethers.getContractAt("KoquiDEX", CONTRACTS.dex);
    
    try {
        const totalSupply = await koquiCoin.totalSupply();
        const currentWeek = await staking.currentWeek();
        const weekEndTime = await staking.weekEndTime();
        const prizePool = await staking.totalPrizePool();
        const dexStats = await dex.getDEXStats();
        
        console.log("🪙 KOQUI Total Supply:", ethers.formatUnits(totalSupply, 18));
        console.log("🎰 Semana actual:", currentWeek.toString());
        console.log("⏰ Fin de semana:", new Date(Number(weekEndTime) * 1000).toLocaleString());
        console.log("🏆 Prize Pool:", ethers.formatUnits(prizePool, 18), "KOQUI");
        console.log("💱 DEX Volume USDT:", ethers.formatUnits(dexStats[0], 6));
        console.log("💱 DEX Volume KOQUI:", ethers.formatUnits(dexStats[1], 18));
        
    } catch (error) {
        console.log("⚠️ Error obteniendo información:", error.message);
    }
}

// Exportar funciones para uso independiente
module.exports = {
    setupKoquiFI,
    testBasicFunctionality,
    generateFrontendConfig,
    getSystemInfo
};

// Ejecutar si se llama directamente
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}
