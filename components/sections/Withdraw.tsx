'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline'

export default function Withdraw() {
  const [withdrawAddress, setWithdrawAddress] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        className="text-center space-y-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-center space-x-3">
          <ArrowUpTrayIcon className="w-8 h-8 text-red-400" />
          <h1 className="text-4xl md:text-5xl font-bold text-white">Retirar</h1>
        </div>
        <p className="text-gray-400 text-lg">
          Retirar fondos de tu cuenta
        </p>
      </motion.div>

      <div className="max-w-2xl mx-auto">
        <motion.div
          className="card space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">
                Dirección de la cartera
              </label>
              <input
                type="text"
                placeholder="Introduce la dirección"
                className="input-primary w-full"
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">
                Importe
              </label>
              <input
                type="number"
                placeholder="Introduce el importe"
                className="input-primary w-full"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
            </div>
          </div>

          <motion.button
            className="btn-primary w-full"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Confirmar
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}
