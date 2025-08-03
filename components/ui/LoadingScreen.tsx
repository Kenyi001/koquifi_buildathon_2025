'use client'

import { motion } from 'framer-motion'

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-black flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* Logo animado */}
        <motion.div
          className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-400 rounded-2xl flex items-center justify-center mx-auto"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <span className="text-2xl font-bold text-white">K</span>
        </motion.div>
        
        {/* Texto */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-secondary-400 bg-clip-text text-transparent">
            KOQUIFI
          </h1>
          <p className="text-gray-400 mt-2">Iniciando tu experiencia DeFi...</p>
        </motion.div>
        
        {/* Barra de progreso */}
        <motion.div
          className="w-64 h-2 bg-dark-700 rounded-full overflow-hidden mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-primary-500 to-secondary-400"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, delay: 1 }}
          />
        </motion.div>
        
        {/* Puntos de carga */}
        <motion.div
          className="flex justify-center space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-primary-500 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  )
}
