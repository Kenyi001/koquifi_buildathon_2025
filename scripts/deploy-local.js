const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 ¡Deployando KoquiFI localmente para testing!");
    
    // Obtener signers
    const [deployer, user1, user2] = await ethers.getSigners();
    console.log("👤 Deployando con:", deployer.address);
    console.log("💰 Balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

    // Para red local, usamos direcciones mock
    const mockAddress = "0x1000000000000000000000000000000000000001";

    // 1. Deploy KoquiCoin
    console.log("\n1️⃣ Deployando KoquiCoin...");
    const KoquiCoin = await ethers.getContractFactory("KoquiCoin");
    const koquiCoin = await KoquiCoin.deploy();
    await koquiCoin.waitForDeployment();
    const koquiCoinAddress = await koquiCoin.getAddress();
    console.log("✅ KoquiCoin:", koquiCoinAddress);

    // 2. Deploy KoquiPriceOracle
    console.log("\n2️⃣ Deployando KoquiPriceOracle...");
    const KoquiPriceOracle = await ethers.getContractFactory("KoquiPriceOracle");
    const priceOracle = await KoquiPriceOracle.deploy();
    await priceOracle.waitForDeployment();
    const priceOracleAddress = await priceOracle.getAddress();
    console.log("✅ KoquiPriceOracle:", priceOracleAddress);

    // 3. Deploy KoquiTicketNFT
    console.log("\n3️⃣ Deployando KoquiTicketNFT...");
    const KoquiTicketNFT = await ethers.getContractFactory("KoquiTicketNFT");
    const ticketNFT = await KoquiTicketNFT.deploy();
    await ticketNFT.waitForDeployment();
    const ticketNFTAddress = await ticketNFT.getAddress();
    console.log("✅ KoquiTicketNFT:", ticketNFTAddress);

    // 4. Deploy KoquiStaking
    console.log("\n4️⃣ Deployando KoquiStaking...");
    const KoquiStaking = await ethers.getContractFactory("KoquiStaking");
    const staking = await KoquiStaking.deploy(
        1, // subscription ID
        mockAddress, // VRF Coordinator mock
        "0x354d2f95da55398f44b7cff77da56283d9c6c829a4bdf1bbcaf2ad6a4d081f61", // Key hash
        koquiCoinAddress,
        ticketNFTAddress
    );
    await staking.waitForDeployment();
    const stakingAddress = await staking.getAddress();
    console.log("✅ KoquiStaking:", stakingAddress);

    // 5. Deploy KoquiDEX (simplificado para testing local)
    console.log("\n5️⃣ Deployando KoquiDEX...");
    const KoquiDEX = await ethers.getContractFactory("KoquiDEX");
    const dex = await KoquiDEX.deploy(
        koquiCoinAddress,
        mockAddress, // USDT mock
        mockAddress, // Router mock
        mockAddress  // Price feed mock
    );
    await dex.waitForDeployment();
    const dexAddress = await dex.getAddress();
    console.log("✅ KoquiDEX:", dexAddress);

    console.log("\n🔧 Configurando permisos...");

    // Configurar roles en KoquiCoin
    const MINTER_ROLE = await koquiCoin.MINTER_ROLE();
    const BURNER_ROLE = await koquiCoin.BURNER_ROLE();
    
    await koquiCoin.grantRole(MINTER_ROLE, dexAddress);
    await koquiCoin.grantRole(BURNER_ROLE, dexAddress);
    await koquiCoin.grantRole(MINTER_ROLE, stakingAddress);
    console.log("✅ Permisos configurados");

    console.log("\n🎉 ¡Deployment local completado!");
    console.log("\n📋 Direcciones de contratos:");
    console.log("============================");
    console.log(`🪙 KoquiCoin: ${koquiCoinAddress}`);
    console.log(`🎫 KoquiTicketNFT: ${ticketNFTAddress}`);
    console.log(`🎰 KoquiStaking: ${stakingAddress}`);
    console.log(`💱 KoquiDEX: ${dexAddress}`);
    console.log(`📊 KoquiPriceOracle: ${priceOracleAddress}`);

    console.log("\n🧪 Ejemplos de testing:");
    console.log("======================");
    console.log("1. Mint initial KOQUI tokens:");
    console.log(`   npx hardhat console --network localhost`);
    console.log(`   const coin = await ethers.getContractAt("KoquiCoin", "${koquiCoinAddress}")`);
    console.log(`   await coin.mint("${user1.address}", ethers.parseUnits("1000", 18))`);
    
    console.log("\n2. Ver balance:");
    console.log(`   await coin.balanceOf("${user1.address}")`);
    
    console.log("\n3. Mint un ticket NFT:");
    console.log(`   const nft = await ethers.getContractAt("KoquiTicketNFT", "${ticketNFTAddress}")`);
    console.log(`   await nft.mintTicket("${user1.address}", [1,2,3,4,5], 1, ethers.parseUnits("10", 18))`);

    return {
        koquiCoin: koquiCoinAddress,
        ticketNFT: ticketNFTAddress,
        staking: stakingAddress,
        dex: dexAddress,
        priceOracle: priceOracleAddress,
        users: {
            deployer: deployer.address,
            user1: user1.address,
            user2: user2.address
        }
    };
}

main()
    .then((addresses) => {
        console.log("\n✅ ¡KoquiFI listo para testing!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    });
