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
  const [saving, setSaving] = useState(false)
  const [loadingCompanies, setLoadingCompanies] = useState(false)

  useEffect(() => {
    if (open) {
      setSelectedCompanyId('')
      setTitle('')
      setDeadline('')
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
