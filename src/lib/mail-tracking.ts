import { supabase } from '@/lib/supabase'

export type MailTrackingEntry = {
  id: string
  company_id: string
  contact_date: string
  created_at: string
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const fromMailTracking = () => (supabase as any).from('mail_tracking')

/**
 * Get all mail tracking entries for a date range.
 */
export async function getMailTracking(
  startDate: string,
  endDate: string
): Promise<MailTrackingEntry[]> {
  const { data, error } = await fromMailTracking()
    .select('*')
    .gte('contact_date', startDate)
    .lte('contact_date', endDate)

  if (error) {
    console.error('getMailTracking error:', error)
    return []
  }
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
  const { data: existing, error: selectErr } = await fromMailTracking()
    .select('id')
    .eq('company_id', companyId)
    .eq('contact_date', contactDate)
    .maybeSingle()

  if (selectErr) {
    console.error('toggleMailTracking select error:', selectErr)
    throw selectErr
  }

  if (existing) {
    const { error } = await fromMailTracking()
      .delete()
      .eq('id', existing.id)
    if (error) {
      console.error('toggleMailTracking delete error:', error)
      throw error
    }
    return false
  } else {
    const { error } = await fromMailTracking()
      .insert({ company_id: companyId, contact_date: contactDate })
    if (error) {
      console.error('toggleMailTracking insert error:', error)
      throw error
    }
    return true
  }
}
