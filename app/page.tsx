'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Dashboard from '@/components/sections/Dashboard'
import Lottery from '@/components/sections/Lottery'
import Deposits from '@/components/sections/Deposits'
import Exchange from '@/components/sections/Exchange'
import Withdraw from '@/components/sections/Withdraw'
import Savings from '@/components/sections/Savings'
import { useAuth } from '@/hooks/useAuth'
import AuthModal from '@/components/auth/AuthModal'
import LoadingScreen from '@/components/ui/LoadingScreen'
import NoSSR from '@/components/ui/NoSSR'
import { motion } from 'framer-motion'

export default function HomePage() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [isLoading, setIsLoading] = useState(true)
  const { user, isAuthenticated, login, logout } = useAuth()

  useEffect(() => {
    // Simular carga inicial
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return (
      <NoSSR fallback={<LoadingScreen />}>
        <AuthModal onLogin={login} />
      </NoSSR>
    )
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard user={user} />
      case 'lottery':
        return <Lottery />
      case 'deposits':
        return <Deposits />
      case 'exchange':
        return <Exchange />
      case 'withdraw':
        return <Withdraw />
      case 'savings':
        return <Savings />
      default:
        return <Dashboard user={user} />
    }
  }

  return (
    <NoSSR fallback={<LoadingScreen />}>
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-black">
        {/* Navbar */}
        <Navbar 
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          user={user}
          onLogout={logout}
        />
        
        {/* Main Content */}
        <motion.main 
          className="pt-20 pb-8 px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-7xl mx-auto">
            {renderSection()}
          </div>
        </motion.main>
        
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-secondary-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-blue rounded-full mix-blend-multiply filter blur-xl opacity-5 animate-float animation-delay-4000"></div>
        </div>
      </div>
    </NoSSR>
  )
}
