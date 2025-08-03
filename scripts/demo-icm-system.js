// ==============================================
// 🚀 Demo Script: ICM-ICTT Complete Flow
// Google OAuth + Wallet Management System
// ==============================================

const { icmManager } = require('../services/icm-manager');

async function runICMDemo() {
    console.log('\n🔐 ============================================');
    console.log('🚀 KoquiFI ICM-ICTT System Demo');
    console.log('   Identity & Wallet Management');
    console.log('🔐 ============================================\n');

    // 📧 1. Simulate Google OAuth Registration
    console.log('📧 1. Simulando registro con Google OAuth...');
    
    const googleUser1 = {
        id: "google_123456",
        email: "juan.perez@gmail.com",
        name: "Juan Pérez",
        picture: "https://lh3.googleusercontent.com/a/default-user",
        email_verified: true
    };

    const mockWallet1 = "0x742d35Cc6935C05B57BA4f8a9F7F4b3e7aDF43F5";
    
    const result1 = await icmManager.registerUserWithGoogle(googleUser1, mockWallet1);
    
    if (result1.success) {
        console.log('✅ Google user registered:', result1.user.email);
        console.log('   Session ID:', result1.sessionId);
        console.log('   Wallet:', result1.user.walletAddress);
        console.log('   New user?', result1.isNewUser);
    }

    // 🔗 2. Simulate Wallet Connection
    console.log('\n🔗 2. Simulando conexión de billetera existente...');
    
    const existingWallet = "0x8888888888888888888888888888888888888888";
    
    const result2 = await icmManager.registerUserWithWallet(existingWallet);
    
    if (result2.success) {
        console.log('✅ Wallet user registered:', result2.user.name);
        console.log('   Session ID:', result2.sessionId);
        console.log('   Wallet:', result2.user.walletAddress);
        console.log('   New user?', result2.isNewUser);
    }

    // 📧 3. Simulate Google user login (existing)
    console.log('\n📧 3. Simulando login de usuario Google existente...');
    
    const result3 = await icmManager.registerUserWithGoogle(googleUser1, mockWallet1);
    
    if (result3.success) {
        console.log('✅ Existing Google user logged in:', result3.user.email);
        console.log('   Session ID:', result3.sessionId);
        console.log('   New user?', result3.isNewUser);
    }

    // 🎫 4. Simulate ticket purchases
    console.log('\n🎫 4. Simulando compras de tickets...');
    
    const users = icmManager.getAllUsers();
    
    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const ticketId = `TICKET_${Date.now()}_${i}`;
        const numbers = [1, 15, 23, 31, 42];
        const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
        
        const ticketResult = await icmManager.recordTicketPurchase(
            user.id, 
            ticketId, 
            numbers, 
            txHash
        );
        
        if (ticketResult.success) {
            console.log(`✅ Ticket registered for ${user.name}: ${ticketId}`);
        }
    }

    // 💰 5. Simulate balance updates
    console.log('\n💰 5. Simulando actualización de balances...');
    
    const usersFromDatabase = icmManager.getAllUsers();
    
    for (const userData of usersFromDatabase) {
        const mockBalance = (Math.random() * 10000).toFixed(2);
        // Find user in database and update
        const userInDb = icmManager.findUserByWallet(userData.walletAddress);
        if (userInDb) {
            userInDb.updateBalance(parseFloat(mockBalance));
            console.log(`💰 ${userInDb.name}: ${mockBalance} KOQUI`);
        }
    }

    // 📊 6. Show user statistics
    console.log('\n📊 6. Estadísticas de usuarios:');
    
    const updatedUsers = icmManager.getAllUsers();
    
    for (const user of updatedUsers) {
        const stats = icmManager.getUserStats(user.id);
        console.log(`\n👤 ${user.name}:`);
        console.log(`   📧 Email: ${user.email || 'N/A'}`);
        console.log(`   🔗 Tipo: ${user.loginType}`);
        console.log(`   💰 Balance: ${stats.userBalance} KOQUI`);
        console.log(`   🎫 Tickets: ${stats.userTickets}`);
        console.log(`   📅 Miembro desde: ${new Date(stats.memberSince).toLocaleDateString()}`);
        console.log(`   ⚡ Última actividad: ${new Date(stats.lastActivity).toLocaleString()}`);
    }

    // 🏢 7. System overview
    console.log('\n🏢 7. Resumen del sistema:');
    const allUsers = icmManager.getAllUsers();
    const googleUsers = allUsers.filter(u => u.loginType === 'google');
    const walletUsers = allUsers.filter(u => u.loginType === 'wallet');
    const totalTickets = allUsers.reduce((sum, u) => sum + u.ticketsOwned.length, 0);
    const totalBalance = allUsers.reduce((sum, u) => sum + u.koquiBalance, 0);
    
    console.log(`👥 Total de usuarios: ${allUsers.length}`);
    console.log(`📧 Usuarios Google: ${googleUsers.length}`);
    console.log(`🔗 Usuarios Wallet: ${walletUsers.length}`);
    console.log(`🎫 Total tickets vendidos: ${totalTickets}`);
    console.log(`💰 Balance total del ecosistema: ${totalBalance.toFixed(2)} KOQUI`);

    // 🔄 8. Session management demo
    console.log('\n🔄 8. Demostración de manejo de sesiones:');
    
    const firstUser = allUsers[0];
    if (firstUser) {
        // Get user by session
        const sessionData = icmManager.getUserBySession(result1.sessionId);
        if (sessionData) {
            console.log(`✅ Sesión válida para: ${sessionData.name}`);
        }
        
        // Logout
        const logoutSuccess = icmManager.logout(result1.sessionId);
        console.log(`🚪 Logout: ${logoutSuccess ? 'exitoso' : 'falló'}`);
        
        // Try to get user after logout
        const expiredSession = icmManager.getUserBySession(result1.sessionId);
        console.log(`❌ Sesión después de logout: ${expiredSession ? 'válida' : 'inválida'}`);
    }

    // 💾 9. Data export/import demo
    console.log('\n💾 9. Demostración de exportación/importación de datos:');
    
    const exportedData = icmManager.exportData();
    console.log(`📤 Datos exportados: ${exportedData.users.length} usuarios, ${exportedData.sessions.length} sesiones`);
    
    // Clear and import
    icmManager.importData(exportedData);
    console.log(`📥 Datos importados exitosamente`);

    console.log('\n🎉 ============================================');
    console.log('✅ Demo ICM-ICTT completado exitosamente!');
    console.log('🎉 ============================================\n');

    return {
        success: true,
        userCount: allUsers.length,
        googleUsers: googleUsers.length,
        walletUsers: walletUsers.length,
        totalTickets,
        totalBalance: totalBalance.toFixed(2)
    };
}

// 🌟 Advanced demo scenarios
async function runAdvancedScenarios() {
    console.log('\n🌟 ============================================');
    console.log('🚀 Escenarios Avanzados ICM-ICTT');
    console.log('🌟 ============================================\n');

    // Scenario 1: Mass user registration
    console.log('📊 Escenario 1: Registro masivo de usuarios...');
    
    const batchUsers = [
        { email: 'maria.garcia@gmail.com', name: 'María García', type: 'google' },
        { email: 'carlos.lopez@gmail.com', name: 'Carlos López', type: 'google' },
        { email: 'ana.martinez@gmail.com', name: 'Ana Martínez', type: 'google' },
        { wallet: '0x1111111111111111111111111111111111111111', type: 'wallet' },
        { wallet: '0x2222222222222222222222222222222222222222', type: 'wallet' },
        { wallet: '0x3333333333333333333333333333333333333333', type: 'wallet' }
    ];

    for (const userData of batchUsers) {
        if (userData.type === 'google') {
            const googleData = {
                id: `google_${Date.now()}_${Math.random()}`,
                email: userData.email,
                name: userData.name,
                picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}`,
                email_verified: true
            };
            
            const mockWallet = `0x${Math.random().toString(16).substr(2, 40)}`;
            await icmManager.registerUserWithGoogle(googleData, mockWallet);
            console.log(`✅ Google user: ${userData.name}`);
            
        } else if (userData.type === 'wallet') {
            await icmManager.registerUserWithWallet(userData.wallet);
            console.log(`✅ Wallet user: ${userData.wallet.slice(0, 8)}...`);
        }
    }

    // Scenario 2: Simulate user activity
    console.log('\n🎮 Escenario 2: Simulando actividad de usuarios...');
    
    const allUsers = icmManager.getAllUsers();
    
    for (const userData of allUsers) {
        // Random number of tickets (0-5)
        const ticketCount = Math.floor(Math.random() * 6);
        
        for (let i = 0; i < ticketCount; i++) {
            const ticketId = `ACTIVITY_${Date.now()}_${userData.id}_${i}`;
            const randomNumbers = Array.from({ length: 5 }, () => Math.floor(Math.random() * 50) + 1);
            const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
            
            await icmManager.recordTicketPurchase(userData.id, ticketId, randomNumbers, txHash);
        }
        
        // Random balance - find user in database and update
        const userInDb = icmManager.findUserByWallet(userData.walletAddress);
        if (userInDb) {
            const balance = Math.random() * 50000;
            userInDb.updateBalance(balance);
            
            // Random staking
            const stakingAmount = Math.random() * 10000;
            const rewards = Math.random() * 1000;
            userInDb.updateStaking(stakingAmount, rewards);
            
            console.log(`🎮 ${userInDb.name}: ${ticketCount} tickets, ${balance.toFixed(2)} KOQUI`);
        }
    }

    // Final statistics
    console.log('\n📈 Estadísticas finales:');
    const finalUsers = icmManager.getAllUsers();
    const totalUsers = finalUsers.length;
    const totalTickets = finalUsers.reduce((sum, u) => sum + u.ticketsOwned.length, 0);
    const totalBalance = finalUsers.reduce((sum, u) => sum + u.koquiBalance, 0);
    const totalStaking = finalUsers.reduce((sum, u) => sum + u.stakingAmount, 0);
    const totalRewards = finalUsers.reduce((sum, u) => sum + u.totalRewards, 0);
    
    console.log(`👥 Total usuarios: ${totalUsers}`);
    console.log(`🎫 Total tickets: ${totalTickets}`);
    console.log(`💰 Balance total: ${totalBalance.toFixed(2)} KOQUI`);
    console.log(`🎰 Total en staking: ${totalStaking.toFixed(2)} KOQUI`);
    console.log(`🏆 Total recompensas: ${totalRewards.toFixed(2)} KOQUI`);
    
    const avgTicketsPerUser = (totalTickets / totalUsers).toFixed(2);
    const avgBalancePerUser = (totalBalance / totalUsers).toFixed(2);
    
    console.log(`📊 Promedio tickets/usuario: ${avgTicketsPerUser}`);
    console.log(`📊 Promedio balance/usuario: ${avgBalancePerUser} KOQUI`);

    console.log('\n🎉 ============================================');
    console.log('✅ Escenarios avanzados completados!');
    console.log('🎉 ============================================\n');

    return {
        totalUsers,
        totalTickets,
        totalBalance: totalBalance.toFixed(2),
        totalStaking: totalStaking.toFixed(2),
        totalRewards: totalRewards.toFixed(2),
        avgTicketsPerUser,
        avgBalancePerUser
    };
}

// 🚀 Main execution
async function main() {
    try {
        console.log('🎬 Iniciando demo completo ICM-ICTT...\n');
        
        const basicResults = await runICMDemo();
        const advancedResults = await runAdvancedScenarios();
        
        console.log('🎯 ============================================');
        console.log('📊 RESUMEN FINAL DEL DEMO');
        console.log('🎯 ============================================');
        console.log(`✅ Sistema ICM-ICTT funcionando al 100%`);
        console.log(`👥 ${advancedResults.totalUsers} usuarios registrados`);
        console.log(`🎫 ${advancedResults.totalTickets} tickets vendidos`);
        console.log(`💰 ${advancedResults.totalBalance} KOQUI en circulación`);
        console.log(`🎰 ${advancedResults.totalStaking} KOQUI en staking`);
        console.log(`🏆 ${advancedResults.totalRewards} KOQUI en recompensas`);
        console.log(`📈 ${advancedResults.avgTicketsPerUser} tickets por usuario (promedio)`);
        console.log('🎯 ============================================\n');
        
    } catch (error) {
        console.error('❌ Error en demo:', error);
    }
}

// Export functions
module.exports = {
    runICMDemo,
    runAdvancedScenarios,
    main
};

// Run if called directly
if (require.main === module) {
    main();
}
