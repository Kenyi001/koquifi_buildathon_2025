'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CurrencyDollarIcon, 
  ChartBarIcon,
  ClockIcon,
  SparklesIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline'
import BalanceCards from '@/components/ui/BalanceCards'
import StakingProgress from '@/components/ui/StakingProgress'
import TransactionHistory from '@/components/ui/TransactionHistory'
import QuickActions from '@/components/ui/QuickActions'
import ClientOnly from '@/components/ui/ClientOnly'
import Faucet from './Faucet'
import { useAuth } from '@/hooks/useAuth'

interface DashboardProps {
  user: any
}

export default function Dashboard({ user }: DashboardProps) {
  const { user: authUser } = useAuth()
  const [balances, setBalances] = useState({
    koficoin: authUser?.kofiBalance || 1250.00,
    usdt: authUser?.usdtBalance || 500.00,
    bob: 3456.78
  })
  
  const [stakingInfo, setStakingInfo] = useState({
    staked: 850.00,
    rewards: 12.5,
    nextDraw: 14, // días
    apr: 15.2
  })

  const [recentTransactions, setRecentTransactions] = useState([
    {
      id: 1,
      type: 'Ahorro',
      amount: '+100 KOFICOIN',
      date: '2024-03-15',
      status: 'Completado'
    },
    {
      id: 2,
      type: 'Intercambio',
      amount: '-300 BOB',
      date: '2024-03-10',
      status: 'Completado'
    },
    {
      id: 3,
      type: 'Depósito',
      amount: '+1000 BOB',
      date: '2024-03-05',
      status: 'Completado'
    },
    {
      id: 4,
      type: 'Ahorro',
      amount: '+20 KOFICOIN',
      date: '2024-02-28',
      status: 'Completado'
    },
    {
      id: 5,
      type: 'Intercambio',
      amount: '-200 BOB',
      date: '2024-02-20',
      status: 'Completado'
    }
  ])

  // Simular actualizaciones en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setStakingInfo(prev => ({
        ...prev,
        rewards: prev.rewards + 0.01
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Actualizar balances cuando cambie el usuario autenticado
  useEffect(() => {
    if (authUser) {
      setBalances({
        koficoin: authUser.kofiBalance,
        usdt: authUser.usdtBalance,
        bob: 3456.78
      })
    }
  }, [authUser])

  return (
    <div className="space-y-8">
      {/* Header con saludo */}
      <motion.div
        className="text-center space-y-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-center space-x-3">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Dashboard
          </h1>
          <RocketLaunchIcon className="w-8 h-8 text-secondary-400 animate-bounce" />
        </div>
        
        <motion.div
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-500/20 to-secondary-400/20 border border-primary-500/30 rounded-full px-6 py-3"
          whileHover={{ scale: 1.05 }}
        >
          <SparklesIcon className="w-5 h-5 text-secondary-400" />
          <span className="text-secondary-400 font-semibold">¡AHORRA AHORA!</span>
          <SparklesIcon className="w-5 h-5 text-secondary-400" />
        </motion.div>
      </motion.div>

      {/* Balance Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <ClientOnly 
          fallback={
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white text-center">Tu balance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <div key={i} className="card bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse">
                    <div className="h-24 bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          }
        >
          <BalanceCards balances={balances} />
        </ClientOnly>
      </motion.div>

      {/* Grid de secciones principales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Random Staking */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <StakingProgress stakingInfo={stakingInfo} />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <QuickActions />
        </motion.div>

        {/* Faucet */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Faucet />
        </motion.div>
      </div>

      {/* Transaction History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <TransactionHistory transactions={recentTransactions} />
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        {/* Total Ahorrado */}
        <div className="card text-center space-y-4">
          <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto">
            <CurrencyDollarIcon className="w-6 h-6 text-primary-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{balances.koficoin.toLocaleString()}</p>
            <p className="text-gray-400">KOFICOIN Total</p>
          </div>
        </div>

        {/* APR Actual */}
        <div className="card text-center space-y-4">
          <div className="w-12 h-12 bg-secondary-400/20 rounded-full flex items-center justify-center mx-auto">
            <ChartBarIcon className="w-6 h-6 text-secondary-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stakingInfo.apr}%</p>
            <p className="text-gray-400">APR Actual</p>
          </div>
        </div>

        {/* Próximo Sorteo */}
        <div className="card text-center space-y-4">
          <div className="w-12 h-12 bg-accent-blue/20 rounded-full flex items-center justify-center mx-auto">
            <ClockIcon className="w-6 h-6 text-accent-blue" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stakingInfo.nextDraw} días</p>
            <p className="text-gray-400">Próximo Sorteo</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
