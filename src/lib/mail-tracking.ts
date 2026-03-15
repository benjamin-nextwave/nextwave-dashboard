import { supabase } from '@/lib/supabase'

export type MailTrackingEntry = {
  id: string
  company_id: string
  contact_date: string
  created_at: string
}

// Use untyped client for mail_tracking since the generated types may not include it
const db = supabase as unknown as {
  from: (table: string) => ReturnType<typeof supabase.from>
}

/**
 * Get all mail tracking entries for a date range.
 */
export async function getMailTracking(
  startDate: string,
  endDate: string
): Promise<MailTrackingEntry[]> {
  const { data, error } = await db
    .from('mail_tracking')
    .select('*')
    .gte('contact_date', startDate)
    .lte('contact_date', endDate)

  if (error) throw error
  return (data ?? []) as MailTrackingEntry[]
}

/**
 * Toggle a mail tracking entry for a company on a specific date.
 * Returns true if created, false if deleted.
 */
export async function toggleMailTracking(
  companyId: string,
  contactDate: string
): Promise<boolean> {
  // Check if entry exists
  const { data: existing } = await db
    .from('mail_tracking')
    .select('id')
    .eq('company_id', companyId)
    .eq('contact_date', contactDate)
    .maybeSingle()

  if (existing) {
    const { error } = await db
      .from('mail_tracking')
      .delete()
      .eq('id', (existing as { id: string }).id)
    if (error) throw error
    return false
  } else {
    const { error } = await db
      .from('mail_tracking')
      .insert({ company_id: companyId, contact_date: contactDate })
    if (error) throw error
    return true
  }
}
