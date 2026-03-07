'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Company } from '@/types/database'
import { CompanyLivegangList } from './company-livegang-list'
import { PlanningCalendar } from './planning-calendar'
import { getCampaignUpdateDates } from './campaign-dates'

export function PlanningPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const fetchCompanies = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setCompanies((data ?? []) as Company[])
    } catch (error) {
      console.error('Failed to fetch companies:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  const handleDateUpdate = useCallback(
    async (companyId: string, date: string | null) => {
      try {
        const { error } = await supabase
          .from('companies')
          .update({ campagne_livegang: date })
          .eq('id', companyId)

        if (error) throw error

        setCompanies((prev) =>
          prev.map((c) =>
            c.id === companyId ? { ...c, campagne_livegang: date } : c
          )
        )
      } catch (error) {
        console.error('Failed to update campagne_livegang:', error)
      }
    },
    []
  )

  // Sort: companies with future dates first (soonest first), then without dates
  const sortedCompanies = [...companies].sort((a, b) => {
    const dateA = a.campagne_livegang
    const dateB = b.campagne_livegang

    if (!dateA && !dateB) return a.name.localeCompare(b.name)
    if (!dateA) return 1
    if (!dateB) return -1
    return dateA.localeCompare(dateB)
  })

  const companiesForDate = selectedDate
    ? companies.filter((c) => {
        if (!c.campagne_livegang) return false
        const dates = getCampaignUpdateDates(c.campagne_livegang)
        return dates.includes(selectedDate)
      })
    : []

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground text-lg">
        Laden...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Planning</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CompanyLivegangList
          companies={sortedCompanies}
          onDateUpdate={handleDateUpdate}
        />
        <PlanningCalendar
          companies={companies}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          companiesForDate={companiesForDate}
        />
      </div>
    </div>
  )
}
