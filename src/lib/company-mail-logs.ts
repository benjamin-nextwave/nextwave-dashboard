import { supabase } from '@/lib/supabase'
import type { CompanyMailLog } from '@/types/database'

export async function getCompanyMailLogs(companyId: string): Promise<CompanyMailLog[]> {
  const { data, error } = await supabase
    .from('company_mail_logs')
    .select('*')
    .eq('company_id', companyId)
    .order('interaction_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []) as CompanyMailLog[]
}

export async function createCompanyMailLog(
  log: Omit<CompanyMailLog, 'id' | 'created_at'>
): Promise<CompanyMailLog> {
  const { data, error } = await supabase
    .from('company_mail_logs')
    .insert(log)
    .select()
    .single()

  if (error) throw error

  return data as CompanyMailLog
}

export async function deleteCompanyMailLog(id: string): Promise<void> {
  const { error } = await supabase
    .from('company_mail_logs')
    .delete()
    .eq('id', id)

  if (error) throw error
}
