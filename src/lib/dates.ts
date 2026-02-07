import { TZDate } from '@date-fns/tz'
import { format, startOfDay, startOfWeek, parseISO } from 'date-fns'
import { nl } from 'date-fns/locale/nl'

export const TIMEZONE = 'Europe/Amsterdam'

/** Returns today at midnight Amsterdam time as a TZDate */
export function getToday(): TZDate {
  return startOfDay(TZDate.tz(TIMEZONE)) as TZDate
}

/** Returns today as 'yyyy-MM-dd' string in Amsterdam timezone */
export function getTodayISO(): string {
  return format(TZDate.tz(TIMEZONE), 'yyyy-MM-dd')
}

/** Formats a date in full Dutch format, e.g. "maandag 10 februari 2025" */
export function formatDutchDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'EEEE d MMMM yyyy', { locale: nl }).toLowerCase()
}

/** Formats a date in full Dutch format with capital first letter, e.g. "Maandag 10 februari 2025" */
export function formatDutchDateCapitalized(date: Date | string): string {
  const result = formatDutchDate(date)
  return result.charAt(0).toUpperCase() + result.slice(1)
}

/** Formats a date in short Dutch format, e.g. "10 feb 2025" */
export function formatShortDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'd MMM yyyy', { locale: nl })
}

/** Returns the start of the week (Monday) for the given date */
export function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1, locale: nl })
}
