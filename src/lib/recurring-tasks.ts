import type { Company } from '@/types/database'

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
