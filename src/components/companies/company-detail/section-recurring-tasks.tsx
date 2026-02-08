'use client'

import type { Company } from '@/types/database'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface SectionRecurringTasksProps {
  company: Company
  onFieldChange: (field: string, value: unknown) => void
  onFieldBlur: (field: string, value: unknown) => void
}

export function SectionRecurringTasks({
  company,
  onFieldChange,
  onFieldBlur,
}: SectionRecurringTasksProps) {
  const handleChange = (field: string, rawValue: string) => {
    const num = rawValue === '' ? null : Math.min(31, Math.max(1, parseInt(rawValue, 10)))
    if (rawValue !== '' && isNaN(num as number)) return
    onFieldChange(field, num)
  }

  const handleBlur = (field: string, rawValue: string) => {
    const num = rawValue === '' ? null : Math.min(31, Math.max(1, parseInt(rawValue, 10)))
    if (rawValue !== '' && isNaN(num as number)) return
    onFieldBlur(field, num)
  }

  return (
    <div>
      <h2 className="text-lg font-semibold">Terugkerende taken</h2>
      <p className="text-sm text-muted-foreground mt-1">
        Dag van de maand (1-31) waarop taken worden ingepland
      </p>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rapport_date">Rapport dag</Label>
          <Input
            id="rapport_date"
            type="number"
            min={1}
            max={31}
            placeholder="bijv. 15"
            value={company.rapport_date ?? ''}
            onChange={(e) => handleChange('rapport_date', e.target.value)}
            onBlur={(e) => handleBlur('rapport_date', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="scrape_date_1">Scrape dag 1</Label>
          <Input
            id="scrape_date_1"
            type="number"
            min={1}
            max={31}
            placeholder="bijv. 5"
            value={company.scrape_date_1 ?? ''}
            onChange={(e) => handleChange('scrape_date_1', e.target.value)}
            onBlur={(e) => handleBlur('scrape_date_1', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="scrape_date_2">Scrape dag 2 (optioneel)</Label>
          <Input
            id="scrape_date_2"
            type="number"
            min={1}
            max={31}
            placeholder="bijv. 15"
            value={company.scrape_date_2 ?? ''}
            onChange={(e) => handleChange('scrape_date_2', e.target.value)}
            onBlur={(e) => handleBlur('scrape_date_2', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="scrape_date_3">Scrape dag 3 (optioneel)</Label>
          <Input
            id="scrape_date_3"
            type="number"
            min={1}
            max={31}
            placeholder="bijv. 25"
            value={company.scrape_date_3 ?? ''}
            onChange={(e) => handleChange('scrape_date_3', e.target.value)}
            onBlur={(e) => handleBlur('scrape_date_3', e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
