'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, X, BellOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  getCompanyNotes,
  createCompanyNote,
  deleteCompanyNote,
  ignoreCompanyNote,
} from '@/lib/company-notes'
import { formatShortDate } from '@/lib/dates'
import type { CompanyNote } from '@/types/database'

const priorityConfig = {
  green: {
    label: 'Laag',
    bg: 'bg-green-100 dark:bg-green-900/30',
    border: 'border-green-300 dark:border-green-700',
    dot: 'bg-green-500',
    ring: 'ring-green-500',
  },
  orange: {
    label: 'Medium',
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    border: 'border-orange-300 dark:border-orange-700',
    dot: 'bg-orange-500',
    ring: 'ring-orange-500',
  },
  red: {
    label: 'Hoog',
    bg: 'bg-red-100 dark:bg-red-900/30',
    border: 'border-red-300 dark:border-red-700',
    dot: 'bg-red-500',
    ring: 'ring-red-500',
  },
} as const

type Priority = CompanyNote['priority']

interface CompanyNotesSectionProps {
  companyId: string
  /** Toon alleen actieve (niet-genegeerde) notities. Standaard true. */
  activeOnly?: boolean
  /** Show ignore button on each note. Standaard true. */
  allowIgnore?: boolean
  /** Externe trigger om notities opnieuw te laden. */
  refreshToken?: number
  /** Callback als er iets wijzigt — useful voor het bijwerken van andere UI. */
  onChange?: () => void
}

export function CompanyNotesSection({
  companyId,
  activeOnly = true,
  allowIgnore = true,
  refreshToken,
  onChange,
}: CompanyNotesSectionProps) {
  const [notes, setNotes] = useState<CompanyNote[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newContent, setNewContent] = useState('')
  const [newPriority, setNewPriority] = useState<Priority>('green')
  const [saving, setSaving] = useState(false)

  const loadNotes = useCallback(async () => {
    try {
      const data = await getCompanyNotes(companyId)
      const filtered = activeOnly ? data.filter((n) => n.ignored_at === null) : data
      setNotes(filtered)
    } catch (error) {
      console.error('Failed to load notes:', error)
    } finally {
      setLoading(false)
    }
  }, [companyId, activeOnly])

  useEffect(() => {
    loadNotes()
  }, [loadNotes, refreshToken])

  async function handleAdd() {
    if (!newContent.trim()) return
    setSaving(true)
    try {
      await createCompanyNote({
        company_id: companyId,
        content: newContent.trim(),
        priority: newPriority,
      })
      setNewContent('')
      setNewPriority('green')
      setShowForm(false)
      await loadNotes()
      onChange?.()
    } catch (error) {
      console.error('Failed to create note:', error)
    } finally {
      setSaving(false)
    }
  }

  async function handleIgnore(noteId: string) {
    try {
      await ignoreCompanyNote(noteId)
      setNotes((prev) => prev.filter((n) => n.id !== noteId))
      onChange?.()
    } catch (error) {
      console.error('Failed to ignore note:', error)
    }
  }

  async function handleDelete(noteId: string) {
    try {
      await deleteCompanyNote(noteId)
      setNotes((prev) => prev.filter((n) => n.id !== noteId))
      onChange?.()
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Notities</h4>
        {!showForm && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setShowForm(true)}
          >
            <Plus className="size-4" />
          </Button>
        )}
      </div>

      {showForm && (
        <div className="space-y-2 rounded-lg border p-3">
          <Textarea
            placeholder="Schrijf een notitie..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={2}
            autoFocus
          />
          <div className="flex items-center gap-1.5">
            {(Object.keys(priorityConfig) as Priority[]).map((p) => (
              <button
                key={p}
                type="button"
                className={cn(
                  'size-6 rounded-full transition-all',
                  priorityConfig[p].dot,
                  newPriority === p
                    ? 'ring-2 ring-offset-2 ' + priorityConfig[p].ring
                    : 'opacity-40 hover:opacity-70'
                )}
                onClick={() => setNewPriority(p)}
                title={priorityConfig[p].label}
              />
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowForm(false)
                setNewContent('')
                setNewPriority('green')
              }}
            >
              Annuleren
            </Button>
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={saving || !newContent.trim()}
            >
              Toevoegen
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-xs text-muted-foreground">Laden...</p>
      ) : notes.length === 0 && !showForm ? (
        <p className="text-xs text-muted-foreground">
          {activeOnly ? 'Geen actieve notities' : 'Geen notities'}
        </p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {notes.map((note) => {
            const config = priorityConfig[note.priority]
            return (
              <div
                key={note.id}
                className={cn(
                  'relative rounded-lg border p-3 pr-16 text-sm',
                  config.bg,
                  config.border
                )}
              >
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  {allowIgnore && note.ignored_at === null && (
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => handleIgnore(note.id)}
                      title="Notitie negeren"
                    >
                      <BellOff className="size-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => handleDelete(note.id)}
                    title="Verwijderen"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
                <p className="whitespace-pre-wrap break-words">{note.content}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatShortDate(note.created_at)}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
