import { supabase } from '@/lib/supabase'
import type { Meeting, MeetingWithCompany } from '@/types/database'

/**
 * Fetches all meetings for a given month range, joined with company name.
 */
export async function getMeetingsByDateRange(
  startDate: string,
  endDate: string
): Promise<MeetingWithCompany[]> {
  const { data, error } = await supabase
    .from('meetings')
    .select('*, companies(name)')
    .gte('meeting_date', startDate)
    .lte('meeting_date', endDate)
    .order('meeting_date', { ascending: true })
    .order('meeting_time', { ascending: true })

  if (error) throw error

  return (data ?? []).map((row) => {
    const castRow = row as unknown as Meeting & {
      companies: { name: string } | null
    }
    return {
      ...castRow,
      company_name: castRow.companies?.name ?? 'Onbekend',
    } as MeetingWithCompany
  })
}

/**
 * Fetches meetings for today, joined with company name, sorted by time.
 */
export async function getMeetingsForToday(
  today: string
): Promise<MeetingWithCompany[]> {
  return getMeetingsByDateRange(today, today)
}

/**
 * Creates a new meeting.
 */
export async function createMeeting(
  meeting: Omit<Meeting, 'id' | 'created_at'>
): Promise<Meeting> {
  const { data, error } = await supabase
    .from('meetings')
    .insert(meeting)
    .select()
    .single()

  if (error) throw error

  return data as Meeting
}

/**
 * Updates specific fields of a meeting.
 */
export async function updateMeeting(
  id: string,
  updates: Partial<Omit<Meeting, 'id' | 'created_at'>>
): Promise<Meeting> {
  const { data, error } = await supabase
    .from('meetings')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return data as Meeting
}

/**
 * Deletes a meeting by ID.
 */
export async function deleteMeeting(id: string): Promise<void> {
  const { error } = await supabase
    .from('meetings')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/**
 * Fetches all companies (id + name) for the company selector.
 */
export async function getCompaniesForSelect(): Promise<
  { id: string; name: string }[]
> {
  const { data, error } = await supabase
    .from('companies')
    .select('id, name')
    .order('name', { ascending: true })

  if (error) throw error

  return (data ?? []) as { id: string; name: string }[]
}
