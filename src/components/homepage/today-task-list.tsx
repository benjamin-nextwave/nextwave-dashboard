'use client'

import { TodayTaskRow } from '@/components/homepage/today-task-row'
import type { TodayTask } from '@/lib/homepage'
import type { Task } from '@/types/database'

interface TodayTaskListProps {
  tasks: TodayTask[]
  onTaskClick: (task: Task) => void
  onMarkNotImportant: (taskId: string) => void
}

export function TodayTaskList({ tasks, onTaskClick, onMarkNotImportant }: TodayTaskListProps) {
  if (tasks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Geen taken voor vandaag
      </p>
    )
  }

  const importantTasks = tasks.filter((t) => !t.task.is_not_important)
  const notImportantTasks = tasks.filter((t) => t.task.is_not_important)

  return (
    <div className="space-y-4">
      {importantTasks.length > 0 && (
        <div className="space-y-2">
          {importantTasks.map((todayTask) => (
            <TodayTaskRow
              key={todayTask.task.id}
              companyName={todayTask.companyName}
              title={todayTask.task.title}
              isCompleted={todayTask.task.is_completed}
              isUrgent={todayTask.task.is_urgent}
              isOverdue={todayTask.overdue.isOverdue}
              isNotImportant={false}
              daysOverdue={todayTask.overdue.daysOverdue}
              onClick={() => onTaskClick(todayTask.task)}
              onMarkNotImportant={() => onMarkNotImportant(todayTask.task.id)}
            />
          ))}
        </div>
      )}

      {notImportantTasks.length > 0 && (
        <div className="rounded-lg border border-purple-200 bg-purple-50/30 p-4 dark:border-purple-800 dark:bg-purple-950/20">
          <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-3">
            Niet belangrijk
          </p>
          <div className="space-y-2">
            {notImportantTasks.map((todayTask) => (
              <TodayTaskRow
                key={todayTask.task.id}
                companyName={todayTask.companyName}
                title={todayTask.task.title}
                isCompleted={todayTask.task.is_completed}
                isUrgent={todayTask.task.is_urgent}
                isOverdue={todayTask.overdue.isOverdue}
                isNotImportant={true}
                daysOverdue={todayTask.overdue.daysOverdue}
                onClick={() => onTaskClick(todayTask.task)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
