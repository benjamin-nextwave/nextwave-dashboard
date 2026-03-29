'use client'

import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { updateTask, deleteTask } from '@/lib/tasks'
import { CompanyNotesSection } from '@/components/shared/company-notes-section'
import type { Task } from '@/types/database'

const sourceOptions = [
  { value: '', label: 'Geen', color: '' },
  { value: 'benjamin', label: 'Benjamin', color: '#3b82f6' },
  { value: 'merlijn', label: 'Merlijn', color: '#22c55e' },
  { value: 'kix', label: 'Kix', color: '#ef4444' },
] as const

interface TaskEditDialogProps {
  task: Task | null
  onClose: () => void
  onSaved: () => void
}

export function TaskEditDialog({ task, onClose, onSaved }: TaskEditDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [source, setSource] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)
  const [isUrgent, setIsUrgent] = useState(false)
  const [notes, setNotes] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description ?? '')
      setDeadline(task.deadline)
      setScheduledDate(task.scheduled_date ?? '')
      setSource(task.source ?? '')
      setIsCompleted(task.is_completed)
      setIsUrgent(task.is_urgent)
      setNotes(task.notes ?? '')
      setDurationMinutes(task.duration_minutes != null ? String(task.duration_minutes) : '')
      setConfirmDelete(false)
    }
  }, [task])

  async function handleSave() {
    if (!task) return
    setSaving(true)
    try {
      await updateTask(task.id, {
        title,
        description: description || null,
        deadline,
        scheduled_date: scheduledDate || null,
        source: (source as Task['source']) || null,
        is_completed: isCompleted,
        is_urgent: isUrgent,
        notes: notes || null,
        duration_minutes: durationMinutes ? parseInt(durationMinutes, 10) : null,
      })
      onSaved()
      onClose()
    } catch (error) {
      console.error('Failed to update task:', error)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!task) return
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setSaving(true)
    try {
      await deleteTask(task.id)
      onSaved()
      onClose()
    } catch (error) {
      console.error('Failed to delete task:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={!!task}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 overflow-hidden">
          {/* Left: Task editing */}
          <div className="flex flex-col overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Taak bewerken</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="task-title">Titel</Label>
                <Input
                  id="task-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-description">Omschrijving</Label>
                <Textarea
                  id="task-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Optionele omschrijving..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="task-deadline">Deadline</Label>
                  <Input
                    id="task-deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-scheduled">Ingepland op</Label>
                  <Input
                    id="task-scheduled"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="task-duration">Duur (minuten)</Label>
                  <Input
                    id="task-duration"
                    type="number"
                    min="0"
                    placeholder="bijv. 30"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-source">Afkomstig van</Label>
                  <select
                    id="task-source"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {sourceOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="task-completed"
                    checked={isCompleted}
                    onCheckedChange={(checked) => setIsCompleted(checked === true)}
                  />
                  <Label htmlFor="task-completed">Afgerond</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="task-urgent"
                    checked={isUrgent}
                    onCheckedChange={setIsUrgent}
                  />
                  <Label htmlFor="task-urgent">Urgent</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-notes">Notities</Label>
                <Textarea
                  id="task-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="sm:justify-between mt-4">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={saving}
              >
                <Trash2 />
                {confirmDelete ? 'Bevestig verwijderen' : 'Verwijderen'}
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose} disabled={saving}>
                  Annuleren
                </Button>
                <Button onClick={handleSave} disabled={saving || !title.trim()}>
                  Opslaan
                </Button>
              </div>
            </DialogFooter>
          </div>

          {/* Right: Company notes */}
          {task && (
            <div className="border-l pl-6 overflow-y-auto max-h-[70vh]">
              <CompanyNotesSection companyId={task.company_id} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
