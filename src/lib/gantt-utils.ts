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
 * starting from the anchor date.
 */
export function getTimelineRange(
  anchorDate: string,
  dayCount: number = 7
): string[] {
  const anchor = parseISO(anchorDate)
  const end = addDays(anchor, dayCount - 1)

  return eachDayOfInterval({ start: anchor, end }).map((d) =>
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
 * Check if a date falls within the warmup period (always 14 days from start).
 * Uses string comparison (yyyy-MM-dd format).
 */
export function isDateInWarmup(
  date: string,
  warmupStart: string | null
): boolean {
  if (!warmupStart) return false
  const end = format(addDays(parseISO(warmupStart), 13), 'yyyy-MM-dd')
  return date >= warmupStart && date <= end
}

/**
 * Check if a date is the go-live date.
 */
export function isGoLiveDate(
  date: string,
  goLiveDate: string | null
): boolean {
  if (!goLiveDate) return false
  return date === goLiveDate
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
