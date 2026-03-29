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
import { getCompaniesForSelect } from '@/lib/meetings'

interface HomepageTaskCreateDialogProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export function HomepageTaskCreateDialog({
  open,
  onClose,
  onCreated,
}: HomepageTaskCreateDialogProps) {
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState('')
  const [title, setTitle] = useState('')
  const [deadline, setDeadline] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('')
  const [description, setDescription] = useState('')
  const [source, setSource] = useState('')
  const [saving, setSaving] = useState(false)
  const [loadingCompanies, setLoadingCompanies] = useState(false)

  useEffect(() => {
    if (open) {
      setSelectedCompanyId('')
      setTitle('')
      setDeadline('')
      setDurationMinutes('')
      setDescription('')
      setSource('')
      setLoadingCompanies(true)
      getCompaniesForSelect()
        .then(setCompanies)
        .catch((err) => console.error('Failed to load companies:', err))
        .finally(() => setLoadingCompanies(false))
    }
  }, [open])

  async function handleCreate() {
    if (!selectedCompanyId || !title.trim() || !deadline) return
    setSaving(true)
    try {
      await createTask({
        company_id: selectedCompanyId,
        title: title.trim(),
        description: description.trim() || null,
        deadline,
        scheduled_date: null,
        is_completed: false,
        is_urgent: false,
        is_date_editable: true,
        is_not_important: false,
        duration_minutes: durationMinutes ? parseInt(durationMinutes, 10) : null,
        source: (source as 'benjamin' | 'merlijn' | 'kix') || null,
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
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nieuwe taak</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-company-select">Bedrijf</Label>
            {loadingCompanies ? (
              <p className="text-muted-foreground text-sm">Laden...</p>
            ) : (
              <select
                id="task-company-select"
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Selecteer een bedrijf...</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="homepage-task-title">Titel</Label>
            <Input
              id="homepage-task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Taaknaam..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="homepage-task-deadline">Deadline</Label>
            <Input
              id="homepage-task-deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="homepage-task-description">Omschrijving</Label>
            <Input
              id="homepage-task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optionele omschrijving..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="homepage-task-duration">Duur (minuten)</Label>
              <Input
                id="homepage-task-duration"
                type="number"
                min="0"
                placeholder="bijv. 30"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="homepage-task-source">Afkomstig van</Label>
              <select
                id="homepage-task-source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Geen</option>
                <option value="benjamin">Benjamin</option>
                <option value="merlijn">Merlijn</option>
                <option value="kix">Kix</option>
              </select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Annuleren
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!selectedCompanyId || !title.trim() || !deadline || saving}
          >
            {saving ? 'Aanmaken...' : 'Aanmaken'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
