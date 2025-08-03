'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  WalletIcon,
  LinkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-hot-toast'
import BlockchainTestPanel from './BlockchainTestPanel'

export default function WalletConnector() {
  const { 
    walletConnected, 
    currentAccount, 
    chainId, 
    connectWalletReal, 
    switchNetwork, 
    sendTransaction,
    isLoading,
    provider
  } = useAuth()
  
  const [isConnecting, setIsConnecting] = useState(false)
  const [balance, setBalance] = useState<string>('0')
  const [testTxLoading, setTestTxLoading] = useState(false)

  useEffect(() => {
    if (walletConnected && provider && currentAccount) {
      getBalance()
    }
  }, [walletConnected, provider, currentAccount])

  const getBalance = async () => {
    if (!provider || !currentAccount) return
    
    try {
      const balance = await provider.getBalance(currentAccount)
      setBalance(parseFloat(balance.toString()) / 1e18 + '')
    } catch (error) {
      console.error('Error getting balance:', error)
    }
  }

  const handleConnectWallet = async () => {
    setIsConnecting(true)
    try {
      const result = await connectWalletReal()
      if (result) {
        toast.success(`🎉 Wallet conectada: ${result.walletAddress?.slice(0, 6)}...${result.walletAddress?.slice(-4)}`)
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleSwitchToFuji = async () => {
    const success = await switchNetwork('43113') // Avalanche Fuji Testnet
    if (success) {
      toast.success('Red cambiada a Avalanche Fuji')
      getBalance()
    } else {
      toast.error('Error al cambiar de red')
    }
  }

  const handleTestTransaction = async () => {
    if (!walletConnected || !currentAccount) {
      toast.error('Wallet no conectada')
      return
    }

    setTestTxLoading(true)
    try {
      // Enviar una pequeña cantidad a una dirección de prueba
      const testAddress = '0x742d35Cc6635C0532925a3b8D4ba1aca45a5c02d' // Dirección de prueba
      const tx = await sendTransaction(testAddress, '0.001', chainId === '43113' ? 'AVAX' : 'ETH')
      
      toast.success(`Transacción enviada: ${tx.hash.slice(0, 10)}...`)
      
      // Esperar confirmación
      const receipt = await tx.wait()
      if (receipt) {
        toast.success(`Transacción confirmada en bloque ${receipt.blockNumber}`)
      } else {
        toast.error('Error confirmando transacción')
      }
      
      getBalance() // Actualizar balance
    } catch (error: any) {
      toast.error(`Error en transacción: ${error.message}`)
    } finally {
      setTestTxLoading(false)
    }
  }

  const getNetworkName = (chainId: string) => {
    switch (chainId) {
      case '1': return 'Ethereum Mainnet'
      case '43114': return 'Avalanche Mainnet'
      case '43113': return 'Avalanche Fuji (Testnet)'
      case '11155111': return 'Sepolia Testnet'
      default: return `Red ${chainId}`
    }
  }

  const getNetworkColor = (chainId: string) => {
    switch (chainId) {
      case '43113': return 'text-red-400'
      case '43114': return 'text-red-400'
      case '1': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="text-center space-y-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-center space-x-3">
          <WalletIcon className="w-8 h-8 text-primary-500" />
          <h2 className="text-3xl font-bold text-white">Conectar Wallet Real</h2>
        </div>
        <p className="text-gray-400">
          Conecta tu wallet MetaMask para transacciones reales en blockchain
        </p>
      </motion.div>

      {/* Wallet Status */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Estado de Wallet</h3>
          {walletConnected ? (
            <div className="flex items-center space-x-2 text-green-400">
              <CheckCircleIcon className="w-5 h-5" />
              <span>Conectada</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-gray-400">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <span>Desconectada</span>
            </div>
          )}
        </div>

        {walletConnected ? (
          <div className="space-y-4">
            {/* Account Info */}
            <div className="bg-dark-700/50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Dirección:</span>
                <span className="text-white font-mono">
                  {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Red:</span>
                <span className={`font-semibold ${getNetworkColor(chainId)}`}>
                  {getNetworkName(chainId)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Balance:</span>
                <span className="text-white font-semibold">
                  {parseFloat(balance).toFixed(4)} {chainId === '43113' || chainId === '43114' ? 'AVAX' : 'ETH'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.button
                onClick={handleSwitchToFuji}
                className="btn-secondary flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={chainId === '43113'}
              >
                <ArrowPathIcon className="w-5 h-5" />
                <span>{chainId === '43113' ? 'En Fuji Testnet' : 'Cambiar a Fuji'}</span>
              </motion.button>

              <motion.button
                onClick={handleTestTransaction}
                disabled={testTxLoading || parseFloat(balance) < 0.002}
                className="btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {testTxLoading ? (
                  <>
                    <ClockIcon className="w-5 h-5 animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <CurrencyDollarIcon className="w-5 h-5" />
                    <span>Tx de Prueba</span>
                  </>
                )}
              </motion.button>
            </div>

            {parseFloat(balance) < 0.002 && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <p className="text-yellow-400 text-sm">
                  ⚠️ <strong>Balance insuficiente:</strong> Necesitas al menos 0.002 {chainId === '43113' ? 'AVAX' : 'ETH'} para enviar transacciones de prueba.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mx-auto">
              <WalletIcon className="w-8 h-8 text-gray-400" />
            </div>
            
            <p className="text-gray-400">
              No hay wallet conectada. Conecta MetaMask para continuar.
            </p>

            <motion.button
              onClick={handleConnectWallet}
              disabled={isConnecting || isLoading}
              className="btn-primary flex items-center justify-center space-x-2 mx-auto"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isConnecting ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  <span>Conectando...</span>
                </>
              ) : (
                <>
                  <LinkIcon className="w-5 h-5" />
                  <span>Conectar MetaMask</span>
                </>
              )}
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Installation Guide */}
      {!window.ethereum && (
        <motion.div
          className="card bg-blue-500/10 border-blue-500/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-xl font-bold text-blue-400 mb-4">¿No tienes MetaMask?</h3>
          <div className="space-y-3">
            <p className="text-gray-300">
              MetaMask es necesario para conectar wallets reales y realizar transacciones en blockchain.
            </p>
            <div className="space-y-2">
              <p className="text-gray-400 text-sm">Pasos para instalar:</p>
              <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
                <li>Visita <a href="https://metamask.io" target="_blank" className="text-blue-400 hover:underline">metamask.io</a></li>
                <li>Descarga la extensión para tu navegador</li>
                <li>Crea una nueva wallet o importa una existente</li>
                <li>Regresa aquí y conecta tu wallet</li>
              </ol>
            </div>
          </div>
        </motion.div>
      )}

      {/* Network Info */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-xl font-bold text-white mb-4">Redes Recomendadas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-dark-700/50 rounded-xl p-4">
            <h4 className="text-red-400 font-semibold mb-2">Avalanche Fuji (Testnet)</h4>
            <div className="text-sm text-gray-300 space-y-1">
              <p>• Chain ID: 43113</p>
              <p>• Moneda: AVAX</p>
              <p>• Para pruebas gratuitas</p>
              <p>• <a href="https://faucet.avax.network/" target="_blank" className="text-blue-400 hover:underline">Faucet gratis</a></p>
            </div>
          </div>
          
          <div className="bg-dark-700/50 rounded-xl p-4">
            <h4 className="text-blue-400 font-semibold mb-2">Ethereum Sepolia (Testnet)</h4>
            <div className="text-sm text-gray-300 space-y-1">
              <p>• Chain ID: 11155111</p>
              <p>• Moneda: ETH</p>
              <p>• Para pruebas gratuitas</p>
              <p>• <a href="https://sepoliafaucet.com/" target="_blank" className="text-blue-400 hover:underline">Faucet gratis</a></p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Panel de Pruebas Blockchain - Solo cuando está conectada */}
      {walletConnected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <BlockchainTestPanel />
        </motion.div>
      )}
    </div>
  )
}
