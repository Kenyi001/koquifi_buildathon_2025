const { ethers } = require("hardhat");

async function setupContracts() {
    console.log("🔧 Configurando contratos para el dashboard...");
    
    const [deployer] = await ethers.getSigners();
    console.log("👤 Usando cuenta:", deployer.address);
    
    // Direcciones de contratos desplegados
    const addresses = {
        KOQUI_COIN: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
        TICKET_NFT: "0x0165878A594ca255338adfa4d48449f69242Eb8F"
    };
    
    try {
        // Conectar a KoquiCoin
        const KoquiCoin = await ethers.getContractFactory("KoquiCoin");
        const koquiCoin = KoquiCoin.attach(addresses.KOQUI_COIN);
        
        console.log("📄 Verificando KoquiCoin...");
        
        // Verificar que el deployer tenga permisos
        const MINTER_ROLE = await koquiCoin.MINTER_ROLE();
        const BURNER_ROLE = await koquiCoin.BURNER_ROLE();
        
        const hasMinterRole = await koquiCoin.hasRole(MINTER_ROLE, deployer.address);
        const hasBurnerRole = await koquiCoin.hasRole(BURNER_ROLE, deployer.address);
        
        console.log("🔑 Minter Role:", hasMinterRole);
        console.log("🔑 Burner Role:", hasBurnerRole);
        
        if (!hasMinterRole) {
            console.log("🔧 Otorgando Minter Role...");
            await koquiCoin.grantRole(MINTER_ROLE, deployer.address);
        }
        
        if (!hasBurnerRole) {
            console.log("🔧 Otorgando Burner Role...");
            await koquiCoin.grantRole(BURNER_ROLE, deployer.address);
        }
        
        // Verificar balance inicial
        const balance = await koquiCoin.balanceOf(deployer.address);
        const totalSupply = await koquiCoin.totalSupply();
        
        console.log("💰 Balance actual:", ethers.formatEther(balance), "KOQUI");
        console.log("📊 Total Supply:", ethers.formatEther(totalSupply), "KOQUI");
        
        // Si no hay tokens, mintear algunos para pruebas
        if (balance == 0) {
            console.log("🎯 Minteando tokens iniciales...");
            const tx = await koquiCoin.mint(deployer.address, ethers.parseEther("100000"));
            await tx.wait();
            console.log("✅ 100,000 KOQUI minteados");
        }
        
        // Verificar TicketNFT
        console.log("📄 Verificando TicketNFT...");
        const TicketNFT = await ethers.getContractFactory("KoquiTicketNFT");
        const ticketNFT = TicketNFT.attach(addresses.TICKET_NFT);
        
        const currentWeek = await ticketNFT.currentWeekId();
        const totalTickets = await ticketNFT.totalSupply();
        
        console.log("📅 Semana actual:", currentWeek.toString());
        console.log("🎫 Total tickets:", totalTickets.toString());
        
        console.log("✅ Contratos configurados correctamente");
        console.log("🌐 Dashboard listo en: http://localhost:3001/dashboard-final.html");
        
    } catch (error) {
        console.error("❌ Error configurando contratos:", error.message);
    }
}

setupContracts();
