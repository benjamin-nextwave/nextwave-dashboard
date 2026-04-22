'use client'

import Link from 'next/link'
import { ArrowRight, ListTodo, StickyNote, Bell, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { VandaagCheckenEntry } from '@/lib/vandaag-checken'

interface Props {
  entries: VandaagCheckenEntry[]
  onAddToTodo: (companyId: string) => void
  onRemoveFromTodo: (companyId: string) => void
}

export function VandaagCheckenOverzichtTab({
  entries,
  onAddToTodo,
  onRemoveFromTodo,
}: Props) {
  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <p className="text-muted-foreground">
          Vandaag staat er geen enkele klant op je radar. 🎉
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <EntryRow
          key={entry.company.id}
          entry={entry}
          onAddToTodo={onAddToTodo}
          onRemoveFromTodo={onRemoveFromTodo}
        />
      ))}
    </div>
  )
}

function EntryRow({
  entry,
  onAddToTodo,
  onRemoveFromTodo,
}: {
  entry: VandaagCheckenEntry
  onAddToTodo: (companyId: string) => void
  onRemoveFromTodo: (companyId: string) => void
}) {
  const { company, openTasks, activeNotes, triggers, inTodoToday } = entry
  const hasDailyTrigger = triggers.includes('daily')

  return (
    <div
      className={cn(
        'group flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors',
        'hover:border-primary/50'
      )}
    >
      <Link
        href={`/bedrijven/${company.id}`}
        className="flex-1 min-w-0 flex items-center gap-3"
      >
        <div className="min-w-0 flex-1">
          <h3 className="font-medium truncate">{company.name}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {hasDailyTrigger && (
              <Badge variant="secondary" className="gap-1">
                <Bell className="size-3" />
                Dagelijks
              </Badge>
            )}
            {openTasks.length > 0 && (
              <Badge variant="secondary" className="gap-1">
                <ListTodo className="size-3" />
                {openTasks.length} {openTasks.length === 1 ? 'taak' : 'taken'}
              </Badge>
            )}
            {activeNotes.length > 0 && (
              <Badge variant="secondary" className="gap-1">
                <StickyNote className="size-3" />
                {activeNotes.length}{' '}
                {activeNotes.length === 1 ? 'notitie' : 'notities'}
              </Badge>
            )}
          </div>
        </div>
        <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>

      {inTodoToday ? (
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => onRemoveFromTodo(company.id)}
          title="Haal uit To do"
        >
          <Check className="size-4 text-green-600" />
          In To do
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAddToTodo(company.id)}
        >
          Verplaats naar To do
        </Button>
      )}
    </div>
  )
}
