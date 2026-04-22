'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2,
  StickyNote,
  Mail,
  BellOff,
  ArrowUpRight,
  ArrowDownLeft,
  Undo2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getTasksByCompanyId, updateTask } from '@/lib/tasks'
import { getCompanyNotes, unignoreCompanyNote } from '@/lib/company-notes'
import { getCompanyMailLogs } from '@/lib/company-mail-logs'
import { formatShortDate } from '@/lib/dates'
import type { CompanyMailLog, CompanyNote, Task } from '@/types/database'

type Filter = 'all' | 'tasks' | 'notes' | 'mails'

type HistoryItem =
  | { kind: 'task'; task: Task; timestamp: string }
  | { kind: 'note'; note: CompanyNote; timestamp: string }
  | { kind: 'mail'; mail: CompanyMailLog; timestamp: string }

interface Props {
  companyId: string
  refreshToken?: number
  onChange?: () => void
}

export function SectionHistory({ companyId, refreshToken, onChange }: Props) {
  const [completedTasks, setCompletedTasks] = useState<Task[]>([])
  const [ignoredNotes, setIgnoredNotes] = useState<CompanyNote[]>([])
  const [mails, setMails] = useState<CompanyMailLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')

  const load = useCallback(async () => {
    try {
      const [tasks, notes, mailLogs] = await Promise.all([
        getTasksByCompanyId(companyId),
        getCompanyNotes(companyId),
        getCompanyMailLogs(companyId),
      ])
      setCompletedTasks(tasks.filter((t) => t.is_completed))
      setIgnoredNotes(notes.filter((n) => n.ignored_at !== null))
      setMails(mailLogs)
    } catch (error) {
      console.error('Failed to load history:', error)
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    load()
  }, [load, refreshToken])

  const items = useMemo<HistoryItem[]>(() => {
    const merged: HistoryItem[] = [
      ...completedTasks.map<HistoryItem>((task) => ({
        kind: 'task',
        task,
        timestamp: task.created_at,
      })),
      ...ignoredNotes.map<HistoryItem>((note) => ({
        kind: 'note',
        note,
        timestamp: note.ignored_at ?? note.created_at,
      })),
      ...mails.map<HistoryItem>((mail) => ({
        kind: 'mail',
        mail,
        timestamp: `${mail.interaction_date}T00:00:00Z`,
      })),
    ]
    merged.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    if (filter === 'all') return merged
    return merged.filter((it) =>
      filter === 'tasks'
        ? it.kind === 'task'
        : filter === 'notes'
          ? it.kind === 'note'
          : it.kind === 'mail'
    )
  }, [completedTasks, ignoredNotes, mails, filter])

  async function handleReactivateTask(taskId: string) {
    try {
      await updateTask(taskId, { is_completed: false })
      await load()
      onChange?.()
    } catch (error) {
      console.error('Failed to reactivate task:', error)
    }
  }

  async function handleReactivateNote(noteId: string) {
    try {
      await unignoreCompanyNote(noteId)
      await load()
      onChange?.()
    } catch (error) {
      console.error('Failed to reactivate note:', error)
    }
  }

  const counts = {
    all: completedTasks.length + ignoredNotes.length + mails.length,
    tasks: completedTasks.length,
    notes: ignoredNotes.length,
    mails: mails.length,
  }

  const chips: { value: Filter; label: string; count: number }[] = [
    { value: 'all', label: 'Alles', count: counts.all },
    { value: 'tasks', label: 'Taken', count: counts.tasks },
    { value: 'notes', label: 'Notities', count: counts.notes },
    { value: 'mails', label: 'Mails', count: counts.mails },
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-semibold">Geschiedenis</h3>
        <div className="flex gap-1.5 flex-wrap">
          {chips.map((chip) => (
            <button
              key={chip.value}
              type="button"
              onClick={() => setFilter(chip.value)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-colors border',
                filter === chip.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:text-foreground'
              )}
            >
              {chip.label}
              <span className="opacity-70">{chip.count}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-xs text-muted-foreground">Laden...</p>
      ) : items.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          {filter === 'all'
            ? 'Nog niets in de geschiedenis'
            : 'Geen resultaten binnen dit filter'}
        </p>
      ) : (
        <div className="space-y-2 max-h-[32rem] overflow-y-auto">
          {items.map((item) => (
            <HistoryItemRow
              key={
                item.kind === 'task'
                  ? `t-${item.task.id}`
                  : item.kind === 'note'
                    ? `n-${item.note.id}`
                    : `m-${item.mail.id}`
              }
              item={item}
              onReactivateTask={handleReactivateTask}
              onReactivateNote={handleReactivateNote}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function HistoryItemRow({
  item,
  onReactivateTask,
  onReactivateNote,
}: {
  item: HistoryItem
  onReactivateTask: (id: string) => void
  onReactivateNote: (id: string) => void
}) {
  if (item.kind === 'task') {
    const { task } = item
    return (
      <div className="flex items-start gap-3 rounded-md border p-3 text-sm bg-muted/30">
        <CheckCircle2 className="size-4 mt-0.5 text-green-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-medium line-through opacity-80">{task.title}</p>
          {task.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {task.description}
            </p>
          )}
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              Taak
            </Badge>
            <span className="text-xs text-muted-foreground">
              Aangemaakt {formatShortDate(task.created_at)}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0"
          onClick={() => onReactivateTask(task.id)}
          title="Heropenen"
        >
          <Undo2 className="size-3.5" />
        </Button>
      </div>
    )
  }

  if (item.kind === 'note') {
    const { note } = item
    return (
      <div className="flex items-start gap-3 rounded-md border p-3 text-sm bg-muted/30">
        <BellOff className="size-4 mt-0.5 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="whitespace-pre-wrap break-words opacity-80">
            {note.content}
          </p>
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs gap-1">
              <StickyNote className="size-3" />
              Notitie genegeerd
            </Badge>
            <span className="text-xs text-muted-foreground">
              Aangemaakt {formatShortDate(note.created_at)}
              {note.ignored_at &&
                ` · genegeerd ${formatShortDate(note.ignored_at)}`}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0"
          onClick={() => onReactivateNote(note.id)}
          title="Terug naar actief"
        >
          <Undo2 className="size-3.5" />
        </Button>
      </div>
    )
  }

  const { mail } = item
  return (
    <div className="flex items-start gap-3 rounded-md border p-3 text-sm bg-muted/30">
      <Mail className="size-4 mt-0.5 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium">{mail.subject}</p>
        {mail.body && (
          <p className="text-xs text-muted-foreground mt-0.5 whitespace-pre-wrap break-words line-clamp-3">
            {mail.body}
          </p>
        )}
        <div className="mt-1 flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs gap-1">
            {mail.direction === 'out' ? (
              <>
                <ArrowUpRight className="size-3" /> Uitgaand
              </>
            ) : (
              <>
                <ArrowDownLeft className="size-3" /> Inkomend
              </>
            )}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatShortDate(mail.interaction_date)}
          </span>
        </div>
      </div>
    </div>
  )
}
