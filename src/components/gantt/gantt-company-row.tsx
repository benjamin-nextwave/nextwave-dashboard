import { Plus } from 'lucide-react'
import { computeOverdue } from '@/lib/overdue'
import { isDateInWarmup, isGoLiveDate } from '@/lib/gantt-utils'
import { cn } from '@/lib/utils'
import { TaskMarker } from '@/components/gantt/task-marker'
import type { CompanyWithTasks, Task } from '@/types/database'

interface GanttCompanyRowProps {
  company: CompanyWithTasks
  days: string[]
  today: string
  onTaskClick: (task: Task) => void
  onCompanyClick: (company: CompanyWithTasks) => void
  onAddTask: (companyId: string) => void
}

export function GanttCompanyRow({
  company,
  days,
  today,
  onTaskClick,
  onCompanyClick,
  onAddTask,
}: GanttCompanyRowProps) {
  return (
    <>
      {/* Sidebar cell - sticky */}
      <div className="sticky left-0 z-10 bg-background border-b border-r p-2 flex items-center justify-between gap-1">
        <button
          type="button"
          className="text-sm font-medium hover:underline truncate text-left"
          onClick={() => onCompanyClick(company)}
        >
          {company.name}
        </button>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground shrink-0"
          onClick={() => onAddTask(company.id)}
          title="Taak toevoegen"
        >
          <Plus className="size-3.5" />
        </button>
      </div>

      {/* Day cells */}
      {days.map((day) => {
        const inWarmup = isDateInWarmup(day, company.warmup_start_date)
        const goLive = isGoLiveDate(day, company.go_live_date)
        const isToday = day === today

        // Find tasks whose effective deadline falls on this day
        const tasksForDay = company.tasks.filter((task) => {
          const { effectiveDeadline } = computeOverdue(
            task.deadline,
            today,
            task.is_completed
          )
          return effectiveDeadline === day
        })

        return (
          <div
            key={day}
            className={cn(
              'relative border-b border-r h-12 flex items-center justify-center gap-0.5 flex-wrap',
              inWarmup && 'bg-blue-100/40 dark:bg-blue-900/20 border-yellow-400 border-2',
              goLive && 'bg-red-500/20 dark:bg-red-900/30 border-red-500 border-2',
              isToday && !inWarmup && !goLive && 'bg-blue-50 dark:bg-blue-950/30'
            )}
          >
            {tasksForDay.map((task) => (
              <TaskMarker
                key={task.id}
                task={task}
                today={today}
                onClick={onTaskClick}
              />
            ))}
          </div>
        )
      })}
    </>
  )
}
