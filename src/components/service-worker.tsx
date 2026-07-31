'use client'

import { useEffect } from 'react'

/** Registreert de service worker zodat Android de app laat installeren. */
export function ServiceWorker() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Registratie faalt in bijvoorbeeld een privévenster. Niet erg:
      // de app werkt zonder, alleen installeren kan dan niet.
    })
  }, [])
  return null
}
