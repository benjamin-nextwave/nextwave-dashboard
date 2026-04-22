'use client'

import type { Company } from '@/types/database'

interface Props {
  company: Company
  onFieldChange: (field: string, value: unknown) => void
  onFieldBlur: (field: string, value: unknown) => void
}

export function SectionBaselineStatus({ company, onFieldChange, onFieldBlur }: Props) {
  const value = company.daily_baseline

  const setBaseline = (next: 'daily' | 'friday') => {
    onFieldChange('daily_baseline', next)
    onFieldBlur('daily_baseline', next)
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-semibold">Baseline-status</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {value === 'daily'
              ? 'Komt elke dag automatisch terug in Vandaag checken.'
              : 'Verschijnt alleen op Vandaag checken bij een open taak of actieve notitie.'}
          </p>
        </div>
        <div className="flex rounded-md border border-border p-0.5 text-sm">
          <button
            type="button"
            onClick={() => setBaseline('daily')}
            className={
              value === 'daily'
                ? 'px-3 py-1.5 rounded bg-primary text-primary-foreground font-medium'
                : 'px-3 py-1.5 rounded text-muted-foreground hover:text-foreground'
            }
          >
            Dagelijks checken
          </button>
          <button
            type="button"
            onClick={() => setBaseline('friday')}
            className={
              value === 'friday'
                ? 'px-3 py-1.5 rounded bg-primary text-primary-foreground font-medium'
                : 'px-3 py-1.5 rounded text-muted-foreground hover:text-foreground'
            }
          >
            Laten lopen tot vrijdag
          </button>
        </div>
      </div>
    </div>
  )
}
