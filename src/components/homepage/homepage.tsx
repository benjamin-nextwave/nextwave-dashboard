'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Plus, Sword } from 'lucide-react'
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
import { TaskFilters, isWarmupTask } from '@/components/homepage/task-filters'
import { TodayTaskList } from '@/components/homepage/today-task-list'
import { TodayMeetings } from '@/components/homepage/today-meetings'
import { MailTaskBox } from '@/components/homepage/mail-task-box'
import { HomepageTaskCreateDialog } from '@/components/homepage/task-create-dialog'
import { TaskEditDialog } from '@/components/gantt/task-edit-dialog'
import { useRecurringTasks } from '@/hooks/use-recurring-tasks'
import { updateTask } from '@/lib/tasks'
import { completeMailTask } from '@/lib/mail-tasks'
import { NuNuOverlay, type NuNuItem } from '@/components/homepage/nu-nu-overlay'
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
  const [companyFilter, setCompanyFilter] = useState('')
  const [warmupOnly, setWarmupOnly] = useState(false)
  const [nuNuItems, setNuNuItems] = useState<NuNuItem[]>([])
  const [nuNuOpen, setNuNuOpen] = useState(false)
  const [mailRefreshTrigger, setMailRefreshTrigger] = useState(0)

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

  const onComplete = useCallback(async (taskId: string) => {
    try {
      await updateTask(taskId, { is_completed: true })
      setTasks((prev) =>
        prev.map((t) =>
          t.task.id === taskId
            ? { ...t, task: { ...t.task, is_completed: true } }
            : t
        )
      )
    } catch (error) {
      console.error('Failed to complete task:', error)
    }
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

  const onAddTaskToNuNu = useCallback((taskId: string) => {
    const todayTask = tasks.find((t) => t.task.id === taskId)
    if (!todayTask) return
    setNuNuItems((prev) => {
      if (prev.some((item) => item.type === 'task' && item.id === taskId)) return prev
      return [...prev, { type: 'task', id: taskId, companyName: todayTask.companyName, title: todayTask.task.title }]
    })
  }, [tasks])

  const onAddMailToNuNu = useCallback((taskId: string, companyName: string) => {
    setNuNuItems((prev) => {
      if (prev.some((item) => item.type === 'mail' && item.id === taskId)) return prev
      return [...prev, { type: 'mail', id: taskId, companyName }]
    })
  }, [])

  const onNuNuComplete = useCallback(async (item: NuNuItem) => {
    if (item.type === 'task') {
      await onComplete(item.id)
    } else {
      try {
        await completeMailTask(item.id, today)
        setMailRefreshTrigger((n) => n + 1)
      } catch (error) {
        console.error('Failed to complete mail task:', error)
      }
    }
    setNuNuItems((prev) => prev.filter((i) => !(i.type === item.type && i.id === item.id)))
  }, [onComplete, today])

  const onNuNuRemove = useCallback((item: NuNuItem) => {
    setNuNuItems((prev) => prev.filter((i) => !(i.type === item.type && i.id === item.id)))
  }, [])

  const onNuNuClearAll = useCallback(() => {
    setNuNuItems([])
  }, [])

  const nuNuTaskIds = useMemo(() => new Set(nuNuItems.filter((i) => i.type === 'task').map((i) => i.id)), [nuNuItems])
  const nuNuMailIds = useMemo(() => new Set(nuNuItems.filter((i) => i.type === 'mail').map((i) => i.id)), [nuNuItems])

  const importantTasks = tasks.filter((t) => !t.task.is_not_important)
  const completedCount = importantTasks.filter((t) => t.task.is_completed).length
  const allCompleted = importantTasks.length > 0 && completedCount === importantTasks.length

  const filteredTasks = tasks.filter((t) => {
    if (companyFilter && t.task.company_id !== companyFilter) return false
    if (warmupOnly && !isWarmupTask(t.task.title)) return false
    return true
  })

  const totalMinutesRemaining = importantTasks
    .filter((t) => !t.task.is_completed)
    .reduce((sum, t) => sum + (t.task.duration_minutes ?? 0), 0)

  const hasActiveFilter = companyFilter !== '' || warmupOnly

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <DailyHeader totalMinutesRemaining={totalMinutesRemaining} />
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setNuNuOpen(true)}
            className="relative"
            style={{
              borderColor: 'rgba(139,109,56,0.4)',
              color: '#8b6d38',
              fontFamily: 'var(--font-medieval)',
            }}
          >
            <Sword className="size-4" />
            Nu Nu
            {nuNuItems.length > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 size-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                style={{ background: '#8b2020' }}
              >
                {nuNuItems.length}
              </span>
            )}
          </Button>
          <Button onClick={() => setOverlay({ type: 'createTask' })}>
            <Plus className="size-4" />
            Nieuwe taak
          </Button>
          {allCompleted ? (
            <Link
              href="/ontspanning"
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium shadow-lg animate-pulse hover:shadow-xl hover:scale-105 transition-all"
              style={{
                background: 'linear-gradient(135deg, #8b6d38, #d4af37, #8b6d38)',
                color: '#2a1f0e',
                border: '1px solid rgba(212,175,55,0.5)',
                fontFamily: 'var(--font-medieval)',
              }}
            >
              👑 De veldslag is gewonnen!
            </Link>
          ) : (
            <ProgressDonut completed={completedCount} total={importantTasks.length} />
          )}
        </div>
      </div>

      <MailTaskBox
        today={today}
        onAddToNuNu={onAddMailToNuNu}
        nuNuMailIds={nuNuMailIds}
        refreshTrigger={mailRefreshTrigger}
      />

      <div className="medieval-divider"><span className="text-sm select-none">⚔️</span></div>

      <PriorityAlerts />

      <TodayMeetings meetings={meetings} loading={meetingsLoading} />

      <div className="medieval-divider"><span className="text-sm select-none">🛡️</span></div>

      {!loading && tasks.length > 0 && (
        <TaskFilters
          tasks={tasks}
          companyFilter={companyFilter}
          warmupOnly={warmupOnly}
          onCompanyFilterChange={setCompanyFilter}
          onWarmupOnlyChange={setWarmupOnly}
          onClearFilters={() => { setCompanyFilter(''); setWarmupOnly(false) }}
        />
      )}

      {loading ? (
        <p className="text-muted-foreground">Laden...</p>
      ) : (
        <TodayTaskList
          tasks={hasActiveFilter ? filteredTasks : tasks}
          onTaskClick={onTaskClick}
          onComplete={onComplete}
          onMarkNotImportant={onMarkNotImportant}
          onAddToNuNu={onAddTaskToNuNu}
          nuNuTaskIds={nuNuTaskIds}
        />
      )}

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

      <NuNuOverlay
        open={nuNuOpen}
        onClose={() => setNuNuOpen(false)}
        items={nuNuItems}
        onComplete={onNuNuComplete}
        onRemove={onNuNuRemove}
        onClearAll={onNuNuClearAll}
      />
    </div>
  )
}
