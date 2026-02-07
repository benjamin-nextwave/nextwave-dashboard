'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getTodayISO } from '@/lib/dates'

const TodayContext = createContext<string>('')

export function TodayProvider({ children }: { children: ReactNode }) {
  const [today, setToday] = useState(() => getTodayISO())

  useEffect(() => {
    function checkDate() {
      const current = getTodayISO()
      setToday((prev) => (prev !== current ? current : prev))
    }

    // Check every 60 seconds for date change
    const interval = setInterval(checkDate, 60_000)

    // Check on tab focus (handles sleep/wake)
    function handleVisibility() {
      if (document.visibilityState === 'visible') {
        checkDate()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  return <TodayContext value={today}>{children}</TodayContext>
}

export function useToday(): string {
  const value = useContext(TodayContext)
  if (value === '') {
    throw new Error('useToday must be used within a TodayProvider')
  }
  return value
}
