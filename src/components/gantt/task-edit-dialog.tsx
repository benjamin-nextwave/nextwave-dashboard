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
import { formatShortDate } from '@/lib/dates'
import type { Task } from '@/types/database'

interface TaskEditDialogProps {
  task: Task | null
  onClose: () => void
  onSaved: () => void
}

export function TaskEditDialog({ task, onClose, onSaved }: TaskEditDialogProps) {
  const [title, setTitle] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)
  const [isUrgent, setIsUrgent] = useState(false)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Sync local state when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setIsCompleted(task.is_completed)
      setIsUrgent(task.is_urgent)
      setNotes(task.notes ?? '')
      setConfirmDelete(false)
    }
  }, [task])

  async function handleSave() {
    if (!task) return
    setSaving(true)
    try {
      await updateTask(task.id, {
        title,
        is_completed: isCompleted,
        is_urgent: isUrgent,
        notes: notes || null,
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Taak bewerken</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Titel</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="task-notes">Notities</Label>
            <Textarea
              id="task-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {task && (
            <p className="text-sm text-muted-foreground">
              Deadline: {formatShortDate(task.deadline)}
            </p>
          )}
        </div>

        <DialogFooter className="sm:justify-between">
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
      </DialogContent>
    </Dialog>
  )
}
