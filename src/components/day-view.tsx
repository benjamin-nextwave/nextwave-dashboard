import Link from 'next/link'
import { DayBoard } from './day-board'
import { DayHeader } from './day-header'
import { DayNote } from './day-note'
import { GoalMeter } from './goal-meter'
import { Nav } from './nav'
import { NoGoAudit } from './nogo-audit'
import { ensureDay, getBlocks, getCategories, getDays, getSettings, getWeek } from '@/lib/data'
import { hours, logicalToday, shiftDay, weekNumber } from '@/lib/time'

export async function DayView({ day }: { day: string }) {
  const previous = shiftDay(day, -1)

  const [settings, categories] = await Promise.all([getSettings(), getCategories()])
  const dayRow = await ensureDay(day)

  // De vorige dag bewust niet aanmaken: die rij ontstaat vanzelf zodra je
  // hem beoordeelt of opent.
  const [blocks, previousRows, previousBlocks, week] = await Promise.all([
    getBlocks([day]),
    getDays([previous]),
    getBlocks([previous]),
    getWeek(day),
  ])

  const goalMinutes = categories.reduce((sum, c) => sum + c.weekly_minutes, 0)
  const doneMinutes = Object.values(week.totals).reduce((sum, t) => sum + t.done, 0)
  const weekPct = goalMinutes > 0 ? Math.min(100, (doneMinutes / goalMinutes) * 100) : 0

  const dayMinutes = blocks.reduce((sum, b) => sum + b.duration_minutes, 0)
  const isToday = day === logicalToday()

  return (
    <main className="px-4 pb-32">
      <DayHeader
        day={day}
        isToday={isToday}
        sleepMinute={settings.sleep_minute}
        weekNumber={weekNumber(day)}
        weekPct={weekPct}
      />

      <DayBoard day={day} blocks={blocks} categories={categories} settings={settings} isToday={isToday} />

      <NoGoAudit
        day={previous}
        row={previousRows[0] ?? null}
        scheduled={previousBlocks.map((b) => b.category)}
      />

      <section className="panel mt-6 p-4">
        <div className="mb-3 flex items-baseline justify-between">
          <p className="label">Deze week</p>
          <Link href="/week" className="label normal-case tracking-normal text-accent">
            alles zien →
          </Link>
        </div>
        <div className="space-y-3">
          {categories.map((category) => {
            const total = week.totals[category.slug] ?? { done: 0, planned: 0, count: 0 }
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

      <DayNote day={day} initial={dayRow.note} />

      <p className="label mt-6 text-center normal-case tracking-normal">
        Deze dag telt <span className="numeric text-muted">{hours(dayMinutes)}</span> uur aan blokken
      </p>

      <Nav />
    </main>
  )
}
