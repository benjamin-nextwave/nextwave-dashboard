'use client'

import { useCallback, useEffect, useState } from 'react'
import { useToday } from '@/lib/today-provider'
import {
  getTodayTasksWithCompany,
  filterTodayTasks,
  sortTodayTasks,
  type TodayTask,
} from '@/lib/homepage'
import { getMeetingsForToday } from '@/lib/meetings'
import { DailyHeader } from '@/components/homepage/daily-header'
import { ProgressDonut } from '@/components/homepage/progress-donut'
import { TodayTaskList } from '@/components/homepage/today-task-list'
import { TodayMeetings } from '@/components/homepage/today-meetings'
import { TaskEditDialog } from '@/components/gantt/task-edit-dialog'
import type { Task, MeetingWithCompany } from '@/types/database'

type OverlayState =
  | { type: 'none' }
  | { type: 'editTask'; task: Task }

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

  const completedCount = tasks.filter((t) => t.task.is_completed).length

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <DailyHeader />
        <ProgressDonut completed={completedCount} total={tasks.length} />
      </div>

      {loading ? (
        <p className="text-muted-foreground">Laden...</p>
      ) : (
        <TodayTaskList tasks={tasks} onTaskClick={onTaskClick} />
      )}

      <TodayMeetings meetings={meetings} loading={meetingsLoading} />

      <TaskEditDialog
        task={overlay.type === 'editTask' ? overlay.task : null}
        onClose={onCloseOverlay}
        onSaved={refreshData}
      />
    </div>
  )
}
