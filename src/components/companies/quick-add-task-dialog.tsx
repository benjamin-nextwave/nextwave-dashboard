'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { createTask } from '@/lib/tasks'
import { getTodayISO } from '@/lib/dates'

interface Props {
  open: boolean
  companyId: string | null
  companyName: string
  onClose: () => void
  onCreated: () => void
}

export function QuickAddTaskDialog({
  open,
  companyId,
  companyName,
  onClose,
  onCreated,
}: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState(getTodayISO())
  const [isUrgent, setIsUrgent] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) {
      setTitle('')
      setDescription('')
      setDeadline(getTodayISO())
      setIsUrgent(false)
    }
  }, [open])

  async function handleSave() {
    if (!companyId || !title.trim()) return
    setSaving(true)
    try {
      await createTask({
        company_id: companyId,
        title: title.trim(),
        description: description.trim() || null,
        deadline,
        scheduled_date: null,
        is_completed: false,
        is_urgent: isUrgent,
        is_date_editable: true,
        is_not_important: false,
        duration_minutes: null,
        source: null,
        assigned_to: null,
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
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Taak toevoegen</DialogTitle>
          <p className="text-sm text-muted-foreground">{companyName}</p>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="qat-title">Titel</Label>
            <Input
              id="qat-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Wat moet er gebeuren?"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="qat-desc">Beschrijving (optioneel)</Label>
            <Textarea
              id="qat-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Extra context..."
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="space-y-1.5 flex-1">
              <Label htmlFor="qat-deadline">Deadline</Label>
              <Input
                id="qat-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <Switch id="qat-urgent" checked={isUrgent} onCheckedChange={setIsUrgent} />
              <Label htmlFor="qat-urgent">Urgent</Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Annuleren
          </Button>
          <Button onClick={handleSave} disabled={saving || !title.trim()}>
            {saving ? 'Opslaan...' : 'Opslaan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
