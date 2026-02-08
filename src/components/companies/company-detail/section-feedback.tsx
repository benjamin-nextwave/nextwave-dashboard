'use client'

import type { Company } from '@/types/database'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface SectionFeedbackProps {
  company: Company
  onFieldChange: (field: string, value: unknown) => void
  onFieldBlur: (field: string, value: unknown) => void
}

export function SectionFeedback({
  company,
  onFieldChange,
  onFieldBlur,
}: SectionFeedbackProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold">Feedback &amp; Wensen</h2>
      <div className="mt-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="feedback_mailvarianten">Feedback mailvarianten</Label>
          <Textarea
            id="feedback_mailvarianten"
            rows={4}
            value={company.feedback_mailvarianten ?? ''}
            onChange={(e) =>
              onFieldChange('feedback_mailvarianten', e.target.value || null)
            }
            onBlur={(e) =>
              onFieldBlur('feedback_mailvarianten', e.target.value || null)
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="toekomstige_wensen">Toekomstige wensen</Label>
          <Textarea
            id="toekomstige_wensen"
            rows={4}
            value={company.toekomstige_wensen ?? ''}
            onChange={(e) =>
              onFieldChange('toekomstige_wensen', e.target.value || null)
            }
            onBlur={(e) =>
              onFieldBlur('toekomstige_wensen', e.target.value || null)
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="extra_notes">Extra shit</Label>
          <Textarea
            id="extra_notes"
            rows={4}
            value={company.extra_notes ?? ''}
            onChange={(e) =>
              onFieldChange('extra_notes', e.target.value || null)
            }
            onBlur={(e) =>
              onFieldBlur('extra_notes', e.target.value || null)
            }
          />
        </div>
      </div>
    </div>
  )
}
