'use client'

import type { Company } from '@/types/database'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface SectionMailvariantenProps {
  company: Company
  onFieldChange: (field: string, value: unknown) => void
  onFieldBlur: (field: string, value: unknown) => void
}

export function SectionMailvarianten({
  company,
  onFieldChange,
  onFieldBlur,
}: SectionMailvariantenProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold">Mailvarianten</h2>
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="mail_variant_1">Variant 1</Label>
          <Textarea
            id="mail_variant_1"
            rows={8}
            value={company.mail_variant_1 ?? ''}
            onChange={(e) =>
              onFieldChange('mail_variant_1', e.target.value || null)
            }
            onBlur={(e) =>
              onFieldBlur('mail_variant_1', e.target.value || null)
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mail_variant_2">Variant 2</Label>
          <Textarea
            id="mail_variant_2"
            rows={8}
            value={company.mail_variant_2 ?? ''}
            onChange={(e) =>
              onFieldChange('mail_variant_2', e.target.value || null)
            }
            onBlur={(e) =>
              onFieldBlur('mail_variant_2', e.target.value || null)
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mail_variant_3">Variant 3</Label>
          <Textarea
            id="mail_variant_3"
            rows={8}
            value={company.mail_variant_3 ?? ''}
            onChange={(e) =>
              onFieldChange('mail_variant_3', e.target.value || null)
            }
            onBlur={(e) =>
              onFieldBlur('mail_variant_3', e.target.value || null)
            }
          />
        </div>
      </div>
    </div>
  )
}
