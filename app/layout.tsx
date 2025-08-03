import '../styles/globals.css'
import { Inter } from 'next/font/google'
import { Web3Provider } from '@/components/providers/Web3Provider'
import HydrationFixProvider from '@/components/providers/HydrationFixProvider'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from '@/components/ui/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'KoquiFi - DeFi para Principiantes',
  description: 'Plataforma DeFi diseñada para usuarios nuevos en Web3. Ahorros, intercambios y lotería con KOFICOIN.',
  keywords: 'DeFi, Web3, KOFICOIN, Avalanche, Staking, Lottery, Bolivia',
  authors: [{ name: 'KoquiFi Team' }],
  creator: 'KoquiFi',
  publisher: 'KoquiFi',
  robots: 'index, follow',
  openGraph: {
    title: 'KoquiFi - DeFi para Principiantes',
    description: 'Descubre el mundo DeFi de forma simple y segura',
    url: 'https://koquifi.vercel.app',
    siteName: 'KoquiFi',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'KoquiFi Platform',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KoquiFi - DeFi para Principiantes',
    description: 'Descubre el mundo DeFi de forma simple y segura',
    images: ['/images/twitter-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="msapplication-TileColor" content="#22c55e" />
        <meta name="theme-color" content="#22c55e" />
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <ErrorBoundary>
          <Web3Provider>
            <HydrationFixProvider>
              <div 
                className="min-h-screen bg-gradient-to-br from-dark-800 via-dark-900 to-black"
                suppressHydrationWarning
              >
                {children}
              </div>
              <div suppressHydrationWarning>
                <Toaster 
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    className: 'text-sm',
                    style: {
                      background: '#1e293b',
                      color: '#f8fafc',
                      border: '1px solid #22c55e',
                    },
                  }}
                />
              </div>
            </HydrationFixProvider>
          </Web3Provider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
