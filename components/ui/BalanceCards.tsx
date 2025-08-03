'use client'

import { motion } from 'framer-motion'
import { 
  CurrencyDollarIcon, 
  ChartBarIcon,
  BanknotesIcon 
} from '@heroicons/react/24/outline'

interface BalanceCardsProps {
  balances: {
    koficoin: number
    usdt: number
    bob: number
  }
}

export default function BalanceCards({ balances }: BalanceCardsProps) {
  const cards = [
    {
      title: 'KOQUICOIN',
      amount: balances.koficoin,
      currency: 'KOQUICOIN',
      color: 'from-primary-500 to-primary-600',
      icon: CurrencyDollarIcon,
      change: '+5.2%'
    },
    {
      title: 'USDT',
      amount: balances.usdt,
      currency: 'USDT',
      color: 'from-secondary-400 to-secondary-500',
      icon: ChartBarIcon,
      change: '+1.8%'
    }
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white text-center">Tu balance</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.color} p-6 shadow-xl`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-black/10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            </div>
            
            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    {card.icon && <card.icon className="w-6 h-6 text-white" />}
                  </div>
                  <span className="text-white/80 font-medium">{card.title}</span>
                </div>
                <span className="text-white/60 text-sm bg-white/20 px-2 py-1 rounded-full">
                  {card.change}
                </span>
              </div>
              
              <div className="space-y-2">
                <p className="text-3xl font-bold text-white">
                  {card.amount.toLocaleString('es-ES', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
                <p className="text-white/80 text-sm">{card.currency}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
