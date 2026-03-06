'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Mail,
  Check,
  ChevronRight,
  Trash2,
  Plus,
  HelpCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import {
  getMailTasksDue,
  completeMailTask,
  snoozeMailTask,
  updateMailTaskUrgency,
  updateMailTaskReason,
  createMailTask,
  deleteMailTask,
} from '@/lib/mail-tasks'
import { getCompaniesForSelect } from '@/lib/meetings'
import type { MailTaskWithCompany } from '@/types/database'

const urgencyConfig = {
  3: { label: 'Hoog', class: 'bg-red-500 text-white hover:bg-red-500' },
  2: { label: 'Medium', class: 'bg-orange-500 text-white hover:bg-orange-500' },
  1: { label: 'Laag', class: 'bg-blue-400 text-white hover:bg-blue-400' },
} as const

interface MailTaskBoxProps {
  today: string
  onRefresh?: () => void
}

export function MailTaskBox({ today, onRefresh }: MailTaskBoxProps) {
  const [tasks, setTasks] = useState<MailTaskWithCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editingTask, setEditingTask] = useState<MailTaskWithCompany | null>(null)

  const loadTasks = useCallback(async () => {
    try {
      const data = await getMailTasksDue(today)
      data.sort((a, b) => {
        if (a.urgency !== b.urgency) return b.urgency - a.urgency
        return a.deadline.localeCompare(b.deadline)
      })
      setTasks(data)
    } catch (error) {
      console.error('Failed to load mail tasks:', error)
    } finally {
      setLoading(false)
    }
  }, [today])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  async function handleComplete(e: React.MouseEvent, taskId: string) {
    e.stopPropagation()
    try {
      await completeMailTask(taskId, today)
      await loadTasks()
      onRefresh?.()
    } catch (error) {
      console.error('Failed to complete mail task:', error)
    }
  }

  async function handleSnooze(e: React.MouseEvent, taskId: string, deadline: string) {
    e.stopPropagation()
    try {
      await snoozeMailTask(taskId, deadline)
      await loadTasks()
    } catch (error) {
      console.error('Failed to snooze mail task:', error)
    }
  }

  async function handleUrgencyChange(e: React.MouseEvent, taskId: string, urgency: 1 | 2 | 3) {
    e.stopPropagation()
    try {
      await updateMailTaskUrgency(taskId, urgency)
      setTasks((prev) =>
        [...prev.map((t) =>
          t.id === taskId ? { ...t, urgency } : t
        )].sort((a, b) => {
          if (a.urgency !== b.urgency) return b.urgency - a.urgency
          return a.deadline.localeCompare(b.deadline)
        })
      )
    } catch (error) {
      console.error('Failed to update urgency:', error)
    }
  }

  async function handleDelete(e: React.MouseEvent, taskId: string) {
    e.stopPropagation()
    try {
      await deleteMailTask(taskId)
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
    } catch (error) {
      console.error('Failed to delete mail task:', error)
    }
  }

  async function handleReasonSaved() {
    setEditingTask(null)
    await loadTasks()
  }

  async function handleCreated() {
    setShowCreate(false)
    await loadTasks()
  }

  function formatLastContact(completedAt: string | null): string {
    if (!completedAt) return 'Nog geen contact'
    const date = new Date(completedAt)
    const diffMs = new Date(today + 'T00:00:00').getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Vandaag'
    if (diffDays === 1) return 'Gisteren'
    return `${diffDays} dagen geleden`
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
        <p className="text-sm text-blue-600 dark:text-blue-400">Mailing taken laden...</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Mail className="size-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Mailing taken ({tasks.length})
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-blue-600 hover:text-blue-800 dark:text-blue-400"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="size-3.5 mr-1" />
            Nieuw
          </Button>
        </div>

        {tasks.length === 0 ? (
          <p className="text-xs text-blue-500 dark:text-blue-400">
            Geen mailing taken voor vandaag
          </p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <button
                key={task.id}
                type="button"
                className="w-full text-left flex items-center justify-between gap-2 rounded-md border border-blue-200 bg-white p-3 dark:border-blue-700 dark:bg-blue-950/50 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                onClick={() => setEditingTask(task)}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">
                      {task.company_name}
                    </p>
                    <Badge
                      className={cn(
                        'text-[10px] px-1.5 py-0 shrink-0',
                        urgencyConfig[task.urgency].class
                      )}
                    >
                      {urgencyConfig[task.urgency].label}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 shrink-0"
                    >
                      {task.is_auto_generated ? 'Auto' : 'Handmatig'}
                    </Badge>
                    {!task.reason && (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1 py-0 shrink-0 border-amber-400 text-amber-600 dark:text-amber-400"
                        title="Geen reden opgegeven"
                      >
                        <HelpCircle className="size-3" />
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-muted-foreground">
                      Laatste contact: {formatLastContact(task.last_completed_at)}
                    </span>
                    {task.reason && (
                      <span className="text-xs text-blue-600 dark:text-blue-400 truncate">
                        {task.reason}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <div className="flex gap-0.5 mr-1">
                    {([1, 2, 3] as const).map((u) => (
                      <span
                        key={u}
                        role="button"
                        tabIndex={0}
                        className={cn(
                          'size-5 rounded-full text-[9px] font-bold transition-all inline-flex items-center justify-center',
                          task.urgency === u
                            ? urgencyConfig[u].class
                            : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 hover:opacity-80'
                        )}
                        onClick={(e) => handleUrgencyChange(e, task.id, u)}
                        title={urgencyConfig[u].label}
                      >
                        {u}
                      </span>
                    ))}
                  </div>

                  {task.is_auto_generated && !task.has_been_snoozed && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                      onClick={(e) => handleSnooze(e, task.id, task.deadline)}
                      title="1 dag uitstellen"
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-green-600 hover:text-green-800 hover:bg-green-100"
                    onClick={(e) => handleComplete(e, task.id)}
                    title="Afgerond"
                  >
                    <Check className="size-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-red-600"
                    onClick={(e) => handleDelete(e, task.id)}
                    title="Verwijderen"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <MailTaskCreateDialog
        open={showCreate}
        today={today}
        onClose={() => setShowCreate(false)}
        onCreated={handleCreated}
      />

      <MailTaskReasonDialog
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSaved={handleReasonSaved}
      />
    </>
  )
}

/* ── Reason edit dialog ── */

function MailTaskReasonDialog({
  task,
  onClose,
  onSaved,
}: {
  task: MailTaskWithCompany | null
  onClose: () => void
  onSaved: () => void
}) {
  const [reason, setReason] = useState('')
  const [noReason, setNoReason] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (task) {
      if (task.reason === '?') {
        setReason('')
        setNoReason(true)
      } else {
        setReason(task.reason ?? '')
        setNoReason(false)
      }
    }
  }, [task])

  async function handleSave() {
    if (!task) return
    setSaving(true)
    try {
      const value = noReason ? '?' : (reason.trim() || null)
      await updateMailTaskReason(task.id, value)
      onSaved()
    } catch (error) {
      console.error('Failed to update reason:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={!!task} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reden voor mail - {task?.company_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Geef een reden op voor deze mail, of klik op het vraagteken als er geen specifieke reden is.
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <Textarea
                  placeholder="Reden voor de mail..."
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value)
                    if (e.target.value) setNoReason(false)
                  }}
                  disabled={noReason}
                  rows={3}
                  className={cn(noReason && 'opacity-50')}
                />
              </div>
              <button
                type="button"
                className={cn(
                  'flex items-center justify-center size-12 rounded-lg border-2 transition-all shrink-0 mt-0.5',
                  noReason
                    ? 'border-amber-400 bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:border-amber-500'
                    : 'border-gray-200 text-gray-400 hover:border-amber-300 hover:text-amber-500 dark:border-gray-700'
                )}
                onClick={() => {
                  setNoReason(!noReason)
                  if (!noReason) setReason('')
                }}
                title="Geen reden"
              >
                <HelpCircle className="size-6" />
              </button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Annuleren
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            Opslaan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ── Create dialog ── */

function MailTaskCreateDialog({
  open,
  today,
  onClose,
  onCreated,
}: {
  open: boolean
  today: string
  onClose: () => void
  onCreated: () => void
}) {
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState('')
  const [deadline, setDeadline] = useState(today)
  const [urgency, setUrgency] = useState<1 | 2 | 3>(2)
  const [reason, setReason] = useState('')
  const [noReason, setNoReason] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadingCompanies, setLoadingCompanies] = useState(false)

  useEffect(() => {
    if (open) {
      setSelectedCompanyId('')
      setDeadline(today)
      setUrgency(2)
      setReason('')
      setNoReason(false)
      setLoadingCompanies(true)
      getCompaniesForSelect()
        .then(setCompanies)
        .catch((err) => console.error('Failed to load companies:', err))
        .finally(() => setLoadingCompanies(false))
    }
  }, [open, today])

  async function handleCreate() {
    if (!selectedCompanyId || !deadline) return
    setSaving(true)
    try {
      const reasonValue = noReason ? '?' : (reason.trim() || null)
      await createMailTask(selectedCompanyId, deadline, urgency, reasonValue)
      onCreated()
    } catch (error) {
      console.error('Failed to create mail task:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nieuwe mailing taak</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Bedrijf</Label>
            {loadingCompanies ? (
              <p className="text-muted-foreground text-sm">Laden...</p>
            ) : (
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Selecteer een bedrijf...</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-2">
            <Label>Deadline</Label>
            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Urgentie</Label>
            <div className="flex gap-2">
              {([1, 2, 3] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  className={cn(
                    'flex-1 rounded-md py-1.5 text-sm font-medium transition-all',
                    urgency === u
                      ? urgencyConfig[u].class
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:opacity-80'
                  )}
                  onClick={() => setUrgency(u)}
                >
                  {urgencyConfig[u].label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Reden voor mail</Label>
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <Textarea
                  placeholder="Reden voor de mail..."
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value)
                    if (e.target.value) setNoReason(false)
                  }}
                  disabled={noReason}
                  rows={2}
                  className={cn(noReason && 'opacity-50')}
                />
              </div>
              <button
                type="button"
                className={cn(
                  'flex items-center justify-center size-10 rounded-lg border-2 transition-all shrink-0 mt-0.5',
                  noReason
                    ? 'border-amber-400 bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:border-amber-500'
                    : 'border-gray-200 text-gray-400 hover:border-amber-300 hover:text-amber-500 dark:border-gray-700'
                )}
                onClick={() => {
                  setNoReason(!noReason)
                  if (!noReason) setReason('')
                }}
                title="Geen reden"
              >
                <HelpCircle className="size-5" />
              </button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Annuleren
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!selectedCompanyId || !deadline || saving}
          >
            Aanmaken
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
