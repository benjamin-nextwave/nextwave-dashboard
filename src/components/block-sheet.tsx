'use client'

import { useEffect, useState, useTransition } from 'react'
import { Sheet } from './sheet'
import { createBlock, deleteBlock, setBlockDone, unplaceBlock, updateBlock } from '@/lib/actions'
import { CATEGORY_COLOR, CATEGORY_GLYPH, type Block, type Category, type CategorySlug } from '@/lib/schema'
import { durationLabel, minuteLabel } from '@/lib/time'

export type SheetTarget =
  | { mode: 'create'; startMinute: number | null; limit?: number; category?: CategorySlug }
  | { mode: 'edit'; block: Block }

type Props = {
  target: SheetTarget | null
  onClose: () => void
  day: string
  categories: Category[]
  wakeMinute: number
  sleepMinute: number
}

const STEP = 15
const DURATION_CHIPS = [30, 60, 90, 120, 180, 300]

export function BlockSheet({ target, onClose, day, categories, wakeMinute, sleepMinute }: Props) {
  const [category, setCategory] = useState<CategorySlug>('werk')
  const [start, setStart] = useState<number | null>(null)
  const [duration, setDuration] = useState(60)
  const [note, setNote] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  // Bij het openen het formulier vullen vanuit het aangetikte blok of gat.
  useEffect(() => {
    if (!target) return
    setError(null)
    if (target.mode === 'edit') {
      setCategory(target.block.category)
      setStart(target.block.start_minute)
      setDuration(target.block.duration_minutes)
      setNote(target.block.note ?? '')
      setDone(target.block.done)
    } else {
      const slug = target.category ?? 'werk'
      const preset = categories.find((c) => c.slug === slug)
      setCategory(slug)
      setStart(target.startMinute)
      setDuration(Math.min(preset?.default_block ?? 60, target.limit ?? Infinity))
      setNote('')
      setDone(false)
    }
  }, [target, categories])

  if (!target) return null

  const isEdit = target.mode === 'edit'
  const placed = start !== null
  const limit = target.mode === 'create' ? target.limit : undefined
  const maxDuration = placed ? sleepMinute - start : sleepMinute - wakeMinute
  const color = CATEGORY_COLOR[category]

  const clampDuration = (value: number) => Math.max(STEP, Math.min(value, limit ?? maxDuration))

  function run(action: () => Promise<{ ok: true } | { ok: false; error: string }>) {
    setError(null)
    startTransition(async () => {
      const result = await action()
      if (result.ok) onClose()
      else setError(result.error)
    })
  }

  const save = () =>
    run(() =>
      isEdit
        ? updateBlock(target.block.id, {
            category,
            startMinute: start,
            durationMinutes: duration,
            note,
          })
        : createBlock({ day, category, startMinute: start, durationMinutes: duration, note })
    )

  return (
    <Sheet
      open
      onClose={onClose}
      title={isEdit ? 'Blok aanpassen' : 'Blok inplannen'}
      subtitle={placed ? `${minuteLabel(start)} – ${minuteLabel(start + duration)}` : 'nog niet geplaatst'}
    >
      <div className="space-y-6">
        <section>
          <p className="label mb-2">Categorie</p>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((c) => {
              const active = c.slug === category
              return (
                <button
                  key={c.slug}
                  onClick={() => setCategory(c.slug)}
                  className="flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs font-medium transition active:scale-95"
                  style={{
                    borderColor: active ? CATEGORY_COLOR[c.slug] : 'var(--color-line)',
                    background: active ? `${CATEGORY_COLOR[c.slug]}1f` : 'var(--color-void)',
                    color: active ? CATEGORY_COLOR[c.slug] : 'var(--color-muted)',
                  }}
                >
                  <span className="text-base leading-none">{CATEGORY_GLYPH[c.slug]}</span>
                  <span className="text-center leading-tight">{c.label}</span>
                </button>
              )
            })}
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-baseline justify-between">
            <p className="label">Duur</p>
            <p className="numeric text-sm" style={{ color }}>
              {durationLabel(duration)}
            </p>
          </div>
          <Stepper
            value={duration}
            onChange={(v) => setDuration(clampDuration(v))}
            step={STEP}
            format={durationLabel}
            color={color}
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {DURATION_CHIPS.filter((c) => c <= (limit ?? maxDuration)).map((chip) => (
              <button
                key={chip}
                onClick={() => setDuration(chip)}
                className="numeric rounded-lg border border-line px-2.5 py-1 text-xs text-muted active:scale-95"
                style={duration === chip ? { borderColor: color, color } : undefined}
              >
                {durationLabel(chip)}
              </button>
            ))}
          </div>
          {limit !== undefined && (
            <p className="label mt-2 normal-case tracking-normal">
              Er past hier maximaal {durationLabel(limit)}.
            </p>
          )}
        </section>

        <section>
          <div className="mb-2 flex items-baseline justify-between">
            <p className="label">Starttijd</p>
            {placed && (
              <button onClick={() => setStart(null)} className="label normal-case tracking-normal underline">
                naar lade
              </button>
            )}
          </div>
          {placed ? (
            <Stepper
              value={start}
              onChange={(v) => setStart(Math.max(wakeMinute, Math.min(v, sleepMinute - duration)))}
              step={STEP}
              format={minuteLabel}
              color={color}
            />
          ) : (
            <button
              onClick={() => setStart(wakeMinute)}
              className="field text-left text-muted active:scale-[0.99]"
            >
              Tik om een tijd te kiezen
            </button>
          )}
        </section>

        <section>
          <p className="label mb-2">Notitie</p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Waar ga je aan werken?"
            className="field resize-none"
          />
        </section>

        {isEdit && (
          <button
            onClick={() => {
              const next = !done
              setDone(next)
              startTransition(async () => {
                await setBlockDone(target.block.id, next)
              })
            }}
            className="flex w-full items-center justify-between rounded-xl border border-line bg-void px-4 py-3 active:scale-[0.99]"
            style={done ? { borderColor: 'var(--color-good)' } : undefined}
          >
            <span className="text-sm">Gehaald</span>
            <span
              className="grid size-6 place-items-center rounded-md border text-xs"
              style={{
                borderColor: done ? 'var(--color-good)' : 'var(--color-line)',
                background: done ? 'var(--color-good)' : 'transparent',
                color: done ? 'var(--color-void)' : 'transparent',
              }}
            >
              ✓
            </span>
          </button>
        )}

        {error && (
          <p className="rounded-xl border border-bad/40 bg-bad/10 px-4 py-3 text-sm text-bad">{error}</p>
        )}

        <div className="flex gap-2">
          {isEdit && (
            <button
              onClick={() =>
                run(() =>
                  target.block.auto && target.block.start_minute !== null
                    ? unplaceBlock(target.block.id)
                    : deleteBlock(target.block.id)
                )
              }
              disabled={pending}
              className="rounded-xl border border-line px-4 py-3.5 text-sm text-muted active:scale-95 disabled:opacity-50"
            >
              {target.block.auto && target.block.start_minute !== null ? 'Losmaken' : 'Verwijderen'}
            </button>
          )}
          <button
            onClick={save}
            disabled={pending}
            className="flex-1 rounded-xl px-4 py-3.5 text-sm font-semibold text-void active:scale-[0.98] disabled:opacity-50"
            style={{ background: color, boxShadow: `0 0 24px ${color}55` }}
          >
            {pending ? 'Bezig…' : placed ? 'Opslaan' : 'Opslaan in lade'}
          </button>
        </div>
      </div>
    </Sheet>
  )
}

function Stepper({
  value,
  onChange,
  step,
  format,
  color,
}: {
  value: number
  onChange: (value: number) => void
  step: number
  format: (value: number) => string
  color: string
}) {
  return (
    <div className="flex items-stretch overflow-hidden rounded-xl border border-line bg-void">
      <StepButton label="−" onClick={() => onChange(value - step)} />
      <div className="numeric grid flex-1 place-items-center text-xl font-semibold" style={{ color }}>
        {format(value)}
      </div>
      <StepButton label="+" onClick={() => onChange(value + step)} />
    </div>
  )
}

function StepButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-16 shrink-0 py-4 text-xl text-muted transition active:scale-90 active:bg-raised"
      aria-label={label === '−' ? 'Verlagen' : 'Verhogen'}
    >
      {label}
    </button>
  )
}
