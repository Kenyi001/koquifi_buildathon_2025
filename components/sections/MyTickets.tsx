'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TicketIcon,
  ClockIcon,
  TrophyIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/hooks/useAuth'
import { db, LotteryTicket } from '@/lib/database'

export default function MyTickets() {
  const { user, isAuthenticated } = useAuth()
  const [tickets, setTickets] = useState<LotteryTicket[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserTickets()
    }
  }, [isAuthenticated, user])

  const loadUserTickets = () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      const userTickets = db.getUserTickets(user.id)
      setTickets(userTickets.sort((a, b) => 
        new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
      ))
    } catch (error) {
      console.error('Error loading tickets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'winner': return 'text-green-400'
      case 'loser': return 'text-red-400'
      case 'active': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'winner': return '🏆 Ganador'
      case 'loser': return '❌ Perdedor'
      case 'active': return '⏳ Activo'
      default: return '❓ Desconocido'
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="card text-center">
        <TicketIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Mis Tickets</h3>
        <p className="text-gray-400">Inicia sesión para ver tus tickets de lotería</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="card text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-400">Cargando tickets...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <TicketIcon className="w-8 h-8 text-primary-400" />
            <h3 className="text-2xl font-bold text-white">Mis Tickets</h3>
          </div>
          <div className="text-right">
            <div className="text-primary-400 font-bold text-lg">{tickets.length}</div>
            <div className="text-gray-400 text-sm">Total</div>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <div className="card text-center">
          <TicketIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-white mb-2">No tienes tickets</h4>
          <p className="text-gray-400">Compra tu primer ticket para participar en la lotería</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket, index) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card bg-gradient-to-r from-dark-700 to-dark-600 border-primary-400/20"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Ticket Info */}
                <div>
                  <div className="text-gray-400 text-sm mb-1">Ticket #{ticket.id.slice(0, 8)}</div>
                  <div className="text-white font-medium mb-2">
                    Lotería #{ticket.lotteryId.slice(-4)}
                  </div>
                  <div className={`text-sm font-medium ${getStatusColor(ticket.status)}`}>
                    {getStatusText(ticket.status)}
                  </div>
                </div>

                {/* Numbers */}
                <div>
                  <div className="text-gray-400 text-sm mb-2">Números</div>
                  <div className="flex space-x-1">
                    {ticket.numbers.map((num, i) => (
                      <div key={i} className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {num}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cost & Date */}
                <div>
                  <div className="text-gray-400 text-sm mb-1">Costo</div>
                  <div className="text-primary-400 font-bold mb-2">{ticket.cost} KOFI</div>
                  <div className="text-gray-400 text-xs">
                    {new Date(ticket.purchaseDate).toLocaleDateString()}
                  </div>
                </div>

                {/* Prize */}
                <div>
                  {ticket.winningAmount ? (
                    <>
                      <div className="text-gray-400 text-sm mb-1">Premio</div>
                      <div className="text-green-400 font-bold text-lg">
                        +{ticket.winningAmount} KOFI
                      </div>
                    </>
                  ) : ticket.status === 'active' ? (
                    <div className="text-center">
                      <ClockIcon className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                      <div className="text-yellow-400 text-sm">Esperando sorteo</div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-gray-500 text-sm">Sin premio</div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Statistics */}
      {tickets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card text-center">
            <div className="text-2xl font-bold text-white mb-1">
              {tickets.filter(t => t.status === 'active').length}
            </div>
            <div className="text-gray-400 text-sm">Tickets Activos</div>
          </div>
          
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {tickets.filter(t => t.status === 'winner').length}
            </div>
            <div className="text-gray-400 text-sm">Ganadores</div>
          </div>
          
          <div className="card text-center">
            <div className="text-2xl font-bold text-primary-400 mb-1">
              {tickets.reduce((sum, t) => sum + t.cost, 0)}
            </div>
            <div className="text-gray-400 text-sm">KOFI Invertidos</div>
          </div>
        </div>
      )}
    </div>
  )
}
