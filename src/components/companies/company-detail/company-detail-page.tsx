'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import type { Company } from '@/types/database'
import { getCompanyById, updateCompany } from '@/lib/companies'
import { useAutoSave } from '@/hooks/use-auto-save'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SaveIndicator } from './save-indicator'
import { SectionBasisgegevens } from './section-basisgegevens'
import { SectionKlantprofiel } from './section-klantprofiel'
import { SectionMailvarianten } from './section-mailvarianten'
import { SectionFeedback } from './section-feedback'

interface CompanyDetailPageProps {
  companyId: string
}

export function CompanyDetailPage({ companyId }: CompanyDetailPageProps) {
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)

  const saveFn = useCallback(
    async (updates: Record<string, unknown>) => {
      await updateCompany(
        companyId,
        updates as Partial<Omit<Company, 'id' | 'created_at' | 'updated_at'>>
      )
    },
    [companyId]
  )

  const { status, save, saveAll } = useAutoSave(saveFn)

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

  const onFieldChange = useCallback(
    (field: string, value: unknown) => {
      setCompany((prev) => (prev ? { ...prev, [field]: value } : prev))
    },
    []
  )

  const onFieldBlur = useCallback(
    (field: string, value: unknown) => {
      save(field, value)
    },
    [save]
  )

  const handleManualSave = useCallback(() => {
    if (!company) return
    const {
      id: _id,
      created_at: _createdAt,
      updated_at: _updatedAt,
      ...fields
    } = company
    saveAll(fields as Record<string, unknown>)
  }, [company, saveAll])

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
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/bedrijven">
            <ArrowLeft className="size-4" />
            Terug naar overzicht
          </Link>
        </Button>

        <div className="flex items-center gap-3">
          <SaveIndicator status={status} />
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualSave}
            disabled={status === 'saving'}
          >
            <Save className="size-4" />
            Opslaan
          </Button>
        </div>
      </div>

      <Separator />

      {/* Section: Basisgegevens */}
      <SectionBasisgegevens
        company={company}
        onFieldChange={onFieldChange}
        onFieldBlur={onFieldBlur}
      />

      <Separator />

      {/* Section: Klantprofiel */}
      <SectionKlantprofiel
        company={company}
        onFieldChange={onFieldChange}
        onFieldBlur={onFieldBlur}
      />

      <Separator />

      {/* Section: Mailvarianten */}
      <SectionMailvarianten
        company={company}
        onFieldChange={onFieldChange}
        onFieldBlur={onFieldBlur}
      />

      <Separator />

      {/* Section: Feedback */}
      <SectionFeedback
        company={company}
        onFieldChange={onFieldChange}
        onFieldBlur={onFieldBlur}
      />
    </div>
  )
}
