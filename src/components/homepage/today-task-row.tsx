'use client'

import { CircleCheck, ArrowDownCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface TodayTaskRowProps {
  companyName: string
  title: string
  isCompleted: boolean
  isUrgent: boolean
  isOverdue: boolean
  isNotImportant: boolean
  daysOverdue: number
  onClick: () => void
  onMarkNotImportant?: () => void
}

export function TodayTaskRow({
  companyName,
  title,
  isCompleted,
  isUrgent,
  isOverdue,
  isNotImportant,
  daysOverdue,
  onClick,
  onMarkNotImportant,
}: TodayTaskRowProps) {
  return (
    <div
      className={cn(
        'flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors',
        isNotImportant
          ? 'border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/30'
          : 'border-border'
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex min-w-0 items-center gap-3 text-left flex-1 hover:opacity-80 transition-opacity"
      >
        {isCompleted && (
          <CircleCheck className="size-5 shrink-0 text-green-500" />
        )}
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{companyName}</p>
          <div className="flex items-center gap-2">
            <p
              className={cn(
                'text-sm text-foreground',
                isCompleted && 'text-muted-foreground line-through'
              )}
            >
              {title}
            </p>
            {isUrgent && !isCompleted && (
              <Badge className="bg-orange-500 text-white hover:bg-orange-500 text-xs px-1.5 py-0">
                Urgent
              </Badge>
            )}
            {isNotImportant && (
              <Badge className="bg-purple-500 text-white hover:bg-purple-500 text-xs px-1.5 py-0">
                Niet belangrijk
              </Badge>
            )}
          </div>
        </div>
      </button>
      <div className="flex items-center gap-2 shrink-0">
        {isOverdue && (
          <Badge variant="destructive">-{daysOverdue}</Badge>
        )}
        {!isCompleted && !isNotImportant && onMarkNotImportant && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onMarkNotImportant()
            }}
            className="text-xs text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-1"
            title="Markeer als niet belangrijk"
          >
            <ArrowDownCircle className="size-4" />
            <span className="hidden sm:inline">Niet belangrijk</span>
          </button>
        )}
      </div>
    </div>
  )
}
