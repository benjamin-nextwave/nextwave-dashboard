import { supabase } from '@/lib/supabase'
import type { Company, CompanyWithTasks } from '@/types/database'

/**
 * Fetches all companies with their incomplete (open) task count.
 * Uses client-side filtering for open count to avoid Supabase embedded filter edge cases.
 */
export async function getCompaniesWithOpenTaskCounts(): Promise<
  (Company & { open_task_count: number })[]
> {
  const { data, error } = await supabase
    .from('companies')
    .select('*, tasks(id, is_completed)')
    .order('name', { ascending: true })

  if (error) throw error

  return (data ?? []).map((company) => {
    const row = company as unknown as Company & {
      tasks: { id: string; is_completed: boolean }[]
    }
    const { tasks: taskRows, ...rest } = row
    return {
      ...rest,
      open_task_count: (taskRows ?? []).filter((t) => !t.is_completed).length,
    }
  })
}

/**
 * Fetches a single company by ID.
 * Returns null if not found.
 */
export async function getCompanyById(id: string): Promise<Company | null> {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Row not found
    throw error
  }

  return data as Company
}

/**
 * Creates a new company.
 */
export async function createCompany(company: {
  name: string
  warmup_start_date: string
  go_live_date: string | null
}): Promise<Company> {
  const { data, error } = await supabase
    .from('companies')
    .insert(company)
    .select()
    .single()

  if (error) throw error

  return data as Company
}

/**
 * Updates specific fields of a company.
 */
export async function updateCompany(
  id: string,
  updates: Partial<Omit<Company, 'id' | 'created_at' | 'updated_at'>>
): Promise<Company> {
  const { data, error } = await supabase
    .from('companies')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return data as Company
}

/**
 * Fetches all companies with their full task objects, sorted by name.
 * Each company's tasks are sorted by deadline ascending.
 */
/**
 * Deletes a company by ID (tasks are cascade-deleted by the database).
 */
export async function deleteCompany(id: string): Promise<void> {
  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/**
 * Fetches all companies with their full task objects, sorted by name.
 * Each company's tasks are sorted by deadline ascending.
 */
export async function getCompaniesWithTasks(): Promise<CompanyWithTasks[]> {
  const { data, error } = await supabase
    .from('companies')
    .select('*, tasks(*)')
    .order('name', { ascending: true })

  if (error) throw error

  return (data ?? []).map((company) => ({
    ...company,
    tasks: ((company as unknown as CompanyWithTasks).tasks ?? []).sort(
      (a, b) => a.deadline.localeCompare(b.deadline)
    ),
  })) as CompanyWithTasks[]
}
