import { TZDate } from '@date-fns/tz'
import { addDays, format, parseISO, startOfWeek } from 'date-fns'
import { nl } from 'date-fns/locale'

export const TZ = 'Europe/Amsterdam'

/**
 * De dag loopt door tot ver na middernacht. Alles vóór dit tijdstip
 * telt daarom nog mee bij de dág ervoor.
 */
const DAY_ROLLOVER_MINUTE = 4 * 60 // 04:00

/** Huidige tijd in Amsterdam. */
export function now(): TZDate {
  return TZDate.tz(TZ)
}

/** Minuten sinds middernacht, in Amsterdam. */
export function nowMinute(): number {
  const d = now()
  return d.getHours() * 60 + d.getMinutes()
}

/**
 * De dag waar je je nú in bevindt. Om 00:45 zit je nog in de dag
 * ervoor — die is immers nog niet afgelopen.
 */
export function logicalToday(): string {
  const d = now()
  const minute = d.getHours() * 60 + d.getMinutes()
  return toKey(minute < DAY_ROLLOVER_MINUTE ? addDays(d, -1) : d)
}

/**
 * Positie op de tijdlijn van vandaag, in minuten sinds middernacht.
 * Na middernacht doorgeteld (01:30 wordt 1530) zodat het aansluit op
 * de opgeslagen blokken.
 */
export function nowTimelineMinute(): number {
  const minute = nowMinute()
  return minute < DAY_ROLLOVER_MINUTE ? minute + 1440 : minute
}

export function toKey(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}

export function shiftDay(key: string, days: number): string {
  return toKey(addDays(parseISO(key), days))
}

/** Maandag van de week waar deze dag in valt. */
export function weekStart(key: string): string {
  return toKey(startOfWeek(parseISO(key), { weekStartsOn: 1 }))
}

/** De zeven dagsleutels van de week waar deze dag in valt. */
export function weekDays(key: string): string[] {
  const start = weekStart(key)
  return Array.from({ length: 7 }, (_, i) => shiftDay(start, i))
}

export function weekNumber(key: string): number {
  return Number(format(parseISO(key), 'I'))
}

/** "07:30" — ook voor minuten voorbij middernacht (1530 → "01:30"). */
export function minuteLabel(minute: number): string {
  const m = ((minute % 1440) + 1440) % 1440
  const h = Math.floor(m / 60)
  return `${String(h).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

/** "1u 30" / "45 min" / "5u" */
export function durationLabel(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h}u`
  return `${h}u ${m}`
}

/** "6.5" — uren met één decimaal, zonder overbodige nul. */
export function hours(minutes: number): string {
  const h = minutes / 60
  return (Math.round(h * 10) / 10).toString().replace('.', ',')
}

/** "vrijdag 31 juli" */
export function dayLabel(key: string): string {
  return format(parseISO(key), 'EEEE d MMMM', { locale: nl })
}

/** "vr 31 jul" */
export function dayLabelShort(key: string): string {
  return format(parseISO(key), 'EEE d MMM', { locale: nl })
}

/** "VR" */
export function weekdayLetter(key: string): string {
  return format(parseISO(key), 'EEEEEE', { locale: nl }).toUpperCase()
}

export function relativeDayLabel(key: string): string | null {
  const today = logicalToday()
  if (key === today) return 'Vandaag'
  if (key === shiftDay(today, -1)) return 'Gisteren'
  if (key === shiftDay(today, 1)) return 'Morgen'
  return null
}

/** Minuten tot bedtijd, of null wanneer die al verstreken is. */
export function minutesUntil(target: number): number | null {
  const diff = target - nowTimelineMinute()
  return diff > 0 ? diff : null
}

export function isValidKey(key: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(key) && !Number.isNaN(parseISO(key).getTime())
}
