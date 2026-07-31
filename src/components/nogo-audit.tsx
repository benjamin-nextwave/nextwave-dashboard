'use client'

import { useOptimistic, useTransition } from 'react'
import { setNoGo } from '@/lib/actions'
import { NO_GOS, type DayRow, type NoGoKey } from '@/lib/schema'
import { dayLabelShort } from '@/lib/time'

type Props = {
  day: string
  row: DayRow | null
  /** Categorieën die op die dag ingepland stonden — bepaalt of 'kamer' meetelt. */
  scheduled: string[]
}

/**
 * De terugblik op de dag ervoor. Bewust achteraf: op de dag zelf kan het
 * nog misgaan, dus pas de volgende ochtend valt er iets te zeggen.
 */
export function NoGoAudit({ day, row, scheduled }: Props) {
  const [pending, startTransition] = useTransition()
  const [state, setState] = useOptimistic(
    row,
    (current: DayRow | null, patch: { key: NoGoKey; value: boolean | null }) =>
      ({ ...(current ?? emptyRow(day)), [patch.key]: patch.value }) as DayRow
  )

  const items = NO_GOS.filter(
    (item) => !('onlyWhenScheduled' in item) || scheduled.includes(item.onlyWhenScheduled)
  )

  const answered = items.filter((i) => state?.[i.key] !== null && state?.[i.key] !== undefined)
  const failed = items.filter((i) => state?.[i.key] === false)

  return (
    <section className="panel bracket mt-6 p-4" style={{ opacity: pending ? 0.85 : 1 }}>
      <div className="mb-3 flex items-baseline justify-between">
        <p className="label">No-go&apos;s · {dayLabelShort(day)}</p>
        <p className="numeric text-[0.6875rem]">
          {failed.length > 0 ? (
            <span className="text-bad">{failed.length} gefaald</span>
          ) : answered.length === items.length ? (
            <span className="text-good">schoon</span>
          ) : (
            <span className="text-dim">
              {answered.length}/{items.length}
            </span>
          )}
        </p>
      </div>

      <ul className="space-y-1.5">
        {items.map((item) => {
          const value = state?.[item.key] ?? null
          return (
            <li key={item.key} className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{item.label}</p>
                {'hint' in item && item.hint && <p className="label normal-case tracking-normal">{item.hint}</p>}
              </div>
              <div className="flex shrink-0 gap-1">
                <Choice
                  active={value === true}
                  tone="good"
                  glyph="✓"
                  label={`${item.label}: gelukt`}
                  onClick={() => toggle(item.key, value === true ? null : true)}
                />
                <Choice
                  active={value === false}
                  tone="bad"
                  glyph="✕"
                  label={`${item.label}: niet gelukt`}
                  onClick={() => toggle(item.key, value === false ? null : false)}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )

  function toggle(key: NoGoKey, value: boolean | null) {
    startTransition(async () => {
      setState({ key, value })
      await setNoGo(day, key, value)
    })
  }
}

function Choice({
  active,
  tone,
  glyph,
  label,
  onClick,
}: {
  active: boolean
  tone: 'good' | 'bad'
  glyph: string
  label: string
  onClick: () => void
}) {
  const color = tone === 'good' ? 'var(--color-good)' : 'var(--color-bad)'
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className="grid size-9 place-items-center rounded-lg border text-sm transition active:scale-90"
      style={{
        borderColor: active ? color : 'var(--color-line)',
        background: active ? color : 'transparent',
        color: active ? 'var(--color-void)' : 'var(--color-dim)',
        boxShadow: active ? `0 0 14px ${color}55` : undefined,
      }}
    >
      {glyph}
    </button>
  )
}

function emptyRow(day: string): DayRow {
  return {
    day,
    no_shorts: null,
    no_youtube: null,
    room_cleaned: null,
    no_oversleep: null,
    note: null,
  }
}
