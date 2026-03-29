import { supabase } from './supabase'
import type { Task } from '../types/database'
import type { TaskWithCompany } from './homepage'

/**
 * Fetches all incomplete tasks with company names, sorted by deadline ascending.
 */
export async function getAllTasksWithCompany(): Promise<TaskWithCompany[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, companies(name)')
    .eq('is_completed', false)
    .order('deadline', { ascending: true })

  if (error) throw error

  return (data ?? []).map((row) => {
    const castRow = row as unknown as Task & {
      companies: { name: string } | null
    }
    return {
      ...castRow,
      company_name: castRow.companies?.name ?? 'Onbekend',
    } as TaskWithCompany
  })
}
