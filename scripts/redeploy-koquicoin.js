const { ethers, run } = require("hardhat");

async function main() {
    console.log("🚀 RE-DEPLOYING KOQUICOIN PARA VERIFICACIÓN");
    console.log("============================================");
    
    const [deployer] = await ethers.getSigners();
    console.log(`👤 Deployer: ${deployer.address}`);
    
    // Verificar balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} AVAX`);
    
    if (parseFloat(ethers.formatEther(balance)) < 0.1) {
        console.log("❌ Balance insuficiente. Necesitas al menos 0.1 AVAX");
        process.exit(1);
    }

    try {
        console.log("\n📝 Compilando contratos...");
        await run("compile");
        
        console.log("\n🏗️ Desplegando KoquiCoin...");
        const KoquiCoin = await ethers.getContractFactory("KoquiCoin");
        
        // Deploy con configuraciones específicas para verificación
        const koquiCoin = await KoquiCoin.deploy({
            gasLimit: 2000000,
            gasPrice: ethers.parseUnits("15", "gwei")
        });
        
        await koquiCoin.waitForDeployment();
        const address = await koquiCoin.getAddress();
        
        console.log(`✅ KoquiCoin desplegado en: ${address}`);
        
        // Esperar confirmaciones para verificación
        console.log("\n⏳ Esperando confirmaciones para verificación...");
        await koquiCoin.deploymentTransaction().wait(5);
        
        // Verificar funcionalidad básica
        console.log("\n🔍 Verificando funcionalidad...");
        const name = await koquiCoin.name();
        const symbol = await koquiCoin.symbol();
        const totalSupply = await koquiCoin.totalSupply();
        const ownerBalance = await koquiCoin.balanceOf(deployer.address);
        
        console.log(`   ├─ Nombre: ${name}`);
        console.log(`   ├─ Símbolo: ${symbol}`);
        console.log(`   ├─ Supply Total: ${ethers.formatEther(totalSupply)} tokens`);
        console.log(`   └─ Balance Owner: ${ethers.formatEther(ownerBalance)} tokens`);
        
        // Intentar verificación inmediata
        console.log("\n🔍 Iniciando verificación en Snowtrace...");
        try {
            await run("verify:verify", {
                address: address,
                constructorArguments: [], // Sin argumentos constructor
            });
            console.log("✅ Contrato verificado exitosamente!");
        } catch (verifyError) {
            if (verifyError.message.includes("Already Verified")) {
                console.log("ℹ️ Contrato ya está verificado");
            } else {
                console.log("⚠️ Error en verificación inmediata:", verifyError.message);
                console.log("💡 Intenta verificar manualmente en unos minutos:");
                console.log(`   npx hardhat verify --network fuji ${address}`);
            }
        }
        
        console.log("\n🎉 DEPLOYMENT COMPLETADO");
        console.log("==========================");
        console.log(`🪙 Nuevo KoquiCoin: ${address}`);
        console.log(`🔗 Snowtrace: https://testnet.snowtrace.io/address/${address}`);
        
        // Actualizar direcciones para nuevos deployments
        console.log("\n📋 PRÓXIMOS PASOS:");
        console.log("==================");
        console.log("1. ✅ Actualizar backend con nueva dirección");
        console.log("2. ✅ Re-deployar contratos que dependan de KoquiCoin");
        console.log("3. ✅ Actualizar frontend con nuevas direcciones");
        console.log("4. ✅ Transferir tokens para testing");
        
        // Preparar script de actualización
        const updateConfig = {
            oldKoquiCoin: "0xa36d6e3A44203d21D92f2d3CA89bE6dF0809aD76",
            newKoquiCoin: address,
            timestamp: new Date().toISOString(),
            deployer: deployer.address
        };
        
        console.log("\n📄 Configuración de actualización:");
        console.log(JSON.stringify(updateConfig, null, 2));
        
        return {
            koquiCoin: address,
            deployer: deployer.address,
            success: true
        };
        
    } catch (error) {
        console.error("❌ Error en deployment:", error.message);
        process.exit(1);
    }
}

main()
    .then((result) => {
        console.log("\n🏆 DEPLOYMENT EXITOSO!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Error fatal:", error);
        process.exit(1);
    });
