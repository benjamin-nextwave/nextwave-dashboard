'use client'

import { TodayTaskRow } from '@/components/homepage/today-task-row'
import type { TodayTask } from '@/lib/homepage'
import type { Task } from '@/types/database'

interface TodayTaskListProps {
  tasks: TodayTask[]
  onTaskClick: (task: Task) => void
  onComplete: (taskId: string) => void
  onMarkNotImportant: (taskId: string) => void
}

export function TodayTaskList({ tasks, onTaskClick, onComplete, onMarkNotImportant }: TodayTaskListProps) {
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
              onComplete={() => onComplete(todayTask.task.id)}
              onMarkNotImportant={() => onMarkNotImportant(todayTask.task.id)}
            />
          ))}
        </div>
      )}

      {notImportantTasks.length > 0 && (
        <div
          className="rounded-lg p-4"
          style={{
            background: 'linear-gradient(135deg, #efe2c4, #e8d8b0)',
            border: '1px dashed rgba(139,109,56,0.35)',
            boxShadow: '0 2px 6px rgba(100,70,20,0.08)',
          }}
        >
          <p
            className="text-xs font-medium mb-3"
            style={{ color: '#8b6d38', fontFamily: 'var(--font-medieval)' }}
          >
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
                onComplete={() => onComplete(todayTask.task.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
