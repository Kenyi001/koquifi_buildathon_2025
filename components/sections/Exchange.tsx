'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowsRightLeftIcon } from '@heroicons/react/24/outline'

export default function Exchange() {
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        className="text-center space-y-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-center space-x-3">
          <ArrowsRightLeftIcon className="w-8 h-8 text-secondary-400" />
          <h1 className="text-4xl md:text-5xl font-bold text-white">Intercambio de dinero</h1>
        </div>
      </motion.div>

      <div className="max-w-2xl mx-auto">
        <motion.div
          className="card space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* From Section */}
          <div className="space-y-2">
            <label className="block text-white font-medium">Tu envío</label>
            <div className="bg-dark-700/50 rounded-xl p-4">
              <div className="flex items-center space-x-4">
                <select className="bg-dark-600 text-white rounded-lg px-3 py-2 border border-dark-500">
                  <option>De</option>
                  <option>BOB</option>
                  <option>USDT</option>
                  <option>KOFICOIN</option>
                </select>
                <input
                  type="number"
                  placeholder="0.00"
                  className="flex-1 bg-transparent text-white text-xl placeholder-gray-400 border-none outline-none"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* To Section */}
          <div className="space-y-2">
            <label className="block text-white font-medium">Usted recibe</label>
            <div className="bg-dark-700/50 rounded-xl p-4">
              <div className="flex items-center space-x-4">
                <select className="bg-dark-600 text-white rounded-lg px-3 py-2 border border-dark-500">
                  <option>Importe</option>
                  <option>USDT</option>
                  <option>KOFICOIN</option>
                  <option>BOB</option>
                </select>
                <input
                  type="number"
                  placeholder="0.00"
                  className="flex-1 bg-transparent text-white text-xl placeholder-gray-400 border-none outline-none"
                  value={toAmount}
                  onChange={(e) => setToAmount(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="text-center text-gray-400 text-sm">
            1 usdt = 1 Único
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
