import { supabase } from '@/lib/supabase'
import type { MailTask, MailTaskWithCompany } from '@/types/database'
import { format, addDays } from 'date-fns'

/**
 * Fetches mail tasks due today or overdue (not completed), plus company name
 * and last completed mail date per company.
 */
export async function getMailTasksDue(
  today: string
): Promise<MailTaskWithCompany[]> {
  // Get all incomplete mail tasks with deadline <= today
  const { data, error } = await supabase
    .from('mail_tasks')
    .select('*, companies(name)')
    .eq('is_completed', false)
    .lte('deadline', today)
    .order('deadline', { ascending: true })

  if (error) throw error

  const tasks = (data ?? []).map((row) => {
    const castRow = row as unknown as MailTask & {
      companies: { name: string } | null
    }
    return {
      ...castRow,
      company_name: castRow.companies?.name ?? 'Onbekend',
      last_completed_at: null as string | null,
    } as MailTaskWithCompany
  })

  // Get last completed mail task per company
  if (tasks.length > 0) {
    const companyIds = [...new Set(tasks.map((t) => t.company_id))]
    const { data: completedData } = await supabase
      .from('mail_tasks')
      .select('company_id, completed_at')
      .eq('is_completed', true)
      .in('company_id', companyIds)
      .order('completed_at', { ascending: false })

    if (completedData) {
      const lastCompleted = new Map<string, string>()
      for (const row of completedData) {
        if (!lastCompleted.has(row.company_id) && row.completed_at) {
          lastCompleted.set(row.company_id, row.completed_at)
        }
      }
      for (const task of tasks) {
        task.last_completed_at = lastCompleted.get(task.company_id) ?? null
      }
    }
  }

  return tasks
}

/**
 * Creates a mail task (manual).
 */
export async function createMailTask(
  companyId: string,
  deadline: string,
  urgency: 1 | 2 | 3 = 2,
  reason: string | null = null
): Promise<MailTask> {
  const { data, error } = await supabase
    .from('mail_tasks')
    .insert({
      company_id: companyId,
      deadline,
      is_completed: false,
      completed_at: null,
      is_auto_generated: false,
      urgency,
      reason,
      has_been_snoozed: false,
    })
    .select()
    .single()

  if (error) throw error
  return data as MailTask
}

/**
 * Completes a mail task and auto-creates the next one 2 days from now.
 */
export async function completeMailTask(
  id: string,
  today: string
): Promise<void> {
  // Get the task first to know company_id, urgency, and reason
  const { data: task, error: fetchErr } = await supabase
    .from('mail_tasks')
    .select('company_id, urgency, reason')
    .eq('id', id)
    .single()

  if (fetchErr) throw fetchErr

  const now = new Date().toISOString()

  // Mark as completed
  const { error: updateErr } = await supabase
    .from('mail_tasks')
    .update({ is_completed: true, completed_at: now })
    .eq('id', id)

  if (updateErr) throw updateErr

  // Create auto-generated follow-up task 2 days from today
  const nextDeadline = format(addDays(new Date(today + 'T00:00:00'), 2), 'yyyy-MM-dd')

  const { error: insertErr } = await supabase
    .from('mail_tasks')
    .insert({
      company_id: (task as { company_id: string; urgency: number; reason: string | null }).company_id,
      deadline: nextDeadline,
      is_completed: false,
      completed_at: null,
      is_auto_generated: true,
      urgency: (task as { company_id: string; urgency: number; reason: string | null }).urgency as 1 | 2 | 3,
      reason: null,
      has_been_snoozed: false,
    })

  if (insertErr) throw insertErr
}

/**
 * Snooze a mail task by 1 day. Only allowed once for auto-generated tasks.
 */
export async function snoozeMailTask(
  id: string,
  currentDeadline: string
): Promise<string> {
  const newDeadline = format(
    addDays(new Date(currentDeadline + 'T00:00:00'), 1),
    'yyyy-MM-dd'
  )

  const { error } = await supabase
    .from('mail_tasks')
    .update({ deadline: newDeadline, has_been_snoozed: true })
    .eq('id', id)

  if (error) throw error
  return newDeadline
}

/**
 * Update urgency of a mail task.
 */
export async function updateMailTaskUrgency(
  id: string,
  urgency: 1 | 2 | 3
): Promise<void> {
  const { error } = await supabase
    .from('mail_tasks')
    .update({ urgency })
    .eq('id', id)

  if (error) throw error
}

/**
 * Update reason of a mail task.
 */
export async function updateMailTaskReason(
  id: string,
  reason: string | null
): Promise<void> {
  const { error } = await supabase
    .from('mail_tasks')
    .update({ reason })
    .eq('id', id)

  if (error) throw error
}

/**
 * Delete a mail task.
 */
export async function deleteMailTask(id: string): Promise<void> {
  const { error } = await supabase
    .from('mail_tasks')
    .delete()
    .eq('id', id)

  if (error) throw error
}
