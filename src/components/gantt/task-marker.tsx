import { computeOverdue } from '@/lib/overdue'
import { cn } from '@/lib/utils'
import type { Task } from '@/types/database'

interface TaskMarkerProps {
  task: Task
  today: string
  onClick: (task: Task) => void
}

export function TaskMarker({ task, today, onClick }: TaskMarkerProps) {
  const overdue = computeOverdue(task.deadline, today, task.is_completed)

  const colorClass = task.is_completed
    ? 'bg-green-500 border-green-600'
    : task.is_not_important
      ? 'bg-purple-500 border-purple-600'
      : task.is_urgent
        ? 'bg-orange-500 border-orange-600'
        : 'bg-red-500 border-red-600'

  return (
    <button
      type="button"
      className="relative group"
      title={task.title}
      onClick={() => onClick(task)}
    >
      <div
        className={cn(
          'size-3.5 rounded-full border-2 transition-transform group-hover:scale-125',
          colorClass
        )}
      />
      {overdue.isOverdue && (
        <span className="absolute -top-2 -right-3 bg-red-600 text-white text-[9px] font-bold px-1 rounded-full leading-tight whitespace-nowrap">
          -{overdue.daysOverdue}
        </span>
      )}
    </button>
  )
}
