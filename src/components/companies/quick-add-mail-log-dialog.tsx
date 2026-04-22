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
import { createCompanyMailLog } from '@/lib/company-mail-logs'
import { getTodayISO } from '@/lib/dates'
import type { CompanyMailLog } from '@/types/database'

type Direction = CompanyMailLog['direction']

interface Props {
  open: boolean
  companyId: string | null
  companyName: string
  onClose: () => void
  onCreated: () => void
}

export function QuickAddMailLogDialog({
  open,
  companyId,
  companyName,
  onClose,
  onCreated,
}: Props) {
  const [direction, setDirection] = useState<Direction>('out')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [date, setDate] = useState(getTodayISO())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) {
      setDirection('out')
      setSubject('')
      setBody('')
      setDate(getTodayISO())
    }
  }, [open])

  async function handleSave() {
    if (!companyId || !subject.trim()) return
    setSaving(true)
    try {
      await createCompanyMailLog({
        company_id: companyId,
        direction,
        subject: subject.trim(),
        body: body.trim() || null,
        interaction_date: date,
      })
      onCreated()
      onClose()
    } catch (error) {
      console.error('Failed to log mail:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mailinteractie vastleggen</DialogTitle>
          <p className="text-sm text-muted-foreground">{companyName}</p>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex rounded-md border border-border p-0.5 w-fit text-sm">
            <button
              type="button"
              onClick={() => setDirection('out')}
              className={
                direction === 'out'
                  ? 'px-3 py-1 rounded bg-primary text-primary-foreground font-medium'
                  : 'px-3 py-1 rounded text-muted-foreground hover:text-foreground'
              }
            >
              Uitgaand
            </button>
            <button
              type="button"
              onClick={() => setDirection('in')}
              className={
                direction === 'in'
                  ? 'px-3 py-1 rounded bg-primary text-primary-foreground font-medium'
                  : 'px-3 py-1 rounded text-muted-foreground hover:text-foreground'
              }
            >
              Inkomend
            </button>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="qml-subject">Onderwerp</Label>
            <Input
              id="qml-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Waar ging de mail over?"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="qml-body">Inhoud (optioneel)</Label>
            <Textarea
              id="qml-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Wat is er gezegd..."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="qml-date">Datum</Label>
            <Input
              id="qml-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Annuleren
          </Button>
          <Button onClick={handleSave} disabled={saving || !subject.trim()}>
            {saving ? 'Opslaan...' : 'Opslaan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
