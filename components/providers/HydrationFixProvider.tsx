'use client'

import { useEffect, useState } from 'react'

export default function HydrationFixProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    // Lista de atributos conocidos de extensiones del navegador
    const extensionAttributes = [
      'bis_skin_checked',
      '__processed_89991e44-234c-49b7-badf-9795e5848600__',
      'bis_register',
      'data-bis-registered',
      '__processed_3f50d2e5-b1a1-4a6e-af95-9af87dd8b6a2__',
      'data-extension-injected',
      'data-adblockkey'
    ]

    // Función para remover atributos de extensiones
    const removeExtensionAttributes = () => {
      try {
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
        // Silenciar errores de DOM
      }
    }

    // Ejecutar inmediatamente
    removeExtensionAttributes()
    
    // Ejecutar después de un pequeño delay
    const timeoutId = setTimeout(removeExtensionAttributes, 50)
    
    // Observer para mutaciones del DOM
    const observer = new MutationObserver((mutations) => {
      let shouldClean = false
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          const attrName = mutation.attributeName
          if (attrName && extensionAttributes.includes(attrName)) {
            shouldClean = true
          }
        } else if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element
              extensionAttributes.forEach(attr => {
                if (element.hasAttribute(attr)) {
                  shouldClean = true
                }
              })
            }
          })
        }
      })
      
      if (shouldClean) {
        removeExtensionAttributes()
      }
    })

    // Observar todo el documento
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: extensionAttributes
    })

    // Cleanup
    return () => {
      clearTimeout(timeoutId)
      observer.disconnect()
    }
  }, [])

  // Mostrar un fallback durante la hidratación para evitar discrepancias
  if (!isClient) {
    return (
      <div suppressHydrationWarning>
        {children}
      </div>
    )
  }

  return <>{children}</>
}
