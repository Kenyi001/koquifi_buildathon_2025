const { ethers } = require("hardhat");

async function main() {
    console.log("🔥 DEMO: SISTEMA DE QUEMA Y MINT AUTOMÁTICO");
    console.log("===========================================");
    
    const [deployer] = await ethers.getSigners();
    
    // Direcciones de contratos
    const KOQUI_COIN_ADDRESS = "0xb45AC6f0cF521ff307E7a273cC05973EFbbcdcdf";
    const TOKEN_MANAGER_ADDRESS = "0x025c37599B5b154892eA3525d24c8CF1e8e98c55";
    
    // Conectar a contratos
    const koquiCoin = await ethers.getContractAt("KoquiCoin", KOQUI_COIN_ADDRESS);
    const tokenManager = await ethers.getContractAt("KoquiTokenManager", TOKEN_MANAGER_ADDRESS);
    
    console.log("📊 ESTADO INICIAL DEL SISTEMA");
    console.log("==============================");
    
    // Obtener estado inicial
    const initialSupply = await koquiCoin.totalSupply();
    const initialPrice = await tokenManager.getCurrentPrice();
    const [shouldIntervene, reason, price] = await tokenManager.shouldInterveneNow();
    const systemStatus = await tokenManager.getSystemStatus();
    
    console.log(`💰 Supply inicial: ${ethers.formatEther(initialSupply)} KOQUI`);
    console.log(`💲 Precio simulado: $${(Number(initialPrice.price) / 1e8).toFixed(4)}`);
    console.log(`🎯 Precio objetivo: $${(Number(systemStatus[0]) / 1e8).toFixed(2)}`);
    console.log(`⚡ Tolerancia: ±${(Number(systemStatus[2]) / 1e6).toFixed(1)}%`);
    console.log(`🔄 Puede intervenir: ${shouldIntervene ? '✅' : '❌'}`);
    console.log(`📝 Razón: ${reason}`);
    
    console.log("\n🎮 DEMO DE FUNCIONAMIENTO");
    console.log("==========================");
    
    // Simular escenarios
    console.log("\n1️⃣ ESCENARIO: Precio alto -> Quemar tokens");
    console.log("--------------------------------------------");
    
    try {
        console.log("🔥 Intentando forzar quema...");
        const burnTx = await tokenManager.forceIntervention(true); // true = burn
        await burnTx.wait();
        
        // Ver resultado
        const newSupply = await koquiCoin.totalSupply();
        const newPrice = await tokenManager.getCurrentPrice();
        const metrics = await tokenManager.getSupplyMetrics();
        
        console.log(`✅ Quema ejecutada!`);
        console.log(`   ├─ Supply anterior: ${ethers.formatEther(initialSupply)} KOQUI`);
        console.log(`   ├─ Supply nuevo: ${ethers.formatEther(newSupply)} KOQUI`);
        console.log(`   ├─ Tokens quemados: ${ethers.formatEther(initialSupply - newSupply)} KOQUI`);
        console.log(`   ├─ Precio nuevo: $${(Number(newPrice.price) / 1e8).toFixed(4)}`);
        console.log(`   └─ Total quemado histórico: ${ethers.formatEther(metrics[1])} KOQUI`);
        
    } catch (error) {
        console.log(`❌ Error en quema: ${error.message}`);
        if (error.message.includes("Cooldown")) {
            console.log("💡 Esto es normal - hay un cooldown de 5 minutos entre intervenciones");
        }
    }
    
    console.log("\n⏰ ESPERANDO COOLDOWN...");
    console.log("=========================");
    
    // Verificar próxima intervención disponible
    const nextIntervention = Number(systemStatus[6]);
    const now = Math.floor(Date.now() / 1000);
    const waitTime = nextIntervention - now;
    
    if (waitTime > 0) {
        console.log(`⏳ Próxima intervención disponible en: ${waitTime} segundos`);
        console.log(`⏰ Timestamp: ${new Date(nextIntervention * 1000).toLocaleString()}`);
    } else {
        console.log("✅ Intervención disponible ahora");
    }
    
    console.log("\n2️⃣ ESCENARIO: Simular diferentes precios");
    console.log("------------------------------------------");
    
    // Mostrar cómo funciona el algoritmo de precios
    const supplies = [
        ethers.parseEther("50000000"),  // 50M - precio alto
        ethers.parseEther("100000000"), // 100M - precio base
        ethers.parseEther("200000000"), // 200M - precio bajo
        ethers.parseEther("500000000")  // 500M - precio muy bajo
    ];
    
    console.log("📈 Simulación de precios según supply:");
    for (const supply of supplies) {
        const basePrice = 1e8; // $1.00 en formato de 8 decimales
        const initialSupply = 100_000_000; // 100M inicial
        const supplyInEther = Number(ethers.formatEther(supply));
        const simulatedPrice = (basePrice * initialSupply) / supplyInEther;
        console.log(`   ├─ Supply: ${ethers.formatEther(supply).padStart(10)} KOQUI -> Precio: $${(simulatedPrice / 1e8).toFixed(4)}`);
    }
    
    console.log("\n📊 MÉTRICAS DEL SISTEMA");
    console.log("========================");
    
    const finalMetrics = await tokenManager.getSupplyMetrics();
    const finalSupply = await koquiCoin.totalSupply();
    const finalPrice = await tokenManager.getCurrentPrice();
    
    console.log(`📊 Supply actual: ${ethers.formatEther(finalSupply)} KOQUI`);
    console.log(`💲 Precio actual: $${(Number(finalPrice.price) / 1e8).toFixed(4)}`);
    console.log(`🔥 Total quemado: ${ethers.formatEther(finalMetrics[1])} KOQUI`);
    console.log(`💰 Total minteado: ${ethers.formatEther(finalMetrics[2])} KOQUI`);
    console.log(`🔄 Intervenciones: ${finalMetrics[3]}`);
    
    console.log("\n🎯 CÓMO FUNCIONA EL SISTEMA");
    console.log("===========================");
    console.log("🔸 Cuando el precio SUBE por encima de $1.05:");
    console.log("   ├─ Se QUEMAN tokens automáticamente");
    console.log("   ├─ Reduce el supply -> Aumenta escasez");
    console.log("   └─ Tiende a estabilizar el precio");
    console.log("");
    console.log("🔸 Cuando el precio BAJA por debajo de $0.95:");
    console.log("   ├─ Se MINTEAN nuevos tokens");
    console.log("   ├─ Aumenta el supply -> Reduce escasez");
    console.log("   └─ Tiende a estabilizar el precio");
    console.log("");
    console.log("🔸 Protecciones incluidas:");
    console.log("   ├─ Supply mínimo: 50M tokens");
    console.log("   ├─ Supply máximo: 500M tokens");
    console.log("   ├─ Cooldown: 5 minutos entre intervenciones");
    console.log("   └─ Tasas limitadas: max 3% quema, max 1% mint");
    
    console.log("\n🚀 INTEGRACIÓN CON BUILDATHON");
    console.log("==============================");
    console.log("✅ Sistema de tokenomics avanzado implementado");
    console.log("✅ Estabilización automática de precios");
    console.log("✅ Protección contra volatilidad extrema");
    console.log("✅ Métricas en tiempo real disponibles");
    console.log("✅ Lista para integrar con price feeds reales");
    
    console.log("\n🔗 ENLACES DEL SISTEMA");
    console.log("======================");
    console.log(`🪙 KoquiCoin: https://testnet.snowtrace.io/address/${KOQUI_COIN_ADDRESS}`);
    console.log(`🔧 TokenManager: https://testnet.snowtrace.io/address/${TOKEN_MANAGER_ADDRESS}`);
    
    console.log("\n💡 PRÓXIMOS PASOS PARA PRODUCCIÓN");
    console.log("==================================");
    console.log("1. 🔗 Conectar a Chainlink Price Feeds reales");
    console.log("2. 📊 Integrar con Chainlink Automation");
    console.log("3. 🎯 Ajustar parámetros según mercado");
    console.log("4. 🛡️ Auditoría de seguridad completa");
    console.log("5. 🌐 Deploy en Avalanche Mainnet");
}

main()
    .then(() => {
        console.log("\n🎉 DEMO COMPLETADO!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Error en demo:", error);
        process.exit(1);
    });
