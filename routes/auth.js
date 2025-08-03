// ==============================================
// 🔐 Authentication Routes - ICM-ICTT System
// Google OAuth + Wallet Connection Endpoints
// ==============================================

const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { icmManager } = require('../services/icm-manager');
const { web3AuthManager } = require('../config/web3auth');

const router = express.Router();

// 🔧 Configure Passport Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || "your-google-client-id",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || "your-google-client-secret",
  callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const userInfo = {
      id: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
      picture: profile.photos[0].value,
      email_verified: profile.emails[0].verified
    };
    
    return done(null, userInfo);
  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// ==============================================
// 🔐 AUTHENTICATION ENDPOINTS
// ==============================================

// 🚀 Initialize Web3Auth
router.post('/init', async (req, res) => {
  try {
    const success = await web3AuthManager.initialize();
    
    res.json({
      success,
      message: success ? "Web3Auth initialized" : "Web3Auth initialization failed",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ Web3Auth init error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 📧 Google OAuth Login (Step 1)
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// 📧 Google OAuth Callback (Step 2)
router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    try {
      // Temporalmente guardar datos de Google
      const tempToken = Buffer.from(JSON.stringify(req.user)).toString('base64');
      
      // Redirigir al frontend con token temporal
      res.redirect(`http://localhost:3002/auth/success?token=${tempToken}`);
    } catch (error) {
      console.error("❌ Google callback error:", error);
      res.redirect('http://localhost:3002/auth/error');
    }
  }
);

// 🔗 Complete Google + Wallet Registration
router.post('/register/google', async (req, res) => {
  try {
    const { tempToken, walletAddress } = req.body;
    
    if (!tempToken || !walletAddress) {
      return res.status(400).json({
        success: false,
        error: "Missing tempToken or walletAddress"
      });
    }

    // Decodificar datos de Google
    const googleUserInfo = JSON.parse(Buffer.from(tempToken, 'base64').toString());
    
    // Registrar usuario con ICM
    const result = await icmManager.registerUserWithGoogle(googleUserInfo, walletAddress);
    
    if (result.success) {
      res.json({
        success: true,
        user: result.user,
        sessionId: result.sessionId,
        isNewUser: result.isNewUser,
        message: result.isNewUser ? "Usuario registrado exitosamente" : "Sesión iniciada"
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("❌ Google registration error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 🔗 Wallet Connection Login
router.post('/connect/wallet', async (req, res) => {
  try {
    const { walletAddress } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: "Wallet address is required"
      });
    }

    // Registrar/login con wallet
    const result = await icmManager.registerUserWithWallet(walletAddress);
    
    if (result.success) {
      res.json({
        success: true,
        user: result.user,
        sessionId: result.sessionId,
        isNewUser: result.isNewUser,
        message: result.isNewUser ? "Nueva billetera registrada" : "Billetera conectada"
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("❌ Wallet connection error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 👤 Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    
    if (!sessionId) {
      return res.status(401).json({
        success: false,
        error: "Session ID required"
      });
    }

    const user = icmManager.getUserBySession(sessionId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired session"
      });
    }

    res.json({
      success: true,
      user: user.serialize()
    });
  } catch (error) {
    console.error("❌ Profile fetch error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 💰 Update user balance
router.post('/update-balance', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    const { contractAddress } = req.body;
    
    if (!sessionId) {
      return res.status(401).json({
        success: false,
        error: "Session ID required"
      });
    }

    const user = icmManager.getUserBySession(sessionId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid session"
      });
    }

    const result = await icmManager.updateUserBalance(user.id, contractAddress);
    
    res.json(result);
  } catch (error) {
    console.error("❌ Balance update error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 📊 Get user statistics
router.get('/stats', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    
    if (!sessionId) {
      return res.status(401).json({
        success: false,
        error: "Session ID required"
      });
    }

    const user = icmManager.getUserBySession(sessionId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid session"
      });
    }

    const stats = icmManager.getUserStats(user.id);
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error("❌ Stats fetch error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 🚪 Logout
router.post('/logout', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    
    if (sessionId) {
      icmManager.logout(sessionId);
    }
    
    res.json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    console.error("❌ Logout error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 🔍 Check session validity
router.get('/check-session', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    
    if (!sessionId) {
      return res.json({
        valid: false,
        message: "No session ID provided"
      });
    }

    const user = icmManager.getUserBySession(sessionId);
    
    res.json({
      valid: !!user,
      user: user ? user.serialize() : null
    });
  } catch (error) {
    console.error("❌ Session check error:", error);
    res.status(500).json({
      valid: false,
      error: error.message
    });
  }
});

// 🎫 Record ticket purchase
router.post('/ticket-purchase', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    const { ticketId, numbers, txHash } = req.body;
    
    if (!sessionId) {
      return res.status(401).json({
        success: false,
        error: "Session ID required"
      });
    }

    const user = icmManager.getUserBySession(sessionId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid session"
      });
    }

    const result = await icmManager.recordTicketPurchase(user.id, ticketId, numbers, txHash);
    
    res.json(result);
  } catch (error) {
    console.error("❌ Ticket purchase recording error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 👥 Get all users (admin only)
router.get('/admin/users', async (req, res) => {
  try {
    // En producción, agregar verificación de admin
    const users = icmManager.getAllUsers();
    
    res.json({
      success: true,
      users,
      total: users.length
    });
  } catch (error) {
    console.error("❌ Admin users fetch error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
