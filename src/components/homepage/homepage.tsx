'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, PartyPopper } from 'lucide-react'
import { useToday } from '@/lib/today-provider'
import {
  getTodayTasksWithCompany,
  filterTodayTasks,
  sortTodayTasks,
  type TodayTask,
} from '@/lib/homepage'
import { getMeetingsForToday } from '@/lib/meetings'
import { Button } from '@/components/ui/button'
import { DailyHeader } from '@/components/homepage/daily-header'
import { ProgressDonut } from '@/components/homepage/progress-donut'
import { PriorityAlerts } from '@/components/homepage/priority-alerts'
import { TodayTaskList } from '@/components/homepage/today-task-list'
import { TodayMeetings } from '@/components/homepage/today-meetings'
import { HomepageTaskCreateDialog } from '@/components/homepage/task-create-dialog'
import { TaskEditDialog } from '@/components/gantt/task-edit-dialog'
import { useRecurringTasks } from '@/hooks/use-recurring-tasks'
import { updateTask } from '@/lib/tasks'
import type { Task, MeetingWithCompany } from '@/types/database'

type OverlayState =
  | { type: 'none' }
  | { type: 'editTask'; task: Task }
  | { type: 'createTask' }

export function Homepage() {
  const today = useToday()
  const [tasks, setTasks] = useState<TodayTask[]>([])
  const [meetings, setMeetings] = useState<MeetingWithCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [meetingsLoading, setMeetingsLoading] = useState(true)
  const [overlay, setOverlay] = useState<OverlayState>({ type: 'none' })

  const loadData = useCallback(async () => {
    const raw = await getTodayTasksWithCompany(today)
    const filtered = filterTodayTasks(raw, today)
    const sorted = sortTodayTasks(filtered)
    setTasks(sorted)
    setLoading(false)
  }, [today])

  // Auto-generate recurring tasks for current month, then refresh
  useRecurringTasks(loadData)

  const loadMeetings = useCallback(async () => {
    try {
      const data = await getMeetingsForToday(today)
      setMeetings(data)
    } catch (error) {
      console.error('Failed to fetch today meetings:', error)
    } finally {
      setMeetingsLoading(false)
    }
  }, [today])

  useEffect(() => {
    loadData()
    loadMeetings()
  }, [loadData, loadMeetings])

  const refreshData = useCallback(async () => {
    await loadData()
  }, [loadData])

  const onTaskClick = useCallback((task: Task) => {
    setOverlay({ type: 'editTask', task })
  }, [])

  const onCloseOverlay = useCallback(() => {
    setOverlay({ type: 'none' })
  }, [])

  const onMarkNotImportant = useCallback(async (taskId: string) => {
    try {
      await updateTask(taskId, { is_not_important: true })
      setTasks((prev) =>
        prev.map((t) =>
          t.task.id === taskId
            ? { ...t, task: { ...t.task, is_not_important: true } }
            : t
        )
      )
    } catch (error) {
      console.error('Failed to mark task as not important:', error)
    }
  }, [])

  const importantTasks = tasks.filter((t) => !t.task.is_not_important)
  const completedCount = importantTasks.filter((t) => t.task.is_completed).length
  const allCompleted = importantTasks.length > 0 && completedCount === importantTasks.length

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <DailyHeader />
        <div className="flex items-center gap-3">
          <Button onClick={() => setOverlay({ type: 'createTask' })}>
            <Plus className="size-4" />
            Nieuwe taak
          </Button>
          {allCompleted ? (
            <Link
              href="/ontspanning"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 px-4 py-2.5 text-sm font-medium text-white shadow-lg animate-pulse hover:shadow-xl hover:scale-105 transition-all"
            >
              <PartyPopper className="size-4" />
              Het tikken kan elders genoten worden
            </Link>
          ) : (
            <ProgressDonut completed={completedCount} total={importantTasks.length} />
          )}
        </div>
      </div>

      <PriorityAlerts />

      {loading ? (
        <p className="text-muted-foreground">Laden...</p>
      ) : (
        <TodayTaskList tasks={tasks} onTaskClick={onTaskClick} onMarkNotImportant={onMarkNotImportant} />
      )}

      <TodayMeetings meetings={meetings} loading={meetingsLoading} />

      <TaskEditDialog
        task={overlay.type === 'editTask' ? overlay.task : null}
        onClose={onCloseOverlay}
        onSaved={refreshData}
      />

      <HomepageTaskCreateDialog
        open={overlay.type === 'createTask'}
        onClose={onCloseOverlay}
        onCreated={refreshData}
      />
    </div>
  )
}
