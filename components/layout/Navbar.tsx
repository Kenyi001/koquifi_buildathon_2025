'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { 
  HomeIcon, 
  CurrencyDollarIcon, 
  ArrowsRightLeftIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  SparklesIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'

interface NavbarProps {
  activeSection: string
  setActiveSection: (section: string) => void
  user: any
  onLogout: () => void
}

export default function Navbar({ activeSection, setActiveSection, user, onLogout }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
    { id: 'deposits', label: 'Depositar', icon: ArrowDownTrayIcon },
    { id: 'withdraw', label: 'Retirar', icon: ArrowUpTrayIcon },
    { id: 'savings', label: 'Ahorros', icon: CurrencyDollarIcon },
    { id: 'exchange', label: 'Intercambio', icon: ArrowsRightLeftIcon },
    { id: 'lottery', label: 'Lotería', icon: SparklesIcon },
    { id: 'blockchain-test', label: 'Pruebas Blockchain', icon: SparklesIcon },
  ]

  const handleNavClick = (sectionId: string) => {
    if (sectionId === 'blockchain-test') {
      // Redirigir a la página de pruebas blockchain
      window.location.href = '/blockchain-test'
    } else {
      setActiveSection(sectionId)
      setIsMobileMenuOpen(false)
    }
  }

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-800/90 backdrop-blur-md border-b border-primary-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-400 rounded-xl flex items-center justify-center overflow-hidden">
                <Image 
                  src="/logo.svg" 
                  alt="KoquiFi Logo" 
                  width={32} 
                  height={32}
                  className="text-white"
                />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-secondary-400 bg-clip-text text-transparent">
                KOQUIFI
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    activeSection === item.id
                      ? 'bg-primary-500 text-white shadow-glow'
                      : 'text-gray-300 hover:text-white hover:bg-dark-700'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              ))}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* User Profile */}
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{user?.name || 'Usuario'}</p>
                  <p className="text-xs text-gray-400">{user?.email || user?.wallet?.slice(0, 6)}...{user?.wallet?.slice(-4)}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-400 rounded-full flex items-center justify-center">
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="Profile" className="w-10 h-10 rounded-full" />
                  ) : (
                    <UserCircleIcon className="w-6 h-6 text-white" />
                  )}
                </div>
              </div>

              {/* Logout Button */}
              <motion.button
                onClick={onLogout}
                className="hidden sm:block px-4 py-2 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 hover:bg-red-500 hover:text-white transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Salir
              </motion.button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-dark-700 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          className="fixed inset-0 z-40 md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          <motion.div
            className="fixed top-16 left-0 right-0 bg-dark-800 border-b border-primary-500/20"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                    activeSection === item.id
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-dark-700'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
              
              {/* Mobile User Info */}
              <div className="border-t border-dark-600 pt-4 mt-4">
                <div className="flex items-center space-x-3 px-4 py-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-400 rounded-full flex items-center justify-center">
                    {user?.profilePicture ? (
                      <img src={user.profilePicture} alt="Profile" className="w-10 h-10 rounded-full" />
                    ) : (
                      <UserCircleIcon className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{user?.name || 'Usuario'}</p>
                    <p className="text-xs text-gray-400">{user?.email || `${user?.wallet?.slice(0, 6)}...${user?.wallet?.slice(-4)}`}</p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="w-full mt-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 hover:bg-red-500 hover:text-white transition-all duration-300"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}
