'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  GiftIcon,
  ClockIcon,
  CurrencyDollarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/hooks/useAuth'
import { FaucetService } from '@/lib/wallet'

export default function Faucet() {
  const { user, isAuthenticated, updateUserBalance } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [lastClaim, setLastClaim] = useState<Date | null>(null)

  const handleClaimFaucet = async () => {
    if (!user || !isAuthenticated) {
      alert('Debes iniciar sesión para usar el faucet')
      return
    }

    if (!FaucetService.canClaimFaucet(user.walletAddress)) {
      alert('Solo puedes reclamar del faucet una vez cada 24 horas')
      return
    }

    try {
      setIsLoading(true)
      
      const tokens = await FaucetService.claimFaucet(user.walletAddress)
      
      // Actualizar balance del usuario
      updateUserBalance(tokens.kofi, tokens.usdt)
      
      // Registrar el claim
      FaucetService.recordFaucetClaim(user.walletAddress)
      setLastClaim(new Date())
      
      alert(`🎉 ¡Tokens recibidos!

💰 Has recibido:
• ${tokens.kofi} KOFICOIN
• ${tokens.usdt} USDT

🔄 Podrás reclamar nuevamente en 24 horas`)
      
    } catch (error: any) {
      alert(`❌ Error al reclamar tokens: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const canClaim = user ? FaucetService.canClaimFaucet(user.walletAddress) : false

  return (
    <motion.div
      className="card bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-400/30"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="text-center space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="w-16 h-16 bg-green-400/20 rounded-full flex items-center justify-center mx-auto">
            <GiftIcon className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">🚰 FAUCET KOQUIFI</h3>
          <p className="text-gray-400">
            Obtén tokens gratis para probar la plataforma
          </p>
        </div>

        {/* Rewards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-dark-700 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <CurrencyDollarIcon className="w-5 h-5 text-primary-400" />
              <span className="text-gray-400 text-sm">KOFICOIN</span>
            </div>
            <div className="text-primary-400 font-bold text-lg">100-300</div>
          </div>
          
          <div className="bg-dark-700 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <CurrencyDollarIcon className="w-5 h-5 text-secondary-400" />
              <span className="text-gray-400 text-sm">USDT</span>
            </div>
            <div className="text-secondary-400 font-bold text-lg">25-75</div>
          </div>
        </div>

        {/* Status */}
        {isAuthenticated && user ? (
          <div className="space-y-4">
            <div className="bg-dark-700 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Tu Wallet</div>
              <div className="text-white font-mono text-sm">
                {user.walletAddress.slice(0, 10)}...{user.walletAddress.slice(-8)}
              </div>
            </div>
            
            {!canClaim && (
              <div className="flex items-center justify-center space-x-2 text-yellow-400">
                <ClockIcon className="w-5 h-5" />
                <span className="text-sm">Próximo claim en 24 horas</span>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-orange-500/20 border border-orange-400/30 rounded-lg p-4">
            <p className="text-orange-300 text-sm">
              💡 Inicia sesión para usar el faucet
            </p>
          </div>
        )}

        {/* Claim Button */}
        <button
          onClick={handleClaimFaucet}
          disabled={!isAuthenticated || !canClaim || isLoading}
          className={`w-full py-4 px-6 rounded-lg font-bold transition-all ${
            isAuthenticated && canClaim && !isLoading
              ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-green-500/25'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Reclamando...</span>
            </div>
          ) : !isAuthenticated ? (
            'Inicia sesión para reclamar'
          ) : !canClaim ? (
            'Espera 24 horas'
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <SparklesIcon className="w-5 h-5" />
              <span>Reclamar Tokens Gratis</span>
            </div>
          )}
        </button>

        {/* Info */}
        <div className="text-gray-500 text-xs space-y-1">
          <p>• Solo una vez cada 24 horas</p>
          <p>• Cantidades aleatorias</p>
          <p>• Para testing y desarrollo</p>
        </div>
      </div>
    </motion.div>
  )
}
