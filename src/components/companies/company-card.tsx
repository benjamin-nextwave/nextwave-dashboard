'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { formatShortDate } from '@/lib/dates'
import { deleteCompany } from '@/lib/companies'

type CompanyCardProps = {
  id: string
  name: string
  goLiveDate: string | null
  openTaskCount: number
  onDeleted: () => void
}

export function CompanyCard({ id, name, goLiveDate, openTaskCount, onDeleted }: CompanyCardProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteCompany(id)
      setShowConfirm(false)
      onDeleted()
    } catch (error) {
      console.error('Failed to delete company:', error)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer relative group">
        <Link href={`/bedrijven/${id}`} className="block">
          <CardHeader>
            <CardTitle>{name}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {goLiveDate ? formatShortDate(goLiveDate) : 'Geen go-live datum'}
            </span>
            <Badge variant="secondary">{openTaskCount} open</Badge>
          </CardContent>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setShowConfirm(true)
          }}
        >
          <Trash2 className="size-4" />
        </Button>
      </Card>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bedrijf verwijderen</DialogTitle>
            <DialogDescription>
              Weet je zeker dat je <strong>{name}</strong> wilt verwijderen? Alle taken worden ook verwijderd.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)} disabled={deleting}>
              Annuleren
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Verwijderen...' : 'Verwijderen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
