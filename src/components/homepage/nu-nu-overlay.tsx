'use client'

import { useState, useRef, useEffect } from 'react'
import { Check, X, Trash2, Mail, Plus, StickyNote, Swords, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export type NuNuItem =
  | { type: 'task'; id: string; companyName: string; title: string }
  | { type: 'mail'; id: string; companyName: string }
  | { type: 'quick'; id: string; title: string; done: boolean }

export type NuNuNote = {
  id: string
  text: string
  createdAt: number
}

type Tab = 'taken' | 'notities'

interface NuNuOverlayProps {
  open: boolean
  onClose: () => void
  items: NuNuItem[]
  notes: NuNuNote[]
  onComplete: (item: NuNuItem) => void
  onRemove: (item: NuNuItem) => void
  onToggleQuickTask: (id: string) => void
  onClearAll: () => void
  onAddQuickTask: (title: string) => void
  onAddNote: (text: string) => void
  onRemoveNote: (id: string) => void
  onClearNotes: () => void
}

export function NuNuOverlay({
  open,
  onClose,
  items,
  notes,
  onComplete,
  onRemove,
  onToggleQuickTask,
  onClearAll,
  onAddQuickTask,
  onAddNote,
  onRemoveNote,
  onClearNotes,
}: NuNuOverlayProps) {
  const [tab, setTab] = useState<Tab>('taken')
  const [quickInput, setQuickInput] = useState('')
  const [noteInput, setNoteInput] = useState('')
  const quickInputRef = useRef<HTMLInputElement>(null)
  const noteInputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open && tab === 'taken') {
      setTimeout(() => quickInputRef.current?.focus(), 100)
    }
    if (open && tab === 'notities') {
      setTimeout(() => noteInputRef.current?.focus(), 100)
    }
  }, [open, tab])

  function handleAddQuickTask() {
    const trimmed = quickInput.trim()
    if (!trimmed) return
    onAddQuickTask(trimmed)
    setQuickInput('')
    quickInputRef.current?.focus()
  }

  function handleAddNote() {
    const trimmed = noteInput.trim()
    if (!trimmed) return
    onAddNote(trimmed)
    setNoteInput('')
    noteInputRef.current?.focus()
  }

  function formatTimeAgo(timestamp: number) {
    const diffMs = Date.now() - timestamp
    const mins = Math.floor(diffMs / 60000)
    if (mins < 1) return 'net'
    if (mins < 60) return `${mins}m geleden`
    const hrs = Math.floor(mins / 60)
    return `${hrs}u geleden`
  }

  const linkedItems = items.filter((i) => i.type === 'task' || i.type === 'mail')
  const quickItems = items.filter((i) => i.type === 'quick') as Extract<NuNuItem, { type: 'quick' }>[]
  const undoneQuickCount = quickItems.filter((i) => !i.done).length
  const totalTaskCount = linkedItems.length + undoneQuickCount

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-lg p-0 overflow-hidden border-0" style={{
        background: 'linear-gradient(135deg, #f5ebd4, #efe0be)',
        boxShadow: '0 8px 32px rgba(100,70,20,0.25), inset 0 1px 0 rgba(255,250,235,0.5)',
      }}>
        <DialogHeader className="px-5 pt-5 pb-0">
          <DialogTitle
            className="text-lg flex items-center gap-2"
            style={{ color: '#2a1f0e', fontFamily: 'var(--font-medieval)' }}
          >
            ⚔️ Krabbelperkament
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 px-5 pt-2">
          <button
            type="button"
            className={cn(
              'flex-1 rounded-lg py-2 text-sm font-medium transition-all flex items-center justify-center gap-1.5',
            )}
            style={{
              fontFamily: 'var(--font-medieval)',
              background: tab === 'taken' ? 'rgba(139,109,56,0.2)' : 'transparent',
              color: tab === 'taken' ? '#2a1f0e' : '#8b7d60',
              border: tab === 'taken' ? '1px solid rgba(139,109,56,0.3)' : '1px solid transparent',
            }}
            onClick={() => setTab('taken')}
          >
            <Swords className="size-3.5" />
            Taken
            {totalTaskCount > 0 && (
              <span
                className="size-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
                style={{ background: '#8b2020' }}
              >
                {totalTaskCount}
              </span>
            )}
          </button>
          <button
            type="button"
            className={cn(
              'flex-1 rounded-lg py-2 text-sm font-medium transition-all flex items-center justify-center gap-1.5',
            )}
            style={{
              fontFamily: 'var(--font-medieval)',
              background: tab === 'notities' ? 'rgba(139,109,56,0.2)' : 'transparent',
              color: tab === 'notities' ? '#2a1f0e' : '#8b7d60',
              border: tab === 'notities' ? '1px solid rgba(139,109,56,0.3)' : '1px solid transparent',
            }}
            onClick={() => setTab('notities')}
          >
            <StickyNote className="size-3.5" />
            Notities
            {notes.length > 0 && (
              <span
                className="size-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
                style={{ background: '#8b6d38' }}
              >
                {notes.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab content */}
        <div className="px-5 pb-5 pt-2 max-h-[60vh] overflow-y-auto">
          {tab === 'taken' && (
            <div className="space-y-3">
              {/* Quick add input */}
              <form
                onSubmit={(e) => { e.preventDefault(); handleAddQuickTask() }}
                className="flex gap-2"
              >
                <input
                  ref={quickInputRef}
                  type="text"
                  value={quickInput}
                  onChange={(e) => setQuickInput(e.target.value)}
                  placeholder="Snel taak toevoegen..."
                  className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
                  style={{
                    background: 'rgba(255,250,235,0.6)',
                    border: '1px solid rgba(139,109,56,0.25)',
                    color: '#2a1f0e',
                    fontFamily: 'var(--font-medieval)',
                  }}
                />
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 shrink-0"
                  style={{ color: '#4a7a2a', background: 'rgba(74,122,42,0.12)' }}
                  disabled={!quickInput.trim()}
                >
                  <Plus className="size-4" />
                </Button>
              </form>

              {/* Quick tasks */}
              {quickItems.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: '#8b7d60', fontFamily: 'var(--font-medieval)' }}>
                    Snelle taken
                  </p>
                  {quickItems.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        'flex items-center gap-2.5 rounded-lg px-3 py-2 transition-all',
                        item.done && 'opacity-50',
                      )}
                      style={{
                        background: 'rgba(255,250,235,0.5)',
                        border: '1px solid rgba(139,109,56,0.2)',
                      }}
                    >
                      <button
                        type="button"
                        className={cn(
                          'size-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
                        )}
                        style={{
                          borderColor: item.done ? '#4a7a2a' : 'rgba(139,109,56,0.4)',
                          background: item.done ? 'rgba(74,122,42,0.15)' : 'transparent',
                          color: '#4a7a2a',
                        }}
                        onClick={() => onToggleQuickTask(item.id)}
                      >
                        {item.done && <Check className="size-3" />}
                      </button>
                      <span
                        className={cn('text-sm flex-1', item.done && 'line-through')}
                        style={{ color: item.done ? '#8b7d60' : '#2a1f0e', fontFamily: 'var(--font-medieval)' }}
                      >
                        {item.title}
                      </span>
                      <button
                        type="button"
                        className="shrink-0 hover:opacity-60 transition-opacity"
                        style={{ color: '#8b7d60' }}
                        onClick={() => onRemove(item)}
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Linked tasks (from main list) */}
              {linkedItems.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: '#8b7d60', fontFamily: 'var(--font-medieval)' }}>
                    Vanuit takenlijst
                  </p>
                  {linkedItems.map((item) => (
                    <div
                      key={`${item.type}-${item.id}`}
                      className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-all"
                      style={{
                        background: item.type === 'mail'
                          ? 'linear-gradient(135deg, #f8f0dc, #f2e6c8)'
                          : 'rgba(255,250,235,0.5)',
                        border: '1px solid rgba(139,109,56,0.25)',
                      }}
                    >
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-[10px] tracking-wide uppercase"
                          style={{ color: '#6b5a3e', fontFamily: 'var(--font-medieval)' }}
                        >
                          {item.type === 'mail' && (
                            <Mail className="size-3 inline mr-1 -mt-0.5" />
                          )}
                          {item.companyName}
                        </p>
                        <p
                          className="text-sm"
                          style={{ color: '#2a1f0e', fontFamily: 'var(--font-medieval)' }}
                        >
                          {item.type === 'task' ? item.title : 'Mail sturen'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:opacity-80 rounded-full"
                          style={{ color: '#4a7a2a', background: 'rgba(74,122,42,0.12)' }}
                          onClick={() => onComplete(item)}
                          title="Afgerond"
                        >
                          <Check className="size-4" />
                        </Button>
                        <button
                          type="button"
                          className="hover:opacity-60 transition-opacity p-1"
                          style={{ color: '#8b7d60' }}
                          onClick={() => onRemove(item)}
                          title="Verwijder uit lijst"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {items.length === 0 && (
                <p
                  className="text-sm text-center py-6"
                  style={{ color: '#8b7d60', fontFamily: 'var(--font-medieval)' }}
                >
                  Typ hierboven een taak, of gebruik ⚔️ in de takenlijst.
                </p>
              )}

              {/* Clear all */}
              {items.length > 0 && (
                <div className="flex justify-end pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs hover:opacity-80"
                    style={{ color: '#8b4020', fontFamily: 'var(--font-medieval)' }}
                    onClick={onClearAll}
                  >
                    <Trash2 className="size-3 mr-1" />
                    Alles wissen
                  </Button>
                </div>
              )}
            </div>
          )}

          {tab === 'notities' && (
            <div className="space-y-3">
              {/* Note input */}
              <form
                onSubmit={(e) => { e.preventDefault(); handleAddNote() }}
                className="space-y-2"
              >
                <textarea
                  ref={noteInputRef}
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Schrijf een notitie..."
                  rows={2}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
                  style={{
                    background: 'rgba(255,250,235,0.6)',
                    border: '1px solid rgba(139,109,56,0.25)',
                    color: '#2a1f0e',
                    fontFamily: 'var(--font-medieval)',
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleAddNote()
                    }
                  }}
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    style={{ color: '#4a7a2a', fontFamily: 'var(--font-medieval)' }}
                    disabled={!noteInput.trim()}
                  >
                    <Plus className="size-3 mr-1" />
                    Toevoegen
                  </Button>
                </div>
              </form>

              {/* Notes list */}
              {notes.length > 0 ? (
                <div className="space-y-2">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-lg px-3 py-2.5 group"
                      style={{
                        background: 'rgba(255,250,235,0.5)',
                        border: '1px solid rgba(139,109,56,0.2)',
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className="text-sm whitespace-pre-wrap flex-1"
                          style={{ color: '#2a1f0e', fontFamily: 'var(--font-medieval)' }}
                        >
                          {note.text}
                        </p>
                        <button
                          type="button"
                          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5"
                          style={{ color: '#8b7d60' }}
                          onClick={() => onRemoveNote(note.id)}
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                      <p className="text-[10px] mt-1 flex items-center gap-1" style={{ color: '#8b7d60' }}>
                        <Clock className="size-2.5" />
                        {formatTimeAgo(note.createdAt)}
                      </p>
                    </div>
                  ))}

                  <div className="flex justify-end pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs hover:opacity-80"
                      style={{ color: '#8b4020', fontFamily: 'var(--font-medieval)' }}
                      onClick={onClearNotes}
                    >
                      <Trash2 className="size-3 mr-1" />
                      Alle notities wissen
                    </Button>
                  </div>
                </div>
              ) : (
                <p
                  className="text-sm text-center py-6"
                  style={{ color: '#8b7d60', fontFamily: 'var(--font-medieval)' }}
                >
                  Nog geen notities. Krabbel hier iets neer.
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
