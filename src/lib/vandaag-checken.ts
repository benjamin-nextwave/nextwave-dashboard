import { supabase } from '@/lib/supabase'
import type { Company, CompanyNote, Task } from '@/types/database'

export type VandaagCheckenTrigger = 'daily' | 'open_task' | 'active_note'

export interface VandaagCheckenEntry {
  company: Company
  openTasks: Task[]
  activeNotes: CompanyNote[]
  triggers: VandaagCheckenTrigger[]
  inTodoToday: boolean
}

/**
 * Haalt alle klanten op met hun open taken en actieve (niet-genegeerde) notities.
 * Filtert naar klanten die voldoen aan minstens één trigger:
 *   - baseline = 'daily'
 *   - minstens één open taak
 *   - minstens één actieve notitie
 */
export async function getVandaagCheckenEntries(
  today: string
): Promise<VandaagCheckenEntry[]> {
  const { data, error } = await supabase
    .from('companies')
    .select('*, tasks(*), company_notes(*)')
    .order('name', { ascending: true })

  if (error) throw error

  const entries = (data ?? []).map((row) => {
    const castRow = row as unknown as Company & {
      tasks: Task[] | null
      company_notes: CompanyNote[] | null
    }
    const { tasks, company_notes, ...company } = castRow
    const openTasks = (tasks ?? []).filter((t) => !t.is_completed)
    const activeNotes = (company_notes ?? []).filter((n) => n.ignored_at === null)
    const triggers: VandaagCheckenTrigger[] = []
    if (company.daily_baseline === 'daily') triggers.push('daily')
    if (openTasks.length > 0) triggers.push('open_task')
    if (activeNotes.length > 0) triggers.push('active_note')
    return {
      company: company as Company,
      openTasks,
      activeNotes,
      triggers,
      inTodoToday: company.todo_date === today,
    } satisfies VandaagCheckenEntry
  })

  return entries.filter((e) => e.triggers.length > 0)
}

/** Voegt een klant toe aan het To do-tabblad voor vandaag. */
export async function addCompanyToTodo(companyId: string, today: string): Promise<void> {
  const { error } = await supabase
    .from('companies')
    .update({ todo_date: today })
    .eq('id', companyId)
  if (error) throw error
}

/** Haalt een klant uit het To do-tabblad. */
export async function removeCompanyFromTodo(companyId: string): Promise<void> {
  const { error } = await supabase
    .from('companies')
    .update({ todo_date: null })
    .eq('id', companyId)
  if (error) throw error
}

/**
 * Sorteert entries voor het Overzicht-tabblad:
 * 1. Entries met open taken eerst
 * 2. Dan entries met actieve notities
 * 3. Alfabetisch op naam
 */
export function sortVandaagCheckenEntries(
  entries: VandaagCheckenEntry[]
): VandaagCheckenEntry[] {
  return [...entries].sort((a, b) => {
    const aScore = a.openTasks.length > 0 ? 2 : a.activeNotes.length > 0 ? 1 : 0
    const bScore = b.openTasks.length > 0 ? 2 : b.activeNotes.length > 0 ? 1 : 0
    if (aScore !== bScore) return bScore - aScore
    return a.company.name.localeCompare(b.company.name, 'nl')
  })
}
