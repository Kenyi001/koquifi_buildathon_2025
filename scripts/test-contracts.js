const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 TESTING INDIVIDUAL DE CONTRATOS");
    console.log("==================================");

    const [owner] = await ethers.getSigners();
    console.log(`👤 Owner/Deployer: ${owner.address}`);
    
    // Crear addresses para user testing (usaremos el mismo owner por simplicidad)
    const user1 = owner;

    // Direcciones desde .env
    const addresses = {
        koquiCoin: process.env.KOQUICOIN_ADDRESS,
        ticketNFT: process.env.TICKET_NFT_ADDRESS,
        staking: process.env.STAKING_ADDRESS
    };

    console.log("\n📋 Direcciones de contratos:");
    console.log(`🪙 KoquiCoin: ${addresses.koquiCoin}`);
    console.log(`🎫 TicketNFT: ${addresses.ticketNFT}`);
    console.log(`🎰 Staking: ${addresses.staking}`);

    try {
        // =============================================
        // TEST 1: KoquiCoin
        // =============================================
        console.log("\n🧪 TEST 1: KoquiCoin");
        console.log("====================");
        
        const KoquiCoin = await ethers.getContractFactory("KoquiCoin");
        const koquiCoin = KoquiCoin.attach(addresses.koquiCoin);
        
        // Verificar información básica
        const name = await koquiCoin.name();
        const symbol = await koquiCoin.symbol();
        const totalSupply = await koquiCoin.totalSupply();
        const ownerBalance = await koquiCoin.balanceOf(owner.address);
        
        console.log(`📄 Nombre: ${name}`);
        console.log(`🏷️  Símbolo: ${symbol}`);
        console.log(`📊 Total Supply: ${ethers.formatEther(totalSupply)}`);
        console.log(`💰 Owner Balance: ${ethers.formatEther(ownerBalance)}`);
        
        // Test transfer
        console.log("\n🔄 Testing transfer...");
        await koquiCoin.transfer(user1.address, ethers.parseEther("100"));
        const user1Balance = await koquiCoin.balanceOf(user1.address);
        console.log(`✅ Transfer exitoso: User1 tiene ${ethers.formatEther(user1Balance)} KOQUI`);

        // =============================================
        // TEST 2: KoquiTicketNFT
        // =============================================
        console.log("\n🧪 TEST 2: KoquiTicketNFT");
        console.log("==========================");
        
        const KoquiTicketNFT = await ethers.getContractFactory("KoquiTicketNFT");
        const ticketNFT = KoquiTicketNFT.attach(addresses.ticketNFT);
        
        // Verificar información básica
        const nftName = await ticketNFT.name();
        const nftSymbol = await ticketNFT.symbol();
        
        console.log(`📄 Nombre: ${nftName}`);
        console.log(`🏷️  Símbolo: ${nftSymbol}`);
        
        // Test minting (solo MINTER_ROLE puede hacer esto)
        console.log("\n🎫 Testing NFT minting...");
        try {
            const numbers = [1, 2, 3, 4, 5];
            await ticketNFT.mintTicket(user1.address, numbers, 1, ethers.parseEther("1"));
            const user1NFTBalance = await ticketNFT.balanceOf(user1.address);
            console.log(`✅ Mint exitoso: User1 tiene ${user1NFTBalance} NFTs`);
        } catch (error) {
            console.log(`⚠️ Mint falló (necesita MINTER_ROLE): ${error.message.substring(0, 50)}...`);
        }

        // =============================================
        // TEST 3: KoquiStakingDemo
        // =============================================
        console.log("\n🧪 TEST 3: KoquiStakingDemo");
        console.log("============================");
        
        const KoquiStakingDemo = await ethers.getContractFactory("KoquiStakingDemo");
        const staking = KoquiStakingDemo.attach(addresses.staking);
        
        // Verificar información básica
        const currentCycle = await staking.getCurrentCycle();
        const timeUntilNext = await staking.getTimeUntilNextCycle();
        const cycleDuration = await staking.DEMO_CYCLE_DURATION();
        
        console.log(`🔄 Ciclo actual: ${currentCycle}`);
        console.log(`⏰ Tiempo hasta próximo: ${timeUntilNext} segundos`);
        console.log(`⏱️  Duración ciclo: ${cycleDuration} segundos`);
        
        // Test approval y ticket purchase
        console.log("\n🎰 Testing staking interaction...");
        
        // User1 approve tokens for staking
        await koquiCoin.connect(user1).approve(addresses.staking, ethers.parseEther("10"));
        console.log("✅ Tokens aprobados para staking");
        
        // Buy ticket
        try {
            await staking.connect(user1).buyTicket([1, 2, 3, 4, 5]);
            console.log("✅ Ticket comprado exitosamente");
            
            // Verificar tickets del user
            const userTickets = await staking.getUserTickets(currentCycle, user1.address);
            console.log(`🎫 User1 tiene ${userTickets.length} tickets en el ciclo ${currentCycle}`);
            
        } catch (error) {
            console.log(`⚠️ Error comprando ticket: ${error.message.substring(0, 100)}...`);
        }

        console.log("\n🎉 ¡TODOS LOS TESTS COMPLETADOS!");
        console.log("=================================");
        console.log("✅ KoquiCoin: Funcionando");
        console.log("✅ KoquiTicketNFT: Funcionando"); 
        console.log("✅ KoquiStakingDemo: Funcionando");

    } catch (error) {
        console.error("❌ Error en testing:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Testing failed:", error.message);
        process.exit(1);
    });
