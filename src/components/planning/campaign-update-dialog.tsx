'use client'

import { useState } from 'react'
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
import type { Company } from '@/types/database'

interface CampaignUpdateDialogProps {
  open: boolean
  company: Company | null
  selectedDate: string
  onClose: () => void
  onSent: (companyId: string, hadMessage: boolean) => void
}

const WEBHOOK_NO_CHANGES = 'https://hook.eu2.make.com/mgmv5qufe0nj8c6gztac36vpdia3guuu'
const WEBHOOK_WITH_CHANGES = 'https://hook.eu2.make.com/mrrvvu6u1uu16il175f525kc8syncjkp'

export function CampaignUpdateDialog({
  open,
  company,
  selectedDate,
  onClose,
  onSent,
}: CampaignUpdateDialogProps) {
  const [voornaam, setVoornaam] = useState('')
  const [mededeling, setMededeling] = useState('')
  const [sending, setSending] = useState(false)

  const handleClose = () => {
    setVoornaam('')
    setMededeling('')
    onClose()
  }

  const handleSend = async (withMessage: boolean) => {
    if (!voornaam.trim() || !company) return

    setSending(true)
    try {
      if (withMessage && mededeling.trim()) {
        await fetch(WEBHOOK_WITH_CHANGES, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            voornaam: voornaam.trim(),
            mededeling: mededeling.trim(),
            email: company.email ?? '',
            bedrijfsnaam: company.name,
          }),
        })
        onSent(company.id, true)
      } else {
        await fetch(WEBHOOK_NO_CHANGES, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            voornaam: voornaam.trim(),
            email: company.email ?? '',
            bedrijfsnaam: company.name,
          }),
        })
        onSent(company.id, false)
      }
      handleClose()
    } catch (error) {
      console.error('Failed to send webhook:', error)
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{company?.name} — Bi-weekly update</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label htmlFor="voornaam">Voornaam ontvanger</Label>
            <Input
              id="voornaam"
              value={voornaam}
              onChange={(e) => setVoornaam(e.target.value)}
              placeholder="Voornaam..."
              disabled={sending}
            />
          </div>

          <div className="rounded-lg border border-border p-4 space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Optie 1 — Geen aanpassingen</p>
              <Button
                variant="outline"
                onClick={() => handleSend(false)}
                disabled={!voornaam.trim() || sending}
                className="w-full"
              >
                {sending ? 'Verzenden...' : 'Er waren geen aanpassingen'}
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-x-0 top-0 flex items-center">
                <div className="w-full border-t border-border" />
                <span className="px-3 text-xs text-muted-foreground bg-card">of</span>
                <div className="w-full border-t border-border" />
              </div>
            </div>

            <div className="pt-2">
              <p className="text-sm font-medium mb-2">Optie 2 — Aanpassingen voorstellen</p>
              <Textarea
                value={mededeling}
                onChange={(e) => setMededeling(e.target.value)}
                placeholder="Omschrijf de gewenste aanpassingen..."
                rows={4}
                disabled={sending}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          {mededeling.trim() && (
            <Button
              onClick={() => handleSend(true)}
              disabled={!voornaam.trim() || sending}
            >
              {sending ? 'Verzenden...' : 'Verzenden'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
