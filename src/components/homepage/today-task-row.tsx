'use client'

import { ArrowDownCircle, Check, Sword } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  onComplete?: () => void
  onMarkNotImportant?: () => void
  onAddToNuNu?: () => void
  isInNuNu?: boolean
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
  onComplete,
  onMarkNotImportant,
  onAddToNuNu,
  isInNuNu,
}: TodayTaskRowProps) {
  return (
    <div
      className={cn(
        'flex w-full items-center justify-between gap-3 rounded-lg px-5 py-4 transition-all duration-200',
        isCompleted && 'opacity-60',
      )}
      style={{
        background: isNotImportant
          ? 'linear-gradient(135deg, #f0e2c0, #ecdaaf)'
          : 'linear-gradient(135deg, #f5ebd4, #efe0be)',
        border: '1px solid rgba(139,109,56,0.35)',
        boxShadow: '0 2px 8px rgba(100,70,20,0.12), inset 0 1px 0 rgba(255,250,235,0.5)',
      }}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex min-w-0 items-center gap-3 text-left flex-1 hover:opacity-80 transition-opacity"
      >
        {/* Wax seal status */}
        <span className="text-xl shrink-0">
          {isCompleted ? '💀' : '🔴'}
        </span>

        <div className="min-w-0">
          <p
            className="text-xs tracking-wide uppercase"
            style={{ color: '#6b5a3e', fontFamily: 'var(--font-medieval)' }}
          >
            {companyName}
          </p>
          <div className="flex items-center gap-2">
            <p
              className={cn(
                'text-sm',
                isCompleted && 'line-through'
              )}
              style={{
                color: isCompleted ? '#8b7d60' : '#2a1f0e',
                fontFamily: 'var(--font-medieval)',
              }}
            >
              {title}
            </p>
            {isUrgent && !isCompleted && (
              <Badge
                className="text-xs px-1.5 py-0 border-0"
                style={{ background: '#8b2020', color: '#f4e4c1' }}
              >
                ⚠ Urgent
              </Badge>
            )}
            {isNotImportant && (
              <Badge
                className="text-xs px-1.5 py-0 border-0"
                style={{ background: 'rgba(139,109,56,0.2)', color: '#6b5a3e' }}
              >
                Niet belangrijk
              </Badge>
            )}
          </div>
        </div>
      </button>
      <div className="flex items-center gap-2 shrink-0">
        {!isCompleted && onAddToNuNu && !isInNuNu && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 hover:opacity-80 rounded-full"
            style={{ color: '#8b6d38', background: 'rgba(139,109,56,0.1)' }}
            onClick={(e) => {
              e.stopPropagation()
              onAddToNuNu()
            }}
            title="Toevoegen aan Nu Nu lijst"
          >
            <Sword className="size-5" />
          </Button>
        )}
        {isInNuNu && (
          <Badge
            className="text-[10px] px-1.5 py-0 border-0"
            style={{ background: 'rgba(139,109,56,0.2)', color: '#6b5a3e' }}
          >
            Nu Nu
          </Badge>
        )}
        {!isCompleted && onComplete && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 hover:opacity-80 rounded-full"
            style={{ color: '#4a7a2a', background: 'rgba(74,122,42,0.12)' }}
            onClick={(e) => {
              e.stopPropagation()
              onComplete()
            }}
            title="Afgerond"
          >
            <Check className="size-5" />
          </Button>
        )}
        {isOverdue && (
          <Badge
            className="border-0"
            style={{ background: '#8b2020', color: '#f4e4c1' }}
          >
            -{daysOverdue}
          </Badge>
        )}
        {!isCompleted && !isNotImportant && onMarkNotImportant && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onMarkNotImportant()
            }}
            className="text-xs transition-colors flex items-center gap-1"
            style={{ color: '#8b6d38' }}
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
