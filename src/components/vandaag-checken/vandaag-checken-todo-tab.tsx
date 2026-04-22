'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowRight, X, StickyNote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { updateTask } from '@/lib/tasks'
import { formatShortDate } from '@/lib/dates'
import type { Task } from '@/types/database'
import type { VandaagCheckenEntry } from '@/lib/vandaag-checken'

interface Props {
  entries: VandaagCheckenEntry[]
  onRemoveFromTodo: (companyId: string) => void
  onRefresh: () => void
}

export function VandaagCheckenTodoTab({
  entries,
  onRemoveFromTodo,
  onRefresh,
}: Props) {
  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <p className="text-muted-foreground">
          Nog geen klanten in je To do voor vandaag. Gebruik
          &ldquo;Verplaats naar To do&rdquo; in het Overzicht-tabblad.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <TodoEntryCard
          key={entry.company.id}
          entry={entry}
          onRemoveFromTodo={onRemoveFromTodo}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  )
}

function TodoEntryCard({
  entry,
  onRemoveFromTodo,
  onRefresh,
}: {
  entry: VandaagCheckenEntry
  onRemoveFromTodo: (companyId: string) => void
  onRefresh: () => void
}) {
  const { company, openTasks, activeNotes } = entry
  const [localTasks, setLocalTasks] = useState<Task[]>(openTasks)
  const [busy, setBusy] = useState<Set<string>>(new Set())

  const handleComplete = useCallback(
    async (taskId: string) => {
      setBusy((prev) => new Set(prev).add(taskId))
      try {
        await updateTask(taskId, { is_completed: true })
        setLocalTasks((prev) => prev.filter((t) => t.id !== taskId))
        onRefresh()
      } catch (error) {
        console.error('Failed to complete task:', error)
      } finally {
        setBusy((prev) => {
          const next = new Set(prev)
          next.delete(taskId)
          return next
        })
      }
    },
    [onRefresh]
  )

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between gap-3 border-b p-3">
        <Link
          href={`/bedrijven/${company.id}`}
          className="group flex items-center gap-2 min-w-0 flex-1"
        >
          <h3 className="font-semibold truncate">{company.name}</h3>
          <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => onRemoveFromTodo(company.id)}
          title="Haal uit To do"
        >
          <X className="size-4" />
          Uit To do
        </Button>
      </div>

      {activeNotes.length > 0 && (
        <div className="border-b p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <StickyNote className="size-3" />
            Actieve notities
          </div>
          {activeNotes.map((note) => (
            <div key={note.id} className="text-sm flex items-start gap-2">
              <span
                className={
                  note.priority === 'red'
                    ? 'mt-1 size-2 rounded-full bg-red-500 shrink-0'
                    : note.priority === 'orange'
                      ? 'mt-1 size-2 rounded-full bg-orange-500 shrink-0'
                      : 'mt-1 size-2 rounded-full bg-green-500 shrink-0'
                }
              />
              <span className="whitespace-pre-wrap break-words flex-1">
                {note.content}
              </span>
              <span className="text-xs text-muted-foreground shrink-0">
                {formatShortDate(note.created_at)}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="p-3 space-y-1.5">
        {localTasks.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            Geen open taken — alles afgevinkt of niets openstaand.
          </p>
        ) : (
          localTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start gap-3 rounded-md px-2 py-1.5 hover:bg-muted/50"
            >
              <Checkbox
                checked={false}
                disabled={busy.has(task.id)}
                onCheckedChange={() => handleComplete(task.id)}
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{task.title}</p>
                {task.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {task.description}
                  </p>
                )}
                <div className="mt-1 flex items-center gap-1.5">
                  <Badge variant="outline" className="text-xs">
                    {formatShortDate(task.deadline)}
                  </Badge>
                  {task.is_urgent && (
                    <Badge variant="destructive" className="text-xs">
                      Urgent
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
