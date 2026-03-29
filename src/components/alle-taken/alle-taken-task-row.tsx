'use client'

import { ArrowDownCircle, CalendarArrowUp, Check, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatShortDate } from '@/lib/dates'
import type { TaskWithCompany } from '@/lib/homepage'

const sourceConfig = {
  benjamin: {
    label: 'Benjamin',
    gradient: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
    border: 'rgba(59,130,246,0.45)',
    shadow: 'rgba(59,130,246,0.15)',
  },
  merlijn: {
    label: 'Merlijn',
    gradient: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
    border: 'rgba(34,197,94,0.45)',
    shadow: 'rgba(34,197,94,0.15)',
  },
  kix: {
    label: 'Kix',
    gradient: 'linear-gradient(135deg, #fee2e2, #fecaca)',
    border: 'rgba(239,68,68,0.45)',
    shadow: 'rgba(239,68,68,0.15)',
  },
} as const

interface AlleTakenTaskRowProps {
  task: TaskWithCompany
  onEdit: () => void
  onComplete: () => void
  onMarkNotImportant?: () => void
  onScheduleToday: () => void
  onDelete: () => void
}

export function AlleTakenTaskRow({
  task,
  onEdit,
  onComplete,
  onMarkNotImportant,
  onScheduleToday,
  onDelete,
}: AlleTakenTaskRowProps) {
  const source = task.source && sourceConfig[task.source]

  return (
    <div
      className="flex w-full items-center justify-between gap-3 rounded-lg px-5 py-4 transition-all duration-200"
      style={{
        background: source ? source.gradient : 'linear-gradient(135deg, #f5ebd4, #efe0be)',
        border: `1px solid ${source ? source.border : 'rgba(139,109,56,0.35)'}`,
        boxShadow: `0 2px 8px ${source ? source.shadow : 'rgba(100,70,20,0.12)'}, inset 0 1px 0 rgba(255,250,235,0.5)`,
      }}
    >
      <div className="flex min-w-0 items-center gap-3 flex-1">
        <span className="text-xl shrink-0">🔴</span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p
              className="text-xs tracking-wide uppercase"
              style={{ color: '#6b5a3e', fontFamily: 'var(--font-medieval)' }}
            >
              {task.company_name}
            </p>
            {source && (
              <span
                className="text-xs font-medium"
                style={{ color: '#6b5a3e', fontFamily: 'var(--font-medieval)' }}
              >
                · {source.label}
              </span>
            )}
          </div>
          <p
            className="text-sm"
            style={{ color: '#2a1f0e', fontFamily: 'var(--font-medieval)' }}
          >
            {task.title}
          </p>
          {task.description && (
            <p
              className="text-xs mt-0.5 line-clamp-1"
              style={{ color: '#8b7d60' }}
            >
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs" style={{ color: '#6b5a3e' }}>
              📅 {formatShortDate(task.deadline)}
            </span>
            {task.duration_minutes != null && (
              <span className="text-xs" style={{ color: '#6b5a3e' }}>
                ⏱ {task.duration_minutes}min
              </span>
            )}
            {task.scheduled_date && (
              <Badge
                className="text-[10px] px-1.5 py-0 border-0"
                style={{ background: 'rgba(139,109,56,0.2)', color: '#6b5a3e' }}
              >
                Ingepland: {formatShortDate(task.scheduled_date)}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:opacity-80 rounded-full"
          style={{ color: '#8b6d38', background: 'rgba(139,109,56,0.1)' }}
          onClick={onScheduleToday}
          title="Verzet naar taken vandaag"
        >
          <CalendarArrowUp className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:opacity-80 rounded-full"
          style={{ color: '#8b6d38', background: 'rgba(139,109,56,0.1)' }}
          onClick={onEdit}
          title="Bewerken"
        >
          <Pencil className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:opacity-80 rounded-full"
          style={{ color: '#4a7a2a', background: 'rgba(74,122,42,0.12)' }}
          onClick={onComplete}
          title="Afgerond"
        >
          <Check className="size-4" />
        </Button>
        {onMarkNotImportant && (
          <button
            type="button"
            onClick={onMarkNotImportant}
            className="text-xs transition-colors flex items-center gap-1"
            style={{ color: '#8b6d38' }}
            title="Markeer als niet belangrijk"
          >
            <ArrowDownCircle className="size-4" />
          </button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:opacity-80 rounded-full"
          style={{ color: '#8b2020', background: 'rgba(139,32,32,0.08)' }}
          onClick={onDelete}
          title="Verwijderen"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  )
}
