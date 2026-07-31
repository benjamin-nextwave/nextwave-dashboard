import 'server-only'
import { db } from './db'
import type { Block, Category, CategorySlug, DayRow, Settings } from './schema'
import { weekDays } from './time'

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await db.from('categories').select('*').order('sort_order')
  if (error) throw new Error(`Categorieën laden mislukt: ${error.message}`)
  return (data ?? []) as Category[]
}

export async function getSettings(): Promise<Settings> {
  const { data, error } = await db
    .from('settings')
    .select('wake_minute, sleep_minute, daily_work_minutes')
    .eq('id', 1)
    .single()
  if (error) throw new Error(`Instellingen laden mislukt: ${error.message}`)
  return data as Settings
}

/**
 * Haalt de dagrij op en maakt hem aan als hij nog niet bestaat. Bij een
 * verse dag wordt meteen het vaste werkblok klaargezet in de lade met
 * nog in te plannen blokken.
 */
export async function ensureDay(day: string): Promise<DayRow> {
  const { data: existing, error: readError } = await db
    .from('days')
    .select('*')
    .eq('day', day)
    .maybeSingle()
  if (readError) throw new Error(`Dag laden mislukt: ${readError.message}`)
  if (existing) return existing as DayRow

  const { data: created, error: insertError } = await db
    .from('days')
    .insert({ day })
    .select('*')
    .single()

  // Twee gelijktijdige verzoeken kunnen dezelfde dag aanmaken; de tweede
  // botst op de primary key en leest de rij van de eerste gewoon terug.
  if (insertError) {
    const { data: retry } = await db.from('days').select('*').eq('day', day).single()
    if (retry) return retry as DayRow
    throw new Error(`Dag aanmaken mislukt: ${insertError.message}`)
  }

  await seedWorkBlock(day)
  return created as DayRow
}

async function seedWorkBlock(day: string) {
  const settings = await getSettings()
  if (settings.daily_work_minutes <= 0) return
  await db.from('blocks').insert({
    day,
    category: 'werk' satisfies CategorySlug,
    start_minute: null,
    duration_minutes: settings.daily_work_minutes,
    auto: true,
  })
}

export async function getBlocks(days: string[]): Promise<Block[]> {
  if (days.length === 0) return []
  const { data, error } = await db
    .from('blocks')
    .select('*')
    .in('day', days)
    .order('start_minute', { ascending: true, nullsFirst: true })
  if (error) throw new Error(`Blokken laden mislukt: ${error.message}`)
  return (data ?? []) as Block[]
}

export async function getDays(days: string[]): Promise<DayRow[]> {
  if (days.length === 0) return []
  const { data, error } = await db.from('days').select('*').in('day', days)
  if (error) throw new Error(`Dagen laden mislukt: ${error.message}`)
  return (data ?? []) as DayRow[]
}

export type CategoryTotals = Record<string, { done: number; planned: number; count: number }>

/** Gemaakte en ingeplande minuten per categorie voor een reeks dagen. */
export function totalsByCategory(blocks: Block[]): CategoryTotals {
  const totals: CategoryTotals = {}
  for (const block of blocks) {
    const entry = (totals[block.category] ??= { done: 0, planned: 0, count: 0 })
    if (block.done) {
      entry.done += block.duration_minutes
      entry.count += 1
    } else {
      entry.planned += block.duration_minutes
    }
  }
  return totals
}

export type WeekSnapshot = {
  days: string[]
  blocks: Block[]
  totals: CategoryTotals
}

export async function getWeek(anchor: string): Promise<WeekSnapshot> {
  const days = weekDays(anchor)
  const blocks = await getBlocks(days)
  return { days, blocks, totals: totalsByCategory(blocks) }
}
