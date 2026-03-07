'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Company } from '@/types/database'
import { cn } from '@/lib/utils'
import { getCampaignUpdateDates } from './campaign-dates'
import { CampaignUpdateDialog } from './campaign-update-dialog'
import { Button } from '@/components/ui/button'

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

const NOTIFICATIONS_KEY = 'planning-update-notifications'

interface UpdateNotification {
  id: string
  companyId: string
  companyName: string
  date: string
}

function loadNotifications(): UpdateNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveNotifications(notifications: UpdateNotification[]) {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications))
}

export function PlanningCalendar({
  companies,
  selectedDate,
  onSelectDate,
  companiesForDate,
}: PlanningCalendarProps) {
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [sentCompanies, setSentCompanies] = useState<Set<string>>(new Set())
  const [notifications, setNotifications] = useState<UpdateNotification[]>([])

  useEffect(() => {
    setNotifications(loadNotifications())
  }, [])

  // Build set of all campaign update dates
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

  const handleCompanyClick = (company: Company) => {
    setSelectedCompany(company)
    setDialogOpen(true)
  }

  const handleSent = (companyId: string, hadMessage: boolean) => {
    setSentCompanies((prev) => new Set(prev).add(companyId))

    if (hadMessage && selectedDate) {
      const company = companies.find((c) => c.id === companyId)
      if (company) {
        const notification: UpdateNotification = {
          id: `${companyId}-${selectedDate}-${Date.now()}`,
          companyId,
          companyName: company.name,
          date: new Date(selectedDate + 'T00:00:00').toLocaleDateString('nl-NL', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
        }
        const updated = [...notifications, notification]
        setNotifications(updated)
        saveNotifications(updated)
      }
    }
  }

  const dismissNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id)
    setNotifications(updated)
    saveNotifications(updated)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Kalender</h2>

      {/* Persistent notifications for proposed changes */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3"
            >
              <p className="text-sm">
                Er zijn aanpassingen voorgesteld aan{' '}
                <span className="font-semibold">{n.companyName}</span> op{' '}
                <span className="font-semibold">{n.date}</span>, is hier al op
                gereageerd?
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => dismissNotification(n.id)}
                className="shrink-0"
              >
                Goedkeuren
              </Button>
            </div>
          ))}
        </div>
      )}

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
                const wasSent = sentCompanies.has(company.id)

                return (
                  <button
                    key={company.id}
                    onClick={() => handleCompanyClick(company)}
                    className="w-full text-left flex items-center gap-4 rounded-lg border border-border bg-background p-4 hover:bg-accent transition-colors cursor-pointer"
                  >
                    <div className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
                    <div className="flex-1">
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
                    {wasSent && (
                      <span className="text-sm text-green-500 font-medium shrink-0">
                        Mail verzonden
                      </span>
                    )}
                  </button>
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

      {/* Campaign update dialog */}
      <CampaignUpdateDialog
        open={dialogOpen}
        company={selectedCompany}
        selectedDate={selectedDate ?? ''}
        onClose={() => {
          setDialogOpen(false)
          setSelectedCompany(null)
        }}
        onSent={handleSent}
      />
    </div>
  )
}
