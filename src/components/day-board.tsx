'use client'

import { useMemo, useState, useTransition } from 'react'
import { BlockSheet, type SheetTarget } from './block-sheet'
import { setBlockDone } from '@/lib/actions'
import { CATEGORY_COLOR, CATEGORY_GLYPH, type Block, type Category, type Settings } from '@/lib/schema'
import { durationLabel, minuteLabel } from '@/lib/time'
import { useClock } from '@/lib/use-clock'

type Props = {
  day: string
  blocks: Block[]
  categories: Category[]
  settings: Settings
  isToday: boolean
}

type Segment =
  | { kind: 'block'; block: Block; start: number; end: number }
  | { kind: 'gap'; start: number; end: number }

/** Blokhoogte groeit met de duur, maar afgevlakt zodat de dag op het scherm past. */
function blockHeight(minutes: number): number {
  return Math.round(Math.min(150, 46 + minutes * 0.3))
}

const GAP_HEIGHT = 58

export function DayBoard({ day, blocks, categories, settings, isToday }: Props) {
  const [target, setTarget] = useState<SheetTarget | null>(null)
  const nowMinute = useClock()

  const unplaced = useMemo(() => blocks.filter((b) => b.start_minute === null), [blocks])

  const segments = useMemo(() => {
    const placed = blocks
      .filter((b): b is Block & { start_minute: number } => b.start_minute !== null)
      .sort((a, b) => a.start_minute - b.start_minute)

    const result: Segment[] = []
    let cursor = settings.wake_minute
    for (const block of placed) {
      if (block.start_minute > cursor) {
        result.push({ kind: 'gap', start: cursor, end: block.start_minute })
      }
      const end = block.start_minute + block.duration_minutes
      result.push({ kind: 'block', block, start: block.start_minute, end })
      cursor = Math.max(cursor, end)
    }
    if (cursor < settings.sleep_minute) {
      result.push({ kind: 'gap', start: cursor, end: settings.sleep_minute })
    }
    return result
  }, [blocks, settings.wake_minute, settings.sleep_minute])

  const showNow =
    isToday && nowMinute !== null && nowMinute >= settings.wake_minute && nowMinute <= settings.sleep_minute

  return (
    <>
      {unplaced.length > 0 && (
        <section className="mb-5">
          <p className="label mb-2">Nog in te plannen</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {unplaced.map((block) => (
              <TrayCard key={block.id} block={block} onTap={() => setTarget({ mode: 'edit', block })} />
            ))}
          </div>
        </section>
      )}

      <section className="relative">
        <Marker minute={settings.wake_minute} label="opstaan" />

        <div className="relative">
          {segments.map((segment, index) =>
            segment.kind === 'block' ? (
              <BlockRow
                key={segment.block.id}
                segment={segment}
                nowMinute={showNow ? nowMinute : null}
                onTap={() => setTarget({ mode: 'edit', block: segment.block })}
              />
            ) : (
              <GapRow
                key={`gap-${index}-${segment.start}`}
                segment={segment}
                nowMinute={showNow ? nowMinute : null}
                onTap={() =>
                  setTarget({
                    mode: 'create',
                    startMinute: segment.start,
                    limit: segment.end - segment.start,
                  })
                }
              />
            )
          )}
        </div>

        <Marker minute={settings.sleep_minute} label="slapen" />
      </section>

      <BlockSheet
        target={target}
        onClose={() => setTarget(null)}
        day={day}
        categories={categories}
        wakeMinute={settings.wake_minute}
        sleepMinute={settings.sleep_minute}
      />

      {/* Blijft binnen de breedte van de app, ook op een breed scherm. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 mx-auto max-w-lg">
        <button
          onClick={() => setTarget({ mode: 'create', startMinute: null })}
          className="pointer-events-auto absolute right-4 grid size-14 place-items-center rounded-full bg-accent text-2xl font-light text-void shadow-[0_0_30px_rgba(34,211,238,0.45)] active:scale-90"
          style={{ bottom: 'calc(env(safe-area-inset-bottom) + 5.5rem)' }}
          aria-label="Blok toevoegen"
        >
          +
        </button>
      </div>
    </>
  )
}

function TrayCard({ block, onTap }: { block: Block; onTap: () => void }) {
  const color = CATEGORY_COLOR[block.category]
  return (
    <button
      onClick={onTap}
      className="flex shrink-0 items-center gap-2.5 rounded-xl border border-dashed px-3.5 py-2.5 active:scale-95"
      style={{ borderColor: `${color}66`, background: `${color}12` }}
    >
      <span className="text-sm" style={{ color }}>
        {CATEGORY_GLYPH[block.category]}
      </span>
      <span className="numeric text-sm font-semibold" style={{ color }}>
        {durationLabel(block.duration_minutes)}
      </span>
      <span className="label normal-case tracking-normal">plaatsen</span>
    </button>
  )
}

function BlockRow({
  segment,
  nowMinute,
  onTap,
}: {
  segment: Extract<Segment, { kind: 'block' }>
  nowMinute: number | null
  onTap: () => void
}) {
  const [pending, startTransition] = useTransition()
  const { block, start, end } = segment
  const color = CATEGORY_COLOR[block.category]
  const active = nowMinute !== null && nowMinute >= start && nowMinute < end

  return (
    <div className="relative flex" style={{ height: blockHeight(block.duration_minutes) }}>
      <TimeRail start={start} end={end} />
      <button
        onClick={onTap}
        className="relative mb-1.5 flex min-w-0 flex-1 items-stretch overflow-hidden rounded-xl border text-left transition active:scale-[0.99]"
        style={{
          borderColor: `${color}55`,
          background: `linear-gradient(100deg, ${color}22, ${color}0a)`,
          boxShadow: active ? `0 0 0 1px ${color}, 0 0 26px ${color}40` : undefined,
          opacity: block.done ? 0.62 : 1,
        }}
      >
        <span className="w-1 shrink-0" style={{ background: color, boxShadow: `0 0 12px ${color}` }} />
        <span className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 px-3 py-2">
          <span className="flex items-baseline gap-2">
            <span
              className="truncate text-sm font-semibold tracking-wide uppercase"
              style={{ color, textDecoration: block.done ? 'line-through' : undefined }}
            >
              {CATEGORY_GLYPH[block.category]} {block.category}
            </span>
            <span className="numeric shrink-0 text-xs text-muted">
              {durationLabel(block.duration_minutes)}
            </span>
          </span>
          {block.note && <span className="line-clamp-2 text-xs text-muted">{block.note}</span>}
          {active && <span className="label animate-pulse-line normal-case" style={{ color }}>nu bezig</span>}
        </span>
        <span
          role="button"
          tabIndex={0}
          aria-label={block.done ? 'Markeren als niet gehaald' : 'Markeren als gehaald'}
          onClick={(e) => {
            e.stopPropagation()
            startTransition(async () => {
              await setBlockDone(block.id, !block.done)
            })
          }}
          onKeyDown={(e) => {
            if (e.key !== 'Enter' && e.key !== ' ') return
            e.preventDefault()
            e.stopPropagation()
            startTransition(async () => {
              await setBlockDone(block.id, !block.done)
            })
          }}
          className="grid w-12 shrink-0 place-items-center border-l active:scale-90"
          style={{ borderColor: `${color}33`, opacity: pending ? 0.4 : 1 }}
        >
          <span
            className="grid size-6 place-items-center rounded-md border text-xs"
            style={{
              borderColor: block.done ? color : 'var(--color-line)',
              background: block.done ? color : 'transparent',
              color: block.done ? 'var(--color-void)' : 'transparent',
            }}
          >
            ✓
          </span>
        </span>
        <NowLine segment={segment} nowMinute={nowMinute} />
      </button>
    </div>
  )
}

function GapRow({
  segment,
  nowMinute,
  onTap,
}: {
  segment: Extract<Segment, { kind: 'gap' }>
  nowMinute: number | null
  onTap: () => void
}) {
  const free = segment.end - segment.start
  return (
    <div className="relative flex" style={{ height: GAP_HEIGHT }}>
      <TimeRail start={segment.start} />
      <button
        onClick={onTap}
        className="relative mb-1.5 flex flex-1 items-center gap-2 rounded-xl border border-dashed border-line px-3 text-left text-dim transition active:scale-[0.99] active:border-accent/60"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, rgba(30,40,66,0.35) 0 6px, transparent 6px 12px)',
        }}
      >
        <span className="grid size-6 place-items-center rounded-md border border-line text-sm">+</span>
        <span className="numeric text-xs">{durationLabel(free)} vrij</span>
        <NowLine segment={segment} nowMinute={nowMinute} />
      </button>
    </div>
  )
}

/** Tijdkolom links van de tijdlijn. */
function TimeRail({ start, end }: { start: number; end?: number }) {
  return (
    <div className="relative w-14 shrink-0 pr-2 pt-0.5 text-right">
      <span className="numeric text-xs text-muted">{minuteLabel(start)}</span>
      {end !== undefined && (
        <span className="numeric absolute right-2 bottom-2 text-[0.625rem] text-dim">
          {minuteLabel(end)}
        </span>
      )}
    </div>
  )
}

/** Dunne lijn die aangeeft hoe ver de dag is, evenredig binnen dit segment. */
function NowLine({ segment, nowMinute }: { segment: Segment; nowMinute: number | null }) {
  if (nowMinute === null || nowMinute < segment.start || nowMinute >= segment.end) return null
  const fraction = (nowMinute - segment.start) / (segment.end - segment.start)
  return (
    <span
      className="pointer-events-none absolute inset-x-0 z-10 flex items-center"
      style={{ top: `${fraction * 100}%` }}
    >
      <span className="h-px flex-1 bg-accent shadow-[0_0_8px_var(--color-accent)]" />
      <span className="numeric mr-1 rounded bg-accent px-1 text-[0.5625rem] font-bold text-void">
        {minuteLabel(nowMinute)}
      </span>
    </span>
  )
}

function Marker({ minute, label }: { minute: number; label: string }) {
  return (
    <div className="flex items-center gap-2 py-1.5">
      <span className="numeric w-12 shrink-0 text-right text-xs text-dim">{minuteLabel(minute)}</span>
      <span className="h-px flex-1 bg-line" />
      <span className="label">{label}</span>
    </div>
  )
}
