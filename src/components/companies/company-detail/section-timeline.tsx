'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { Plus, Mail, StickyNote, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { getCompanyNotes, createCompanyNote, deleteCompanyNote } from '@/lib/company-notes'
import { getMailTracking } from '@/lib/mail-tracking'
import type { CompanyNote } from '@/types/database'

type TimelineEntry =
  | { type: 'note'; id: string; content: string; priority: CompanyNote['priority']; date: Date }
  | { type: 'mail'; id: string; date: Date }

const priorityStyles = {
  green: { bg: 'rgba(74,122,42,0.1)', border: 'rgba(74,122,42,0.3)', dot: '#4a7a2a' },
  orange: { bg: 'rgba(200,140,20,0.1)', border: 'rgba(200,140,20,0.3)', dot: '#c88c14' },
  red: { bg: 'rgba(180,40,40,0.1)', border: 'rgba(180,40,40,0.3)', dot: '#b42828' },
} as const

interface SectionTimelineProps {
  companyId: string
  companyName: string
}

export function SectionTimeline({ companyId, companyName }: SectionTimelineProps) {
  const [entries, setEntries] = useState<TimelineEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newContent, setNewContent] = useState('')
  const [newPriority, setNewPriority] = useState<CompanyNote['priority']>('green')
  const [saving, setSaving] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const loadEntries = useCallback(async () => {
    try {
      const [notes, tracking] = await Promise.all([
        getCompanyNotes(companyId),
        getMailTracking('2020-01-01', '2099-12-31').then((data) =>
          data.filter((t) => t.company_id === companyId)
        ),
      ])

      const timeline: TimelineEntry[] = [
        ...notes.map((n) => ({
          type: 'note' as const,
          id: n.id,
          content: n.content,
          priority: n.priority,
          date: new Date(n.created_at),
        })),
        ...tracking.map((t) => ({
          type: 'mail' as const,
          id: t.id,
          date: new Date(t.contact_date + 'T12:00:00'),
        })),
      ]

      timeline.sort((a, b) => b.date.getTime() - a.date.getTime())
      setEntries(timeline)
    } catch (error) {
      console.error('Failed to load timeline:', error)
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    loadEntries()
  }, [loadEntries])

  useEffect(() => {
    if (showForm) {
      setTimeout(() => textareaRef.current?.focus(), 50)
    }
  }, [showForm])

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
      await loadEntries()
    } catch (error) {
      console.error('Failed to create note:', error)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteNote(noteId: string) {
    try {
      await deleteCompanyNote(noteId)
      setEntries((prev) => prev.filter((e) => !(e.type === 'note' && e.id === noteId)))
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  function formatDate(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Vandaag'
    if (diffDays === 1) return 'Gisteren'
    if (diffDays < 7) return `${diffDays} dagen geleden`
    return format(date, 'd MMM yyyy', { locale: nl })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-lg font-semibold"
          style={{ color: '#2a1f0e', fontFamily: 'var(--font-medieval)' }}
        >
          Klant Timeline
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(!showForm)}
          style={{
            borderColor: 'rgba(139,109,56,0.4)',
            color: '#8b6d38',
            fontFamily: 'var(--font-medieval)',
          }}
        >
          <Plus className="size-3.5" />
          Notitie
        </Button>
      </div>

      {/* Add note form */}
      {showForm && (
        <div
          className="mb-4 rounded-lg p-4 space-y-3"
          style={{
            background: 'linear-gradient(135deg, #f8f0dc, #f2e6c8)',
            border: '1px solid rgba(139,109,56,0.25)',
          }}
        >
          <Textarea
            ref={textareaRef}
            placeholder="Wat is er besproken, afgesproken of opgemerkt?"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={3}
            className="bg-white/60 border-amber-200"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault()
                handleAdd()
              }
            }}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {(Object.keys(priorityStyles) as CompanyNote['priority'][]).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={cn(
                    'size-6 rounded-full transition-all border-2',
                    newPriority === p ? 'scale-110' : 'opacity-40 hover:opacity-70'
                  )}
                  style={{
                    background: priorityStyles[p].dot,
                    borderColor: newPriority === p ? priorityStyles[p].dot : 'transparent',
                    boxShadow: newPriority === p ? `0 0 0 2px white, 0 0 0 4px ${priorityStyles[p].dot}` : 'none',
                  }}
                  onClick={() => setNewPriority(p)}
                  title={{ green: 'Normaal', orange: 'Belangrijk', red: 'Urgent' }[p]}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setShowForm(false); setNewContent(''); setNewPriority('green') }}
                style={{ color: '#8b7d60', fontFamily: 'var(--font-medieval)' }}
              >
                Annuleren
              </Button>
              <Button
                size="sm"
                onClick={handleAdd}
                disabled={saving || !newContent.trim()}
                style={{ fontFamily: 'var(--font-medieval)' }}
              >
                Opslaan
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      {loading ? (
        <p className="text-sm" style={{ color: '#8b7d60', fontFamily: 'var(--font-medieval)' }}>
          Timeline laden...
        </p>
      ) : entries.length === 0 ? (
        <p className="text-sm py-6 text-center" style={{ color: '#8b7d60', fontFamily: 'var(--font-medieval)' }}>
          Nog geen activiteit voor {companyName}.
        </p>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-4 top-2 bottom-2 w-px"
            style={{ background: 'rgba(139,109,56,0.2)' }}
          />

          <div className="space-y-3">
            {entries.map((entry) => (
              <div key={`${entry.type}-${entry.id}`} className="relative pl-10">
                {/* Dot on timeline */}
                <div
                  className="absolute left-2.5 top-3 size-3 rounded-full border-2"
                  style={{
                    background: entry.type === 'mail' ? '#8b6d38' : priorityStyles[(entry as TimelineEntry & { type: 'note' }).priority].dot,
                    borderColor: entry.type === 'mail'
                      ? 'rgba(139,109,56,0.3)'
                      : priorityStyles[(entry as TimelineEntry & { type: 'note' }).priority].border,
                  }}
                />

                {entry.type === 'mail' ? (
                  <div
                    className="rounded-lg px-3 py-2 flex items-center gap-2"
                    style={{
                      background: 'rgba(139,109,56,0.06)',
                      border: '1px solid rgba(139,109,56,0.15)',
                    }}
                  >
                    <Mail className="size-3.5 shrink-0" style={{ color: '#8b6d38' }} />
                    <span
                      className="text-sm"
                      style={{ color: '#4a3a20', fontFamily: 'var(--font-medieval)' }}
                    >
                      Mail verstuurd
                    </span>
                    <span className="text-xs ml-auto shrink-0" style={{ color: '#8b7d60' }}>
                      {formatDate(entry.date)}
                    </span>
                  </div>
                ) : (
                  <div
                    className="rounded-lg px-3 py-2.5 group"
                    style={{
                      background: priorityStyles[entry.priority].bg,
                      border: `1px solid ${priorityStyles[entry.priority].border}`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0 flex-1">
                        <StickyNote className="size-3.5 shrink-0 mt-0.5" style={{ color: priorityStyles[entry.priority].dot }} />
                        <p
                          className="text-sm whitespace-pre-wrap break-words"
                          style={{ color: '#2a1f0e' }}
                        >
                          {entry.content}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5"
                        style={{ color: '#8b7d60' }}
                        onClick={() => handleDeleteNote(entry.id)}
                        title="Verwijderen"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                    <p className="text-xs mt-1 pl-5.5" style={{ color: '#8b7d60' }}>
                      {formatDate(entry.date)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
