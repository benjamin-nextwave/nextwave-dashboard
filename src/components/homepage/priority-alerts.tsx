'use client'

import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Rocket } from 'lucide-react'
import { useToday } from '@/lib/today-provider'
import { supabase } from '@/lib/supabase'
import type { Company } from '@/types/database'

const DOMAIN_TASK_TITLE = 'Buy custom domains and mailboxes, place in warmup tool'

interface DomainStatus {
  pending: { companyName: string }[]
  allDone: boolean
}

interface GoLiveStatus {
  companies: { name: string }[]
  none: boolean
}

export function PriorityAlerts() {
  const today = useToday()
  const [domainStatus, setDomainStatus] = useState<DomainStatus | null>(null)
  const [goLiveStatus, setGoLiveStatus] = useState<GoLiveStatus | null>(null)

  const loadAlerts = useCallback(async () => {
    // Fetch domain tasks across all companies (not filtered by deadline)
    const { data: domainTasks } = await supabase
      .from('tasks')
      .select('company_id, is_completed, companies(name)')
      .eq('title', DOMAIN_TASK_TITLE)

    if (domainTasks) {
      const pending = domainTasks
        .filter((t) => !t.is_completed)
        .map((t) => ({
          companyName: (t.companies as unknown as { name: string } | null)?.name ?? 'Onbekend',
        }))
      setDomainStatus({
        pending,
        allDone: pending.length === 0 && domainTasks.length > 0,
      })
    }

    // Fetch companies going live today
    const { data: companies } = await supabase
      .from('companies')
      .select('name, go_live_date')
      .eq('go_live_date', today)

    const goLiveCompanies = ((companies ?? []) as Pick<Company, 'name' | 'go_live_date'>[])
    setGoLiveStatus({
      companies: goLiveCompanies.map((c) => ({ name: c.name })),
      none: goLiveCompanies.length === 0,
    })
  }, [today])

  useEffect(() => {
    loadAlerts()
  }, [loadAlerts])

  if (!domainStatus && !goLiveStatus) return null

  return (
    <div className="space-y-3">
      {/* Domain & mailbox task alert */}
      {domainStatus && !domainStatus.allDone && domainStatus.pending.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/50">
          <AlertTriangle className="size-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800 dark:text-red-300">
              Domeinen &amp; mailboxen nog niet afgerond
            </p>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">
              {domainStatus.pending.map((p) => p.companyName).join(', ')}
            </p>
          </div>
        </div>
      )}

      {domainStatus?.allDone && (
        <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/50">
          <CheckCircle2 className="size-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-green-800 dark:text-green-300">
            Alle domeinen &amp; mailboxen zijn afgerond
          </p>
        </div>
      )}

      {/* Go-live alert */}
      {goLiveStatus && !goLiveStatus.none && (
        <div className="flex items-start gap-3 rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-900 dark:bg-purple-950/50">
          <Rocket className="size-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-purple-800 dark:text-purple-300">
              Vandaag live!
            </p>
            <p className="text-sm text-purple-700 dark:text-purple-400 mt-1">
              {goLiveStatus.companies.map((c) => c.name).join(', ')}
            </p>
          </div>
        </div>
      )}

      {goLiveStatus?.none && (
        <div className="flex items-start gap-3 rounded-lg border border-muted bg-muted/30 p-4">
          <Rocket className="size-5 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            Geen bedrijven gaan vandaag live
          </p>
        </div>
      )}
    </div>
  )
}
