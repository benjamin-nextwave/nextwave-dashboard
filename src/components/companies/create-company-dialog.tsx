'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { createCompany } from '@/lib/companies'
import { generateDefaultTasks } from '@/lib/default-tasks'
import { insertDefaultTasks } from '@/lib/tasks'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type CreateCompanyDialogProps = {
  onCreated: () => void
}

export function CreateCompanyDialog({ onCreated }: CreateCompanyDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [warmupStartDate, setWarmupStartDate] = useState('')
  const [goLiveDate, setGoLiveDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!name.trim() || !warmupStartDate) return

    setIsSubmitting(true)

    try {
      const company = await createCompany({
        name: name.trim(),
        warmup_start_date: warmupStartDate,
        go_live_date: goLiveDate || null,
      })

      const tasks = generateDefaultTasks(company.id, warmupStartDate)
      await insertDefaultTasks(tasks)

      setName('')
      setWarmupStartDate('')
      setGoLiveDate('')
      setOpen(false)
      onCreated()
    } catch (error) {
      console.error('Failed to create company:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Nieuw bedrijf
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nieuw bedrijf aanmaken</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Bedrijfsnaam</Label>
            <Input
              id="company-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Bijv. Acme B.V."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="warmup-start-date">Warmup startdatum</Label>
            <Input
              id="warmup-start-date"
              type="date"
              required
              value={warmupStartDate}
              onChange={(e) => setWarmupStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="go-live-date">Go-live datum</Label>
            <Input
              id="go-live-date"
              type="date"
              value={goLiveDate}
              onChange={(e) => setGoLiveDate(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Aanmaken...' : 'Aanmaken'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
