'use client'

import { usePathname } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { MedievalEffects } from '@/components/medieval-effects'
import { ParchmentOverlay } from '@/components/parchment-overlay'

export function DashboardChrome() {
  const pathname = usePathname()

  // Don't show dashboard navigation on Benjamin's portal or login pages
  if (pathname.startsWith('/benjamin') || pathname === '/login' || pathname === '/benjamin-login') {
    return null
  }

  return (
    <>
      <Navigation />
      <MedievalEffects />
      <ParchmentOverlay />
    </>
  )
}
