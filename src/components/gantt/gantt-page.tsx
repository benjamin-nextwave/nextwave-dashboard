'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { addDays, format, parseISO } from 'date-fns'
import { useToday } from '@/lib/today-provider'
import { getCompaniesWithTasks } from '@/lib/companies'
import { getTimelineRange } from '@/lib/gantt-utils'
import { GanttHeader } from '@/components/gantt/gantt-header'
import { GanttTimeline } from '@/components/gantt/gantt-timeline'
import type { CompanyWithTasks, Task } from '@/types/database'

type OverlayState =
  | { type: 'none' }
  | { type: 'editTask'; task: Task }
  | { type: 'createTask'; companyId: string }
  | { type: 'companyTasks'; company: CompanyWithTasks }

export function GanttPage() {
  const today = useToday()
  const [anchorDate, setAnchorDate] = useState(today)
  const [companies, setCompanies] = useState<CompanyWithTasks[]>([])
  const [loading, setLoading] = useState(true)
  const [overlay, setOverlay] = useState<OverlayState>({ type: 'none' })

  useEffect(() => {
    ;(async () => {
      const data = await getCompaniesWithTasks()
      setCompanies(data)
      setLoading(false)
    })()
  }, [])

  const refreshData = useCallback(async () => {
    const data = await getCompaniesWithTasks()
    setCompanies(data)
  }, [])

  const days = useMemo(
    () => getTimelineRange(anchorDate, 14),
    [anchorDate]
  )

  function navigateWeek(direction: 'prev' | 'next') {
    setAnchorDate((current) => {
      const offset = direction === 'next' ? 7 : -7
      return format(addDays(parseISO(current), offset), 'yyyy-MM-dd')
    })
  }

  function goToToday() {
    setAnchorDate(today)
  }

  const onTaskClick = useCallback((task: Task) => {
    setOverlay({ type: 'editTask', task })
  }, [])

  const onCompanyClick = useCallback((company: CompanyWithTasks) => {
    setOverlay({ type: 'companyTasks', company })
  }, [])

  const onAddTask = useCallback((companyId: string) => {
    setOverlay({ type: 'createTask', companyId })
  }, [])

  const onCloseOverlay = useCallback(() => {
    setOverlay({ type: 'none' })
  }, [])

  // overlay, refreshData, and onCloseOverlay will be used by dialogs in Plan 03
  void overlay
  void refreshData
  void onCloseOverlay

  return (
    <div className="space-y-4">
      <GanttHeader
        days={days}
        onPrev={() => navigateWeek('prev')}
        onNext={() => navigateWeek('next')}
        onToday={goToToday}
      />
      {loading ? (
        <p className="text-muted-foreground">Laden...</p>
      ) : (
        <GanttTimeline
          companies={companies}
          days={days}
          today={today}
          onTaskClick={onTaskClick}
          onCompanyClick={onCompanyClick}
          onAddTask={onAddTask}
        />
      )}
    </div>
  )
}
