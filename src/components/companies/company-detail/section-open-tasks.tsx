'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getTasksByCompanyId } from '@/lib/tasks'
import { formatShortDate } from '@/lib/dates'
import { QuickAddTaskDialog } from '@/components/companies/quick-add-task-dialog'
import { TaskEditDialog } from '@/components/shared/task-edit-dialog'
import type { Task } from '@/types/database'

interface Props {
  companyId: string
  companyName: string
  refreshToken?: number
  onChange?: () => void
}

export function SectionOpenTasks({
  companyId,
  companyName,
  refreshToken,
  onChange,
}: Props) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)

  const loadTasks = useCallback(async () => {
    try {
      const all = await getTasksByCompanyId(companyId)
      setTasks(all.filter((t) => !t.is_completed))
    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    loadTasks()
  }, [loadTasks, refreshToken])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Open taken</h3>
        <Button variant="ghost" size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="size-4" />
          Taak
        </Button>
      </div>

      {loading ? (
        <p className="text-xs text-muted-foreground">Laden...</p>
      ) : tasks.length === 0 ? (
        <p className="text-xs text-muted-foreground">Geen open taken</p>
      ) : (
        <div className="space-y-1.5">
          {tasks.map((task) => (
            <button
              key={task.id}
              type="button"
              onClick={() => setEditTask(task)}
              className="w-full text-left flex items-start gap-3 rounded-md border p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{task.title}</p>
                {task.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {task.description}
                  </p>
                )}
                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    Deadline: {formatShortDate(task.deadline)}
                  </Badge>
                  {task.is_urgent && (
                    <Badge variant="destructive" className="text-xs">
                      Urgent
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    Toegevoegd {formatShortDate(task.created_at)}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <QuickAddTaskDialog
        open={showAdd}
        companyId={companyId}
        companyName={companyName}
        onClose={() => setShowAdd(false)}
        onCreated={() => {
          loadTasks()
          onChange?.()
        }}
      />

      <TaskEditDialog
        task={editTask}
        onClose={() => setEditTask(null)}
        onSaved={() => {
          loadTasks()
          onChange?.()
        }}
      />
    </div>
  )
}
