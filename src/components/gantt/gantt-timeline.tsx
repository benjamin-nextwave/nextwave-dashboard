'use client'

import type { CompanyWithTasks, Task } from '@/types/database'

interface GanttTimelineProps {
  companies: CompanyWithTasks[]
  days: string[]
  today: string
  onTaskClick: (task: Task) => void
  onCompanyClick: (company: CompanyWithTasks) => void
  onAddTask: (companyId: string) => void
}

export function GanttTimeline({ companies, days, today, onTaskClick, onCompanyClick, onAddTask }: GanttTimelineProps) {
  // Placeholder - fully implemented in Task 2
  void onTaskClick
  void onCompanyClick
  void onAddTask
  return (
    <div className="text-muted-foreground text-sm">
      Tijdlijn wordt geladen... ({companies.length} bedrijven, {days.length} dagen, vandaag: {today})
    </div>
  )
}
