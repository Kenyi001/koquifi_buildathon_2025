const { ethers, run } = require("hardhat");

async function verify(contractAddress, constructorArgs = []) {
    console.log(`🔍 Verificando contrato en ${contractAddress}...`);
    
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: constructorArgs,
        });
        console.log("✅ Contrato verificado exitosamente");
        return true;
    } catch (error) {
        if (error.message.includes("Already Verified")) {
            console.log("ℹ️ Contrato ya está verificado");
            return true;
        } else if (error.message.includes("does not have bytecode")) {
            console.log("❌ Contrato no encontrado en esta red");
            return false;
        } else {
            console.error("❌ Error verificando:", error.message);
            return false;
        }
    }
}

async function main() {
    console.log("🔍 VERIFICACIÓN DE CONTRATOS EN SNOWTRACE");
    console.log("========================================");
    
    // Direcciones de nuestros contratos deployados
    const contracts = {
        koquiCoin: "0xa36d6e3A44203d21D92f2d3CA89bE6dF0809aD76",
        ticketNFT: "0x26360F225c6123904A93318703EB47187d32228E",
        staking: "0xfC105bE4cf9Cc246B582Bc3fE6Ca3316B786c53b"
    };

    console.log("\n📋 Contratos a verificar:");
    console.log(`🪙 KoquiCoin: ${contracts.koquiCoin}`);
    console.log(`🎫 TicketNFT: ${contracts.ticketNFT}`);
    console.log(`🎰 Staking: ${contracts.staking}`);

    let verified = 0;
    let total = 0;

    // 1. Verificar KoquiCoin (sin argumentos constructor)
    console.log("\n1️⃣ Verificando KoquiCoin...");
    total++;
    if (await verify(contracts.koquiCoin, [])) {
        verified++;
    }

    // 2. Verificar KoquiTicketNFT (sin argumentos constructor)
    console.log("\n2️⃣ Verificando KoquiTicketNFT...");
    total++;
    if (await verify(contracts.ticketNFT, [])) {
        verified++;
    }

    // 3. Verificar KoquiStakingDemo (con argumentos constructor)
    console.log("\n3️⃣ Verificando KoquiStakingDemo...");
    total++;
    const stakingArgs = [
        1, // VRF Subscription ID simplificado
        "0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE", // VRF Coordinator
        "0xc799bd1e3bd4d1a41cd4968997a4e03dfd2a3c7c04b695881138580163f42887", // VRF Key Hash
        contracts.koquiCoin, // KoquiCoin address
        contracts.ticketNFT  // TicketNFT address
    ];
    
    if (await verify(contracts.staking, stakingArgs)) {
        verified++;
    }

    console.log("\n🎉 VERIFICACIÓN COMPLETADA!");
    console.log("============================");
    console.log(`✅ Contratos verificados: ${verified}/${total}`);
    
    if (verified === total) {
        console.log("🏆 ¡Todos los contratos verificados exitosamente!");
    } else {
        console.log("⚠️ Algunos contratos no se pudieron verificar");
    }

    console.log("\n🔗 Enlaces Snowtrace:");
    console.log("=====================");
    console.log(`🪙 KoquiCoin: https://testnet.snowtrace.io/address/${contracts.koquiCoin}#code`);
    console.log(`🎫 TicketNFT: https://testnet.snowtrace.io/address/${contracts.ticketNFT}#code`);
    console.log(`🎰 Staking: https://testnet.snowtrace.io/address/${contracts.staking}#code`);

    console.log("\n💡 Tips:");
    console.log("========");
    console.log("• Si falla la verificación, espera unos minutos y reintenta");
    console.log("• Asegúrate de que SNOWTRACE_API_KEY esté configurado en .env");
    console.log("• Los contratos deben estar completamente sincronizados");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error.message);
        process.exit(1);
    });
