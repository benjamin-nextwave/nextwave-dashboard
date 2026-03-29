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
 * Fetches tasks scheduled for today (scheduled_date = today),
 * joined with company names.
 */
export async function getTodayTasksWithCompany(
  today: string
): Promise<TaskWithCompany[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, companies(name)')
    .eq('scheduled_date', today)

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
 * Maps tasks scheduled for today into TodayTask format with overdue info.
 * Tasks are already filtered by scheduled_date in the query.
 */
export function filterTodayTasks(
  tasks: TaskWithCompany[],
  today: string
): TodayTask[] {
  return tasks.map((task) => ({
    task,
    companyName: task.company_name,
    overdue: computeOverdue(task.deadline, today, task.is_completed),
  }))
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
