'use client'

import { Clock } from 'lucide-react'
import { formatDutchDateCapitalized } from '@/lib/dates'
import { useToday } from '@/lib/today-provider'

interface DailyHeaderProps {
  totalMinutesRemaining?: number
}

export function DailyHeader({ totalMinutesRemaining }: DailyHeaderProps) {
  const today = useToday()

  const hours = totalMinutesRemaining ? Math.floor(totalMinutesRemaining / 60) : 0
  const minutes = totalMinutesRemaining ? totalMinutesRemaining % 60 : 0
  const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`

  return (
    <div>
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-foreground">Vandaag</h1>
        {totalMinutesRemaining != null && totalMinutesRemaining > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-100 px-2.5 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            <Clock className="size-3.5" />
            {timeString}
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        {formatDutchDateCapitalized(today)}
      </p>
    </div>
  )
}
