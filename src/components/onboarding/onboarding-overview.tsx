'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Company } from '@/types/database'
import { fetchCompaniesForOnboarding } from '@/lib/onboarding'
import { OnboardingDetail } from './onboarding-detail'

export function OnboardingOverview() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [hideCompleted, setHideCompleted] = useState(false)

  const loadCompanies = useCallback(async () => {
    try {
      const data = await fetchCompaniesForOnboarding()
      setCompanies(data)
    } catch (err) {
      console.error('Failed to load companies:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCompanies()
  }, [loadCompanies])

  const handleBack = useCallback(() => {
    setSelectedCompany(null)
    loadCompanies()
  }, [loadCompanies])

  if (selectedCompany) {
    return (
      <OnboardingDetail
        company={selectedCompany}
        onBack={handleBack}
      />
    )
  }

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )
  const activeCompanies = filtered.filter((c) => !c.onboarding_completed)
  const completedCompanies = filtered.filter((c) => c.onboarding_completed)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Onboarding</h1>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Zoek bedrijf..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl border bg-background px-5 py-3 text-lg"
        />
        {completedCompanies.length > 0 && (
          <button
            onClick={() => setHideCompleted(!hideCompleted)}
            className="rounded-xl border px-5 py-3 text-lg transition-colors hover:bg-muted"
          >
            {hideCompleted ? 'Toon afgeronde' : 'Verberg afgeronde'}
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-muted-foreground text-lg">Laden...</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {activeCompanies.map((company) => (
            <button
              key={company.id}
              onClick={() => setSelectedCompany(company)}
              className="w-full text-left rounded-xl border-2 border-red-300 bg-red-50 p-6 transition-all hover:shadow-lg hover:border-red-400 dark:bg-red-950/30 dark:border-red-800 dark:hover:border-red-600"
            >
              <span className="text-2xl font-semibold">{company.name}</span>
              <span className="ml-4 inline-block rounded-full bg-red-200 px-3 py-1 text-sm font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                Bezig
              </span>
            </button>
          ))}

          {!hideCompleted && completedCompanies.map((company) => (
            <button
              key={company.id}
              onClick={() => setSelectedCompany(company)}
              className="w-full text-left rounded-xl border-2 border-green-300 bg-green-50 p-6 transition-all hover:shadow-lg hover:border-green-400 dark:bg-green-950/30 dark:border-green-800 dark:hover:border-green-600"
            >
              <span className="text-2xl font-semibold">{company.name}</span>
              <span className="ml-4 inline-block rounded-full bg-green-200 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                Afgerond
              </span>
            </button>
          ))}

          {companies.length === 0 && (
            <p className="text-muted-foreground text-lg col-span-3">Geen bedrijven gevonden.</p>
          )}
        </div>
      )}
    </div>
  )
}
