const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 DEPLOYING KOQUI TOKEN MANAGER");
    console.log("================================");
    
    const [deployer] = await ethers.getSigners();
    console.log(`👤 Deployer: ${deployer.address}`);
    
    // Direcciones existentes
    const KOQUI_COIN_ADDRESS = "0xb45AC6f0cF521ff307E7a273cC05973EFbbcdcdf";
    
    console.log(`🪙 KoquiCoin: ${KOQUI_COIN_ADDRESS}`);
    console.log(`📊 Precio: Simulado basado en supply (para MVP)`);
    
    try {
        console.log("\n🏗️ Desplegando KoquiTokenManager...");
        const KoquiTokenManager = await ethers.getContractFactory("KoquiTokenManager");
        
        const tokenManager = await KoquiTokenManager.deploy(
            KOQUI_COIN_ADDRESS,
            {
                gasLimit: 3000000,
                gasPrice: ethers.parseUnits("15", "gwei")
            }
        );
        
        await tokenManager.waitForDeployment();
        const managerAddress = await tokenManager.getAddress();
        
        console.log(`✅ KoquiTokenManager desplegado en: ${managerAddress}`);
        
        // Esperar confirmaciones
        console.log("\n⏳ Esperando confirmaciones...");
        await tokenManager.deploymentTransaction().wait(3);
        
        // Configurar permisos en KoquiCoin
        console.log("\n🔑 Configurando permisos...");
        const koquiCoin = await ethers.getContractAt("KoquiCoin", KOQUI_COIN_ADDRESS);
        
        // Dar rol MINTER al TokenManager
        const MINTER_ROLE = await koquiCoin.MINTER_ROLE();
        const BURNER_ROLE = await koquiCoin.BURNER_ROLE();
        
        console.log("   ├─ Otorgando rol MINTER...");
        const mintTx = await koquiCoin.grantRole(MINTER_ROLE, managerAddress);
        await mintTx.wait();
        
        console.log("   ├─ Otorgando rol BURNER...");
        const burnTx = await koquiCoin.grantRole(BURNER_ROLE, managerAddress);
        await burnTx.wait();
        
        // Transferir algunos tokens al manager para quemas
        console.log("   └─ Transfiriendo tokens para gestión...");
        const transferAmount = ethers.parseEther("1000000"); // 1M tokens
        const transferTx = await koquiCoin.transfer(managerAddress, transferAmount);
        await transferTx.wait();
        
        // Verificar configuración
        console.log("\n🔍 Verificando configuración...");
        const hasMinterRole = await koquiCoin.hasRole(MINTER_ROLE, managerAddress);
        const hasBurnerRole = await koquiCoin.hasRole(BURNER_ROLE, managerAddress);
        const managerBalance = await koquiCoin.balanceOf(managerAddress);
        
        console.log(`   ├─ Rol MINTER: ${hasMinterRole ? '✅' : '❌'}`);
        console.log(`   ├─ Rol BURNER: ${hasBurnerRole ? '✅' : '❌'}`);
        console.log(`   └─ Balance: ${ethers.formatEther(managerBalance)} KOQUI`);
        
        // Verificar estado inicial
        console.log("\n📊 Estado inicial del sistema:");
        const currentPrice = await tokenManager.getCurrentPrice();
        const supplyMetrics = await tokenManager.getSupplyMetrics();
        const [shouldIntervene, reason] = await tokenManager.shouldInterveneNow();
        
        console.log(`   ├─ Precio actual: $${(Number(currentPrice.price) / 1e8).toFixed(4)}`);
        console.log(`   ├─ Supply actual: ${ethers.formatEther(supplyMetrics[0])} tokens`);
        console.log(`   ├─ Necesita intervención: ${shouldIntervene ? '✅' : '❌'}`);
        console.log(`   └─ Razón: ${reason}`);
        
        console.log("\n🎉 DEPLOYMENT COMPLETADO!");
        console.log("==========================");
        console.log(`🔧 TokenManager: ${managerAddress}`);
        console.log(`🔗 Snowtrace: https://testnet.snowtrace.io/address/${managerAddress}`);
        
        console.log("\n📋 CONFIGURACIÓN DEL SISTEMA:");
        console.log("==============================");
        console.log("🎯 Precio objetivo: $1.00");
        console.log("⚡ Tolerancia: ±5%");
        console.log("🔥 Tasa de quema: 1% cuando precio > $1.05");
        console.log("💰 Tasa de mint: 0.5% cuando precio < $0.95");
        console.log("⏰ Cooldown: 1 hora entre intervenciones");
        console.log("📊 Supply min: 50M tokens");
        console.log("📈 Supply max: 500M tokens");
        
        console.log("\n🚀 PRÓXIMOS PASOS:");
        console.log("==================");
        console.log("1. ✅ Registrar upkeep en Chainlink Automation");
        console.log("2. ✅ Monitorear precios y supply");
        console.log("3. ✅ Actualizar dashboard con métricas");
        console.log("4. ✅ Probar intervenciones manuales");
        
        return {
            tokenManager: managerAddress,
            koquiCoin: KOQUI_COIN_ADDRESS,
            success: true
        };
        
    } catch (error) {
        console.error("❌ Error en deployment:", error.message);
        process.exit(1);
    }
}

main()
    .then((result) => {
        console.log("\n🏆 TOKEN MANAGER DEPLOYADO EXITOSAMENTE!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Error fatal:", error);
        process.exit(1);
    });
