import { supabase } from './supabase'
import type { OnboardingTask, Company } from '@/types/database'

export const TASK_DEFINITIONS = [
  { number: 1, type: 'Invulformulier verzenden', isOptional: false, targetDay: 1 },
  { number: 2, type: 'Bevestigingsmail sturen', isOptional: false, targetDay: 2 },
  { number: 3, type: 'Mailvarianten maken en opsturen', isOptional: false, targetDay: 4 },
  { number: 4, type: 'Beoordeling mailvarianten', isOptional: false, targetDay: 5 },
  { number: 5, type: 'Contactenlijst samenstellen en delen', isOptional: false, targetDay: 7 },
  { number: 6, type: 'Beoordeling contactenlijst', isOptional: false, targetDay: 9 },
  { number: 7, type: 'RLM keuze', isOptional: true, targetDay: 10 },
  { number: 8, type: 'RLM maken en delen', isOptional: true, targetDay: 11 },
  { number: 9, type: 'Beoordeling RLM', isOptional: true, targetDay: 13 },
  { number: 10, type: 'Campagne live zetten', isOptional: false, targetDay: 14 },
]

export function getTargetDay(taskNumber: number): number {
  return TASK_DEFINITIONS.find((d) => d.number === taskNumber)?.targetDay ?? 0
}

export function getScheduleStatus(task: OnboardingTask, startDate: string): { onTrack: boolean; daysOff: number } {
  const start = new Date(startDate)
  const now = new Date()
  const daysPassed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  const target = getTargetDay(task.task_number)

  if (task.status === 'completed') {
    return { onTrack: true, daysOff: 0 }
  }

  const diff = daysPassed - target
  return { onTrack: diff <= 0, daysOff: diff }
}

export function getTaskLabel(task: OnboardingTask): string {
  const base = task.task_type
  if (task.iteration > 1) {
    return `${base} (ronde ${task.iteration})`
  }
  return base
}

export async function fetchCompaniesForOnboarding(): Promise<Company[]> {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('name')

  if (error) throw error
  return ((data || []) as Company[]).map((c) => ({
    ...c,
    onboarding_completed: c.onboarding_completed ?? false,
  }))
}

export async function fetchOnboardingTasks(clientId: string): Promise<OnboardingTask[]> {
  const { data, error } = await supabase
    .from('onboarding_tasks')
    .select('*')
    .eq('client_id', clientId)
    .order('task_number')
    .order('iteration')

  if (error) throw error
  return ((data || []) as OnboardingTask[]).map(parseTask)
}

function parseTask(task: OnboardingTask): OnboardingTask {
  let links = task.links
  if (typeof links === 'string') {
    try { links = JSON.parse(links) } catch { links = [] }
  }
  if (!Array.isArray(links)) links = []
  return { ...task, links }
}

export async function initializeOnboarding(clientId: string): Promise<OnboardingTask[]> {
  const tasks = TASK_DEFINITIONS.map((def, index) => ({
    client_id: clientId,
    task_number: def.number,
    task_type: def.type,
    status: index === 0 ? 'active' : 'locked' as const,
    links: [] as { label: string; url: string }[],
    is_optional: def.isOptional,
    parent_task_number: null as number | null,
    iteration: 1,
  }))

  const { data, error } = await supabase
    .from('onboarding_tasks')
    .insert(tasks as any)
    .select()

  if (error) throw error
  return ((data || []) as OnboardingTask[]).map(parseTask)
}

export async function completeTask(
  task: OnboardingTask,
  allTasks: OnboardingTask[],
  clientId: string,
  choice?: 'approved' | 'feedback' | 'rlm' | 'no-rlm'
): Promise<void> {
  // Mark current task as completed
  await supabase
    .from('onboarding_tasks')
    .update({ status: 'completed', updated_at: new Date().toISOString() } as any)
    .eq('id', task.id)

  const taskNum = task.task_number

  // Handle feedback loops and choices
  if (taskNum === 4 && choice === 'feedback') {
    await createFeedbackIteration(clientId, 3, allTasks)
    return
  }
  if (taskNum === 6 && choice === 'feedback') {
    await createFeedbackIteration(clientId, 5, allTasks)
    return
  }
  if (taskNum === 9 && choice === 'feedback') {
    await createFeedbackIteration(clientId, 8, allTasks)
    return
  }
  if (taskNum === 7 && choice === 'no-rlm') {
    // Skip tasks 8 and 9, activate task 10
    await supabase
      .from('onboarding_tasks')
      .update({ status: 'completed', updated_at: new Date().toISOString() } as any)
      .eq('client_id', clientId)
      .in('task_number', [8, 9])
      .eq('iteration', 1)

    await activateTask(clientId, 10)
    return
  }

  // Default: activate the next task
  let nextTaskNum = taskNum + 1
  if (nextTaskNum > 10) {
    // All done — mark onboarding as completed
    await supabase
      .from('companies')
      .update({ onboarding_completed: true })
      .eq('id', clientId)
    return
  }

  await activateTask(clientId, nextTaskNum)
}

async function createFeedbackIteration(
  clientId: string,
  originalTaskNumber: number,
  allTasks: OnboardingTask[]
): Promise<void> {
  const existingIterations = allTasks.filter(
    (t) => t.task_number === originalTaskNumber || t.parent_task_number === originalTaskNumber
  )
  const maxIteration = Math.max(...existingIterations.map((t) => t.iteration))
  const originalTask = TASK_DEFINITIONS.find((d) => d.number === originalTaskNumber)!

  // Create new iteration of the original task
  const { data: newTask } = await supabase
    .from('onboarding_tasks')
    .insert({
      client_id: clientId,
      task_number: originalTaskNumber,
      task_type: originalTask.type,
      status: 'active' as const,
      links: [] as { label: string; url: string }[],
      is_optional: originalTask.isOptional,
      parent_task_number: originalTaskNumber,
      iteration: maxIteration + 1,
    } as any)
    .select()
    .single()

  if (!newTask) return

  // Create new review task that follows it
  const reviewTaskNumber = originalTaskNumber + 1
  const reviewDef = TASK_DEFINITIONS.find((d) => d.number === reviewTaskNumber)!

  await supabase
    .from('onboarding_tasks')
    .insert({
      client_id: clientId,
      task_number: reviewTaskNumber,
      task_type: reviewDef.type,
      status: 'locked' as const,
      links: [] as { label: string; url: string }[],
      is_optional: reviewDef.isOptional,
      parent_task_number: reviewTaskNumber,
      iteration: maxIteration + 1,
    } as any)
}

async function activateTask(clientId: string, taskNumber: number): Promise<void> {
  // Find the latest iteration of this task that is still locked
  const { data: tasks } = await supabase
    .from('onboarding_tasks')
    .select('*')
    .eq('client_id', clientId)
    .eq('task_number', taskNumber)
    .eq('status', 'locked')
    .order('iteration', { ascending: false })
    .limit(1) as { data: OnboardingTask[] | null }

  if (tasks && tasks.length > 0) {
    await supabase
      .from('onboarding_tasks')
      .update({ status: 'active', updated_at: new Date().toISOString() } as any)
      .eq('id', tasks[0].id)
  }
}

export async function updateTaskLinks(
  taskId: string,
  links: { label: string; url: string }[]
): Promise<void> {
  await supabase
    .from('onboarding_tasks')
    .update({ links, updated_at: new Date().toISOString() } as any)
    .eq('id', taskId)
}
