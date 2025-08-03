// ==============================================
// 🔐 Web3Auth + Google OAuth Configuration
// ICM-ICTT: Identity & Wallet Management System
// ==============================================

const { Web3Auth } = require("@web3auth/modal");
const { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } = require("@web3auth/base");
const { EthereumPrivateKeyProvider } = require("@web3auth/ethereum-provider");

// 🔧 Avalanche Fuji Configuration
const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xa869", // Fuji Testnet
  rpcTarget: "https://api.avax-test.network/ext/bc/C/rpc",
  displayName: "Avalanche Fuji Testnet", 
  blockExplorer: "https://testnet.snowtrace.io/",
  ticker: "AVAX",
  tickerName: "Avalanche",
};

// 🚀 Web3Auth Instance
class Web3AuthManager {
  constructor() {
    this.web3auth = null;
    this.provider = null;
    this.user = null;
    this.isInitialized = false;
  }

  // 🔧 Initialize Web3Auth
  async initialize() {
    try {
      // Ethereum provider
      const privateKeyProvider = new EthereumPrivateKeyProvider({
        config: { chainConfig }
      });

      // Web3Auth configuration
      this.web3auth = new Web3Auth({
        clientId: process.env.WEB3AUTH_CLIENT_ID || "BPj1VK9SLAV8k4v_sOyT1_Hb4-Ec7N6H3XzQJNcW2Xc9O8w6K4z9TgGhZhqL2Q3",
        web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
        chainConfig,
        privateKeyProvider,
        uiConfig: {
          theme: "dark",
          loginMethodsOrder: ["google", "facebook", "twitter"],
          appName: "KoquiFI",
          appUrl: "http://localhost:3002",
          appLogo: "https://web3auth.io/images/w3a-L-Favicon-1.svg",
        },
      });

      await this.web3auth.initModal();
      this.isInitialized = true;

      console.log("✅ Web3Auth initialized successfully");
      return true;
    } catch (error) {
      console.error("❌ Web3Auth initialization failed:", error);
      return false;
    }
  }

  // 🔐 Login with Google OAuth
  async loginWithGoogle() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Login con Google
      const web3authProvider = await this.web3auth.connect("google");
      
      if (web3authProvider) {
        this.provider = web3authProvider;
        
        // Obtener información del usuario
        this.user = await this.web3auth.getUserInfo();
        
        // Obtener dirección de billetera
        const accounts = await this.getAccounts();
        const walletAddress = accounts[0];

        // Resultado completo
        const authResult = {
          success: true,
          user: {
            ...this.user,
            walletAddress,
            loginType: "google"
          },
          provider: this.provider
        };

        console.log("✅ Google login successful:", authResult.user);
        return authResult;
      }
    } catch (error) {
      console.error("❌ Google login failed:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 🔗 Connect existing wallet
  async connectWallet() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Conectar billetera existente (MetaMask, etc.)
      const web3authProvider = await this.web3auth.connect("wallet");
      
      if (web3authProvider) {
        this.provider = web3authProvider;
        
        const accounts = await this.getAccounts();
        const walletAddress = accounts[0];

        const authResult = {
          success: true,
          user: {
            walletAddress,
            loginType: "wallet",
            email: null,
            name: "Wallet User"
          },
          provider: this.provider
        };

        console.log("✅ Wallet connection successful:", authResult.user);
        return authResult;
      }
    } catch (error) {
      console.error("❌ Wallet connection failed:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 📋 Get wallet accounts
  async getAccounts() {
    try {
      if (!this.provider) throw new Error("Provider not initialized");
      
      const ethers = require("ethers");
      const provider = new ethers.BrowserProvider(this.provider);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      return [address];
    } catch (error) {
      console.error("❌ Failed to get accounts:", error);
      return [];
    }
  }

  // 💰 Get wallet balance
  async getBalance() {
    try {
      if (!this.provider) throw new Error("Provider not initialized");
      
      const ethers = require("ethers");
      const provider = new ethers.BrowserProvider(this.provider);
      const signer = await signer.getAddress();
      const balance = await provider.getBalance(signer);
      
      return ethers.formatEther(balance);
    } catch (error) {
      console.error("❌ Failed to get balance:", error);
      return "0";
    }
  }

  // 🔐 Get private key (for backend operations)
  async getPrivateKey() {
    try {
      if (!this.provider) throw new Error("Provider not initialized");
      
      const privateKey = await this.provider.request({
        method: "eth_private_key"
      });
      
      return privateKey;
    } catch (error) {
      console.error("❌ Failed to get private key:", error);
      return null;
    }
  }

  // 🚪 Logout
  async logout() {
    try {
      if (this.web3auth) {
        await this.web3auth.logout();
        this.provider = null;
        this.user = null;
        console.log("✅ Logout successful");
        return true;
      }
    } catch (error) {
      console.error("❌ Logout failed:", error);
      return false;
    }
  }

  // 📊 Get user status
  isLoggedIn() {
    return this.web3auth && this.web3auth.connected;
  }

  // 👤 Get current user
  getCurrentUser() {
    return this.user;
  }

  // 🔗 Get provider for transactions
  getProvider() {
    return this.provider;
  }
}

// 🌟 Singleton instance
const web3AuthManager = new Web3AuthManager();

module.exports = {
  Web3AuthManager,
  web3AuthManager,
  chainConfig
};
