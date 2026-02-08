'use client'

import { useEffect, useRef } from 'react'
import { GanttDayHeader } from '@/components/gantt/gantt-day-header'
import { GanttCompanyRow } from '@/components/gantt/gantt-company-row'
import type { CompanyWithTasks, Task } from '@/types/database'

interface GanttTimelineProps {
  companies: CompanyWithTasks[]
  days: string[]
  today: string
  onTaskClick: (task: Task) => void
  onCompanyClick: (company: CompanyWithTasks) => void
  onAddTask: (companyId: string) => void
}

export function GanttTimeline({
  companies,
  days,
  today,
  onTaskClick,
  onCompanyClick,
  onAddTask,
}: GanttTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Reset scroll position when navigating weeks
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0
    }
  }, [days])

  if (companies.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Geen bedrijven gevonden. Voeg bedrijven toe via de Bedrijven pagina.
      </p>
    )
  }

  return (
    <div ref={scrollRef} className="border rounded-lg">
      <div
        className="grid"
        style={{
          gridTemplateColumns: `180px repeat(${days.length}, 1fr)`,
        }}
      >
        {/* Header row */}
        <div className="sticky left-0 z-20 bg-background border-b border-r p-2 font-medium text-sm flex items-center h-12">
          Bedrijf
        </div>
        {days.map((day) => (
          <GanttDayHeader key={day} dateStr={day} isToday={day === today} />
        ))}

        {/* Company rows */}
        {companies.map((company) => (
          <GanttCompanyRow
            key={company.id}
            company={company}
            days={days}
            today={today}
            onTaskClick={onTaskClick}
            onCompanyClick={onCompanyClick}
            onAddTask={onAddTask}
          />
        ))}
      </div>
    </div>
  )
}
