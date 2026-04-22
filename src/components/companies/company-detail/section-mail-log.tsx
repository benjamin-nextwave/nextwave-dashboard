'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, X, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  getCompanyMailLogs,
  deleteCompanyMailLog,
} from '@/lib/company-mail-logs'
import { formatShortDate } from '@/lib/dates'
import { QuickAddMailLogDialog } from '@/components/companies/quick-add-mail-log-dialog'
import type { CompanyMailLog } from '@/types/database'

interface Props {
  companyId: string
  companyName: string
  refreshToken?: number
  onChange?: () => void
}

export function SectionMailLog({
  companyId,
  companyName,
  refreshToken,
  onChange,
}: Props) {
  const [logs, setLogs] = useState<CompanyMailLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)

  const load = useCallback(async () => {
    try {
      const data = await getCompanyMailLogs(companyId)
      setLogs(data)
    } catch (error) {
      console.error('Failed to load mail logs:', error)
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    load()
  }, [load, refreshToken])

  async function handleDelete(id: string) {
    try {
      await deleteCompanyMailLog(id)
      setLogs((prev) => prev.filter((l) => l.id !== id))
      onChange?.()
    } catch (error) {
      console.error('Failed to delete mail log:', error)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Mailinteracties</h3>
        <Button variant="ghost" size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="size-4" />
          Mail loggen
        </Button>
      </div>

      {loading ? (
        <p className="text-xs text-muted-foreground">Laden...</p>
      ) : logs.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nog geen mail-interacties gelogd</p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {logs.map((log) => (
            <div
              key={log.id}
              className="relative rounded-lg border p-3 pr-10 text-sm bg-card"
            >
              <button
                type="button"
                className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => handleDelete(log.id)}
                title="Verwijderen"
              >
                <X className="size-3.5" />
              </button>
              <div className="flex items-center gap-2">
                <Badge
                  variant={log.direction === 'out' ? 'default' : 'secondary'}
                  className="gap-1"
                >
                  {log.direction === 'out' ? (
                    <>
                      <ArrowUpRight className="size-3" /> Uitgaand
                    </>
                  ) : (
                    <>
                      <ArrowDownLeft className="size-3" /> Inkomend
                    </>
                  )}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatShortDate(log.interaction_date)}
                </span>
              </div>
              <p className="mt-1.5 font-medium">{log.subject}</p>
              {log.body && (
                <p className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap break-words">
                  {log.body}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <QuickAddMailLogDialog
        open={showAdd}
        companyId={companyId}
        companyName={companyName}
        onClose={() => setShowAdd(false)}
        onCreated={() => {
          load()
          onChange?.()
        }}
      />
    </div>
  )
}
