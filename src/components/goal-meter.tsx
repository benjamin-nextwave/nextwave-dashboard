import { CATEGORY_COLOR, CATEGORY_GLYPH, type Category } from '@/lib/schema'
import { hours } from '@/lib/time'

type Props = {
  category: Category
  doneMinutes: number
  plannedMinutes: number
  doneCount: number
}

/**
 * Eén weekdoel. De volle balk is wat je gehaald hebt, de doorschijnende
 * staart erachter is wat er nog ingepland staat.
 */
export function GoalMeter({ category, doneMinutes, plannedMinutes, doneCount }: Props) {
  const color = CATEGORY_COLOR[category.slug]
  const countBased = category.weekly_count !== null

  const target = countBased ? category.weekly_count! : category.weekly_minutes
  const achieved = countBased ? doneCount : doneMinutes
  const scheduled = countBased ? Math.ceil(plannedMinutes / (category.default_block || 30)) : plannedMinutes

  const donePct = target > 0 ? Math.min(100, (achieved / target) * 100) : 0
  const plannedPct = target > 0 ? Math.min(100 - donePct, (scheduled / target) * 100) : 0
  const complete = achieved >= target && target > 0

  return (
    <div className="flex items-center gap-3">
      <span className="grid size-7 shrink-0 place-items-center text-sm" style={{ color }}>
        {CATEGORY_GLYPH[category.slug]}
      </span>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-medium">{category.label}</span>
          <span className="numeric shrink-0 text-xs text-muted">
            <span style={{ color: complete ? color : undefined }}>
              {countBased ? achieved : hours(achieved)}
            </span>
            <span className="text-dim">
              {' / '}
              {countBased ? target : hours(target)}
              {countBased ? '×' : 'u'}
            </span>
          </span>
        </div>
        <div className="flex h-1.5 overflow-hidden rounded-full bg-line-soft">
          <span
            className="h-full rounded-full transition-[width] duration-500"
            style={{
              width: `${donePct}%`,
              background: color,
              boxShadow: complete ? `0 0 10px ${color}` : undefined,
            }}
          />
          <span
            className="h-full transition-[width] duration-500"
            style={{ width: `${plannedPct}%`, background: `${color}3d` }}
          />
        </div>
      </div>
    </div>
  )
}
