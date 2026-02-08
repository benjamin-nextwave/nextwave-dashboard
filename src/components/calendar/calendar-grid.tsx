'use client'

import { useMemo } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  parseISO,
} from 'date-fns'
import { nl } from 'date-fns/locale/nl'
import { cn } from '@/lib/utils'
import type { MeetingWithCompany } from '@/types/database'

interface CalendarGridProps {
  currentMonth: string // 'yyyy-MM'
  meetings: MeetingWithCompany[]
  selectedDate: string | null
  todayISO: string
  onDayClick: (date: string) => void
}

const DAY_NAMES = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo']

export function CalendarGrid({
  currentMonth,
  meetings,
  selectedDate,
  todayISO,
  onDayClick,
}: CalendarGridProps) {
  const monthDate = parseISO(currentMonth + '-01')

  // Build set of dates that have meetings for quick lookup
  const meetingDates = useMemo(() => {
    const set = new Set<string>()
    for (const m of meetings) {
      set.add(m.meeting_date)
    }
    return set
  }, [meetings])

  // Generate all days to display (full weeks, Monday start)
  const days = useMemo(() => {
    const monthStart = startOfMonth(monthDate)
    const monthEnd = endOfMonth(monthDate)
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1, locale: nl })
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1, locale: nl })
    return eachDayOfInterval({ start: gridStart, end: gridEnd })
  }, [monthDate])

  return (
    <div>
      {/* Day name headers */}
      <div className="grid grid-cols-7 gap-px mb-1">
        {DAY_NAMES.map((name) => (
          <div
            key={name}
            className="text-center text-sm font-medium text-muted-foreground py-2"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-px">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const isCurrentMonth = isSameMonth(day, monthDate)
          const isToday = dateStr === todayISO
          const isSelected = dateStr === selectedDate
          const hasMeetings = meetingDates.has(dateStr)

          return (
            <button
              key={dateStr}
              onClick={() => onDayClick(dateStr)}
              className={cn(
                'relative flex flex-col items-center justify-start rounded-md border p-2 min-h-[72px] transition-colors text-sm',
                isCurrentMonth
                  ? 'text-foreground'
                  : 'text-muted-foreground/40',
                isToday && 'bg-primary/10 border-primary/50',
                isSelected && 'ring-2 ring-primary',
                !isSelected && !isToday && 'hover:bg-accent border-border/50'
              )}
            >
              <span
                className={cn(
                  'text-sm font-medium',
                  isToday &&
                    'bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center'
                )}
              >
                {format(day, 'd')}
              </span>
              {hasMeetings && isCurrentMonth && (
                <div className="flex gap-1 mt-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
