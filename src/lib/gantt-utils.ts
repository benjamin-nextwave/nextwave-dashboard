import {
  eachDayOfInterval,
  startOfWeek,
  addDays,
  format,
  parseISO,
  differenceInCalendarDays,
} from 'date-fns'
import { nl } from 'date-fns/locale/nl'

/**
 * Generate array of 'yyyy-MM-dd' strings for a timeline window
 * starting from Monday of anchorDate's week.
 */
export function getTimelineRange(
  anchorDate: string,
  dayCount: number = 14
): string[] {
  const anchor = parseISO(anchorDate)
  const weekStart = startOfWeek(anchor, { weekStartsOn: 1 })
  const end = addDays(weekStart, dayCount - 1)

  return eachDayOfInterval({ start: weekStart, end }).map((d) =>
    format(d, 'yyyy-MM-dd')
  )
}

/**
 * Get 0-based column index for a date within the timeline range.
 */
export function getColumnIndex(dateStr: string, rangeStart: string): number {
  return differenceInCalendarDays(parseISO(dateStr), parseISO(rangeStart))
}

/**
 * Check if a date falls within a start/end interval (inclusive).
 * Uses string comparison (yyyy-MM-dd format).
 */
export function isDateInRange(
  date: string,
  start: string | null,
  end: string | null
): boolean {
  if (!start) return false
  if (!end) return date >= start // Ongoing warmup with no go-live set
  return date >= start && date <= end
}

/**
 * Format date for day column header in Dutch locale.
 * dayName: two-letter abbreviation ("ma", "di", etc.)
 * dayNum: day of month ("8", "15", etc.)
 */
export function formatDayHeader(dateStr: string): {
  dayName: string
  dayNum: string
} {
  const d = parseISO(dateStr)
  return {
    dayName: format(d, 'EEEEEE', { locale: nl }),
    dayNum: format(d, 'd'),
  }
}
