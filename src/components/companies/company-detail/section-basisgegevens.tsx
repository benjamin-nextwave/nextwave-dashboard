'use client'

import type { Company } from '@/types/database'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface SectionBasisgegevensProps {
  company: Company
  onFieldChange: (field: string, value: unknown) => void
  onFieldBlur: (field: string, value: unknown) => void
}

export function SectionBasisgegevens({
  company,
  onFieldChange,
  onFieldBlur,
}: SectionBasisgegevensProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold">Basisgegevens</h2>
      <div className="mt-4 space-y-4">
        {/* Name spans full width */}
        <div className="space-y-2">
          <Label htmlFor="name">Bedrijfsnaam</Label>
          <Input
            id="name"
            type="text"
            value={company.name}
            onChange={(e) => onFieldChange('name', e.target.value)}
            onBlur={(e) => onFieldBlur('name', e.target.value)}
          />
        </div>

        {/* 2-column grid for remaining fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="warmup_start_date">Warmup startdatum</Label>
            <Input
              id="warmup_start_date"
              type="date"
              value={company.warmup_start_date ?? ''}
              onChange={(e) =>
                onFieldChange('warmup_start_date', e.target.value || null)
              }
              onBlur={(e) =>
                onFieldBlur('warmup_start_date', e.target.value || null)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="go_live_date">Go-live datum</Label>
            <Input
              id="go_live_date"
              type="date"
              value={company.go_live_date ?? ''}
              onChange={(e) =>
                onFieldChange('go_live_date', e.target.value || null)
              }
              onBlur={(e) =>
                onFieldBlur('go_live_date', e.target.value || null)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail klant</Label>
            <Input
              id="email"
              type="email"
              value={company.email ?? ''}
              onChange={(e) =>
                onFieldChange('email', e.target.value || null)
              }
              onBlur={(e) => onFieldBlur('email', e.target.value || null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefoon klant</Label>
            <Input
              id="phone"
              type="tel"
              value={company.phone ?? ''}
              onChange={(e) =>
                onFieldChange('phone', e.target.value || null)
              }
              onBlur={(e) => onFieldBlur('phone', e.target.value || null)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
