'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  SparklesIcon, 
  TrophyIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ArrowPathIcon,
  FireIcon,
  GiftIcon,
  StarIcon,
  UserIcon,
  WalletIcon,
  TicketIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/hooks/useAuth'
import MyTickets from './MyTickets'

interface LotteryDraw {
  id: number
  date: string
  winningNumbers: number[]
  prizePool: {
    koficoin: number
    usdt: number
  }
  winners: {
    jackpot: number
    second: number
    third: number
  }
  totalParticipants: number
  status: 'completed' | 'current' | 'upcoming'
}

export default function Lottery() {
  const { user, isAuthenticated, isLoading, loginWithGoogle, connectWallet, logout, purchaseLotteryTicket, testLogin } = useAuth()
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const [activeTab, setActiveTab] = useState<'current' | 'history' | 'stats' | 'mytickets'>('current')
  const [isProcessing, setIsProcessing] = useState(false)
  const [timeLeft, setTimeLeft] = useState({
    days: 7,
    hours: 14,
    minutes: 32,
    seconds: 45
  })

  // Mock data para las loterías
  const lotteryHistory: LotteryDraw[] = [
    {
      id: 1,
      date: '2025-07-28',
      winningNumbers: [1, 3, 5, 7, 8, 9],
      prizePool: { koficoin: 15000, usdt: 2200 },
      winners: { jackpot: 1, second: 3, third: 12 },
      totalParticipants: 847,
      status: 'completed'
    },
    {
      id: 2,
      date: '2025-07-21',
      winningNumbers: [2, 4, 6, 7, 8, 9],
      prizePool: { koficoin: 12500, usdt: 1800 },
      winners: { jackpot: 2, second: 5, third: 18 },
      totalParticipants: 723,
      status: 'completed'
    },
    {
      id: 3,
      date: '2025-07-14',
      winningNumbers: [1, 2, 3, 6, 8, 9],
      prizePool: { koficoin: 18000, usdt: 2500 },
      winners: { jackpot: 0, second: 2, third: 8 },
      totalParticipants: 689,
      status: 'completed'
    }
  ]

  const currentDraw: LotteryDraw = {
    id: 4,
    date: '2025-08-10',
    winningNumbers: [],
    prizePool: { koficoin: 22500, usdt: 3200 },
    winners: { jackpot: 0, second: 0, third: 0 },
    totalParticipants: 1247,
    status: 'current'
  }

  // Variables para compatibilidad con el código existente
  const currentPool = {
    koficoin: currentDraw.prizePool.koficoin,
    usdt: currentDraw.prizePool.usdt
  }

  const pastDraws = lotteryHistory.map(draw => ({
    date: draw.date,
    numbers: draw.winningNumbers.join(' '),
    prize: `${draw.prizePool.koficoin.toLocaleString()} KOFI`
  }))

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const generateRandomNumbers = () => {
    const numbers: number[] = []
    while (numbers.length < 6) {
      const num = Math.floor(Math.random() * 9) + 1
      if (!numbers.includes(num)) {
        numbers.push(num)
      }
    }
    setSelectedNumbers(numbers.sort((a, b) => a - b))
  }

  const handleNumberSelect = (num: number) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== num))
    } else if (selectedNumbers.length < 6) {
      setSelectedNumbers([...selectedNumbers, num].sort((a, b) => a - b))
    }
  }

  const handleTicketPurchase = async () => {
    if (!isAuthenticated || !user) {
      alert('Debes iniciar sesión para comprar tickets')
      return
    }
    
    if (selectedNumbers.length !== 6) {
      alert('Debes seleccionar exactamente 6 números')
      return
    }

    if (user.kofiBalance < 100) {
      alert(`Saldo insuficiente. Necesitas 100 KOQUICOIN pero solo tienes ${user.kofiBalance} KOQUICOIN`)
      return
    }

    try {
      setIsProcessing(true)
      
      const ticket = await purchaseLotteryTicket(selectedNumbers, 100)
      
      alert(`🎫 ¡Ticket comprado exitosamente!
      
📝 Detalles:
• Ticket ID: ${ticket.id.slice(0, 8)}...
• Números: ${selectedNumbers.join(', ')}
• Usuario: ${user.name}
• Costo: 100 KOQUICOIN
• Balance restante: ${user.kofiBalance} KOQUICOIN

🍀 ¡Buena suerte en el sorteo!`)
      
      setSelectedNumbers([])
    } catch (error: any) {
      alert(`❌ Error al comprar ticket: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleLogin = async (method: 'google' | 'wallet') => {
    try {
      setIsProcessing(true)
      
      let result
      if (method === 'google') {
        result = await loginWithGoogle()
      } else {
        result = await connectWallet()
      }
      
      alert(`🎉 ¡Bienvenido a KOQUIFI!

👤 Usuario: ${result.name}
💼 Wallet: ${result.walletAddress}
💰 Balance inicial:
   • ${result.kofiBalance} KOQUICOIN
   • ${result.usdtBalance} Bs

✨ ${result.authMethod === 'google' ? 'Cuenta creada con Google' : 'Wallet conectada'} exitosamente`)
      
    } catch (error: any) {
      alert(`❌ Error al iniciar sesión: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTestLogin = async () => {
    try {
      setIsProcessing(true)
      const testEmail = `test${Date.now()}@gmail.com`
      const testName = `Tester ${Math.floor(Math.random() * 1000)}`
      
      const result = await testLogin(testEmail, testName)
      
      alert(`🧪 Test Login Exitoso!

👤 Usuario: ${result.name}
📧 Email: ${result.email}
💼 Wallet: ${result.walletAddress}
💰 Balance: ${result.kofiBalance} KOQUICOIN, ${result.usdtBalance} Bs`)
      
    } catch (error: any) {
      alert(`❌ Error en test login: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const TabButton = ({ tab, label, icon: Icon }: { tab: string, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(tab as any)}
      className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
        activeTab === tab
          ? 'bg-primary-500 text-white shadow-lg'
          : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        className="text-center space-y-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-center space-x-3">
          <SparklesIcon className="w-8 h-8 text-secondary-400" />
          <h1 className="text-4xl md:text-5xl font-bold text-white">LOTERÍA KOQUIFI</h1>
          <TrophyIcon className="w-8 h-8 text-secondary-400" />
        </div>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Participa en sorteos semanales y gana increíbles premios en KOQUICOIN y Bs
        </p>
        
        {/* User Status */}
        {isAuthenticated && user ? (
          <div className="flex flex-col items-center space-y-4 p-6 bg-dark-700 rounded-xl max-w-2xl mx-auto">
            {/* User Info */}
            <div className="flex items-center space-x-4">
              <img 
                src={user.profilePicture || 'https://ui-avatars.com/api/?name=User&background=22c55e&color=fff'} 
                alt={user.name}
                className="w-12 h-12 rounded-full"
              />
              <div className="text-left">
                <div className="text-white font-medium text-lg">{user.name}</div>
                <div className="text-gray-400 text-sm">
                  {user.authMethod === 'google' ? '🔗 Google' : '👛 Wallet'} • {user.walletAddress?.slice(0, 6)}...{user.walletAddress?.slice(-4)}
                </div>
                {user.email && (
                  <div className="text-gray-400 text-xs">{user.email}</div>
                )}
              </div>
              <button
                onClick={logout}
                className="text-gray-400 hover:text-white transition-colors ml-4"
                disabled={isProcessing}
              >
                Salir
              </button>
            </div>
            
            {/* Balance */}
                    <div className="flex space-x-6 bg-dark-600 rounded-lg p-4 w-full justify-center">
              <div className="text-center">
                <div className="text-primary-400 font-bold text-xl">{user.kofiBalance.toLocaleString()}</div>
                <div className="text-gray-400 text-sm">KOQUICOIN</div>
              </div>
              <div className="text-center">
                <div className="text-secondary-400 font-bold text-xl">{user.usdtBalance.toLocaleString()}</div>
                <div className="text-gray-400 text-sm">Bs</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => handleLogin('google')}
                disabled={isProcessing || isLoading}
                className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <UserIcon className="w-5 h-5" />
                <span>{isProcessing ? 'Iniciando...' : 'Iniciar con Google'}</span>
              </button>
              
              <button
                onClick={() => handleLogin('wallet')}
                disabled={isProcessing || isLoading}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <WalletIcon className="w-5 h-5" />
                <span>{isProcessing ? 'Conectando...' : 'Conectar Wallet'}</span>
              </button>
            </div>
            
            {/* Test Login Button */}
            <div className="flex justify-center">
              <button
                onClick={handleTestLogin}
                disabled={isProcessing || isLoading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors disabled:opacity-50"
              >
                🧪 Test Login (Demo)
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Tabs Navigation */}
      <motion.div 
        className="flex flex-wrap justify-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <TabButton tab="current" label="Sorteo Actual" icon={FireIcon} />
        <TabButton tab="history" label="Historial" icon={CalendarDaysIcon} />
        <TabButton tab="stats" label="Estadísticas" icon={ChartBarIcon} />
        {isAuthenticated && <TabButton tab="mytickets" label="Mis Tickets" icon={TicketIcon} />}
      </motion.div>

      {/* Content based on active tab */}
      <AnimatePresence mode="wait">
        {activeTab === 'current' && (
          <motion.div
            key="current"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {/* Current Pool & Countdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Prize Pool */}
              <div className="card bg-gradient-to-br from-secondary-500/20 to-secondary-600/10 border-secondary-400/30">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-secondary-400/20 rounded-full flex items-center justify-center mx-auto">
                    <GiftIcon className="w-8 h-8 text-secondary-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Premio Acumulado</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-3xl font-bold text-primary-400">
                        {currentDraw.prizePool.koficoin.toLocaleString()} KOQUICOIN
                      </span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-xl text-gray-300">
                        {currentDraw.prizePool.usdt.toLocaleString()} Bs
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-gray-400">
                    <UserGroupIcon className="w-5 h-5" />
                    <span>{currentDraw.totalParticipants} participantes</span>
                  </div>
                </div>
              </div>

              {/* Countdown */}
              <div className="card bg-gradient-to-br from-primary-500/20 to-primary-600/10 border-primary-400/30">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary-400/20 rounded-full flex items-center justify-center mx-auto">
                    <ClockIcon className="w-8 h-8 text-primary-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Tiempo Restante</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'Días', value: timeLeft.days },
                      { label: 'Horas', value: timeLeft.hours },
                      { label: 'Min', value: timeLeft.minutes },
                      { label: 'Seg', value: timeLeft.seconds }
                    ].map((item, index) => (
                      <div key={index} className="bg-dark-700 rounded-lg p-3">
                        <div className="text-2xl font-bold text-primary-400">
                          {item.value.toString().padStart(2, '0')}
                        </div>
                        <div className="text-xs text-gray-400">{item.label}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-gray-400">Próximo sorteo: {currentDraw.date}</p>
                </div>
              </div>
            </div>

            {/* Number Selection */}
            <div className="card">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">
                Selecciona tus números de la suerte
              </h3>
              
              {/* Selected Numbers Display */}
              <div className="mb-6 p-4 bg-dark-700 rounded-lg">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-gray-400">Números seleccionados:</span>
                  <div className="flex space-x-2">
                    {selectedNumbers.length > 0 ? (
                      selectedNumbers.map((num, index) => (
                        <motion.div
                          key={num}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        >
                          {num}
                        </motion.div>
                      ))
                    ) : (
                      <span className="text-gray-500">Ninguno</span>
                    )}
                  </div>
                  <span className="text-gray-400">({selectedNumbers.length}/6)</span>
                </div>
              </div>

              {/* Numbers Grid */}
              <div className="grid grid-cols-9 gap-3 mb-6 justify-center max-w-md mx-auto">
                {Array.from({ length: 9 }, (_, i) => i + 1).map(num => (
                  <motion.button
                    key={num}
                    onClick={() => handleNumberSelect(num)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`w-12 h-12 rounded-full font-bold text-lg transition-all ${
                      selectedNumbers.includes(num)
                        ? 'bg-primary-500 text-white shadow-lg'
                        : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                    }`}
                  >
                    {num}
                  </motion.button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={generateRandomNumbers}
                  className="flex items-center space-x-2 px-6 py-3 bg-secondary-500 hover:bg-secondary-600 text-white rounded-lg font-medium transition-colors"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                  <span>Números Aleatorios</span>
                </button>
                
                <button
                  onClick={() => setSelectedNumbers([])}
                  className="px-6 py-3 bg-dark-600 hover:bg-dark-500 text-white rounded-lg font-medium transition-colors"
                >
                  Limpiar
                </button>
                
                <button
                  onClick={handleTicketPurchase}
                  disabled={selectedNumbers.length !== 6 || !isAuthenticated || isProcessing || (user ? user.kofiBalance < 100 : true)}
                  className={`px-8 py-3 rounded-lg font-medium transition-all ${
                    selectedNumbers.length === 6 && isAuthenticated && user && user.kofiBalance >= 100 && !isProcessing
                      ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isProcessing 
                    ? '🔄 Procesando...'
                    : !isAuthenticated 
                      ? 'Inicia sesión para participar' 
                      : selectedNumbers.length !== 6 
                        ? 'Selecciona 6 números'
                        : user && user.kofiBalance < 100
                          ? `Saldo insuficiente (${user.kofiBalance} KOQUICOIN)`
                          : 'Comprar Ticket (100 KOQUICOIN)'
                  }
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="card">
              <h3 className="text-2xl font-bold text-white mb-6">Sorteos Anteriores</h3>
              
              <div className="space-y-4">
                {lotteryHistory.map((draw, index) => (
                  <motion.div
                    key={draw.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-dark-700 rounded-lg p-6 hover:bg-dark-600 transition-colors"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                      {/* Date & Numbers */}
                      <div>
                        <div className="text-gray-400 text-sm mb-2">Sorteo #{draw.id}</div>
                        <div className="text-white font-medium">{draw.date}</div>
                        <div className="flex space-x-1 mt-2">
                          {draw.winningNumbers.map((num, i) => (
                            <div key={i} className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {num}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Prize Pool */}
                      <div>
                        <div className="text-gray-400 text-sm mb-2">Premio Total</div>
                        <div className="text-primary-400 font-bold">
                          {draw.prizePool.koficoin.toLocaleString()} KOQUICOIN
                        </div>
                        <div className="text-gray-300">
                          {draw.prizePool.usdt.toLocaleString()} Bs
                        </div>
                      </div>

                      {/* Winners */}
                      <div>
                        <div className="text-gray-400 text-sm mb-2">Ganadores</div>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <StarIcon className="w-4 h-4 text-yellow-400" />
                            <span className="text-yellow-400">{draw.winners.jackpot} Premio Mayor</span>
                          </div>
                          <div className="text-gray-300">{draw.winners.second} Segundo</div>
                          <div className="text-gray-300">{draw.winners.third} Tercero</div>
                        </div>
                      </div>

                      {/* Participants */}
                      <div>
                        <div className="text-gray-400 text-sm mb-2">Participación</div>
                        <div className="flex items-center space-x-2">
                          <UserGroupIcon className="w-5 h-5 text-gray-400" />
                          <span className="text-white">{draw.totalParticipants}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card text-center">
                <div className="w-12 h-12 bg-primary-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrophyIcon className="w-6 h-6 text-primary-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-2">
                  {lotteryHistory.reduce((acc, draw) => acc + draw.prizePool.koficoin, 0).toLocaleString()}
                </div>
                <div className="text-gray-400">KOQUICOIN Repartidos</div>
              </div>

              <div className="card text-center">
                <div className="w-12 h-12 bg-secondary-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CurrencyDollarIcon className="w-6 h-6 text-secondary-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-2">
                  {lotteryHistory.reduce((acc, draw) => acc + draw.prizePool.usdt, 0).toLocaleString()}
                </div>
                <div className="text-gray-400">Bs Repartidos</div>
              </div>

              <div className="card text-center">
                <div className="w-12 h-12 bg-green-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserGroupIcon className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-2">
                  {lotteryHistory.reduce((acc, draw) => acc + draw.totalParticipants, 0).toLocaleString()}
                </div>
                <div className="text-gray-400">Total Participantes</div>
              </div>

              <div className="card text-center">
                <div className="w-12 h-12 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <StarIcon className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-2">
                  {lotteryHistory.reduce((acc, draw) => acc + draw.winners.jackpot + draw.winners.second + draw.winners.third, 0)}
                </div>
                <div className="text-gray-400">Total Ganadores</div>
              </div>
            </div>

            {/* Numbers Frequency */}
            <div className="card">
              <h3 className="text-2xl font-bold text-white mb-6">Números Más Sorteados</h3>
              <div className="grid grid-cols-9 gap-3 justify-center max-w-lg mx-auto">
                {/* Frequency data for numbers 1-9 */}
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num, index) => (
                  <div key={num} className="text-center">
                    <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2">
                      {num}
                    </div>
                    <div className="text-xs text-gray-400">{Math.floor(Math.random() * 5) + 1}x</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'mytickets' && (
          <motion.div
            key="mytickets"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <MyTickets />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
