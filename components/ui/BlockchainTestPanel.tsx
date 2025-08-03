'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useContracts } from '@/lib/contracts'
import { motion } from 'framer-motion'
import { 
  CurrencyDollarIcon,
  SparklesIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

export default function BlockchainTestPanel() {
  const { user, currentAccount, chainId, provider } = useAuth()
  const contracts = useContracts(provider, chainId || '43113')

  // Estados para token KOQUICOIN
  const [koficoinBalance, setKoficoinBalance] = useState('0')
  const [transferTo, setTransferTo] = useState('')
  const [transferAmount, setTransferAmount] = useState('')
  const [transferLoading, setTransferLoading] = useState(false)

  // Estados para lotería
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const [lotteryLoading, setLotteryLoading] = useState(false)

  // Estados para staking
  const [stakeAmount, setStakeAmount] = useState('')
  const [stakingLoading, setStakingLoading] = useState(false)

  const [contractsReady, setContractsReady] = useState(false)

  useEffect(() => {
    if (currentAccount && contracts) {
      loadData()
    }
  }, [currentAccount, contracts, chainId])

  const loadData = async () => {
    if (!contracts || !currentAccount) return

    try {
      // Verificar si los contratos están desplegados
      const isKofiDeployed = contracts.isContractDeployed('KOFICOIN')
      const isLotteryDeployed = contracts.isContractDeployed('LOTTERY')
      
      setContractsReady(isKofiDeployed && isLotteryDeployed)

      if (isKofiDeployed) {
        const balance = await contracts.getKoficoinBalance(currentAccount)
        setKoficoinBalance(balance)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  // Funciones para Token KOQUICOIN
  const handleTransferToken = async () => {
    if (!contracts || !transferTo || !transferAmount) {
      toast.error('Completa todos los campos')
      return
    }

    setTransferLoading(true)
    try {
      const tx = await contracts.transferKoficoin(transferTo, transferAmount)
      toast.success(`Transacción enviada: ${tx.hash.slice(0, 10)}...`)
      
      const receipt = await contracts.waitForTransaction(tx.hash)
      if (receipt?.status === 1) {
        toast.success('¡Transferencia exitosa!')
        await loadData()
        setTransferTo('')
        setTransferAmount('')
      } else {
        toast.error('Transacción falló')
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`)
    } finally {
      setTransferLoading(false)
    }
  }

  // Funciones para Lotería
  const toggleNumber = (num: number) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== num))
    } else if (selectedNumbers.length < 6) {
      setSelectedNumbers([...selectedNumbers, num])
    }
  }

  const generateRandomNumbers = () => {
    const numbers: number[] = []
    while (numbers.length < 6) {
      const num = Math.floor(Math.random() * 49) + 1
      if (!numbers.includes(num)) {
        numbers.push(num)
      }
    }
    setSelectedNumbers(numbers.sort((a, b) => a - b))
  }

  const handleBuyLotteryTicket = async () => {
    if (!contracts || selectedNumbers.length !== 6) {
      toast.error('Selecciona exactamente 6 números')
      return
    }

    setLotteryLoading(true)
    try {
      const tx = await contracts.buyLotteryTicket(selectedNumbers)
      toast.success(`Boleto comprado: ${tx.hash.slice(0, 10)}...`)
      
      const receipt = await contracts.waitForTransaction(tx.hash)
      if (receipt?.status === 1) {
        toast.success('¡Boleto de lotería comprado!')
        setSelectedNumbers([])
      } else {
        toast.error('Compra falló')
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`)
    } finally {
      setLotteryLoading(false)
    }
  }

  if (!user || !currentAccount) {
    return (
      <div className="card text-center">
        <ExclamationTriangleIcon className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Wallet Requerida</h3>
        <p className="text-gray-400">Conecta tu wallet para probar los contratos</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Pruebas de Contratos MVP</h2>
        <p className="text-gray-400">Prueba funcionalidades blockchain en tiempo real</p>
      </div>

      {/* Estado de Contratos */}
      <div className="card">
        <h3 className="text-xl font-bold text-white mb-4">Estado de Contratos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-dark-700/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              {contracts?.isContractDeployed('KOFICOIN') ? (
                <CheckCircleIcon className="w-5 h-5 text-green-400" />
              ) : (
                <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
              )}
              <span className="text-white font-medium">Token KOQUICOIN</span>
            </div>
            <p className="text-sm text-gray-400">
              {contracts?.isContractDeployed('KOFICOIN') ? 'Desplegado ✓' : 'No desplegado ✗'}
            </p>
          </div>

          <div className="bg-dark-700/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              {contracts?.isContractDeployed('LOTTERY') ? (
                <CheckCircleIcon className="w-5 h-5 text-green-400" />
              ) : (
                <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
              )}
              <span className="text-white font-medium">Lotería</span>
            </div>
            <p className="text-sm text-gray-400">
              {contracts?.isContractDeployed('LOTTERY') ? 'Desplegado ✓' : 'No desplegado ✗'}
            </p>
          </div>

          <div className="bg-dark-700/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-white font-medium">Red: {chainId}</span>
            </div>
            <p className="text-sm text-gray-400">
              {chainId === '43113' ? 'Avalanche Fuji ✓' : 'Cambiar a Fuji'}
            </p>
          </div>
        </div>
      </div>

      {/* Token KOQUICOIN */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-2 mb-4">
          <CurrencyDollarIcon className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-bold text-white">Token KOQUICOIN</h3>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
          <p className="text-blue-400 font-semibold">Balance: {koficoinBalance} KOFI</p>
        </div>

        {contracts?.isContractDeployed('KOFICOIN') ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Dirección destino (0x...)"
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
                className="input"
              />
              <input
                type="number"
                placeholder="Cantidad"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                className="input"
              />
            </div>
            <motion.button
              onClick={handleTransferToken}
              disabled={transferLoading || !transferTo || !transferAmount}
              className="btn-primary w-full disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {transferLoading ? (
                <div className="flex items-center space-x-2">
                  <ClockIcon className="w-5 h-5 animate-spin" />
                  <span>Enviando...</span>
                </div>
              ) : (
                'Transferir KOQUICOIN'
              )}
            </motion.button>
          </div>
        ) : (
          <div className="text-center text-yellow-400">
            <p>⚠️ Contrato KOQUICOIN no desplegado</p>
            <p className="text-sm text-gray-400 mt-2">
              Despliega el contrato en Remix IDE y actualiza la dirección en lib/contracts.ts
            </p>
          </div>
        )}
      </motion.div>

      {/* Lotería */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center space-x-2 mb-4">
          <SparklesIcon className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-bold text-white">Lotería Blockchain</h3>
        </div>

        {contracts?.isContractDeployed('LOTTERY') ? (
          <div className="space-y-4">
            <div>
              <p className="text-gray-400 mb-2">Selecciona 6 números (1-49):</p>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {Array.from({ length: 49 }, (_, i) => i + 1).map(num => (
                  <button
                    key={num}
                    onClick={() => toggleNumber(num)}
                    className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                      selectedNumbers.includes(num)
                        ? 'bg-purple-500 text-white'
                        : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                    }`}
                    disabled={!selectedNumbers.includes(num) && selectedNumbers.length >= 6}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {selectedNumbers.length > 0 && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <p className="text-purple-400">Números seleccionados: {selectedNumbers.join(', ')}</p>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={generateRandomNumbers}
                className="btn-secondary flex-1"
              >
                Números Aleatorios
              </button>
              <button
                onClick={() => setSelectedNumbers([])}
                className="btn-secondary flex-1"
              >
                Limpiar
              </button>
            </div>

            <motion.button
              onClick={handleBuyLotteryTicket}
              disabled={lotteryLoading || selectedNumbers.length !== 6}
              className="btn-primary w-full disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {lotteryLoading ? (
                <div className="flex items-center space-x-2">
                  <ClockIcon className="w-5 h-5 animate-spin" />
                  <span>Comprando...</span>
                </div>
              ) : (
                'Comprar Boleto (0.001 AVAX)'
              )}
            </motion.button>
          </div>
        ) : (
          <div className="text-center text-yellow-400">
            <p>⚠️ Contrato de Lotería no desplegado</p>
            <p className="text-sm text-gray-400 mt-2">
              Despliega el contrato en Remix IDE y actualiza la dirección en lib/contracts.ts
            </p>
          </div>
        )}
      </motion.div>

      {/* Guía Rápida */}
      <div className="card bg-yellow-500/10 border-yellow-500/30">
        <h3 className="text-xl font-bold text-yellow-400 mb-4">🚀 Guía Rápida MVP</h3>
        <div className="space-y-2 text-sm text-gray-300">
          <p><strong>1. Desplegar Contratos:</strong> Usa Remix IDE con los archivos en /contracts/</p>
          <p><strong>2. Actualizar Direcciones:</strong> Edita CONTRACT_ADDRESSES en lib/contracts.ts</p>
          <p><strong>3. Obtener Fondos:</strong> Usa el faucet de Avalanche Fuji</p>
          <p><strong>4. Probar Funciones:</strong> Transfiere tokens y compra boletos</p>
        </div>
        <div className="mt-4 flex space-x-4">
          <a
            href="https://remix.ethereum.org"
            target="_blank"
            className="text-blue-400 hover:underline text-sm"
          >
            🔗 Remix IDE
          </a>
          <a
            href="https://faucet.avax.network/"
            target="_blank"
            className="text-blue-400 hover:underline text-sm"
          >
            💰 Faucet AVAX
          </a>
        </div>
      </div>
    </div>
  )
}
