'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Task } from '@/types/database'

type TaskWithCompany = Task & { company_name: string }

export default function BenjaminTakenPage() {
  const [tasks, setTasks] = useState<TaskWithCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'open' | 'done' | 'all'>('open')

  useEffect(() => {
    loadTasks()
  }, [filter])

  async function loadTasks() {
    setLoading(true)

    let query = supabase
      .from('tasks')
      .select('*, companies!inner(name)')
      .eq('assigned_to', 'benjamin')
      .order('deadline', { ascending: true })

    if (filter === 'open') {
      query = query.eq('is_completed', false)
    } else if (filter === 'done') {
      query = query.eq('is_completed', true)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error loading tasks:', error)
      setTasks([])
    } else {
      setTasks(
        (data || []).map((t: Record<string, unknown>) => ({
          ...t,
          company_name: (t.companies as { name: string })?.name ?? 'Onbekend',
          companies: undefined,
        })) as unknown as TaskWithCompany[]
      )
    }

    setLoading(false)
  }

  async function updateTaskStatus(taskId: string, completed: boolean) {
    const { error } = await supabase
      .from('tasks')
      .update({ is_completed: completed })
      .eq('id', taskId)

    if (!error) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, is_completed: completed } : t
        )
      )
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
    })
  }

  function isOverdue(deadline: string) {
    return new Date(deadline) < new Date(new Date().toDateString())
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Taken</h2>

        <div className="flex gap-1 rounded-md border border-border p-0.5">
          {(['open', 'done', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f === 'open' ? 'Open' : f === 'done' ? 'Afgerond' : 'Alles'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Laden...</p>
      ) : tasks.length === 0 ? (
        <p className="text-muted-foreground">
          {filter === 'open' ? 'Geen openstaande taken.' : 'Geen taken gevonden.'}
        </p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card"
            >
              <div className="flex-1 min-w-0">
                <h3 className={`font-medium ${task.is_completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {task.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {task.company_name}
                  {task.deadline && (
                    <>
                      {' '}&middot;{' '}
                      <span className={isOverdue(task.deadline) && !task.is_completed ? 'text-red-500' : ''}>
                        {formatDate(task.deadline)}
                        {isOverdue(task.deadline) && !task.is_completed && ' (te laat)'}
                      </span>
                    </>
                  )}
                </p>
                {task.description && (
                  <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {task.is_urgent && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-500/10 text-red-500">
                    Urgent
                  </span>
                )}

                {task.is_completed ? (
                  <button
                    onClick={() => updateTaskStatus(task.id, false)}
                    className="px-3 py-1.5 text-sm rounded-md border border-border text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Heropenen
                  </button>
                ) : (
                  <button
                    onClick={() => updateTaskStatus(task.id, true)}
                    className="px-3 py-1.5 text-sm rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
                  >
                    Afronden
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
