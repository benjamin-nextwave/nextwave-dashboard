'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { Company } from '@/types/database'
import { getCompanyById, updateCompany } from '@/lib/companies'
import { useAutoSave } from '@/hooks/use-auto-save'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SaveIndicator } from './save-indicator'
import { SectionBaselineStatus } from './section-baseline-status'
import { SectionOpenTasks } from './section-open-tasks'
import { SectionMailLog } from './section-mail-log'
import { SectionHistory } from './section-history'
import { CompanyNotesSection } from '@/components/shared/company-notes-section'

interface CompanyDetailPageProps {
  companyId: string
}

export function CompanyDetailPage({ companyId }: CompanyDetailPageProps) {
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshToken, setRefreshToken] = useState(0)
  const refreshRelated = useCallback(() => setRefreshToken((t) => t + 1), [])

  const saveFn = useCallback(
    async (updates: Record<string, unknown>) => {
      await updateCompany(
        companyId,
        updates as Partial<Omit<Company, 'id' | 'created_at' | 'updated_at'>>
      )
    },
    [companyId]
  )

  const { status, save } = useAutoSave(saveFn)

  useEffect(() => {
    async function loadCompany() {
      try {
        const data = await getCompanyById(companyId)
        setCompany(data)
      } finally {
        setLoading(false)
      }
    }
    loadCompany()
  }, [companyId])

  const onFieldChange = useCallback((field: string, value: unknown) => {
    setCompany((prev) => (prev ? { ...prev, [field]: value } : prev))
  }, [])

  const onFieldBlur = useCallback(
    (field: string, value: unknown) => {
      save(field, value)
    },
    [save]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Laden...</p>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <p className="text-muted-foreground">Bedrijf niet gevonden</p>
        <Button variant="outline" asChild>
          <Link href="/bedrijven">
            <ArrowLeft className="size-4" />
            Terug naar overzicht
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Button variant="ghost" asChild>
          <Link href="/bedrijven">
            <ArrowLeft className="size-4" />
            Terug naar overzicht
          </Link>
        </Button>

        <div className="flex items-center gap-3">
          <SaveIndicator status={status} />
          <Button variant="outline" size="sm" asChild>
            <Link href={`/bedrijven/${companyId}/profiel`}>
              Bedrijfsprofiel
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div>
        <h1
          className="text-3xl font-bold"
          style={{ fontFamily: 'var(--font-fraktur)', color: '#4a3a20' }}
        >
          {company.name}
        </h1>
      </div>

      <Separator />

      {/* Baseline-status voor Vandaag checken */}
      <SectionBaselineStatus
        company={company}
        onFieldChange={onFieldChange}
        onFieldBlur={onFieldBlur}
      />

      <Separator />

      {/* Actieve notities */}
      <CompanyNotesSection
        companyId={companyId}
        activeOnly
        refreshToken={refreshToken}
        onChange={refreshRelated}
      />

      <Separator />

      {/* Open taken */}
      <SectionOpenTasks
        companyId={companyId}
        companyName={company.name}
        refreshToken={refreshToken}
        onChange={refreshRelated}
      />

      <Separator />

      {/* Mailinteracties */}
      <SectionMailLog
        companyId={companyId}
        companyName={company.name}
        refreshToken={refreshToken}
        onChange={refreshRelated}
      />

      <Separator />

      {/* Geschiedenis */}
      <SectionHistory
        companyId={companyId}
        refreshToken={refreshToken}
        onChange={refreshRelated}
      />
    </div>
  )
}
