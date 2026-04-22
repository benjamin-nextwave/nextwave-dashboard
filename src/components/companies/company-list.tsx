'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  StickyNote,
  ListTodo,
  Mail,
  Trash2,
  Plus,
} from 'lucide-react'
import type { Company } from '@/types/database'
import { getCompaniesOverview, deleteCompany, updateCompany } from '@/lib/companies'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CreateCompanyDialog } from '@/components/companies/create-company-dialog'
import { QuickAddNoteDialog } from '@/components/companies/quick-add-note-dialog'
import { QuickAddTaskDialog } from '@/components/companies/quick-add-task-dialog'
import { QuickAddMailLogDialog } from '@/components/companies/quick-add-mail-log-dialog'

type CompanyRow = Company & { open_task_count: number; active_note_count: number }

type QuickAction =
  | { type: 'none' }
  | { type: 'note'; company: CompanyRow }
  | { type: 'task'; company: CompanyRow }
  | { type: 'mail'; company: CompanyRow }
  | { type: 'delete'; company: CompanyRow }

export function CompanyList() {
  const [companies, setCompanies] = useState<CompanyRow[]>([])
  const [loading, setLoading] = useState(true)
  const [quickAction, setQuickAction] = useState<QuickAction>({ type: 'none' })
  const [deleting, setDeleting] = useState(false)

  const fetchCompanies = useCallback(async () => {
    try {
      const data = await getCompaniesOverview()
      setCompanies(data)
    } catch (error) {
      console.error('Failed to fetch companies:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  const handleBaselineChange = useCallback(
    async (companyId: string, baseline: 'daily' | 'friday') => {
      setCompanies((prev) =>
        prev.map((c) => (c.id === companyId ? { ...c, daily_baseline: baseline } : c))
      )
      try {
        await updateCompany(companyId, { daily_baseline: baseline })
      } catch (error) {
        console.error('Failed to update baseline:', error)
        fetchCompanies()
      }
    },
    [fetchCompanies]
  )

  const handleDelete = useCallback(async () => {
    if (quickAction.type !== 'delete') return
    setDeleting(true)
    try {
      await deleteCompany(quickAction.company.id)
      setQuickAction({ type: 'none' })
      fetchCompanies()
    } catch (error) {
      console.error('Failed to delete company:', error)
    } finally {
      setDeleting(false)
    }
  }, [quickAction, fetchCompanies])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-fraktur)', color: '#4a3a20' }}
        >
          Bedrijven overzicht
        </h1>
        <CreateCompanyDialog onCreated={fetchCompanies} />
      </div>

      {loading ? (
        <p className="text-muted-foreground">Laden...</p>
      ) : companies.length === 0 ? (
        <p className="text-muted-foreground">Nog geen bedrijven</p>
      ) : (
        <div className="space-y-2">
          {companies.map((company) => (
            <CompanyRowItem
              key={company.id}
              company={company}
              onBaselineChange={handleBaselineChange}
              onAddNote={() => setQuickAction({ type: 'note', company })}
              onAddTask={() => setQuickAction({ type: 'task', company })}
              onAddMail={() => setQuickAction({ type: 'mail', company })}
              onDelete={() => setQuickAction({ type: 'delete', company })}
            />
          ))}
        </div>
      )}

      {/* Quick-add dialogs */}
      <QuickAddNoteDialog
        open={quickAction.type === 'note'}
        companyId={quickAction.type === 'note' ? quickAction.company.id : null}
        companyName={quickAction.type === 'note' ? quickAction.company.name : ''}
        onClose={() => setQuickAction({ type: 'none' })}
        onCreated={fetchCompanies}
      />
      <QuickAddTaskDialog
        open={quickAction.type === 'task'}
        companyId={quickAction.type === 'task' ? quickAction.company.id : null}
        companyName={quickAction.type === 'task' ? quickAction.company.name : ''}
        onClose={() => setQuickAction({ type: 'none' })}
        onCreated={fetchCompanies}
      />
      <QuickAddMailLogDialog
        open={quickAction.type === 'mail'}
        companyId={quickAction.type === 'mail' ? quickAction.company.id : null}
        companyName={quickAction.type === 'mail' ? quickAction.company.name : ''}
        onClose={() => setQuickAction({ type: 'none' })}
        onCreated={fetchCompanies}
      />

      {/* Delete confirmation */}
      <Dialog
        open={quickAction.type === 'delete'}
        onOpenChange={(open) => !open && setQuickAction({ type: 'none' })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bedrijf verwijderen</DialogTitle>
            <DialogDescription>
              Weet je zeker dat je{' '}
              <strong>
                {quickAction.type === 'delete' ? quickAction.company.name : ''}
              </strong>{' '}
              wilt verwijderen? Alle taken, notities en mail-logs worden ook verwijderd.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setQuickAction({ type: 'none' })}
              disabled={deleting}
            >
              Annuleren
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Verwijderen...' : 'Verwijderen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CompanyRowItem({
  company,
  onBaselineChange,
  onAddNote,
  onAddTask,
  onAddMail,
  onDelete,
}: {
  company: CompanyRow
  onBaselineChange: (id: string, baseline: 'daily' | 'friday') => void
  onAddNote: () => void
  onAddTask: () => void
  onAddMail: () => void
  onDelete: () => void
}) {
  return (
    <div className="group flex items-center gap-3 rounded-lg border bg-card p-3 hover:border-primary/50 transition-colors">
      <Link
        href={`/bedrijven/${company.id}`}
        className="flex-1 min-w-0 flex items-center gap-3"
      >
        <div className="min-w-0 flex-1">
          <h3 className="font-medium truncate">{company.name}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {company.open_task_count > 0 && (
              <Badge variant="secondary" className="gap-1">
                <ListTodo className="size-3" />
                {company.open_task_count} open
              </Badge>
            )}
            {company.active_note_count > 0 && (
              <Badge variant="secondary" className="gap-1">
                <StickyNote className="size-3" />
                {company.active_note_count}
              </Badge>
            )}
          </div>
        </div>
        <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>

      {/* Baseline status selector */}
      <BaselineToggle
        value={company.daily_baseline}
        onChange={(val) => onBaselineChange(company.id, val)}
      />

      {/* Quick actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          title="Notitie toevoegen"
          onClick={onAddNote}
        >
          <StickyNote className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          title="Taak toevoegen"
          onClick={onAddTask}
        >
          <Plus className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          title="Mail loggen"
          onClick={onAddMail}
        >
          <Mail className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Verwijderen"
          onClick={onDelete}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  )
}

function BaselineToggle({
  value,
  onChange,
}: {
  value: 'daily' | 'friday'
  onChange: (val: 'daily' | 'friday') => void
}) {
  return (
    <div className="flex rounded-md border border-border p-0.5 text-xs">
      <button
        type="button"
        onClick={() => onChange('daily')}
        className={
          value === 'daily'
            ? 'px-2.5 py-1 rounded bg-primary text-primary-foreground font-medium'
            : 'px-2.5 py-1 rounded text-muted-foreground hover:text-foreground'
        }
        title="Komt elke dag terug in Vandaag checken"
      >
        Dagelijks
      </button>
      <button
        type="button"
        onClick={() => onChange('friday')}
        className={
          value === 'friday'
            ? 'px-2.5 py-1 rounded bg-primary text-primary-foreground font-medium'
            : 'px-2.5 py-1 rounded text-muted-foreground hover:text-foreground'
        }
        title="Laten lopen tot vrijdag"
      >
        Tot vrijdag
      </button>
    </div>
  )
}
