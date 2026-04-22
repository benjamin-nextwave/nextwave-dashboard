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
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { createCompanyNote } from '@/lib/company-notes'
import type { CompanyNote } from '@/types/database'

type Priority = CompanyNote['priority']

const priorityConfig = {
  green: { label: 'Laag', dot: 'bg-green-500', ring: 'ring-green-500' },
  orange: { label: 'Medium', dot: 'bg-orange-500', ring: 'ring-orange-500' },
  red: { label: 'Hoog', dot: 'bg-red-500', ring: 'ring-red-500' },
} as const

interface Props {
  open: boolean
  companyId: string | null
  companyName: string
  onClose: () => void
  onCreated: () => void
}

export function QuickAddNoteDialog({
  open,
  companyId,
  companyName,
  onClose,
  onCreated,
}: Props) {
  const [content, setContent] = useState('')
  const [priority, setPriority] = useState<Priority>('green')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) {
      setContent('')
      setPriority('green')
    }
  }, [open])

  async function handleSave() {
    if (!companyId || !content.trim()) return
    setSaving(true)
    try {
      await createCompanyNote({
        company_id: companyId,
        content: content.trim(),
        priority,
      })
      onCreated()
      onClose()
    } catch (error) {
      console.error('Failed to add note:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notitie toevoegen</DialogTitle>
          <p className="text-sm text-muted-foreground">{companyName}</p>
        </DialogHeader>
        <div className="space-y-3">
          <Textarea
            placeholder="Schrijf een notitie..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            autoFocus
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Prioriteit:</span>
            {(Object.keys(priorityConfig) as Priority[]).map((p) => (
              <button
                key={p}
                type="button"
                className={cn(
                  'size-6 rounded-full transition-all',
                  priorityConfig[p].dot,
                  priority === p
                    ? 'ring-2 ring-offset-2 ' + priorityConfig[p].ring
                    : 'opacity-40 hover:opacity-70'
                )}
                onClick={() => setPriority(p)}
                title={priorityConfig[p].label}
              />
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Annuleren
          </Button>
          <Button onClick={handleSave} disabled={saving || !content.trim()}>
            {saving ? 'Opslaan...' : 'Opslaan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
