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
        <h1
          className="text-2xl font-bold"
          style={{ color: '#2a1f0e', fontFamily: 'var(--font-fraktur)' }}
        >
          ⚔️ Dagorders
        </h1>
        {totalMinutesRemaining != null && totalMinutesRemaining > 0 && (
          <span
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium"
            style={{
              background: 'linear-gradient(135deg, rgba(139,109,56,0.2), rgba(139,109,56,0.1))',
              color: '#4a3a20',
              border: '1px solid rgba(139,109,56,0.25)',
              fontFamily: 'var(--font-medieval)',
            }}
          >
            <Clock className="size-3.5" />
            {timeString}
          </span>
        )}
      </div>
      <p
        className="text-sm mt-0.5"
        style={{ color: '#6b5a3e', fontFamily: 'var(--font-medieval)' }}
      >
        {formatDutchDateCapitalized(today)}
      </p>
    </div>
  )
}
