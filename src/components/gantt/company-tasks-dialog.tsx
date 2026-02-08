'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { computeOverdue } from '@/lib/overdue'
import { formatShortDate } from '@/lib/dates'
import { cn } from '@/lib/utils'
import type { CompanyWithTasks, Task } from '@/types/database'

interface CompanyTasksDialogProps {
  company: CompanyWithTasks | null
  today: string
  onClose: () => void
  onEditTask: (task: Task) => void
}

export function CompanyTasksDialog({
  company,
  today,
  onClose,
  onEditTask,
}: CompanyTasksDialogProps) {
  const sortedTasks = company
    ? [...company.tasks].sort((a, b) => a.deadline.localeCompare(b.deadline))
    : []

  return (
    <Dialog
      open={!!company}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Taken - {company?.name}</DialogTitle>
        </DialogHeader>

        {sortedTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">Geen taken</p>
        ) : (
          <div className="max-h-96 overflow-y-auto space-y-2">
            {sortedTasks.map((task) => {
              const overdue = computeOverdue(
                task.deadline,
                today,
                task.is_completed
              )
              return (
                <button
                  key={task.id}
                  type="button"
                  className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors flex items-center justify-between"
                  onClick={() => onEditTask(task)}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'size-2 rounded-full shrink-0',
                        task.is_completed
                          ? 'bg-green-500'
                          : task.is_urgent
                            ? 'bg-orange-500'
                            : 'bg-red-500'
                      )}
                    />
                    <span
                      className={cn(
                        'text-sm',
                        task.is_completed &&
                          'line-through text-muted-foreground'
                      )}
                    >
                      {task.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {overdue.isOverdue && (
                      <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded">
                        {overdue.daysOverdue}d te laat
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatShortDate(task.deadline)}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
