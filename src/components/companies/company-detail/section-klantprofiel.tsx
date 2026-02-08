'use client'

import type { Company } from '@/types/database'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PersonalitySelector } from './personality-selector'

interface SectionKlantprofielProps {
  company: Company
  onFieldChange: (field: string, value: unknown) => void
  onFieldBlur: (field: string, value: unknown) => void
}

export function SectionKlantprofiel({
  company,
  onFieldChange,
  onFieldBlur,
}: SectionKlantprofielProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold">Klantprofiel</h2>
      <div className="mt-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="client_notes">Klantnotities</Label>
          <Textarea
            id="client_notes"
            rows={4}
            value={company.client_notes ?? ''}
            onChange={(e) =>
              onFieldChange('client_notes', e.target.value || null)
            }
            onBlur={(e) =>
              onFieldBlur('client_notes', e.target.value || null)
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Persoonlijkheid (1-5)</Label>
          <PersonalitySelector
            value={company.personality_score}
            onChange={(score) => {
              onFieldChange('personality_score', score)
              onFieldBlur('personality_score', score)
            }}
          />
        </div>
      </div>
    </div>
  )
}
