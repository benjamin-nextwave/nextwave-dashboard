'use client'

import { useCallback, useEffect, useState } from 'react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, parseISO } from 'date-fns'
import { TZDate } from '@date-fns/tz'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { TIMEZONE } from '@/lib/dates'
import { getMeetingsByDateRange } from '@/lib/meetings'
import type { MeetingWithCompany } from '@/types/database'
import { Button } from '@/components/ui/button'
import { CalendarGrid } from '@/components/calendar/calendar-grid'
import { MeetingEditDialog } from '@/components/calendar/meeting-edit-dialog'
import { MeetingCreateDialog } from '@/components/calendar/meeting-create-dialog'

type OverlayState =
  | { type: 'none' }
  | { type: 'editMeeting'; meeting: MeetingWithCompany }
  | { type: 'createMeeting'; date: string | null }

export function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = TZDate.tz(TIMEZONE)
    return format(now, 'yyyy-MM')
  })
  const [meetings, setMeetings] = useState<MeetingWithCompany[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [overlay, setOverlay] = useState<OverlayState>({ type: 'none' })
  const [loading, setLoading] = useState(true)

  const todayISO = format(TZDate.tz(TIMEZONE), 'yyyy-MM-dd')

  const loadMeetings = useCallback(async () => {
    const monthDate = parseISO(currentMonth + '-01')
    const start = format(startOfMonth(monthDate), 'yyyy-MM-dd')
    const end = format(endOfMonth(monthDate), 'yyyy-MM-dd')
    try {
      const data = await getMeetingsByDateRange(start, end)
      setMeetings(data)
    } catch (error) {
      console.error('Failed to fetch meetings:', error)
    } finally {
      setLoading(false)
    }
  }, [currentMonth])

  useEffect(() => {
    setLoading(true)
    loadMeetings()
  }, [loadMeetings])

  const goToPrevMonth = useCallback(() => {
    setCurrentMonth((prev) => {
      const d = parseISO(prev + '-01')
      return format(subMonths(d, 1), 'yyyy-MM')
    })
    setSelectedDate(null)
  }, [])

  const goToNextMonth = useCallback(() => {
    setCurrentMonth((prev) => {
      const d = parseISO(prev + '-01')
      return format(addMonths(d, 1), 'yyyy-MM')
    })
    setSelectedDate(null)
  }, [])

  const goToToday = useCallback(() => {
    const now = TZDate.tz(TIMEZONE)
    setCurrentMonth(format(now, 'yyyy-MM'))
    setSelectedDate(todayISO)
  }, [todayISO])

  const onDayClick = useCallback((date: string) => {
    setSelectedDate((prev) => (prev === date ? null : date))
  }, [])

  const onMeetingClick = useCallback((meeting: MeetingWithCompany) => {
    setOverlay({ type: 'editMeeting', meeting })
  }, [])

  const onCreateClick = useCallback(() => {
    setOverlay({ type: 'createMeeting', date: selectedDate })
  }, [selectedDate])

  const onCloseOverlay = useCallback(() => {
    setOverlay({ type: 'none' })
  }, [])

  const refreshData = useCallback(async () => {
    await loadMeetings()
  }, [loadMeetings])

  // Get meetings for selected date
  const selectedDateMeetings = selectedDate
    ? meetings.filter((m) => m.meeting_date === selectedDate)
    : []

  // Month display label
  const monthDate = parseISO(currentMonth + '-01')
  const monthLabel = format(monthDate, 'MMMM yyyy')
  // Capitalize first letter for Dutch
  const monthLabelCapitalized =
    monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kalender</h1>
        <Button onClick={onCreateClick}>
          <Plus className="size-4" />
          Nieuwe vergadering
        </Button>
      </div>

      {/* Month navigation */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={goToPrevMonth}>
          <ChevronLeft className="size-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={goToNextMonth}>
          <ChevronRight className="size-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={goToToday}>
          Vandaag
        </Button>
        <span className="text-lg font-medium">{monthLabelCapitalized}</span>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Laden...</p>
      ) : (
        <>
          {/* Calendar grid */}
          <CalendarGrid
            currentMonth={currentMonth}
            meetings={meetings}
            selectedDate={selectedDate}
            todayISO={todayISO}
            onDayClick={onDayClick}
          />

          {/* Selected day meetings */}
          {selectedDate && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">
                {format(parseISO(selectedDate), 'd MMMM yyyy')}
              </h2>
              {selectedDateMeetings.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Geen vergaderingen op deze dag
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedDateMeetings.map((meeting) => (
                    <button
                      key={meeting.id}
                      onClick={() => onMeetingClick(meeting)}
                      className={`w-full text-left rounded-lg border p-3 transition-colors hover:bg-accent ${
                        meeting.is_completed ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p
                            className={`font-medium ${
                              meeting.is_completed ? 'line-through' : ''
                            }`}
                          >
                            {meeting.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {meeting.company_name} &middot;{' '}
                            {meeting.meeting_time.slice(0, 5)}
                          </p>
                        </div>
                        {meeting.meeting_link && (
                          <a
                            href={meeting.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-sm text-primary hover:underline shrink-0 ml-3"
                          >
                            Link openen
                          </a>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Edit overlay */}
      <MeetingEditDialog
        meeting={overlay.type === 'editMeeting' ? overlay.meeting : null}
        onClose={onCloseOverlay}
        onSaved={refreshData}
      />

      {/* Create overlay */}
      <MeetingCreateDialog
        open={overlay.type === 'createMeeting'}
        initialDate={
          overlay.type === 'createMeeting' ? overlay.date : null
        }
        onClose={onCloseOverlay}
        onCreated={refreshData}
      />
    </div>
  )
}
