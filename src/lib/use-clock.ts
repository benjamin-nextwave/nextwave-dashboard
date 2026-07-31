'use client'

import { useEffect, useState } from 'react'
import { TZ } from './time'

const formatter = new Intl.DateTimeFormat('nl-NL', {
  timeZone: TZ,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

function amsterdamMinute(): number {
  const parts = formatter.formatToParts(new Date())
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0)
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0)
  return hour * 60 + minute
}

/**
 * Minuten sinds middernacht in Amsterdam, doorgeteld na middernacht zodat
 * 01:12 als 1512 op de tijdlijn van de vorige dag terechtkomt.
 *
 * Geeft `null` tot na het aankoppelen: de server weet niet welke minuut de
 * browser laat zien, dus pas daarna is de waarde betrouwbaar.
 */
export function useClock(): number | null {
  const [minute, setMinute] = useState<number | null>(null)

  useEffect(() => {
    const tick = () => {
      const m = amsterdamMinute()
      setMinute(m < 4 * 60 ? m + 1440 : m)
    }
    tick()
    const id = setInterval(tick, 20_000)
    return () => clearInterval(id)
  }, [])

  return minute
}
