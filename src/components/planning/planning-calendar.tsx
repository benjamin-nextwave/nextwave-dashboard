'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Company } from '@/types/database'
import { cn } from '@/lib/utils'
import { getCampaignUpdateDates } from './campaign-dates'

interface PlanningCalendarProps {
  companies: Company[]
  selectedDate: string | null
  onSelectDate: (date: string | null) => void
  companiesForDate: Company[]
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  // 0 = Sunday, convert to Monday-based (0 = Monday)
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

function formatDateISO(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
  'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December',
]

const DAY_NAMES = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']

export function PlanningCalendar({
  companies,
  selectedDate,
  onSelectDate,
  companiesForDate,
}: PlanningCalendarProps) {
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())

  // Build set of all campaign update dates (4 per company, every 2 weeks)
  const livegangDates = new Set<string>()
  for (const c of companies) {
    if (c.campagne_livegang) {
      for (const d of getCampaignUpdateDates(c.campagne_livegang)) {
        livegangDates.add(d)
      }
    }
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1)
      setViewMonth(11)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1)
      setViewMonth(0)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  const todayISO = formatDateISO(now.getFullYear(), now.getMonth(), now.getDate())

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Kalender</h2>

      {/* Calendar */}
      <div className="rounded-xl border border-border bg-card p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevMonth}
            className="p-2 rounded-md hover:bg-accent transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h3 className="text-xl font-semibold">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </h3>
          <button
            onClick={nextMonth}
            className="p-2 rounded-md hover:bg-accent transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAY_NAMES.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7">
          {/* Empty cells before first day */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="h-16" />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dateISO = formatDateISO(viewYear, viewMonth, day)
            const hasLivegang = livegangDates.has(dateISO)
            const isSelected = dateISO === selectedDate
            const isToday = dateISO === todayISO

            return (
              <button
                key={day}
                onClick={() => onSelectDate(isSelected ? null : dateISO)}
                className={cn(
                  'h-16 flex flex-col items-center justify-center rounded-lg transition-colors relative',
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent',
                  isToday && !isSelected && 'ring-2 ring-primary'
                )}
              >
                <span className="text-base font-medium">{day}</span>
                {hasLivegang && (
                  <span
                    className={cn(
                      'absolute bottom-1.5 w-2 h-2 rounded-full',
                      isSelected ? 'bg-primary-foreground' : 'bg-red-500'
                    )}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected date panel */}
      {selectedDate && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h3 className="text-lg font-semibold">
            Campagne-updates voor{' '}
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('nl-NL', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </h3>
          {companiesForDate.length > 0 ? (
            <div className="space-y-3">
              {companiesForDate.map((company) => {
                const updateDates = getCampaignUpdateDates(company.campagne_livegang!)
                const updateNr = updateDates.indexOf(selectedDate) + 1

                return (
                  <div
                    key={company.id}
                    className="flex items-center gap-4 rounded-lg border border-border bg-background p-4"
                  >
                    <div className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
                    <div>
                      <div className="text-base font-semibold">
                        {company.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Update {updateNr} van 4 &middot; Livegang:{' '}
                        {new Date(
                          company.campagne_livegang + 'T00:00:00'
                        ).toLocaleDateString('nl-NL', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-base">
              Geen campagne-updates op deze dag.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
