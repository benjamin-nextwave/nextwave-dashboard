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
import { updateMeeting, deleteMeeting } from '@/lib/meetings'
import type { MeetingWithCompany } from '@/types/database'

interface MeetingEditDialogProps {
  meeting: MeetingWithCompany | null
  onClose: () => void
  onSaved: () => void
}

export function MeetingEditDialog({
  meeting,
  onClose,
  onSaved,
}: MeetingEditDialogProps) {
  const [title, setTitle] = useState('')
  const [meetingDate, setMeetingDate] = useState('')
  const [meetingTime, setMeetingTime] = useState('')
  const [meetingLink, setMeetingLink] = useState('')
  const [notes, setNotes] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (meeting) {
      setTitle(meeting.title)
      setMeetingDate(meeting.meeting_date)
      setMeetingTime(meeting.meeting_time.slice(0, 5))
      setMeetingLink(meeting.meeting_link ?? '')
      setNotes(meeting.notes ?? '')
      setIsCompleted(meeting.is_completed)
      setConfirmDelete(false)
    }
  }, [meeting])

  async function handleSave() {
    if (!meeting) return
    setSaving(true)
    try {
      await updateMeeting(meeting.id, {
        title,
        meeting_date: meetingDate,
        meeting_time: meetingTime,
        meeting_link: meetingLink || null,
        notes: notes || null,
        is_completed: isCompleted,
      })
      onSaved()
      onClose()
    } catch (error) {
      console.error('Failed to update meeting:', error)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!meeting) return
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setSaving(true)
    try {
      await deleteMeeting(meeting.id)
      onSaved()
      onClose()
    } catch (error) {
      console.error('Failed to delete meeting:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={!!meeting}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vergadering bewerken</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {meeting && (
            <p className="text-sm text-muted-foreground">
              {meeting.company_name}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="meeting-title">Titel</Label>
            <Input
              id="meeting-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="meeting-date">Datum</Label>
              <Input
                id="meeting-date"
                type="date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meeting-time">Tijd</Label>
              <Input
                id="meeting-time"
                type="time"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meeting-link">Vergaderlink</Label>
            <Input
              id="meeting-link"
              type="url"
              placeholder="https://..."
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meeting-notes">Notities</Label>
            <Textarea
              id="meeting-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="meeting-completed"
              checked={isCompleted}
              onCheckedChange={(checked) => setIsCompleted(checked === true)}
            />
            <Label htmlFor="meeting-completed">Afgerond</Label>
          </div>
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
            <Button
              onClick={handleSave}
              disabled={saving || !title.trim() || !meetingDate || !meetingTime}
            >
              Opslaan
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
