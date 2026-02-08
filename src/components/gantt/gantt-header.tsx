import { format, parseISO } from 'date-fns'
import { nl } from 'date-fns/locale/nl'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface GanttHeaderProps {
  days: string[]
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}

export function GanttHeader({ days, onPrev, onNext, onToday }: GanttHeaderProps) {
  const firstDay = days[0]
  const lastDay = days[days.length - 1]

  const rangeLabel = firstDay && lastDay
    ? `${format(parseISO(firstDay), 'd MMM', { locale: nl })} - ${format(parseISO(lastDay), 'd MMM yyyy', { locale: nl })}`
    : ''

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">Gantt</h1>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onPrev} aria-label="Vorige week">
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-sm font-medium min-w-[160px] text-center">
          {rangeLabel}
        </span>
        <Button variant="outline" size="icon" onClick={onNext} aria-label="Volgende week">
          <ChevronRight className="size-4" />
        </Button>
        <Button variant="outline" onClick={onToday}>
          Vandaag
        </Button>
      </div>
    </div>
  )
}
