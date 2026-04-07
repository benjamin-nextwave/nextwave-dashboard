'use client'

import { useState } from 'react'
import { ArrowDownCircle, Check, MessageSquare, Sword } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { updateTask } from '@/lib/tasks'
import type { Task } from '@/types/database'

const sourceStyles = {
  benjamin: {
    gradient: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
    border: 'rgba(59,130,246,0.45)',
    shadow: 'rgba(59,130,246,0.15)',
  },
  merlijn: {
    gradient: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
    border: 'rgba(34,197,94,0.45)',
    shadow: 'rgba(34,197,94,0.15)',
  },
  kix: {
    gradient: 'linear-gradient(135deg, #fee2e2, #fecaca)',
    border: 'rgba(239,68,68,0.45)',
    shadow: 'rgba(239,68,68,0.15)',
  },
} as const

interface TodayTaskRowProps {
  taskId: string
  companyName: string
  title: string
  isCompleted: boolean
  isUrgent: boolean
  isOverdue: boolean
  isNotImportant: boolean
  daysOverdue: number
  source?: Task['source']
  notes?: string | null
  onClick: () => void
  onComplete?: () => void
  onMarkNotImportant?: () => void
  onAddToNuNu?: () => void
  isInNuNu?: boolean
  onTaskUpdated?: () => void
}

export function TodayTaskRow({
  taskId,
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
  source,
  notes,
  onTaskUpdated,
}: TodayTaskRowProps) {
  const srcStyle = source && sourceStyles[source]
  const [showReply, setShowReply] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const isMerlijnTask = source === 'merlijn'

  async function handleSendReply() {
    if (!replyText.trim()) return
    setSending(true)
    try {
      await updateTask(taskId, { notes: replyText.trim() })
      setShowReply(false)
      setReplyText('')
      onTaskUpdated?.()
    } catch (error) {
      console.error('Failed to send reply:', error)
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      className={cn(
        'rounded-lg transition-all duration-200',
        isCompleted && 'opacity-60',
      )}
      style={{
        background: srcStyle
          ? srcStyle.gradient
          : isNotImportant
            ? 'linear-gradient(135deg, #f0e2c0, #ecdaaf)'
            : 'linear-gradient(135deg, #f5ebd4, #efe0be)',
        border: `1px solid ${srcStyle ? srcStyle.border : 'rgba(139,109,56,0.35)'}`,
        boxShadow: `0 2px 8px ${srcStyle ? srcStyle.shadow : 'rgba(100,70,20,0.12)'}, inset 0 1px 0 rgba(255,250,235,0.5)`,
      }}
    >
      <div className="flex w-full items-center justify-between gap-3 px-5 py-4">
        <button
          type="button"
          onClick={onClick}
          className="flex min-w-0 items-center gap-3 text-left flex-1 hover:opacity-80 transition-opacity"
        >
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
            {notes && (
              <div
                className="mt-1.5 text-xs px-2 py-1 rounded"
                style={{ background: 'rgba(0,0,0,0.06)', color: '#4a3a20' }}
              >
                <span className="font-medium">Reactie:</span> {notes}
              </div>
            )}
          </div>
        </button>
        <div className="flex items-center gap-2 shrink-0">
          {isMerlijnTask && !notes && !isCompleted && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 hover:opacity-80 rounded-full"
              style={{ color: '#22c55e', background: 'rgba(34,197,94,0.12)' }}
              onClick={(e) => {
                e.stopPropagation()
                setShowReply(!showReply)
              }}
              title="Reageer"
            >
              <MessageSquare className="size-5" />
            </Button>
          )}
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

      {showReply && (
        <div className="px-5 pb-4 flex gap-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Typ je reactie..."
            rows={2}
            className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            disabled={sending}
          />
          <Button
            size="sm"
            onClick={handleSendReply}
            disabled={sending || !replyText.trim()}
            className="self-end"
          >
            {sending ? 'Versturen...' : 'Verstuur'}
          </Button>
        </div>
      )}
    </div>
  )
}
