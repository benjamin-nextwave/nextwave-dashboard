'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Company } from '@/types/database'
import { getCompaniesWithOpenTaskCounts } from '@/lib/companies'
import { CompanyCard } from '@/components/companies/company-card'
import { CreateCompanyDialog } from '@/components/companies/create-company-dialog'

type CompanyWithCount = Company & { open_task_count: number }

export function CompanyGrid() {
  const [companies, setCompanies] = useState<CompanyWithCount[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCompanies = useCallback(async () => {
    try {
      const data = await getCompaniesWithOpenTaskCounts()
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

  const refreshCompanies = useCallback(() => {
    fetchCompanies()
  }, [fetchCompanies])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bedrijven</h1>
        <CreateCompanyDialog onCreated={refreshCompanies} />
      </div>

      {loading ? (
        <p className="text-muted-foreground">Laden...</p>
      ) : companies.length === 0 ? (
        <p className="text-muted-foreground">Nog geen bedrijven</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((company) => (
            <CompanyCard
              key={company.id}
              id={company.id}
              name={company.name}
              goLiveDate={company.go_live_date}
              openTaskCount={company.open_task_count}
              onDeleted={refreshCompanies}
            />
          ))}
        </div>
      )}
    </div>
  )
}
