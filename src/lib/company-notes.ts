import { supabase } from '@/lib/supabase'
import type { CompanyNote } from '@/types/database'

export async function getCompanyNotes(companyId: string): Promise<CompanyNote[]> {
  const { data, error } = await supabase
    .from('company_notes')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []) as CompanyNote[]
}

export async function getActiveCompanyNotes(companyId: string): Promise<CompanyNote[]> {
  const { data, error } = await supabase
    .from('company_notes')
    .select('*')
    .eq('company_id', companyId)
    .is('ignored_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []) as CompanyNote[]
}

export async function createCompanyNote(
  note: Omit<CompanyNote, 'id' | 'created_at' | 'ignored_at'>
): Promise<CompanyNote> {
  const { data, error } = await supabase
    .from('company_notes')
    .insert({ ...note, ignored_at: null })
    .select()
    .single()

  if (error) throw error

  return data as CompanyNote
}

export async function ignoreCompanyNote(id: string): Promise<void> {
  const { error } = await supabase
    .from('company_notes')
    .update({ ignored_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

export async function unignoreCompanyNote(id: string): Promise<void> {
  const { error } = await supabase
    .from('company_notes')
    .update({ ignored_at: null })
    .eq('id', id)

  if (error) throw error
}

export async function deleteCompanyNote(id: string): Promise<void> {
  const { error } = await supabase
    .from('company_notes')
    .delete()
    .eq('id', id)

  if (error) throw error
}
