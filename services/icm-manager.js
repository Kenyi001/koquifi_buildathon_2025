// ==============================================
// 🔐 ICM-ICTT: Identity & Wallet Management System
// User Management with Google OAuth + Wallet Integration
// ==============================================

const { ethers } = require("ethers");
const crypto = require("crypto");

// 📊 Base de datos simulada (en producción usar MongoDB/PostgreSQL)
let usersDatabase = new Map();
let sessionsDatabase = new Map();

// 👤 User Profile Structure
class UserProfile {
  constructor(data) {
    this.id = data.id || crypto.randomUUID();
    this.email = data.email || null;
    this.name = data.name || null;
    this.picture = data.picture || null;
    this.walletAddress = data.walletAddress;
    this.loginType = data.loginType; // 'google', 'wallet'
    this.createdAt = data.createdAt || new Date().toISOString();
    this.lastLogin = new Date().toISOString();
    this.isVerified = data.isVerified || false;
    this.koquiBalance = data.koquiBalance || 0;
    this.ticketsOwned = data.ticketsOwned || [];
    this.stakingAmount = data.stakingAmount || 0;
    this.totalRewards = data.totalRewards || 0;
  }

  // 📄 Serialize for storage
  serialize() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      picture: this.picture,
      walletAddress: this.walletAddress,
      loginType: this.loginType,
      createdAt: this.createdAt,
      lastLogin: this.lastLogin,
      isVerified: this.isVerified,
      koquiBalance: this.koquiBalance,
      ticketsOwned: this.ticketsOwned,
      stakingAmount: this.stakingAmount,
      totalRewards: this.totalRewards
    };
  }

  // 📈 Update balance
  updateBalance(newBalance) {
    this.koquiBalance = newBalance;
    this.lastLogin = new Date().toISOString();
  }

  // 🎫 Add ticket
  addTicket(ticketId, numbers) {
    this.ticketsOwned.push({
      id: ticketId,
      numbers,
      purchaseDate: new Date().toISOString()
    });
  }

  // 💰 Update staking
  updateStaking(amount, rewards = 0) {
    this.stakingAmount = amount;
    this.totalRewards += rewards;
    this.lastLogin = new Date().toISOString();
  }
}

// 🔐 Session Management
class SessionManager {
  static generateSession(userId) {
    const sessionId = crypto.randomUUID();
    const session = {
      userId,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      isActive: true
    };
    
    sessionsDatabase.set(sessionId, session);
    return sessionId;
  }

  static validateSession(sessionId) {
    const session = sessionsDatabase.get(sessionId);
    if (!session) return null;
    
    if (new Date() > new Date(session.expiresAt)) {
      sessionsDatabase.delete(sessionId);
      return null;
    }
    
    return session;
  }

  static deleteSession(sessionId) {
    return sessionsDatabase.delete(sessionId);
  }
}

// 🏢 ICM-ICTT Main Manager
class ICMManager {
  constructor() {
    this.provider = null;
    this.contracts = {};
  }

  // 🚀 Initialize with blockchain provider
  async initialize(provider) {
    this.provider = provider;
    console.log("✅ ICM-ICTT Manager initialized");
  }

  // 📧 Register user with Google OAuth
  async registerUserWithGoogle(googleUserInfo, walletAddress) {
    try {
      // Verificar si ya existe usuario con este email
      const existingUser = this.findUserByEmail(googleUserInfo.email);
      if (existingUser) {
        // Actualizar información
        existingUser.walletAddress = walletAddress;
        existingUser.lastLogin = new Date().toISOString();
        usersDatabase.set(existingUser.id, existingUser);
        
        const sessionId = SessionManager.generateSession(existingUser.id);
        
        return {
          success: true,
          user: existingUser.serialize(),
          sessionId,
          isNewUser: false
        };
      }

      // Crear nuevo usuario
      const newUser = new UserProfile({
        email: googleUserInfo.email,
        name: googleUserInfo.name,
        picture: googleUserInfo.picture,
        walletAddress,
        loginType: 'google',
        isVerified: googleUserInfo.email_verified || true
      });

      usersDatabase.set(newUser.id, newUser);
      
      // Generar sesión
      const sessionId = SessionManager.generateSession(newUser.id);

      console.log(`✅ New Google user registered: ${newUser.email}`);
      
      return {
        success: true,
        user: newUser.serialize(),
        sessionId,
        isNewUser: true
      };

    } catch (error) {
      console.error("❌ Google registration failed:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 🔗 Register user with existing wallet
  async registerUserWithWallet(walletAddress) {
    try {
      // Verificar si ya existe usuario con esta wallet
      const existingUser = this.findUserByWallet(walletAddress);
      if (existingUser) {
        existingUser.lastLogin = new Date().toISOString();
        usersDatabase.set(existingUser.id, existingUser);
        
        const sessionId = SessionManager.generateSession(existingUser.id);
        
        return {
          success: true,
          user: existingUser.serialize(),
          sessionId,
          isNewUser: false
        };
      }

      // Crear nuevo usuario wallet-only
      const newUser = new UserProfile({
        walletAddress,
        name: `User ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
        loginType: 'wallet',
        isVerified: false
      });

      usersDatabase.set(newUser.id, newUser);
      
      const sessionId = SessionManager.generateSession(newUser.id);

      console.log(`✅ New wallet user registered: ${walletAddress}`);
      
      return {
        success: true,
        user: newUser.serialize(),
        sessionId,
        isNewUser: true
      };

    } catch (error) {
      console.error("❌ Wallet registration failed:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 🔍 Find user by email
  findUserByEmail(email) {
    for (let user of usersDatabase.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  // 🔍 Find user by wallet
  findUserByWallet(walletAddress) {
    for (let user of usersDatabase.values()) {
      if (user.walletAddress?.toLowerCase() === walletAddress.toLowerCase()) {
        return user;
      }
    }
    return null;
  }

  // 👤 Get user by session
  getUserBySession(sessionId) {
    const session = SessionManager.validateSession(sessionId);
    if (!session) return null;
    
    return usersDatabase.get(session.userId);
  }

  // 💰 Update user balance from blockchain
  async updateUserBalance(userId, contractAddress) {
    try {
      const user = usersDatabase.get(userId);
      if (!user) throw new Error("User not found");

      if (this.provider && contractAddress) {
        // Obtener balance real del contrato
        const contract = new ethers.Contract(
          contractAddress,
          ["function balanceOf(address) view returns (uint256)"],
          this.provider
        );
        
        const balance = await contract.balanceOf(user.walletAddress);
        const formattedBalance = ethers.formatEther(balance);
        
        user.updateBalance(parseFloat(formattedBalance));
        usersDatabase.set(userId, user);
        
        return {
          success: true,
          balance: formattedBalance
        };
      }

      return {
        success: false,
        error: "Provider or contract not available"
      };

    } catch (error) {
      console.error("❌ Balance update failed:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 🎫 Record ticket purchase
  async recordTicketPurchase(userId, ticketId, numbers, txHash) {
    try {
      const user = usersDatabase.get(userId);
      if (!user) throw new Error("User not found");

      user.addTicket(ticketId, numbers);
      usersDatabase.set(userId, user);

      console.log(`✅ Ticket recorded for user ${userId}: ${ticketId}`);
      
      return {
        success: true,
        ticket: {
          id: ticketId,
          numbers,
          txHash,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error("❌ Ticket recording failed:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 🚪 Logout user
  logout(sessionId) {
    return SessionManager.deleteSession(sessionId);
  }

  // 📊 Get user statistics
  getUserStats(userId) {
    const user = usersDatabase.get(userId);
    if (!user) return null;

    return {
      totalUsers: usersDatabase.size,
      userTickets: user.ticketsOwned.length,
      userBalance: user.koquiBalance,
      stakingAmount: user.stakingAmount,
      totalRewards: user.totalRewards,
      memberSince: user.createdAt,
      lastActivity: user.lastLogin
    };
  }

  // 📋 Get all users (admin)
  getAllUsers() {
    return Array.from(usersDatabase.values()).map(user => user.serialize());
  }

  // 🔧 Database operations (for demo purposes)
  exportData() {
    return {
      users: Array.from(usersDatabase.entries()),
      sessions: Array.from(sessionsDatabase.entries())
    };
  }

  importData(data) {
    if (data.users) {
      usersDatabase = new Map(data.users);
    }
    if (data.sessions) {
      sessionsDatabase = new Map(data.sessions);
    }
  }
}

// 🌟 Singleton instance
const icmManager = new ICMManager();

module.exports = {
  ICMManager,
  icmManager,
  UserProfile,
  SessionManager
};
