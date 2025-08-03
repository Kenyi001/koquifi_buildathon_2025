const { ethers } = require("hardhat");

async function verify(contractAddress, constructorArgs = []) {
    console.log(`🔍 Verificando contrato en ${contractAddress}...`);
    
    try {
        await hre.run("verify:verify", {
            address: contractAddress,
            constructorArguments: constructorArgs,
        });
        console.log("✅ Contrato verificado exitosamente");
    } catch (error) {
        if (error.message.includes("Already Verified")) {
            console.log("ℹ️ Contrato ya está verificado");
        } else {
            console.error("❌ Error verificando:", error.message);
        }
    }
}

async function main() {
    console.log("🔍 VERIFICACIÓN DE CONTRATOS EN FUJI");
    console.log("===================================");
    
    // Lee las direcciones del .env
    const addresses = {
        koquiCoin: process.env.KOQUICOIN_ADDRESS,
        ticketNFT: process.env.TICKET_NFT_ADDRESS,
        staking: process.env.STAKING_ADDRESS,
        dex: process.env.DEX_ADDRESS,
        priceOracle: process.env.PRICE_ORACLE_ADDRESS
    };

    if (!addresses.koquiCoin) {
        console.log("⚠️ No hay direcciones en .env");
        console.log("Primero ejecuta el deployment");
        return;
    }

    // Verificar cada contrato
    console.log("\n1️⃣ Verificando KoquiCoin...");
    await verify(addresses.koquiCoin, []);

    if (addresses.ticketNFT) {
        console.log("\n2️⃣ Verificando KoquiTicketNFT...");
        await verify(addresses.ticketNFT, []);
    }

    if (addresses.priceOracle) {
        console.log("\n3️⃣ Verificando KoquiPriceOracle...");
        await verify(addresses.priceOracle, []);
    }

    if (addresses.staking) {
        console.log("\n4️⃣ Verificando KoquiStaking...");
        const stakingArgs = [
            "39650578419738586146415071830778224814442955562269021256613850465642893401058", // VRF Subscription ID
            "0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE", // VRF Coordinator
            "0xc799bd1e3bd4d1a41cd4968997a4e03dfd2a3c7c04b695881138580163f42887", // VRF Key Hash
            addresses.koquiCoin,
            addresses.ticketNFT
        ];
        await verify(addresses.staking, stakingArgs);
    }

    if (addresses.dex) {
        console.log("\n5️⃣ Verificando KoquiDEX...");
        const dexArgs = [
            addresses.koquiCoin,
            "0x7898AcCC83587C3C55116c5230C17a6d441077b5", // USDT.e
            "0x5db0735cf88F85E78ed742215090c465979B5006", // Trader Joe Router
            "0x0000000000000000000000000000000000000001" // Mock price feed
        ];
        await verify(addresses.dex, dexArgs);
    }

    console.log("\n🎉 ¡VERIFICACIÓN COMPLETADA!");
    console.log("============================");
    console.log("🌐 Ver en Snowtrace: https://testnet.snowtrace.io/");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error.message);
        process.exit(1);
    });
