import { ethers } from 'ethers'

export interface WalletData {
  address: string
  privateKey: string
  mnemonic?: string
}

export class WalletService {
  /**
   * Crea una nueva wallet de Ethereum
   */
  static createWallet(): WalletData {
    try {
      // Crear wallet aleatoria
      const wallet = ethers.Wallet.createRandom()
      
      return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic?.phrase
      }
    } catch (error) {
      console.error('Error creating wallet:', error)
      throw new Error('Failed to create wallet')
    }
  }

  /**
   * Importa wallet desde private key
   */
  static importFromPrivateKey(privateKey: string): WalletData {
    try {
      const wallet = new ethers.Wallet(privateKey)
      
      return {
        address: wallet.address,
        privateKey: wallet.privateKey
      }
    } catch (error) {
      console.error('Error importing wallet:', error)
      throw new Error('Invalid private key')
    }
  }

  /**
   * Importa wallet desde mnemonic
   */
  static importFromMnemonic(mnemonic: string): WalletData {
    try {
      const wallet = ethers.Wallet.fromPhrase(mnemonic)
      
      return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic?.phrase
      }
    } catch (error) {
      console.error('Error importing from mnemonic:', error)
      throw new Error('Invalid mnemonic phrase')
    }
  }

  /**
   * Valida si una dirección de wallet es válida
   */
  static isValidAddress(address: string): boolean {
    try {
      return ethers.isAddress(address)
    } catch {
      return false
    }
  }

  /**
   * Valida si una private key es válida
   */
  static isValidPrivateKey(privateKey: string): boolean {
    try {
      new ethers.Wallet(privateKey)
      return true
    } catch {
      return false
    }
  }

  /**
   * Genera un balance inicial aleatorio para development
   */
  static generateInitialBalance(): { kofi: number; usdt: number } {
    return {
      kofi: Math.floor(Math.random() * 1000) + 500, // 500-1500 KOFI
      usdt: Math.floor(Math.random() * 100) + 50    // 50-150 USDT
    }
  }

  /**
   * Encripta la private key (básico para demo)
   */
  static encryptPrivateKey(privateKey: string, password: string): string {
    // En producción usar una librería de encriptación robusta
    const encoded = btoa(privateKey + ':' + password)
    return encoded
  }

  /**
   * Desencripta la private key (básico para demo)
   */
  static decryptPrivateKey(encryptedKey: string, password: string): string {
    try {
      const decoded = atob(encryptedKey)
      const [privateKey, storedPassword] = decoded.split(':')
      
      if (storedPassword !== password) {
        throw new Error('Invalid password')
      }
      
      return privateKey
    } catch (error) {
      throw new Error('Failed to decrypt private key')
    }
  }
}

// Servicio de faucet para testnet (dar tokens gratis)
export class FaucetService {
  /**
   * Simula recibir tokens gratis para testing
   */
  static async claimFaucet(walletAddress: string): Promise<{ kofi: number; usdt: number }> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Cantidades aleatorias
    const kofi = Math.floor(Math.random() * 200) + 100 // 100-300 KOFI
    const usdt = Math.floor(Math.random() * 50) + 25   // 25-75 USDT
    
    return { kofi, usdt }
  }

  /**
   * Verifica si una wallet puede reclamar del faucet
   */
  static canClaimFaucet(walletAddress: string): boolean {
    const lastClaim = localStorage.getItem(`faucet_claim_${walletAddress}`)
    if (!lastClaim) return true
    
    const lastClaimTime = new Date(lastClaim).getTime()
    const now = new Date().getTime()
    const hoursSinceLastClaim = (now - lastClaimTime) / (1000 * 60 * 60)
    
    return hoursSinceLastClaim >= 24 // Una vez por día
  }

  /**
   * Registra un claim del faucet
   */
  static recordFaucetClaim(walletAddress: string): void {
    localStorage.setItem(`faucet_claim_${walletAddress}`, new Date().toISOString())
  }
}
