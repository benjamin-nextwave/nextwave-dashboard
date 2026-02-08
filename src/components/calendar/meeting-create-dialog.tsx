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
import { Textarea } from '@/components/ui/textarea'
import { createMeeting, getCompaniesForSelect } from '@/lib/meetings'

interface MeetingCreateDialogProps {
  open: boolean
  initialDate: string | null
  onClose: () => void
  onCreated: () => void
}

export function MeetingCreateDialog({
  open,
  initialDate,
  onClose,
  onCreated,
}: MeetingCreateDialogProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState('')
  const [title, setTitle] = useState('')
  const [meetingDate, setMeetingDate] = useState('')
  const [meetingTime, setMeetingTime] = useState('')
  const [meetingLink, setMeetingLink] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [loadingCompanies, setLoadingCompanies] = useState(false)

  useEffect(() => {
    if (open) {
      setStep(1)
      setSelectedCompanyId('')
      setTitle('')
      setMeetingDate(initialDate ?? '')
      setMeetingTime('')
      setMeetingLink('')
      setNotes('')
      setLoadingCompanies(true)
      getCompaniesForSelect()
        .then(setCompanies)
        .catch((err) => console.error('Failed to load companies:', err))
        .finally(() => setLoadingCompanies(false))
    }
  }, [open, initialDate])

  async function handleCreate() {
    if (!selectedCompanyId || !title.trim() || !meetingDate || !meetingTime) return
    setSaving(true)
    try {
      await createMeeting({
        company_id: selectedCompanyId,
        title,
        meeting_date: meetingDate,
        meeting_time: meetingTime,
        meeting_link: meetingLink || null,
        notes: notes || null,
        is_completed: false,
      })
      onCreated()
      onClose()
    } catch (error) {
      console.error('Failed to create meeting:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? 'Kies een bedrijf' : 'Nieuwe vergadering'}
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4">
            {loadingCompanies ? (
              <p className="text-muted-foreground text-sm">Laden...</p>
            ) : companies.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Geen bedrijven gevonden. Maak eerst een bedrijf aan.
              </p>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="company-select">Bedrijf</Label>
                <select
                  id="company-select"
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
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Annuleren
              </Button>
              <Button
                onClick={() => setStep(2)}
                disabled={!selectedCompanyId}
              >
                Volgende
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {companies.find((c) => c.id === selectedCompanyId)?.name}
            </p>

            <div className="space-y-2">
              <Label htmlFor="new-meeting-title">Titel</Label>
              <Input
                id="new-meeting-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Bijv. Onboarding call"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-meeting-date">Datum</Label>
                <Input
                  id="new-meeting-date"
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-meeting-time">Tijd</Label>
                <Input
                  id="new-meeting-time"
                  type="time"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-meeting-link">Vergaderlink (optioneel)</Label>
              <Input
                id="new-meeting-link"
                type="url"
                placeholder="https://..."
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-meeting-notes">Notities (optioneel)</Label>
              <Textarea
                id="new-meeting-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep(1)} disabled={saving}>
                Terug
              </Button>
              <Button
                onClick={handleCreate}
                disabled={saving || !title.trim() || !meetingDate || !meetingTime}
              >
                {saving ? 'Opslaan...' : 'Opslaan'}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
