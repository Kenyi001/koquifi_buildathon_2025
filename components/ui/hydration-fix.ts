// Utility para suprimir warnings de hydration causados por extensiones del navegador
export function suppressHydrationWarning() {
  if (typeof window !== 'undefined') {
    // Suprimir warnings específicos de bis_skin_checked y extensiones
    const originalError = console.error
    console.error = (...args) => {
      const errorString = args.join(' ')
      
      // Suprimir warnings de hydration causados por extensiones del navegador
      if (
        errorString.includes('bis_skin_checked') ||
        errorString.includes('__processed_') ||
        errorString.includes('browser extension') ||
        errorString.includes('server rendered HTML')
      ) {
        return
      }
      
      originalError(...args)
    }
  }
}

// Hook para usar con componentes
export function useHydrationFix() {
  if (typeof window !== 'undefined') {
    suppressHydrationWarning()
  }
}
