'use client'

import { motion } from 'framer-motion'
import { ClockIcon, SparklesIcon } from '@heroicons/react/24/outline'

interface StakingProgressProps {
  stakingInfo: {
    staked: number
    rewards: number
    nextDraw: number
    apr: number
  }
}

export default function StakingProgress({ stakingInfo }: StakingProgressProps) {
  const progress = 65 // Porcentaje de progreso hacia el próximo sorteo

  return (
    <motion.div
      className="card space-y-6"
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center">
          <SparklesIcon className="w-6 h-6 text-primary-500" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Random Staking</h3>
          <p className="text-gray-400 text-sm">Próximo sorteo {stakingInfo.nextDraw} días</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Progreso</span>
          <span className="text-white font-semibold">{progress}%</span>
        </div>
        
        <div className="relative">
          <div className="w-full bg-dark-700 rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-primary-500 to-secondary-400 h-3 rounded-full relative overflow-hidden"
              style={{ width: `${progress}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-dark-700/50 rounded-xl">
          <p className="text-2xl font-bold text-white">{stakingInfo.staked.toLocaleString()}</p>
          <p className="text-gray-400 text-sm">KOFI en Stake</p>
        </div>
        <div className="text-center p-4 bg-dark-700/50 rounded-xl">
          <p className="text-2xl font-bold text-secondary-400">+{stakingInfo.rewards}</p>
          <p className="text-gray-400 text-sm">Recompensas</p>
        </div>
      </div>

      {/* Next Draw Timer */}
      <motion.div
        className="bg-gradient-to-r from-primary-500/20 to-secondary-400/20 border border-primary-500/30 rounded-xl p-4"
        animate={{ boxShadow: ['0 0 20px rgba(34, 197, 94, 0.3)', '0 0 30px rgba(34, 197, 94, 0.5)', '0 0 20px rgba(34, 197, 94, 0.3)'] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ClockIcon className="w-5 h-5 text-primary-500" />
            <span className="text-white font-semibold">Próximo Sorteo</span>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-white">{stakingInfo.nextDraw} días</p>
            <p className="text-primary-500 text-sm">APR {stakingInfo.apr}%</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
