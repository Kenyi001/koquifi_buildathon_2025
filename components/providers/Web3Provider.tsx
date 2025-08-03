'use client'

import { createContext, useContext, ReactNode } from 'react'

interface Web3ContextType {
  // Aquí puedes agregar las funciones y estado de Web3
  isConnected: boolean
  account: string | null
  connect: () => Promise<void>
  disconnect: () => void
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export const useWeb3 = () => {
  const context = useContext(Web3Context)
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider')
  }
  return context
}

interface Web3ProviderProps {
  children: ReactNode
}

export const Web3Provider = ({ children }: Web3ProviderProps) => {
  // Valores simulados para el contexto
  const value: Web3ContextType = {
    isConnected: false,
    account: null,
    connect: async () => {
      // Implementar conexión Web3
    },
    disconnect: () => {
      // Implementar desconexión
    }
  }

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  )
}
