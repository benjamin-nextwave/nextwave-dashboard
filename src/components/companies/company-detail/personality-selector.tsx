'use client'

import { cn } from '@/lib/utils'

const SCORE_EMOJIS: Record<number, string> = {
  1: '\u{1F621}',
  2: '\u{1F615}',
  3: '\u{1F610}',
  4: '\u{1F642}',
  5: '\u{1F60A}',
}

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
            'size-9 rounded-full border-2 text-lg transition-colors',
            value === score
              ? 'bg-primary/10 border-primary'
              : 'border-border hover:border-primary/50'
          )}
        >
          {SCORE_EMOJIS[score]}
        </button>
      ))}
    </div>
  )
}
