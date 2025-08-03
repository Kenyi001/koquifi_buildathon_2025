'use client'

import { motion } from 'framer-motion'
import { 
  ArrowDownTrayIcon, 
  ArrowUpTrayIcon, 
  ArrowsRightLeftIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'

export default function QuickActions() {
  const actions = [
    {
      id: 'deposit',
      title: 'Depositar',
      description: 'Añadir fondos a tu cuenta',
      icon: ArrowDownTrayIcon,
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700'
    },
    {
      id: 'withdraw',
      title: 'Retirar',
      description: 'Sacar tus ganancias',
      icon: ArrowUpTrayIcon,
      color: 'from-red-500 to-red-600',
      hoverColor: 'hover:from-red-600 hover:to-red-700'
    },
    {
      id: 'exchange',
      title: 'Intercambiar',
      description: 'Cambiar entre monedas',
      icon: ArrowsRightLeftIcon,
      color: 'from-secondary-400 to-secondary-500',
      hoverColor: 'hover:from-secondary-500 hover:to-secondary-600'
    },
    {
      id: 'lottery',
      title: 'Lotería',
      description: 'Participar en sorteos',
      icon: SparklesIcon,
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700'
    },
    {
      id: 'savings',
      title: 'Ahorros',
      description: 'Hacer crecer tu dinero',
      icon: CurrencyDollarIcon,
      color: 'from-primary-500 to-primary-600',
      hoverColor: 'hover:from-primary-600 hover:to-primary-700'
    },
    {
      id: 'rewards',
      title: 'Recompensas',
      description: 'Ver tus logros',
      icon: TrophyIcon,
      color: 'from-yellow-500 to-yellow-600',
      hoverColor: 'hover:from-yellow-600 hover:to-yellow-700'
    }
  ]

  const handleActionClick = (actionId: string) => {
    console.log(`Clicked action: ${actionId}`)
    // Aquí puedes agregar la lógica para navegar o ejecutar acciones
  }

  return (
    <div className="card space-y-6">
      <h3 className="text-xl font-bold text-white">Acciones rápidas</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <motion.button
            key={action.id}
            onClick={() => handleActionClick(action.id)}
            className={`p-4 rounded-xl bg-gradient-to-br ${action.color} ${action.hoverColor} transition-all duration-300 group`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-white/30 transition-colors">
                <action.icon className="w-6 h-6 text-white" />
              </div>
              
              <div>
                <p className="text-white font-semibold text-sm">{action.title}</p>
                <p className="text-white/80 text-xs">{action.description}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
      
      {/* Quick Stats */}
      <motion.div
        className="bg-gradient-to-r from-primary-500/10 to-secondary-400/10 border border-primary-500/20 rounded-xl p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-semibold">Estado de la cuenta</p>
            <p className="text-primary-500 text-sm">Activa y verificada ✓</p>
          </div>
          <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center">
            <TrophyIcon className="w-6 h-6 text-primary-500" />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
