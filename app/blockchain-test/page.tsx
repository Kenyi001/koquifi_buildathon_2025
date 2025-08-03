'use client'

import BlockchainTestPanel from '@/components/ui/BlockchainTestPanel'
import { Toaster } from 'react-hot-toast'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function BlockchainTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      {/* Header */}
      <div className="bg-dark-800/50 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link 
              href="/dashboard"
              className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Volver al Dashboard
            </Link>
            
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg"></div>
              <div>
                <h1 className="text-xl font-bold text-white">KoquiFi MVP</h1>
                <p className="text-gray-400 text-xs">Pruebas Blockchain</p>
              </div>
            </div>
            
            <div className="w-24" /> {/* Spacer */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BlockchainTestPanel />
      </main>

      {/* Footer */}
      <footer className="bg-dark-800/30 border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-400 text-sm">
            <p>🧪 Entorno de Pruebas MVP - KoquiFi Blockchain</p>
            <p className="mt-2">
              <span className="inline-flex items-center space-x-4">
                <span>🔗 Chain ID: 43113 (Avalanche Fuji)</span>
                <span>•</span>
                <span>💰 Faucet: faucet.avax.network</span>
                <span>•</span>
                <span>🛠️ Remix IDE para despliegue</span>
              </span>
            </p>
          </div>
        </div>
      </footer>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1F2937',
            color: '#F3F4F6',
            border: '1px solid #374151'
          },
          success: {
            style: {
              background: '#065F46',
              color: '#D1FAE5',
              border: '1px solid #10B981'
            }
          },
          error: {
            style: {
              background: '#7F1D1D',
              color: '#FEE2E2',
              border: '1px solid #EF4444'
            }
          }
        }}
      />
    </div>
  )
}
