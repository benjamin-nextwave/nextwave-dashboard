'use client'

import { CircleCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface TodayTaskRowProps {
  companyName: string
  title: string
  isCompleted: boolean
  isOverdue: boolean
  daysOverdue: number
  onClick: () => void
}

export function TodayTaskRow({
  companyName,
  title,
  isCompleted,
  isOverdue,
  daysOverdue,
  onClick,
}: TodayTaskRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 rounded-lg border border-border px-4 py-3 text-left transition-colors hover:bg-accent"
    >
      <div className="flex min-w-0 items-center gap-3">
        {isCompleted && (
          <CircleCheck className="size-5 shrink-0 text-green-500" />
        )}
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{companyName}</p>
          <p
            className={cn(
              'text-sm text-foreground',
              isCompleted && 'text-muted-foreground line-through'
            )}
          >
            {title}
          </p>
        </div>
      </div>
      {isOverdue && (
        <Badge variant="destructive">-{daysOverdue}</Badge>
      )}
    </button>
  )
}
