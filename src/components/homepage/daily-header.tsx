'use client'

import { formatDutchDateCapitalized } from '@/lib/dates'
import { useToday } from '@/lib/today-provider'

export function DailyHeader() {
  const today = useToday()

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Vandaag</h1>
      <p className="text-sm text-muted-foreground">
        {formatDutchDateCapitalized(today)}
      </p>
    </div>
  )
}
