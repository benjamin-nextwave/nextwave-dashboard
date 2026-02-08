'use client'

import { useEffect, useRef } from 'react'
import { useToday } from '@/lib/today-provider'
import { ensureRecurringTasks } from '@/lib/recurring-tasks'

/**
 * Hook that auto-generates recurring tasks for the current month on first load.
 * Calls the provided callback after generation so the page can refresh its data.
 */
export function useRecurringTasks(onGenerated?: () => void) {
  const today = useToday()
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    ensureRecurringTasks(today)
      .then(() => {
        onGenerated?.()
      })
      .catch((err) => {
        console.error('Failed to generate recurring tasks:', err)
      })
  }, [today, onGenerated])
}
