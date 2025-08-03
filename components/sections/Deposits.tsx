'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowDownTrayIcon,
  CreditCardIcon,
  BanknotesIcon,
  CheckCircleIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-hot-toast'
import QRPaymentModal from '@/components/ui/QRPaymentModal'
import { db } from '@/lib/database'

export default function Deposits() {
  const [depositMethod, setDepositMethod] = useState('bank')
  const [amount, setAmount] = useState('')
  const [selectedCrypto, setSelectedCrypto] = useState('USDT')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [currentTransaction, setCurrentTransaction] = useState<any>(null)
  const { user, updateUserBalance } = useAuth()

  const depositMethods = [
    {
      id: 'bank',
      title: 'Depósito con bolivianos',
      description: 'Transfiere bolivianos con código QR',
      icon: BanknotesIcon,
      selected: true
    },
    {
      id: 'crypto',
      title: 'Depósito con criptomonedas',
      description: 'Deposita directamente con criptomonedas existentes',
      icon: CreditCardIcon,
      selected: false
    }
  ]

  const cryptoOptions = [
    { symbol: 'Bitcoin', name: 'Bitcoin', icon: '₿' },
    { symbol: 'Ethereum', name: 'Ethereum', icon: 'Ξ' },
    { symbol: 'Litecoin', name: 'Litecoin', icon: 'Ł' },
    { symbol: 'Bitcoin Cash', name: 'Bitcoin Cash', icon: '₿' }
  ]

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Por favor introduce un importe válido')
      return
    }

    if (!user) {
      toast.error('Usuario no autenticado')
      return
    }

    setIsProcessing(true)
    
    try {
      // Generar ID de transacción
      const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Preparar datos de la transacción
      const transactionData = {
        transactionId,
        amount: amount,
        currency: depositMethod === 'bank' ? selectedCrypto : 'KOQUICOIN',
        method: depositMethod === 'bank' ? 'Transferencia Bancaria BOB' : 'Depósito Criptomonedas',
        originalAmount: amount,
        originalCurrency: depositMethod === 'bank' ? 'BOB' : 'KOFI'
      }

      setCurrentTransaction(transactionData)
      setShowQRModal(true)
      
    } catch (error) {
      toast.error('Error al generar código QR')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePaymentComplete = async () => {
    if (!currentTransaction || !user) return

    try {
      const amountNumber = parseFloat(currentTransaction.originalAmount)
      let kofiAmount = 0
      let usdtAmount = 0
      
      if (depositMethod === 'bank') {
        // Convertir BOB a KOFI/USDT (nueva tasa: 14 BOB = 1 USD)
        if (selectedCrypto === 'KOFI') {
          kofiAmount = amountNumber / 14 // 14 BOB = 1 KOFI
        } else if (selectedCrypto === 'USDT') {
          usdtAmount = amountNumber / 14 // 14 BOB = 1 Bs
        }
      } else {
        // Depósito directo de crypto
        kofiAmount = amountNumber
      }
      
      // Actualizar balance del usuario
      updateUserBalance(kofiAmount, usdtAmount)
      
      // Crear transacción en la base de datos
      db.createTransaction({
        userId: user.id,
        type: 'deposit',
        amount: kofiAmount > 0 ? kofiAmount : usdtAmount,
        currency: kofiAmount > 0 ? 'KOQUICOIN' : 'Bs',
        status: 'completed',
        description: `Depósito ${currentTransaction.method} - QR: ${currentTransaction.transactionId.slice(-8)}`,
        txHash: currentTransaction.transactionId
      })
      
      toast.success(
        `¡Depósito exitoso! Se agregaron ${kofiAmount > 0 ? `${kofiAmount.toFixed(2)} KOQUICOIN` : `${usdtAmount.toFixed(2)} Bs`} a tu cuenta`
      )
      
      // Limpiar formulario
      setAmount('')
      setCurrentTransaction(null)
      
    } catch (error) {
      toast.error('Error al procesar el depósito')
    }
  }

  const handleCloseQR = () => {
    setShowQRModal(false)
    setCurrentTransaction(null)
    setIsProcessing(false)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        className="text-center space-y-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-center space-x-3">
          <ArrowDownTrayIcon className="w-8 h-8 text-blue-400" />
          <h1 className="text-4xl md:text-5xl font-bold text-white">Fondos de depósito</h1>
        </div>
        <p className="text-gray-400 text-lg">
          Elige tu método de ingreso
        </p>
      </motion.div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Method Selection */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {depositMethods.map((method) => (
            <motion.button
              key={method.id}
              onClick={() => setDepositMethod(method.id)}
              className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                depositMethod === method.id
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-dark-600 bg-dark-800 hover:border-dark-500'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-center space-y-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
                  depositMethod === method.id ? 'bg-primary-500' : 'bg-dark-700'
                }`}>
                  <method.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{method.title}</h3>
                  <p className="text-gray-400 text-sm">{method.description}</p>
                </div>
                {depositMethod === method.id && (
                  <CheckCircleIcon className="w-6 h-6 text-primary-500 mx-auto" />
                )}
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Deposit Form */}
        <motion.div
          className="card space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {depositMethod === 'bank' ? (
            <>
              <h3 className="text-xl font-bold text-white">Depósito con bolivianos (Simulación MVP)</h3>
              <p className="text-gray-400">
                Transfiere bolivianos BCB a Bs o KOQUICOIN de manera simulada para testing.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-white font-medium mb-2">
                    Seleccionar criptomoneda
                  </label>
                  <select 
                    className="input-primary w-full"
                    value={selectedCrypto}
                    onChange={(e) => setSelectedCrypto(e.target.value)}
                  >
                    <option value="USDT">Bs</option>
                    <option value="KOFI">KOQUICOIN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Importe en BOB
                  </label>
                  <input
                    type="number"
                    placeholder="Introduce el importe"
                    className="input-primary w-full"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <div className="bg-dark-700/50 rounded-xl p-4">
                  <h4 className="text-white font-semibold mb-2">Resumen del depósito</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Importe</span>
                      <span className="text-white">{amount || '0.00'} BOB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tasa de cambio</span>
                      <span className="text-white">14 BOB = 1 USD = 1 {selectedCrypto === 'USDT' ? 'Bs' : selectedCrypto}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Recibirás</span>
                      <span className="text-white">{amount ? (parseFloat(amount) / 14).toFixed(4) : '0.0000'} {selectedCrypto === 'USDT' ? 'Bs' : selectedCrypto}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Comisión</span>
                      <span className="text-white">0.00 BOB</span>
                    </div>
                    <div className="flex justify-between border-t border-dark-600 pt-2">
                      <span className="text-white font-semibold">Total</span>
                      <span className="text-white font-semibold">{amount || '0.00'} BOB</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                  <p className="text-yellow-400 text-sm">
                    🚧 <strong>Modo MVP:</strong> Este es un depósito simulado para testing. 
                    En producción se integrará con APIs bancarias reales.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold text-white">Depósito con criptomonedas (Simulación MVP)</h3>
              <p className="text-gray-400">
                Deposita directamente usando las siguientes criptomonedas (simulado)
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-white font-medium mb-2">
                    Importe en KOQUICOIN
                  </label>
                  <input
                    type="number"
                    placeholder="Introduce el importe"
                    className="input-primary w-full"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {cryptoOptions.map((crypto) => (
                    <motion.button
                      key={crypto.symbol}
                      className="p-4 bg-dark-700/50 rounded-xl hover:bg-dark-700 transition-colors"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="text-center space-y-2">
                        <div className="text-2xl">{crypto.icon}</div>
                        <p className="text-white font-medium">{crypto.symbol}</p>
                        <p className="text-gray-400 text-sm">{crypto.name}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                  <p className="text-yellow-400 text-sm">
                    🚧 <strong>Modo MVP:</strong> Este es un depósito simulado para testing. 
                    En producción se integrará con wallets reales.
                  </p>
                </div>
              </div>
            </>
          )}

          <motion.button
            className={`btn-primary w-full ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleDeposit}
            disabled={isProcessing}
            whileHover={!isProcessing ? { scale: 1.02 } : {}}
            whileTap={!isProcessing ? { scale: 0.98 } : {}}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generando código QR...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <QrCodeIcon className="h-5 w-5" />
                <span>Generar código QR para depósito</span>
              </div>
            )}
          </motion.button>
        </motion.div>
      </div>

      {/* QR Payment Modal */}
      {showQRModal && currentTransaction && (
        <QRPaymentModal
          isOpen={showQRModal}
          onClose={handleCloseQR}
          onPaymentComplete={handlePaymentComplete}
          paymentData={currentTransaction}
        />
      )}
    </div>
  )
}
