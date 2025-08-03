'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BanknotesIcon,
  TrophyIcon,
  CalendarDaysIcon,
  ClockIcon,
  StarIcon,
  GiftIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-hot-toast'
import { db } from '@/lib/database'
import Image from 'next/image'

interface StakingPool {
  id: string
  name: string
  apy: number
  minAmount: number
  duration: number // días
  monthlyPrize: number
  weeklyPrize: number
  description: string
  isActive: boolean
}

interface UserStaking {
  id: string
  userId: string
  poolId: string
  amount: number
  startDate: string
  endDate: string
  isActive: boolean
  ticketsEarned: number
}

export default function Savings() {
  const { user, updateUserBalance } = useAuth()
  const [selectedPool, setSelectedPool] = useState<StakingPool | null>(null)
  const [stakingAmount, setStakingAmount] = useState('')
  const [userStakings, setUserStakings] = useState<UserStaking[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const stakingPools: StakingPool[] = [
    {
      id: 'basic',
      name: 'Ahorro Básico',
      apy: 8.5,
      minAmount: 10,
      duration: 30,
      monthlyPrize: 1000,
      weeklyPrize: 150,
      description: 'Plan ideal para empezar a ahorrar. Gana intereses y participa en sorteos semanales.',
      isActive: true
    },
    {
      id: 'premium',
      name: 'Ahorro Premium',
      apy: 12.0,
      minAmount: 50,
      duration: 30,
      monthlyPrize: 5000,
      weeklyPrize: 500,
      description: 'Mayor rentabilidad y premios más grandes. Requiere mayor inversión inicial.',
      isActive: true
    },
    {
      id: 'elite',
      name: 'Ahorro Elite',
      apy: 15.5,
      minAmount: 200,
      duration: 30,
      monthlyPrize: 15000,
      weeklyPrize: 2000,
      description: 'Máxima rentabilidad y premios exclusivos para inversores serios.',
      isActive: true
    }
  ]

  const nextDraws = [
    {
      type: 'Semanal',
      date: 'Este Domingo 23:59',
      prize: 2650,
      participants: 127,
      icon: GiftIcon
    },
    {
      type: 'Mensual',
      date: '31 de Agosto',
      prize: 21000,
      participants: 89,
      icon: TrophyIcon
    }
  ]

  useEffect(() => {
    if (user) {
      loadUserStakings()
    }
  }, [user])

  const loadUserStakings = () => {
    // Simular carga de stakings del usuario
    // En producción esto vendría de la base de datos
    const mockStakings: UserStaking[] = [
      {
        id: 'staking_1',
        userId: user?.id || '',
        poolId: 'basic',
        amount: 50,
        startDate: '2025-07-15',
        endDate: '2025-08-14',
        isActive: true,
        ticketsEarned: 5
      }
    ]
    setUserStakings(mockStakings)
  }

  const handleStake = async () => {
    if (!user || !selectedPool) {
      toast.error('Por favor selecciona un plan de ahorro')
      return
    }

    const amount = parseFloat(stakingAmount)
    if (!amount || amount < selectedPool.minAmount) {
      toast.error(`El monto mínimo es ${selectedPool.minAmount} KOFI`)
      return
    }

    if (amount > user.kofiBalance) {
      toast.error('Saldo insuficiente')
      return
    }

    setIsProcessing(true)

    try {
      // Simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Crear staking
      const newStaking: UserStaking = {
        id: `staking_${Date.now()}`,
        userId: user.id,
        poolId: selectedPool.id,
        amount: amount,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + selectedPool.duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isActive: true,
        ticketsEarned: Math.floor(amount / 10) // 1 ticket cada 10 KOFI
      }

      // Actualizar balance (restar el monto del staking)
      updateUserBalance(-amount, 0)

      // Registrar transacción
      db.createTransaction({
        userId: user.id,
        type: 'stake',
        amount: amount,
        currency: 'KOQUICOIN',
        status: 'completed',
        description: `Staking ${selectedPool.name} - ${selectedPool.duration} días`,
        txHash: `stake_${newStaking.id}`
      })

      // Actualizar lista local
      setUserStakings([...userStakings, newStaking])

      toast.success(
        `¡Staking creado exitosamente! Ahorraste ${amount} KOFI y ganaste ${newStaking.ticketsEarned} tickets para sorteos.`
      )

      setStakingAmount('')
      setSelectedPool(null)

    } catch (error) {
      toast.error('Error al crear el staking')
    } finally {
      setIsProcessing(false)
    }
  }

  const calculateEarnings = (staking: UserStaking) => {
    const pool = stakingPools.find(p => p.id === staking.poolId)
    if (!pool) return 0
    
    const daysElapsed = Math.floor((Date.now() - new Date(staking.startDate).getTime()) / (1000 * 60 * 60 * 24))
    const dailyRate = pool.apy / 365 / 100
    return staking.amount * dailyRate * Math.min(daysElapsed, pool.duration)
  }

  const getTotalStaked = () => {
    return userStakings.filter(s => s.isActive).reduce((sum, s) => sum + s.amount, 0)
  }

  const getTotalEarnings = () => {
    return userStakings.filter(s => s.isActive).reduce((sum, s) => sum + calculateEarnings(s), 0)
  }

  const getTotalTickets = () => {
    return userStakings.filter(s => s.isActive).reduce((sum, s) => sum + s.ticketsEarned, 0)
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header con logo */}
      <motion.div
        className="text-center space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center space-x-4">
          <Image 
            src="/logo.svg" 
            alt="KoquiFi Logo" 
            width={60} 
            height={60}
            className="rounded-xl"
          />
          <div>
            <h1 className="text-4xl font-bold text-white">KoquiFi Ahorros</h1>
            <p className="text-xl text-gray-400">Tu cuenta de ahorros inteligente</p>
          </div>
        </div>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Ahorra con staking, gana intereses competitivos y participa automáticamente en sorteos semanales y mensuales.
          <br />
          <span className="text-green-400 font-semibold">1 USD = 14 BOB | Intereses pagados en KOFI</span>
        </p>
      </motion.div>

      {/* Resumen de cuenta */}
      {user && (
        <motion.div
          className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <BanknotesIcon className="h-8 w-8 mx-auto mb-2" />
              <p className="text-green-100">Total Ahorrado</p>
              <p className="text-2xl font-bold">{getTotalStaked().toFixed(2)} KOFI</p>
            </div>
            <div className="text-center">
              <ChartBarIcon className="h-8 w-8 mx-auto mb-2" />
              <p className="text-green-100">Intereses Ganados</p>
              <p className="text-2xl font-bold">+{getTotalEarnings().toFixed(4)} KOFI</p>
            </div>
            <div className="text-center">
              <StarIcon className="h-8 w-8 mx-auto mb-2" />
              <p className="text-green-100">Tickets de Sorteo</p>
              <p className="text-2xl font-bold">{getTotalTickets()}</p>
            </div>
            <div className="text-center">
              <CurrencyDollarIcon className="h-8 w-8 mx-auto mb-2" />
              <p className="text-green-100">Disponible</p>
              <p className="text-2xl font-bold">{user.kofiBalance.toFixed(2)} KOFI</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Próximos sorteos */}
      <motion.div
        className="bg-dark-800/50 backdrop-blur-sm rounded-2xl p-6 border border-dark-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <TrophyIcon className="h-6 w-6 mr-2 text-yellow-400" />
          Próximos Sorteos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {nextDraws.map((draw, index) => (
            <div key={index} className="bg-dark-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <draw.icon className="h-5 w-5 text-yellow-400" />
                  <span className="text-white font-semibold">{draw.type}</span>
                </div>
                <span className="text-yellow-400 font-bold">{draw.prize.toLocaleString()} KOFI</span>
              </div>
              <p className="text-gray-400 text-sm mb-2">{draw.date}</p>
              <p className="text-gray-500 text-xs">{draw.participants} participantes</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Planes de ahorro */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-white">Planes de Ahorro</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stakingPools.map((pool) => (
            <motion.div
              key={pool.id}
              className={`bg-dark-800/50 backdrop-blur-sm rounded-2xl p-6 border transition-all duration-300 cursor-pointer ${
                selectedPool?.id === pool.id 
                  ? 'border-green-500 bg-green-500/10' 
                  : 'border-dark-700 hover:border-green-600'
              }`}
              onClick={() => setSelectedPool(pool)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white">{pool.name}</h3>
                  <p className="text-3xl font-bold text-green-400">{pool.apy}% APY</p>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mínimo:</span>
                    <span className="text-white">{pool.minAmount} KOFI</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duración:</span>
                    <span className="text-white">{pool.duration} días</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Premio semanal:</span>
                    <span className="text-yellow-400">{pool.weeklyPrize} KOFI</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Premio mensual:</span>
                    <span className="text-yellow-400">{pool.monthlyPrize} KOFI</span>
                  </div>
                </div>

                <p className="text-gray-400 text-sm">{pool.description}</p>

                {selectedPool?.id === pool.id && (
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <div>
                      <label className="block text-white font-medium mb-2">
                        Monto a ahorrar (KOFI)
                      </label>
                      <input
                        type="number"
                        placeholder={`Mínimo ${pool.minAmount} KOFI`}
                        className="input-primary w-full"
                        value={stakingAmount}
                        onChange={(e) => setStakingAmount(e.target.value)}
                      />
                    </div>

                    {stakingAmount && parseFloat(stakingAmount) >= pool.minAmount && (
                      <div className="bg-dark-700/50 rounded-xl p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Tickets de sorteo:</span>
                          <span className="text-white">{Math.floor(parseFloat(stakingAmount) / 10)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Intereses estimados (30 días):</span>
                          <span className="text-green-400">
                            +{((parseFloat(stakingAmount) * pool.apy / 100 / 12)).toFixed(4)} KOFI
                          </span>
                        </div>
                      </div>
                    )}

                    <motion.button
                      onClick={handleStake}
                      disabled={isProcessing || !stakingAmount || parseFloat(stakingAmount) < pool.minAmount}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isProcessing ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <BanknotesIcon className="h-5 w-5" />
                          <span>Empezar a Ahorrar</span>
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Mis ahorros activos */}
      {userStakings.length > 0 && (
        <motion.div
          className="bg-dark-800/50 backdrop-blur-sm rounded-2xl p-6 border border-dark-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <CheckCircleIcon className="h-6 w-6 mr-2 text-green-400" />
            Mis Ahorros Activos
          </h2>
          <div className="space-y-4">
            {userStakings.filter(s => s.isActive).map((staking) => {
              const pool = stakingPools.find(p => p.id === staking.poolId)
              const earnings = calculateEarnings(staking)
              const daysRemaining = Math.max(0, Math.ceil((new Date(staking.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
              
              return (
                <div key={staking.id} className="bg-dark-700/50 rounded-xl p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Plan</p>
                      <p className="text-white font-semibold">{pool?.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Monto</p>
                      <p className="text-white font-semibold">{staking.amount} KOFI</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Intereses ganados</p>
                      <p className="text-green-400 font-semibold">+{earnings.toFixed(4)} KOFI</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Días restantes</p>
                      <p className="text-white font-semibold">{daysRemaining} días</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <StarIcon className="h-4 w-4 text-yellow-400" />
                      <span className="text-gray-400">{staking.ticketsEarned} tickets de sorteo</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="h-4 w-4 text-blue-400" />
                      <span className="text-gray-400">Desde {staking.startDate}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
