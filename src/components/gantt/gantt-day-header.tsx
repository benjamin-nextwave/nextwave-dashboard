import { formatDayHeader } from '@/lib/gantt-utils'
import { cn } from '@/lib/utils'

interface GanttDayHeaderProps {
  dateStr: string
  isToday: boolean
}

export function GanttDayHeader({ dateStr, isToday }: GanttDayHeaderProps) {
  const { dayName, dayNum } = formatDayHeader(dateStr)

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center border-b border-r p-1 h-12',
        isToday && 'bg-blue-50 dark:bg-blue-950/30'
      )}
    >
      <span className="text-[10px] text-muted-foreground uppercase">
        {dayName}
      </span>
      <span className="text-sm font-medium">
        {dayNum}
      </span>
    </div>
  )
}
