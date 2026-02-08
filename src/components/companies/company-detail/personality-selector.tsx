'use client'

import { cn } from '@/lib/utils'

interface PersonalitySelectorProps {
  value: number | null
  onChange: (score: number) => void
}

export function PersonalitySelector({
  value,
  onChange,
}: PersonalitySelectorProps) {
  return (
    <div className="flex flex-row gap-2">
      {[1, 2, 3, 4, 5].map((score) => (
        <button
          key={score}
          type="button"
          onClick={() => onChange(score)}
          className={cn(
            'size-9 rounded-full border-2 text-sm font-medium transition-colors',
            value === score
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border hover:border-primary/50 text-muted-foreground'
          )}
        >
          {score}
        </button>
      ))}
    </div>
  )
}
