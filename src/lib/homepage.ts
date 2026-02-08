import { supabase } from './supabase'
import type { Task } from '../types/database'
import { computeOverdue, type OverdueResult } from './overdue'

export interface TaskWithCompany extends Task {
  company_name: string
}

export interface TodayTask {
  task: TaskWithCompany
  companyName: string
  overdue: OverdueResult
}

/**
 * Fetches tasks with deadline <= today, joined with company names.
 * Returns TaskWithCompany[] with null-safe company name handling.
 */
export async function getTodayTasksWithCompany(
  today: string
): Promise<TaskWithCompany[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, companies(name)')
    .lte('deadline', today)

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

/**
 * Filters tasks to those whose effective deadline equals today.
 *
 * This single condition handles all cases:
 * - Overdue incomplete: effectiveDeadline rolled forward to today
 * - Due today incomplete: effectiveDeadline = deadline = today
 * - Completed due today: effectiveDeadline = deadline = today (no rollover)
 * - Completed past: effectiveDeadline = past deadline (excluded)
 * - Future: effectiveDeadline = future deadline (excluded)
 */
export function filterTodayTasks(
  tasks: TaskWithCompany[],
  today: string
): TodayTask[] {
  const result: TodayTask[] = []

  for (const task of tasks) {
    const overdue = computeOverdue(task.deadline, today, task.is_completed)
    if (overdue.effectiveDeadline === today) {
      result.push({
        task,
        companyName: task.company_name,
        overdue,
      })
    }
  }

  return result
}

/**
 * Sorts today's tasks by 4-tier priority (returns new array):
 * 1. Incomplete above completed
 * 2. Urgent first within same completion status
 * 3. Most overdue first (higher daysOverdue)
 * 4. Alphabetical by title (Dutch locale)
 */
export function sortTodayTasks(tasks: TodayTask[]): TodayTask[] {
  return [...tasks].sort((a, b) => {
    // 1. Incomplete above completed
    if (a.task.is_completed !== b.task.is_completed) {
      return a.task.is_completed ? 1 : -1
    }

    // 2. Urgent first
    if (a.task.is_urgent !== b.task.is_urgent) {
      return a.task.is_urgent ? -1 : 1
    }

    // 3. Most overdue first
    if (a.overdue.daysOverdue !== b.overdue.daysOverdue) {
      return b.overdue.daysOverdue - a.overdue.daysOverdue
    }

    // 4. Alphabetical by title (Dutch locale)
    return a.task.title.localeCompare(b.task.title, 'nl')
  })
}
