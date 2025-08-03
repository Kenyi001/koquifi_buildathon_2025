'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import QRCode from 'react-qr-code'
import { 
  QrCodeIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface QRPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onPaymentComplete: () => void
  paymentData: {
    amount: string
    currency: string
    method: string
    transactionId: string
  }
}

export default function QRPaymentModal({ 
  isOpen, 
  onClose, 
  onPaymentComplete, 
  paymentData 
}: QRPaymentModalProps) {
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutos
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'expired'>('pending')

  // Datos del QR - simulando información de pago
  const qrData = JSON.stringify({
    type: 'KOQUIFI_PAYMENT',
    transactionId: paymentData.transactionId,
    amount: paymentData.amount,
    currency: paymentData.currency,
    method: paymentData.method,
    timestamp: Date.now(),
    recipient: 'KOQUIFI_BANK_ACCOUNT',
    reference: `DEP-${paymentData.transactionId.slice(-8)}`
  })

  // Countdown timer
  useEffect(() => {
    if (!isOpen || paymentStatus !== 'pending') return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setPaymentStatus('expired')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, paymentStatus])

  // Simular detección de pago después de 10 segundos
  useEffect(() => {
    if (!isOpen || paymentStatus !== 'pending') return

    const paymentSimulation = setTimeout(() => {
      setPaymentStatus('completed')
      setTimeout(() => {
        onPaymentComplete()
        onClose()
      }, 2000)
    }, 10000) // 10 segundos

    return () => clearTimeout(paymentSimulation)
  }, [isOpen, paymentStatus, onPaymentComplete, onClose])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleManualConfirm = () => {
    setPaymentStatus('completed')
    setTimeout(() => {
      onPaymentComplete()
      onClose()
    }, 1000)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-md bg-dark-800 rounded-2xl border border-primary-500/30 overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-dark-700">
            <div className="flex items-center space-x-3">
              <QrCodeIcon className="w-6 h-6 text-primary-500" />
              <h3 className="text-xl font-bold text-white">Código QR de Pago</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {paymentStatus === 'pending' && (
              <>
                {/* QR Code */}
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-xl">
                    <QRCode
                      value={qrData}
                      size={200}
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    />
                  </div>
                </div>

                {/* Payment Info */}
                <div className="space-y-3">
                  <div className="text-center">
                    <p className="text-white font-semibold text-lg">
                      {paymentData.amount} {paymentData.currency === 'USDT' ? 'Bs' : paymentData.currency === 'KOFI' ? 'KOQUICOIN' : paymentData.currency}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Método: {paymentData.method}
                    </p>
                  </div>

                  <div className="bg-dark-700/50 rounded-xl p-4 space-y-2">
                    <h4 className="text-white font-medium">Instrucciones:</h4>
                    <ol className="text-gray-300 text-sm space-y-1">
                      <li>1. Escanea el código QR con tu app bancaria</li>
                      <li>2. Confirma el pago de {paymentData.amount} BOB</li>
                      <li>3. El depósito se procesará automáticamente</li>
                    </ol>
                  </div>

                  {/* Timer */}
                  <div className="flex items-center justify-center space-x-2 text-yellow-400">
                    <ClockIcon className="w-5 h-5" />
                    <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
                  </div>

                  {/* Manual Confirm Button */}
                  <motion.button
                    onClick={handleManualConfirm}
                    className="w-full btn-primary"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    ✅ Confirmar Pago Manualmente (Para Testing)
                  </motion.button>
                </div>
              </>
            )}

            {paymentStatus === 'completed' && (
              <motion.div
                className="text-center space-y-4"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <motion.div
                  className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                >
                  <CheckCircleIcon className="w-10 h-10 text-white" />
                </motion.div>
                <div>
                  <h4 className="text-xl font-bold text-green-400">¡Pago Completado!</h4>
                  <p className="text-gray-300">
                    Tu depósito de {paymentData.amount} {paymentData.currency === 'USDT' ? 'Bs' : paymentData.currency === 'KOFI' ? 'KOQUICOIN' : paymentData.currency} ha sido procesado
                  </p>
                </div>
              </motion.div>
            )}

            {paymentStatus === 'expired' && (
              <motion.div
                className="text-center space-y-4"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto">
                  <XMarkIcon className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-red-400">Código Expirado</h4>
                  <p className="text-gray-300">
                    El tiempo para completar el pago ha expirado
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-full btn-secondary"
                >
                  Cerrar
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
