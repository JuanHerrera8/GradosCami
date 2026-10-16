'use client'

import { useEffect } from 'react'

/**
 * Registra el service worker de la PWA. Solo en producción para no
 * interferir con la recarga en caliente de `next dev`.
 */
export function RegistrarServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((err) => {
      console.warn('No se pudo registrar el service worker:', err)
    })
  }, [])

  return null
}
