/**
 * Returns 4 campaign update dates for a livegang date,
 * each 2 weeks apart (livegang, +2w, +4w, +6w) = 8 weeks total.
 */
export function getCampaignUpdateDates(livegangDate: string): string[] {
  const dates: string[] = []
  const base = new Date(livegangDate + 'T00:00:00')

  for (let i = 0; i < 4; i++) {
    const d = new Date(base)
    d.setDate(d.getDate() + i * 14)
    dates.push(formatISO(d))
  }

  return dates
}

function formatISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
