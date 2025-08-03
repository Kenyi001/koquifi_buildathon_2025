'use client'

import { motion } from 'framer-motion'

interface Transaction {
  id: number
  type: string
  amount: string
  date: string
  status: string
}

interface TransactionHistoryProps {
  transactions: Transaction[]
}

export default function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completado':
        return 'text-green-400 bg-green-400/20'
      case 'pendiente':
        return 'text-yellow-400 bg-yellow-400/20'
      case 'fallido':
        return 'text-red-400 bg-red-400/20'
      default:
        return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'ahorro':
        return 'text-primary-500'
      case 'intercambio':
        return 'text-secondary-400'
      case 'depósito':
        return 'text-blue-400'
      case 'retiro':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <motion.div
      className="card space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="text-xl font-bold text-white">Transacciones recientes</h3>
      
      <div className="space-y-3">
        {transactions.map((transaction, index) => (
          <motion.div
            key={transaction.id}
            className="flex items-center justify-between p-4 bg-dark-700/50 rounded-xl hover:bg-dark-700 transition-colors cursor-pointer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(transaction.type)} bg-current/20`}>
                <span className="text-sm font-bold">
                  {transaction.type.charAt(0).toUpperCase()}
                </span>
              </div>
              
              <div>
                <p className="text-white font-medium">{transaction.type}</p>
                <p className="text-gray-400 text-sm">{transaction.date}</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className={`font-semibold ${
                transaction.amount.startsWith('+') ? 'text-green-400' : 'text-red-400'
              }`}>
                {transaction.amount}
              </p>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(transaction.status)}`}>
                {transaction.status}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
      
      <motion.button
        className="w-full py-3 text-primary-500 border border-primary-500/30 rounded-xl hover:bg-primary-500 hover:text-white transition-all duration-300"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Ver todas las transacciones
      </motion.button>
    </motion.div>
  )
}
