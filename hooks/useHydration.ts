'use client'

import { useEffect, useState } from 'react'

export function useIsomorphicLayoutEffect(effect: React.EffectCallback, deps?: React.DependencyList) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(
    isClient ? effect : () => {},
    deps
  )
}

export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const handleHydration = () => {
      setIsHydrated(true)
      
      // Limpiar atributos de extensiones después de la hidratación
      const cleanExtensionAttributes = () => {
        try {
          const extensionAttributes = [
            'bis_skin_checked',
            '__processed_89991e44-234c-49b7-badf-9795e5848600__',
            'bis_register',
            'data-bis-registered',
            'data-extension-injected',
            'data-adblockkey'
          ]

          const selector = extensionAttributes.map(attr => `[${attr}]`).join(', ')
          const elements = document.querySelectorAll(selector)
          
          elements.forEach((element) => {
            extensionAttributes.forEach(attr => {
              if (element.hasAttribute(attr)) {
                element.removeAttribute(attr)
              }
            })
          })
        } catch (error) {
          // Silenciar errores
        }
      }

      // Ejecutar limpieza con delay
      setTimeout(cleanExtensionAttributes, 100)
    }

    handleHydration()
  }, [])

  return isHydrated
}
