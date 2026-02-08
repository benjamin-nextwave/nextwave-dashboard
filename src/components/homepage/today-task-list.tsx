'use client'

import { TodayTaskRow } from '@/components/homepage/today-task-row'
import type { TodayTask } from '@/lib/homepage'
import type { Task } from '@/types/database'

interface TodayTaskListProps {
  tasks: TodayTask[]
  onTaskClick: (task: Task) => void
}

export function TodayTaskList({ tasks, onTaskClick }: TodayTaskListProps) {
  if (tasks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Geen taken voor vandaag
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {tasks.map((todayTask) => (
        <TodayTaskRow
          key={todayTask.task.id}
          companyName={todayTask.companyName}
          title={todayTask.task.title}
          isCompleted={todayTask.task.is_completed}
          isUrgent={todayTask.task.is_urgent}
          isOverdue={todayTask.overdue.isOverdue}
          daysOverdue={todayTask.overdue.daysOverdue}
          onClick={() => onTaskClick(todayTask.task)}
        />
      ))}
    </div>
  )
}
