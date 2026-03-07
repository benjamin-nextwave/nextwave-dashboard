'use client'

import type { Company } from '@/types/database'

interface CompanyLivegangListProps {
  companies: Company[]
  onDateUpdate: (companyId: string, date: string | null) => void
}

export function CompanyLivegangList({
  companies,
  onDateUpdate,
}: CompanyLivegangListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Bedrijven</h2>
      <div className="space-y-3">
        {companies.map((company) => (
          <div
            key={company.id}
            className="rounded-xl border border-border bg-card p-5 space-y-3"
          >
            <div className="text-lg font-semibold">{company.name}</div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-muted-foreground whitespace-nowrap">
                Campagne livegang:
              </label>
              <input
                type="date"
                value={company.campagne_livegang ?? ''}
                onChange={(e) =>
                  onDateUpdate(
                    company.id,
                    e.target.value || null
                  )
                }
                className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
              {company.campagne_livegang && (
                <span className="text-sm font-medium text-foreground">
                  {new Date(
                    company.campagne_livegang + 'T00:00:00'
                  ).toLocaleDateString('nl-NL', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              )}
            </div>
          </div>
        ))}
        {companies.length === 0 && (
          <p className="text-muted-foreground py-8 text-center text-lg">
            Geen bedrijven gevonden
          </p>
        )}
      </div>
    </div>
  )
}
