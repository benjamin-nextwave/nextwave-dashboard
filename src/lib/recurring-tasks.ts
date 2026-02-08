import { supabase } from '@/lib/supabase'
import type { Company, Task } from '@/types/database'

/**
 * Adjusts a date to avoid weekends: Saturday→Friday, Sunday→Monday.
 */
export function adjustForWeekend(date: Date): Date {
  const day = date.getDay()
  if (day === 6) {
    // Saturday → Friday
    const adjusted = new Date(date)
    adjusted.setDate(adjusted.getDate() - 1)
    return adjusted
  }
  if (day === 0) {
    // Sunday → Monday
    const adjusted = new Date(date)
    adjusted.setDate(adjusted.getDate() + 1)
    return adjusted
  }
  return date
}

/**
 * Given a day-of-month, month, and year, returns a valid Date clamped to the last day of that month.
 */
function dayOfMonthToDate(dayOfMonth: number, month: number, year: number): Date {
  // month is 0-indexed for JS Date
  const lastDay = new Date(year, month + 1, 0).getDate()
  const clamped = Math.min(dayOfMonth, lastDay)
  return new Date(year, month, clamped)
}

/**
 * Generates non-conflicting scrape dates for all companies in a given month.
 * Returns a map of companyId → adjusted scrape dates.
 */
export function getScrapeDatesForMonth(
  month: number,
  year: number,
  allCompanies: Company[]
): Map<string, Date[]> {
  const usedDates = new Set<string>()
  const result = new Map<string, Date[]>()

  for (const company of allCompanies) {
    const dates: Date[] = []
    const scrapeDays = [company.scrape_date_1, company.scrape_date_2, company.scrape_date_3].filter(
      (d): d is number => d != null
    )

    for (const dayOfMonth of scrapeDays) {
      let date = dayOfMonthToDate(dayOfMonth, month, year)
      date = adjustForWeekend(date)

      // Shift forward if conflicting, up to 5 attempts
      let dateStr = date.toISOString().slice(0, 10)
      let attempts = 0
      while (usedDates.has(dateStr) && attempts < 5) {
        date.setDate(date.getDate() + 1)
        date = adjustForWeekend(date)
        dateStr = date.toISOString().slice(0, 10)
        attempts++
      }

      usedDates.add(dateStr)
      dates.push(new Date(date))
    }

    result.set(company.id, dates)
  }

  return result
}

/**
 * Generates rapport + scrape task definitions for a given company and month.
 */
export function generateMonthlyTasks(
  company: Company,
  month: number,
  year: number,
  allCompanies: Company[]
): { title: string; deadline: string }[] {
  const tasks: { title: string; deadline: string }[] = []

  // Rapport task
  if (company.rapport_date) {
    let rapportDate = dayOfMonthToDate(company.rapport_date, month, year)
    rapportDate = adjustForWeekend(rapportDate)
    tasks.push({
      title: `Rapport ${company.name}`,
      deadline: rapportDate.toISOString().slice(0, 10),
    })
  }

  // Scrape tasks
  const scrapeDatesMap = getScrapeDatesForMonth(month, year, allCompanies)
  const scrapeDates = scrapeDatesMap.get(company.id) ?? []
  scrapeDates.forEach((date, i) => {
    tasks.push({
      title: `Scrape ${i + 1} ${company.name}`,
      deadline: date.toISOString().slice(0, 10),
    })
  })

  return tasks
}

// ── Auto-generation on page load ────────────────────────────────────────

/** Module-level flag so we only run once per browser session. */
let _ensuredForKey = ''

/**
 * Ensures recurring tasks (rapport + scrape) exist for the current month.
 * Checks existing tasks by title prefix + deadline month to avoid duplicates.
 * Designed to be called on homepage/gantt load — runs at most once per month per session.
 */
export async function ensureRecurringTasks(todayISO: string): Promise<void> {
  const date = new Date(todayISO + 'T00:00:00')
  const month = date.getMonth() // 0-indexed
  const year = date.getFullYear()
  const sessionKey = `${year}-${month}`

  // Skip if already checked this month in this session
  if (_ensuredForKey === sessionKey) return
  _ensuredForKey = sessionKey

  // Fetch all companies
  const { data: companies, error: compErr } = await supabase
    .from('companies')
    .select('*')

  if (compErr) throw compErr
  const allCompanies = (companies ?? []) as Company[]

  // Only companies that have at least one recurring date configured
  const configured = allCompanies.filter(
    (c) => c.rapport_date || c.scrape_date_1 || c.scrape_date_2 || c.scrape_date_3
  )
  if (configured.length === 0) return

  // Compute first and last day of month for deadline range query
  const firstOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const lastDay = new Date(year, month + 1, 0).getDate()
  const lastOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  // Fetch existing tasks in this month whose titles start with "Rapport " or "Scrape "
  const { data: existing, error: taskErr } = await supabase
    .from('tasks')
    .select('title, company_id, deadline')
    .gte('deadline', firstOfMonth)
    .lte('deadline', lastOfMonth)

  if (taskErr) throw taskErr
  const existingTasks = (existing ?? []) as Pick<Task, 'title' | 'company_id' | 'deadline'>[]

  // Build a set of "companyId::title" for fast duplicate checking
  const existingSet = new Set(
    existingTasks.map((t) => `${t.company_id}::${t.title}`)
  )

  // Generate missing tasks
  const toInsert: Omit<Task, 'id' | 'created_at'>[] = []

  for (const company of configured) {
    const planned = generateMonthlyTasks(company, month, year, allCompanies)
    for (const task of planned) {
      const key = `${company.id}::${task.title}`
      if (!existingSet.has(key)) {
        toInsert.push({
          company_id: company.id,
          title: task.title,
          deadline: task.deadline,
          is_completed: false,
          is_urgent: false,
          is_date_editable: true,
          notes: null,
        })
      }
    }
  }

  if (toInsert.length === 0) return

  const { error: insertErr } = await supabase
    .from('tasks')
    .insert(toInsert)

  if (insertErr) throw insertErr
}
