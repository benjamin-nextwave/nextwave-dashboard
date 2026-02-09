import { addDays, format } from 'date-fns'
import type { Task } from '@/types/database'

export type DefaultTaskDefinition = {
  title: string
  dayOffset: number
  is_date_editable: boolean
}

export const DEFAULT_TASKS: DefaultTaskDefinition[] = [
  { title: 'Create email templates', dayOffset: 0, is_date_editable: false },
  { title: 'Have an onboarding call', dayOffset: 1, is_date_editable: true },
  {
    title: 'Buy custom domains and mailboxes, place in warmup tool',
    dayOffset: 2,
    is_date_editable: false,
  },
  { title: 'Create an RLM', dayOffset: 3, is_date_editable: false },
  { title: 'Create follow-up mails', dayOffset: 4, is_date_editable: false },
  { title: 'Create a dashboard', dayOffset: 5, is_date_editable: false },
]

/**
 * Generates the 6 default tasks for a newly created company.
 * Deadlines start at warmupStartDate and increment by 1 day each.
 *
 * @param companyId - The UUID of the company
 * @param warmupStartDate - ISO date string (YYYY-MM-DD) for the first task deadline
 * @returns Array of task objects ready for Supabase insert (without id/created_at)
 */
export function generateDefaultTasks(
  companyId: string,
  warmupStartDate: string
): Omit<Task, 'id' | 'created_at'>[] {
  // Parse with explicit time to avoid timezone offset issues
  const baseDate = new Date(warmupStartDate + 'T00:00:00')

  return DEFAULT_TASKS.map((definition) => ({
    company_id: companyId,
    title: definition.title,
    deadline: format(addDays(baseDate, definition.dayOffset), 'yyyy-MM-dd'),
    is_completed: false,
    is_urgent: false,
    is_date_editable: definition.is_date_editable,
    is_not_important: false,
    notes: null,
  }))
}
