const { ethers } = require("hardhat");

async function main() {
    console.log("⛽ Verificando precios de gas en Fuji...");
    
    try {
        // Usar el provider de hardhat
        const gasPrice = await ethers.provider.getFeeData();
        console.log(`💰 Gas price actual: ${ethers.formatUnits(gasPrice.gasPrice, "gwei")} Gwei`);
        console.log(`� Max fee per gas: ${ethers.formatUnits(gasPrice.maxFeePerGas, "gwei")} Gwei`);
        console.log(`⚡ Max priority fee: ${ethers.formatUnits(gasPrice.maxPriorityFeePerGas, "gwei")} Gwei`);
        
        // Comparar con nuestra configuración
        const ourGasPrice = 15000000000n; // 15 Gwei
        console.log(`🔧 Nuestro gas price: ${ethers.formatUnits(ourGasPrice, "gwei")} Gwei`);
        
        if (gasPrice.gasPrice > ourGasPrice) {
            console.log("⚠️ Nuestro gas price puede ser muy bajo");
            console.log(`💡 Sugerencia: usar ${ethers.formatUnits(gasPrice.gasPrice, "gwei")} Gwei`);
        } else {
            console.log("✅ Nuestro gas price es competitivo");
        }
        
        // Estimar costos de deployment
        console.log("\n📊 ESTIMACIÓN DE COSTOS (con nuestro gas price):");
        console.log("===============================================");
        
        const contractSizes = {
            "KoquiCoinLite": 800000,    // Gas estimado
            "KoquiTicketNFT": 1200000,  // Gas estimado
            "KoquiStakingDemo": 2000000 // Gas estimado
        };
        
        let totalGas = 0;
        for (const [contract, gas] of Object.entries(contractSizes)) {
            const cost = BigInt(gas) * ourGasPrice;
            console.log(`${contract}: ${gas.toLocaleString()} gas = ${ethers.formatEther(cost)} AVAX`);
            totalGas += gas;
        }
        
        const totalCost = BigInt(totalGas) * ourGasPrice;
        console.log(`\n🎯 TOTAL ESTIMADO: ${totalGas.toLocaleString()} gas = ${ethers.formatEther(totalCost)} AVAX`);
        console.log(`💵 Costo USD aprox: $${(parseFloat(ethers.formatEther(totalCost)) * 30).toFixed(4)}`);
        
        console.log("\n💡 OPTIMIZACIONES APLICADAS:");
        console.log("============================");
        console.log("✅ Gas price reducido a 15 Gwei (era 470 Gwei)");
        console.log("✅ Optimizer runs aumentado a 1000");
        console.log("✅ Via IR habilitado");
        console.log("✅ Contratos lite creados");
        console.log("✅ Gas limit optimizado");
        
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

main();
