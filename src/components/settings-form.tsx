'use client'

import { useState, useTransition } from 'react'
import { updateGoal, updateSettings } from '@/lib/actions'
import { CATEGORY_COLOR, CATEGORY_GLYPH, type Category, type Settings } from '@/lib/schema'
import { durationLabel, hours, minuteLabel } from '@/lib/time'

export function SettingsForm({
  settings,
  categories,
}: {
  settings: Settings
  categories: Category[]
}) {
  return (
    <div className="space-y-4">
      <RhythmPanel settings={settings} />
      {categories.map((category) => (
        <GoalPanel key={category.slug} category={category} />
      ))}
    </div>
  )
}

function RhythmPanel({ settings }: { settings: Settings }) {
  const [wake, setWake] = useState(settings.wake_minute)
  const [sleep, setSleep] = useState(settings.sleep_minute)
  const [work, setWork] = useState(settings.daily_work_minutes)
  const [status, setStatus] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const dirty =
    wake !== settings.wake_minute ||
    sleep !== settings.sleep_minute ||
    work !== settings.daily_work_minutes

  return (
    <section className="panel bracket p-4">
      <p className="label mb-3">Dagritme</p>
      <div className="space-y-3">
        <Row label="Opstaan" value={minuteLabel(wake)} onStep={(d) => setWake(clamp(wake + d, 0, 1200))} />
        <Row
          label="Naar bed"
          value={minuteLabel(sleep)}
          hint="richtlijn, geen harde eis"
          onStep={(d) => setSleep(clamp(sleep + d, 720, 1800))}
        />
        <Row
          label="Werk per dag"
          value={durationLabel(work)}
          hint="komt elke dag klaar te staan in de lade"
          onStep={(d) => setWork(clamp(work + d, 0, 960))}
        />
      </div>
      <p className="label mt-3 normal-case tracking-normal">
        Wakker: <span className="numeric text-muted">{hours(sleep - wake)}</span> uur per dag ·{' '}
        <span className="numeric text-muted">{hours((sleep - wake) * 7)}</span> uur per week
      </p>

      {status && <p className="mt-3 text-sm text-bad">{status}</p>}

      <button
        disabled={!dirty || pending}
        onClick={() =>
          startTransition(async () => {
            const result = await updateSettings({
              wakeMinute: wake,
              sleepMinute: sleep,
              dailyWorkMinutes: work,
            })
            setStatus(result.ok ? null : result.error)
          })
        }
        className="mt-4 w-full rounded-xl bg-accent py-3 text-sm font-semibold text-void active:scale-[0.98] disabled:opacity-30"
      >
        {pending ? 'Bezig…' : 'Opslaan'}
      </button>
    </section>
  )
}

function GoalPanel({ category }: { category: Category }) {
  const countBased = category.weekly_count !== null
  const [minutes, setMinutes] = useState(category.weekly_minutes)
  const [count, setCount] = useState(category.weekly_count ?? 0)
  const [pending, startTransition] = useTransition()
  const color = CATEGORY_COLOR[category.slug]

  const dirty = minutes !== category.weekly_minutes || count !== (category.weekly_count ?? 0)

  return (
    <section className="panel p-4">
      <div className="mb-3 flex items-center gap-2">
        <span style={{ color }}>{CATEGORY_GLYPH[category.slug]}</span>
        <p className="text-sm font-semibold">{category.label}</p>
        <span className="numeric ml-auto text-xs" style={{ color }}>
          {countBased ? `${count}× · ${hours(minutes)}u` : `${hours(minutes)}u`}
        </span>
      </div>

      <div className="space-y-3">
        <Row
          label="Uren per week"
          value={`${hours(minutes)}u`}
          onStep={(d) => setMinutes(clamp(minutes + d * 2, 0, 6000))}
        />
        {countBased && (
          <Row
            label="Keer per week"
            value={`${count}×`}
            onStep={(d) => setCount(clamp(count + (d > 0 ? 1 : -1), 0, 30))}
          />
        )}
      </div>

      <button
        disabled={!dirty || pending}
        onClick={() =>
          startTransition(async () => {
            await updateGoal(category.slug, minutes, countBased ? count : null)
          })
        }
        className="mt-3 w-full rounded-xl border py-2.5 text-sm font-medium active:scale-[0.98] disabled:opacity-30"
        style={{ borderColor: `${color}66`, color }}
      >
        {pending ? 'Bezig…' : 'Doel opslaan'}
      </button>
    </section>
  )
}

function Row({
  label,
  value,
  hint,
  onStep,
}: {
  label: string
  value: string
  hint?: string
  onStep: (delta: number) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm">{label}</p>
        {hint && <p className="label normal-case tracking-normal">{hint}</p>}
      </div>
      <div className="flex items-center gap-1">
        <StepButton label="−" onClick={() => onStep(-15)} />
        <span className="numeric w-16 text-center text-sm font-semibold">{value}</span>
        <StepButton label="+" onClick={() => onStep(15)} />
      </div>
    </div>
  )
}

function StepButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={label === '−' ? 'Verlagen' : 'Verhogen'}
      className="grid size-9 shrink-0 place-items-center rounded-lg border border-line text-muted active:scale-90"
    >
      {label}
    </button>
  )
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}
