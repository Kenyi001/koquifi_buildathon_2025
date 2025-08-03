'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  UserIcon, 
  WalletIcon,
  SparklesIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'

interface AuthModalProps {
  onLogin: (method: string) => void
}

export default function AuthModal({ onLogin }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    // Simular proceso de login
    setTimeout(() => {
      onLogin('google')
      setIsLoading(false)
    }, 2000)
  }

  const handleWalletConnect = async () => {
    setIsLoading(true)
    // Simular conexión de wallet
    setTimeout(() => {
      onLogin('wallet')
      setIsLoading(false)
    }, 1500)
  }

  const features = [
    {
      icon: CurrencyDollarIcon,
      title: 'Ahorros Inteligentes',
      description: 'Haz crecer tu dinero con staking automático'
    },
    {
      icon: SparklesIcon,
      title: 'Sorteos Semanales',
      description: 'Participa en lotería mientras ahorras'
    },
    {
      icon: ShieldCheckIcon,
      title: '100% Seguro',
      description: 'Tu dinero protegido con blockchain'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Features */}
        <motion.div
          className="space-y-8 text-center lg:text-left"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div>
            <motion.div
              className="flex items-center justify-center lg:justify-start space-x-3 mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-400 rounded-2xl flex items-center justify-center overflow-hidden">
                <svg width="40" height="40" viewBox="0 0 200 200" fill="none" className="text-white">
                  <path d="M100 20 C130 20, 160 50, 160 80 C160 110, 130 140, 100 180 C70 140, 40 110, 40 80 C40 50, 70 20, 100 20 Z" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="4"/>
                  <path d="M70 60 L90 80 L130 40" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="4" 
                        strokeLinecap="round"/>
                  <path d="M65 90 L85 110 L125 70" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="4" 
                        strokeLinecap="round"/>
                  <path d="M75 120 L95 140 L135 100" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="4" 
                        strokeLinecap="round"/>
                  <circle cx="100" cy="165" r="8" fill="currentColor"/>
                </svg>
              </div>
              <span className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-secondary-400 bg-clip-text text-transparent">
                KOQUIFI
              </span>
            </motion.div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Bienvenido al futuro de
              <span className="text-primary-500"> las finanzas</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Diseñado especialmente para usuarios nuevos en Web3. 
              Simple, seguro y rentable.
            </p>
          </div>
          
          <div className="space-y-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-start space-x-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-primary-500" />
                </div>
                <div className="text-left">
                  <h3 className="text-white font-semibold">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        {/* Right Side - Auth Form */}
        <motion.div
          className="bg-dark-800/80 backdrop-blur-xl rounded-3xl p-8 border border-primary-500/20"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              Comienza tu viaje DeFi
            </h2>
            <p className="text-gray-400">
              Elige cómo quieres comenzar
            </p>
          </div>
          
          <div className="space-y-4">
            {/* Google Login */}
            <motion.button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-white text-dark-900 font-semibold py-4 px-6 rounded-xl flex items-center justify-center space-x-3 hover:bg-gray-100 transition-all duration-300 disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <UserIcon className="w-6 h-6" />
              <span>Crear cuenta con Google</span>
              {isLoading && (
                <div className="w-5 h-5 border-2 border-dark-900 border-t-transparent rounded-full animate-spin"></div>
              )}
            </motion.button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-dark-800 text-gray-400">o</span>
              </div>
            </div>
            
            {/* Wallet Connect */}
            <motion.button
              onClick={handleWalletConnect}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary-500 to-secondary-400 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center space-x-3 hover:from-primary-600 hover:to-secondary-500 transition-all duration-300 disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <WalletIcon className="w-6 h-6" />
              <span>Conectar billetera existente</span>
              {isLoading && (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
            </motion.button>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm mb-4">
              ¿Nuevo en Web3? Te ayudamos paso a paso
            </p>
            <div className="flex justify-center space-x-4">
              <span className="text-xs text-primary-500">✓ Fácil de usar</span>
              <span className="text-xs text-primary-500">✓ 100% Seguro</span>
              <span className="text-xs text-primary-500">✓ Sin comisiones</span>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-secondary-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  )
}
