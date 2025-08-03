'use client'

import { useState, useEffect } from 'react'
import { db, User } from '@/lib/database'
import { WalletService } from '@/lib/wallet'
import { ethers } from 'ethers'

// Interfaz para proveedores de wallet
interface WalletProvider {
  isMetaMask?: boolean
  request: (request: { method: string; params?: any[] }) => Promise<any>
  on: (event: string, handler: (...args: any[]) => void) => void
  removeListener: (event: string, handler: (...args: any[]) => void) => void
}

declare global {
  interface Window {
    ethereum?: WalletProvider
  }
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [walletConnected, setWalletConnected] = useState(false)
  const [currentAccount, setCurrentAccount] = useState<string>('')
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [chainId, setChainId] = useState<string>('')

  useEffect(() => {
    checkExistingSession()
    checkWalletConnection()
  }, [])

  const checkExistingSession = async () => {
    try {
      const savedUserId = localStorage.getItem('koquifi_current_user')
      if (savedUserId) {
        const userData = db.getUserById(savedUserId)
        if (userData) {
          setUser(userData)
          setIsAuthenticated(true)
          
          // Actualizar último login
          db.updateUser(userData.id, { 
            lastLogin: new Date().toISOString() 
          })
        }
      }
    } catch (error) {
      console.error('Error checking session:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          setCurrentAccount(accounts[0])
          setWalletConnected(true)
          
          const browserProvider = new ethers.BrowserProvider(window.ethereum)
          setProvider(browserProvider)
          
          const network = await browserProvider.getNetwork()
          setChainId(network.chainId.toString())
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error)
      }
    }
  }

  const connectWalletReal = async () => {
    if (!window.ethereum) {
      alert('MetaMask no está instalado. Por favor instala MetaMask para continuar.')
      return null
    }

    try {
      setIsLoading(true)
      
      // Solicitar conexión a MetaMask
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      if (accounts.length === 0) {
        throw new Error('No hay cuentas conectadas')
      }

      const account = accounts[0]
      setCurrentAccount(account)
      setWalletConnected(true)

      const browserProvider = new ethers.BrowserProvider(window.ethereum)
      setProvider(browserProvider)

      const network = await browserProvider.getNetwork()
      setChainId(network.chainId.toString())

      // Verificar si ya existe un usuario con esta wallet
      const users = db.getUsers()
      let existingUser = users.find(u => u.walletAddress?.toLowerCase() === account.toLowerCase())

      if (existingUser) {
        // Usuario existente con wallet real
        existingUser = db.updateUser(existingUser.id, {
          lastLogin: new Date().toISOString(),
          walletAddress: account
        })!
        
        setUser(existingUser)
        setIsAuthenticated(true)
        localStorage.setItem('koquifi_current_user', existingUser.id)
        
        return existingUser
      }

      // Crear nuevo usuario con wallet real
      const initialBalance = WalletService.generateInitialBalance()
      
      const newUser = db.createUser({
        email: `${account.slice(0, 8)}@wallet.real`,
        name: `Usuario ${account.slice(0, 6)}`,
        walletAddress: account,
        privateKey: 'external_wallet_real', // Wallet externa real
        kofiBalance: initialBalance.kofi,
        usdtBalance: initialBalance.usdt,
        authMethod: 'wallet',
        isVerified: false
      })

      // Transacción inicial KOQUICOIN
      db.createTransaction({
        userId: newUser.id,
        type: 'deposit',
        amount: initialBalance.kofi,
        currency: 'KOQUICOIN',
        status: 'completed',
        description: 'Bono de conexión de wallet real',
        txHash: `0x${Math.random().toString(16).slice(2)}`
      })

      setUser(newUser)
      setIsAuthenticated(true)
      localStorage.setItem('koquifi_current_user', newUser.id)
      
      return newUser
    } catch (error: any) {
      console.error('Error connecting wallet:', error)
      if (error.code === 4001) {
        alert('Conexión rechazada por el usuario')
      } else {
        alert(`Error al conectar wallet: ${error.message}`)
      }
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithGoogle = async (googleData?: any) => {
    try {
      setIsLoading(true)
      
      // Simular datos de Google OAuth (en producción vendría de Google)
      const googleUserData = googleData || {
        email: `user${Date.now()}@gmail.com`,
        name: `Usuario ${Math.floor(Math.random() * 1000)}`,
        picture: `https://ui-avatars.com/api/?name=Usuario&background=dc2626&color=fff&size=128`,
        sub: `google_${Date.now()}`
      }

      // Verificar si el usuario ya existe
      let existingUser = db.getUserByEmail(googleUserData.email)
      
      if (existingUser) {
        // Usuario existente, solo actualizar último login
        existingUser = db.updateUser(existingUser.id, {
          lastLogin: new Date().toISOString(),
          name: googleUserData.name,
          profilePicture: googleUserData.picture
        })!
        
        setUser(existingUser)
        setIsAuthenticated(true)
        localStorage.setItem('koquifi_current_user', existingUser.id)
        
        return existingUser
      }

      // Crear nueva wallet para el usuario
      const walletData = WalletService.createWallet()
      const initialBalance = WalletService.generateInitialBalance()

      // Crear nuevo usuario
      const newUser = db.createUser({
        email: googleUserData.email,
        name: googleUserData.name,
        profilePicture: googleUserData.picture,
        walletAddress: walletData.address,
        privateKey: walletData.privateKey, // En producción esto se encriptaría
        kofiBalance: initialBalance.kofi,
        usdtBalance: initialBalance.usdt,
        authMethod: 'google',
        isVerified: true
      })

      // Crear transacción inicial KOQUICOIN
      db.createTransaction({
        userId: newUser.id,
        type: 'deposit',
        amount: initialBalance.kofi,
        currency: 'KOQUICOIN',
        status: 'completed',
        description: 'Bono de bienvenida',
        txHash: `0x${Math.random().toString(16).slice(2)}`
      })

      // Crear transacción inicial Bs
      db.createTransaction({
        userId: newUser.id,
        type: 'deposit',
        amount: initialBalance.usdt,
        currency: 'Bs',
        status: 'completed',
        description: 'Bono de bienvenida',
        txHash: `0x${Math.random().toString(16).slice(2)}`
      })

      setUser(newUser)
      setIsAuthenticated(true)
      localStorage.setItem('koquifi_current_user', newUser.id)
      
      return newUser
    } catch (error) {
      console.error('Google login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const connectWallet = async (walletAddress?: string) => {
    try {
      setIsLoading(true)
      
      // Si no se proporciona address, crear una nueva (para testing)
      let walletData
      if (walletAddress && WalletService.isValidAddress(walletAddress)) {
        walletData = {
          address: walletAddress,
          privateKey: 'external_wallet' // No tenemos la private key de wallets externas
        }
      } else {
        walletData = WalletService.createWallet()
      }

      // Verificar si ya existe un usuario con esta wallet
      const users = db.getUsers()
      let existingUser = users.find(u => u.walletAddress === walletData.address)
      
      if (existingUser) {
        existingUser = db.updateUser(existingUser.id, {
          lastLogin: new Date().toISOString()
        })!
        
        setUser(existingUser)
        setIsAuthenticated(true)
        localStorage.setItem('koquifi_current_user', existingUser.id)
        
        return existingUser
      }

      // Crear nuevo usuario con wallet
      const initialBalance = WalletService.generateInitialBalance()
      
      const newUser = db.createUser({
        email: `${walletData.address.slice(0, 8)}@wallet.local`,
        name: `Usuario ${walletData.address.slice(0, 6)}`,
        walletAddress: walletData.address,
        privateKey: walletData.privateKey,
        kofiBalance: initialBalance.kofi,
        usdtBalance: initialBalance.usdt,
        authMethod: 'wallet',
        isVerified: false
      })

      // Transacción inicial KOQUICOIN
      db.createTransaction({
        userId: newUser.id,
        type: 'deposit',
        amount: initialBalance.kofi,
        currency: 'KOQUICOIN',
        status: 'completed',
        description: 'Bono de conexión de wallet'
      })

      setUser(newUser)
      setIsAuthenticated(true)
      localStorage.setItem('koquifi_current_user', newUser.id)
      
      return newUser
    } catch (error) {
      console.error('Wallet connection error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const switchNetwork = async (targetChainId: string) => {
    if (!window.ethereum) return false

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${parseInt(targetChainId).toString(16)}` }]
      })
      return true
    } catch (error: any) {
      // Network not added to MetaMask
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${parseInt(targetChainId).toString(16)}`,
              chainName: targetChainId === '43113' ? 'Avalanche Fuji' : 'Unknown Network',
              rpcUrls: targetChainId === '43113' ? ['https://api.avax-test.network/ext/bc/C/rpc'] : [],
              nativeCurrency: {
                name: 'AVAX',
                symbol: 'AVAX',
                decimals: 18
              },
              blockExplorerUrls: targetChainId === '43113' ? ['https://testnet.snowtrace.io/'] : []
            }]
          })
          return true
        } catch (addError) {
          console.error('Error adding network:', addError)
          return false
        }
      }
      console.error('Error switching network:', error)
      return false
    }
  }

  const sendTransaction = async (to: string, amount: string, currency: 'ETH' | 'AVAX' = 'ETH') => {
    if (!provider || !currentAccount) {
      throw new Error('Wallet no conectada')
    }

    try {
      const signer = await provider.getSigner()
      const tx = {
        to,
        value: ethers.parseEther(amount),
        gasLimit: 21000
      }

      const transaction = await signer.sendTransaction(tx)
      
      // Registrar transacción en la base de datos
      if (user) {
        db.createTransaction({
          userId: user.id,
          type: 'withdrawal',
          amount: parseFloat(amount),
          currency: currency === 'ETH' ? 'Bs' : currency === 'AVAX' ? 'Bs' : 'KOQUICOIN',
          status: 'pending',
          description: `Transferencia a ${to.slice(0, 6)}...${to.slice(-4)}`,
          txHash: transaction.hash
        })
      }

      return transaction
    } catch (error) {
      console.error('Error sending transaction:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      localStorage.removeItem('koquifi_current_user')
      setUser(null)
      setIsAuthenticated(false)
      setWalletConnected(false)
      setCurrentAccount('')
      setProvider(null)
      setChainId('')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const updateUserBalance = (kofiAmount: number, usdtAmount: number) => {
    if (!user) return

    const updatedUser = db.updateUser(user.id, {
      kofiBalance: Math.max(0, user.kofiBalance + kofiAmount),
      usdtBalance: Math.max(0, user.usdtBalance + usdtAmount)
    })

    if (updatedUser) {
      setUser(updatedUser)
    }
  }

  const purchaseLotteryTicket = async (numbers: number[], cost: number = 100) => {
    if (!user || !isAuthenticated) {
      throw new Error('Usuario no autenticado')
    }

    if (user.kofiBalance < cost) {
      throw new Error('Saldo insuficiente de KOQUICOIN')
    }

    if (numbers.length !== 6) {
      throw new Error('Debes seleccionar exactamente 6 números')
    }

    try {
      // Obtener sorteo actual
      const currentDraw = db.getCurrentDraw()
      if (!currentDraw) {
        throw new Error('No hay sorteo activo')
      }

      // Crear ticket
      const ticket = db.createLotteryTicket({
        userId: user.id,
        lotteryId: currentDraw.id,
        numbers,
        cost,
        status: 'active'
      })

      // Actualizar balance del usuario
      updateUserBalance(-cost, 0)

      // Crear transacción
      db.createTransaction({
        userId: user.id,
        type: 'lottery_purchase',
        amount: cost,
        currency: 'KOQUICOIN',
        status: 'completed',
        description: `Ticket lotería #${currentDraw.id.slice(-4)} - Números: ${numbers.join(', ')}`
      })

      // Actualizar sorteo
      const draws = db.getLotteryDraws()
      const drawIndex = draws.findIndex(d => d.id === currentDraw.id)
      if (drawIndex !== -1) {
        draws[drawIndex].totalParticipants += 1
        draws[drawIndex].tickets.push(ticket.id)
        draws[drawIndex].prizePool.koficoin += cost * 0.8 // 80% va al prize pool
        db.saveLotteryDraws(draws)
      }

      return ticket
    } catch (error) {
      console.error('Error purchasing lottery ticket:', error)
      throw error
    }
  }

  // Función para testing - simular login con datos específicos
  const testLogin = async (email: string, name: string) => {
    const testData = {
      email,
      name,
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=22c55e&color=fff`,
      sub: `test_${Date.now()}`
    }
    
    return await loginWithGoogle(testData)
  }

  // Función unificada de login que maneja ambos métodos
  const login = async (method: string) => {
    try {
      if (method === 'google') {
        return await loginWithGoogle()
      } else if (method === 'wallet') {
        return await connectWallet()
      } else if (method === 'wallet-real') {
        return await connectWalletReal()
      } else {
        throw new Error('Método de login no válido')
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    walletConnected,
    currentAccount,
    provider,
    chainId,
    login,
    loginWithGoogle,
    connectWallet,
    connectWalletReal,
    switchNetwork,
    sendTransaction,
    logout,
    updateUserBalance,
    purchaseLotteryTicket,
    testLogin,
    checkExistingSession
  }
}
