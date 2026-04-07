'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { useToday } from '@/lib/today-provider'
import { getAllTasksWithCompany } from '@/lib/alle-taken'
import { updateTask, deleteTask } from '@/lib/tasks'
import { Button } from '@/components/ui/button'
import { HomepageTaskCreateDialog } from '@/components/homepage/task-create-dialog'
import { TaskEditDialog } from '@/components/shared/task-edit-dialog'
import { AlleTakenTaskRow } from '@/components/alle-taken/alle-taken-task-row'
import type { TaskWithCompany } from '@/lib/homepage'
import type { Task } from '@/types/database'

type OverlayState =
  | { type: 'none' }
  | { type: 'editTask'; task: Task }
  | { type: 'createTask' }

export function AlleTakenPage() {
  const today = useToday()
  const [tasks, setTasks] = useState<TaskWithCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [overlay, setOverlay] = useState<OverlayState>({ type: 'none' })

  const loadData = useCallback(async () => {
    try {
      const data = await getAllTasksWithCompany()
      setTasks(data)
    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const refreshData = useCallback(async () => {
    await loadData()
  }, [loadData])

  const onComplete = useCallback(async (taskId: string) => {
    try {
      await updateTask(taskId, { is_completed: true })
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
    } catch (error) {
      console.error('Failed to complete task:', error)
    }
  }, [])

  const onMarkNotImportant = useCallback(async (taskId: string) => {
    try {
      await updateTask(taskId, { is_not_important: true })
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, is_not_important: true } : t
        )
      )
    } catch (error) {
      console.error('Failed to mark task as not important:', error)
    }
  }, [])

  const onScheduleToday = useCallback(async (taskId: string) => {
    try {
      await updateTask(taskId, { scheduled_date: today })
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, scheduled_date: today } : t
        )
      )
    } catch (error) {
      console.error('Failed to schedule task:', error)
    }
  }, [today])

  const onDelete = useCallback(async (taskId: string) => {
    try {
      await deleteTask(taskId)
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }, [])

  const importantTasks = tasks.filter((t) => !t.is_not_important)
  const notImportantTasks = tasks.filter((t) => t.is_not_important)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1
          className="text-2xl font-bold"
          style={{ color: '#2a1f0e', fontFamily: 'var(--font-fraktur)' }}
        >
          📋 Alle taken
        </h1>
        <Button onClick={() => setOverlay({ type: 'createTask' })}>
          <Plus className="size-4" />
          Nieuwe taak
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Laden...</p>
      ) : importantTasks.length === 0 && notImportantTasks.length === 0 ? (
        <p
          className="text-center py-12"
          style={{ color: '#8b7d60', fontFamily: 'var(--font-medieval)' }}
        >
          Geen openstaande taken gevonden.
        </p>
      ) : (
        <>
          <div className="space-y-2">
            {importantTasks.map((task) => (
              <AlleTakenTaskRow
                key={task.id}
                task={task}
                onEdit={() => setOverlay({ type: 'editTask', task })}
                onComplete={() => onComplete(task.id)}
                onMarkNotImportant={() => onMarkNotImportant(task.id)}
                onScheduleToday={() => onScheduleToday(task.id)}
                onDelete={() => onDelete(task.id)}
                onTaskUpdated={refreshData}
              />
            ))}
          </div>

          {notImportantTasks.length > 0 && (
            <>
              <div className="medieval-divider">
                <span className="text-sm select-none">🛡️</span>
              </div>
              <div>
                <h2
                  className="text-sm font-medium mb-3"
                  style={{ color: '#8b7d60', fontFamily: 'var(--font-medieval)' }}
                >
                  Niet belangrijk ({notImportantTasks.length})
                </h2>
                <div
                  className="space-y-2 rounded-lg p-4"
                  style={{
                    border: '1px dashed rgba(139,109,56,0.3)',
                    background: 'rgba(139,109,56,0.04)',
                  }}
                >
                  {notImportantTasks.map((task) => (
                    <AlleTakenTaskRow
                      key={task.id}
                      task={task}
                      onEdit={() => setOverlay({ type: 'editTask', task })}
                      onComplete={() => onComplete(task.id)}
                      onScheduleToday={() => onScheduleToday(task.id)}
                      onDelete={() => onDelete(task.id)}
                      onTaskUpdated={refreshData}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}

      <TaskEditDialog
        task={overlay.type === 'editTask' ? overlay.task : null}
        onClose={() => setOverlay({ type: 'none' })}
        onSaved={refreshData}
      />

      <HomepageTaskCreateDialog
        open={overlay.type === 'createTask'}
        onClose={() => setOverlay({ type: 'none' })}
        onCreated={refreshData}
      />
    </div>
  )
}
