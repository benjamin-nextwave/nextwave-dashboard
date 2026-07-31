'use server'

import { revalidatePath } from 'next/cache'
import { db } from './db'
import { ensureDay, getSettings } from './data'
import type { Block, CategorySlug, NoGoKey } from './schema'
import { minuteLabel } from './time'

export type Result = { ok: true } | { ok: false, error: string }

const ok: Result = { ok: true }
const fail = (error: string): Result => ({ ok: false, error })

function refresh() {
  revalidatePath('/', 'layout')
}

/**
 * Controleert of een blok binnen de wakkere uren valt en niet over een
 * bestaand blok heen ligt. `ignoreId` slaat het blok over dat je aan het
 * verplaatsen bent.
 */
async function validatePlacement(
  day: string,
  start: number,
  duration: number,
  ignoreId?: string
): Promise<string | null> {
  const settings = await getSettings()
  const end = start + duration

  if (start < settings.wake_minute) {
    return `Je staat pas op om ${minuteLabel(settings.wake_minute)}.`
  }
  if (end > settings.sleep_minute) {
    return `Dat loopt door tot ${minuteLabel(end)} — voorbij je bedtijd van ${minuteLabel(settings.sleep_minute)}.`
  }

  const { data, error } = await db
    .from('blocks')
    .select('id, start_minute, duration_minutes')
    .eq('day', day)
    .not('start_minute', 'is', null)
  if (error) return `Controle mislukt: ${error.message}`

  for (const other of data ?? []) {
    if (other.id === ignoreId) continue
    const otherStart = other.start_minute as number
    const otherEnd = otherStart + other.duration_minutes
    if (start < otherEnd && otherStart < end) {
      return `Dat overlapt met het blok van ${minuteLabel(otherStart)}–${minuteLabel(otherEnd)}.`
    }
  }
  return null
}

export async function createBlock(input: {
  day: string
  category: CategorySlug
  startMinute: number | null
  durationMinutes: number
  note?: string | null
}): Promise<Result> {
  if (input.durationMinutes <= 0) return fail('Duur moet groter zijn dan nul.')
  await ensureDay(input.day)

  if (input.startMinute !== null) {
    const problem = await validatePlacement(input.day, input.startMinute, input.durationMinutes)
    if (problem) return fail(problem)
  }

  const { error } = await db.from('blocks').insert({
    day: input.day,
    category: input.category,
    start_minute: input.startMinute,
    duration_minutes: input.durationMinutes,
    note: input.note?.trim() || null,
  })
  if (error) return fail(`Opslaan mislukt: ${error.message}`)
  refresh()
  return ok
}

export async function updateBlock(
  id: string,
  patch: {
    category?: CategorySlug
    startMinute?: number | null
    durationMinutes?: number
    note?: string | null
  }
): Promise<Result> {
  const { data: current, error: readError } = await db
    .from('blocks')
    .select('*')
    .eq('id', id)
    .single()
  if (readError || !current) return fail('Dit blok bestaat niet meer.')

  const block = current as Block
  const start = patch.startMinute !== undefined ? patch.startMinute : block.start_minute
  const duration = patch.durationMinutes ?? block.duration_minutes
  if (duration <= 0) return fail('Duur moet groter zijn dan nul.')

  if (start !== null) {
    const problem = await validatePlacement(block.day, start, duration, id)
    if (problem) return fail(problem)
  }

  const { error } = await db
    .from('blocks')
    .update({
      ...(patch.category !== undefined && { category: patch.category }),
      start_minute: start,
      duration_minutes: duration,
      ...(patch.note !== undefined && { note: patch.note?.trim() || null }),
    })
    .eq('id', id)
  if (error) return fail(`Opslaan mislukt: ${error.message}`)
  refresh()
  return ok
}

export async function setBlockDone(id: string, done: boolean): Promise<Result> {
  const { error } = await db.from('blocks').update({ done }).eq('id', id)
  if (error) return fail(`Bijwerken mislukt: ${error.message}`)
  refresh()
  return ok
}

export async function deleteBlock(id: string): Promise<Result> {
  const { error } = await db.from('blocks').delete().eq('id', id)
  if (error) return fail(`Verwijderen mislukt: ${error.message}`)
  refresh()
  return ok
}

/** Haalt een geplaatst blok terug naar de lade met nog in te plannen blokken. */
export async function unplaceBlock(id: string): Promise<Result> {
  const { error } = await db.from('blocks').update({ start_minute: null }).eq('id', id)
  if (error) return fail(`Bijwerken mislukt: ${error.message}`)
  refresh()
  return ok
}

export async function setNoGo(day: string, key: NoGoKey, value: boolean | null): Promise<Result> {
  await ensureDay(day)
  const { error } = await db
    .from('days')
    .update({ [key]: value, updated_at: new Date().toISOString() })
    .eq('day', day)
  if (error) return fail(`Opslaan mislukt: ${error.message}`)
  refresh()
  return ok
}

export async function setDayNote(day: string, note: string): Promise<Result> {
  await ensureDay(day)
  const { error } = await db
    .from('days')
    .update({ note: note.trim() || null, updated_at: new Date().toISOString() })
    .eq('day', day)
  if (error) return fail(`Opslaan mislukt: ${error.message}`)
  refresh()
  return ok
}

export async function updateSettings(patch: {
  wakeMinute: number
  sleepMinute: number
  dailyWorkMinutes: number
}): Promise<Result> {
  if (patch.sleepMinute <= patch.wakeMinute) {
    return fail('Bedtijd moet ná het opstaan liggen.')
  }
  const { error } = await db
    .from('settings')
    .update({
      wake_minute: patch.wakeMinute,
      sleep_minute: patch.sleepMinute,
      daily_work_minutes: patch.dailyWorkMinutes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1)
  if (error) return fail(`Opslaan mislukt: ${error.message}`)
  refresh()
  return ok
}

export async function updateGoal(slug: CategorySlug, weeklyMinutes: number, weeklyCount: number | null): Promise<Result> {
  if (weeklyMinutes < 0) return fail('Een doel kan niet negatief zijn.')
  const { error } = await db
    .from('categories')
    .update({ weekly_minutes: weeklyMinutes, weekly_count: weeklyCount })
    .eq('slug', slug)
  if (error) return fail(`Opslaan mislukt: ${error.message}`)
  refresh()
  return ok
}
