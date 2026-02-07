import { supabase } from '@/lib/supabase'
import type { Task } from '@/types/database'

/**
 * Batch inserts tasks (typically default tasks for a new company).
 */
export async function insertDefaultTasks(
  tasks: Omit<Task, 'id' | 'created_at'>[]
): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .insert(tasks)
    .select()

  if (error) throw error

  return data as Task[]
}

/**
 * Fetches all tasks for a given company, ordered by deadline ascending.
 */
export async function getTasksByCompanyId(companyId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('company_id', companyId)
    .order('deadline', { ascending: true })

  if (error) throw error

  return (data ?? []) as Task[]
}
