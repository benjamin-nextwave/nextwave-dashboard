'use client'

import Link from 'next/link'
import { dayLabel, durationLabel, minuteLabel, relativeDayLabel, shiftDay } from '@/lib/time'
import { useClock } from '@/lib/use-clock'

type Props = {
  day: string
  isToday: boolean
  sleepMinute: number
  weekNumber: number
  weekPct: number
}

export function DayHeader({ day, isToday, sleepMinute, weekNumber, weekPct }: Props) {
  const nowMinute = useClock()
  const relative = relativeDayLabel(day)
  const untilBed = isToday && nowMinute !== null ? sleepMinute - nowMinute : null

  return (
    <header
      className="sticky top-0 z-30 -mx-4 mb-5 border-b border-line-soft bg-bg/85 px-4 pb-3 backdrop-blur-xl"
      style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
    >
      <div className="flex items-center gap-2">
        <NavArrow to={shiftDay(day, -1)} label="Vorige dag" glyph="‹" />

        <div className="min-w-0 flex-1 text-center">
          <p className="label">
            {relative ? `${relative} · week ${weekNumber}` : `week ${weekNumber}`}
          </p>
          <h1 className="truncate text-lg font-semibold first-letter:uppercase">{dayLabel(day)}</h1>
        </div>

        <NavArrow to={shiftDay(day, 1)} label="Volgende dag" glyph="›" />
      </div>

      <div className="mt-2.5 flex items-center gap-3">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-line-soft">
          <span
            className="block h-full rounded-full bg-gradient-to-r from-accent to-[#a78bfa] transition-[width] duration-700"
            style={{ width: `${weekPct}%` }}
          />
        </div>
        <span className="numeric text-[0.6875rem] text-muted">{Math.round(weekPct)}% week</span>
      </div>

      {untilBed !== null && (
        <p className="label mt-1.5 normal-case tracking-normal">
          {untilBed > 0 ? (
            <>
              nog <span className="numeric text-accent">{durationLabel(untilBed)}</span> tot bedtijd (
              {minuteLabel(sleepMinute)})
            </>
          ) : (
            <span className="text-warn">je zou al in bed moeten liggen</span>
          )}
        </p>
      )}
    </header>
  )
}

function NavArrow({ to, label, glyph }: { to: string; label: string; glyph: string }) {
  return (
    <Link
      href={`/dag/${to}`}
      aria-label={label}
      className="grid size-10 shrink-0 place-items-center rounded-full border border-line text-lg text-muted active:scale-90"
    >
      {glyph}
    </Link>
  )
}
