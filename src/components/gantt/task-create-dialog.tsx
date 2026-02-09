'use client'

import { useEffect, useState } from 'react'
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
import { createTask } from '@/lib/tasks'

interface TaskCreateDialogProps {
  companyId: string | null
  onClose: () => void
  onCreated: () => void
}

export function TaskCreateDialog({
  companyId,
  onClose,
  onCreated,
}: TaskCreateDialogProps) {
  const [title, setTitle] = useState('')
  const [deadline, setDeadline] = useState('')
  const [saving, setSaving] = useState(false)

  // Reset fields when dialog opens
  useEffect(() => {
    if (companyId) {
      setTitle('')
      setDeadline('')
    }
  }, [companyId])

  async function handleCreate() {
    if (!companyId || !title.trim() || !deadline) return
    setSaving(true)
    try {
      await createTask({
        company_id: companyId,
        title: title.trim(),
        deadline,
        is_completed: false,
        is_urgent: false,
        is_date_editable: true,
        is_not_important: false,
        notes: null,
      })
      onCreated()
      onClose()
    } catch (error) {
      console.error('Failed to create task:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={!!companyId}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nieuwe taak</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-task-title">Titel</Label>
            <Input
              id="new-task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Taaknaam..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-task-deadline">Deadline</Label>
            <Input
              id="new-task-deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Annuleren
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!title.trim() || !deadline || saving}
          >
            Aanmaken
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
