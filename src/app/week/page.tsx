import Link from 'next/link'
import { GoalMeter } from '@/components/goal-meter'
import { Nav } from '@/components/nav'
import { getBlocks, getCategories, getDays, totalsByCategory } from '@/lib/data'
import { CATEGORY_COLOR, NO_GOS, type DayRow } from '@/lib/schema'
import {
  dayLabelShort,
  hours,
  isValidKey,
  logicalToday,
  shiftDay,
  weekDays,
  weekNumber,
  weekStart,
  weekdayLetter,
} from '@/lib/time'

export const dynamic = 'force-dynamic'

export default async function WeekPage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>
}) {
  const { d } = await searchParams
  const anchor = d && isValidKey(d) ? d : logicalToday()
  const start = weekStart(anchor)
  const days = weekDays(anchor)

  const [categories, blocks, dayRows] = await Promise.all([
    getCategories(),
    getBlocks(days),
    getDays(days),
  ])

  const totals = totalsByCategory(blocks)
  const rowByDay = new Map(dayRows.map((row) => [row.day, row]))
  const today = logicalToday()

  const goalMinutes = categories.reduce((sum, c) => sum + c.weekly_minutes, 0)
  const doneMinutes = Object.values(totals).reduce((sum, t) => sum + t.done, 0)
  const plannedMinutes = Object.values(totals).reduce((sum, t) => sum + t.planned, 0)
  const maxDayMinutes = Math.max(
    ...days.map((day) =>
      blocks.filter((b) => b.day === day).reduce((sum, b) => sum + b.duration_minutes, 0)
    ),
    60
  )

  return (
    <main className="px-4 pb-32">
      <header
        className="sticky top-0 z-30 -mx-4 mb-5 border-b border-line-soft bg-bg/85 px-4 pb-3 backdrop-blur-xl"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        <div className="flex items-center gap-2">
          <WeekArrow to={shiftDay(start, -7)} label="Vorige week" glyph="‹" />
          <div className="min-w-0 flex-1 text-center">
            <p className="label">
              {dayLabelShort(start)} – {dayLabelShort(shiftDay(start, 6))}
            </p>
            <h1 className="text-lg font-semibold">Week {weekNumber(anchor)}</h1>
          </div>
          <WeekArrow to={shiftDay(start, 7)} label="Volgende week" glyph="›" />
        </div>
      </header>

      <section className="panel bracket p-4">
        <div className="mb-1 flex items-end justify-between">
          <div>
            <p className="label">Gehaald</p>
            <p className="numeric text-3xl font-semibold text-accent">{hours(doneMinutes)}u</p>
          </div>
          <p className="numeric text-right text-xs text-dim">
            {hours(plannedMinutes)}u ingepland
            <br />
            doel {hours(goalMinutes)}u
          </p>
        </div>
        <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-line-soft">
          <span
            className="h-full rounded-full bg-gradient-to-r from-accent to-[#a78bfa]"
            style={{ width: `${Math.min(100, (doneMinutes / goalMinutes) * 100)}%` }}
          />
          <span
            className="h-full bg-accent/25"
            style={{
              width: `${Math.max(0, Math.min(100 - (doneMinutes / goalMinutes) * 100, (plannedMinutes / goalMinutes) * 100))}%`,
            }}
          />
        </div>
      </section>

      <section className="panel mt-4 p-4">
        <p className="label mb-3">Per onderwerp</p>
        <div className="space-y-3.5">
          {categories.map((category) => {
            const total = totals[category.slug] ?? { done: 0, planned: 0, count: 0 }
            return (
              <GoalMeter
                key={category.slug}
                category={category}
                doneMinutes={total.done}
                plannedMinutes={total.planned}
                doneCount={total.count}
              />
            )
          })}
        </div>
      </section>

      <section className="panel mt-4 p-4">
        <p className="label mb-3">Verdeling over de week</p>
        <div className="flex items-end gap-1.5">
          {days.map((day) => {
            const dayBlocks = blocks.filter((b) => b.day === day)
            const total = dayBlocks.reduce((sum, b) => sum + b.duration_minutes, 0)
            return (
              <Link
                key={day}
                href={`/dag/${day}`}
                className="flex min-w-0 flex-1 flex-col items-center gap-1.5 active:scale-95"
              >
                <span className="numeric text-[0.625rem] text-dim">{total > 0 ? hours(total) : ''}</span>
                <span
                  className="flex w-full flex-col-reverse overflow-hidden rounded-md bg-line-soft"
                  style={{ height: `${Math.max(8, (total / maxDayMinutes) * 120)}px` }}
                >
                  {dayBlocks.map((block) => (
                    <span
                      key={block.id}
                      style={{
                        height: `${(block.duration_minutes / Math.max(total, 1)) * 100}%`,
                        background: CATEGORY_COLOR[block.category],
                        opacity: block.done ? 1 : 0.4,
                      }}
                    />
                  ))}
                </span>
                <span
                  className="label"
                  style={{ color: day === today ? 'var(--color-accent)' : undefined }}
                >
                  {weekdayLetter(day)}
                </span>
                <NoGoDots row={rowByDay.get(day) ?? null} />
              </Link>
            )
          })}
        </div>
        <p className="label mt-3 normal-case tracking-normal">
          Volle kleur is gehaald, doorschijnend is nog ingepland.
        </p>
      </section>

      <Nav />
    </main>
  )
}

function NoGoDots({ row }: { row: DayRow | null }) {
  if (!row) return <span className="h-1.5" />
  const failed = NO_GOS.filter((item) => row[item.key] === false).length
  if (failed === 0) return <span className="size-1.5 rounded-full bg-good/60" />
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: failed }, (_, i) => (
        <span key={i} className="size-1.5 rounded-full bg-bad" />
      ))}
    </span>
  )
}

function WeekArrow({ to, label, glyph }: { to: string; label: string; glyph: string }) {
  return (
    <Link
      href={`/week?d=${to}`}
      aria-label={label}
      className="grid size-10 shrink-0 place-items-center rounded-full border border-line text-lg text-muted active:scale-90"
    >
      {glyph}
    </Link>
  )
}
