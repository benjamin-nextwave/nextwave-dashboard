'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Company, OnboardingTask } from '@/types/database'
import {
  fetchOnboardingTasks,
  initializeOnboarding,
  completeTask,
  updateTaskLinks,
  getTaskLabel,
} from '@/lib/onboarding'
import { OnboardingCompleted } from './onboarding-completed'
import { TaskBlock } from './task-block'

type Props = {
  company: Company
  onBack: () => void
}

export function OnboardingDetail({ company, onBack }: Props) {
  const [tasks, setTasks] = useState<OnboardingTask[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  const loadTasks = useCallback(async () => {
    try {
      let data = await fetchOnboardingTasks(company.id)
      if (data.length === 0) {
        data = await initializeOnboarding(company.id)
      }
      setTasks(data)
    } catch (err) {
      console.error('Failed to load onboarding tasks:', err)
    } finally {
      setLoading(false)
    }
  }, [company.id])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  // Build the visual flow: completed tasks, then active, then locked
  // For feedback loops, insert the iterations in order
  const buildTaskFlow = useCallback((): OnboardingTask[] => {
    const flow: OnboardingTask[] = []
    const tasksByNumber = new Map<number, OnboardingTask[]>()

    for (const task of tasks) {
      const num = task.task_number
      if (!tasksByNumber.has(num)) {
        tasksByNumber.set(num, [])
      }
      tasksByNumber.get(num)!.push(task)
    }

    // Process tasks 1-10 in order, inserting all iterations
    for (let num = 1; num <= 10; num++) {
      const taskGroup = tasksByNumber.get(num) || []
      // Sort by iteration
      taskGroup.sort((a, b) => a.iteration - b.iteration)
      flow.push(...taskGroup)
    }

    return flow
  }, [tasks])

  const handleComplete = useCallback(
    async (task: OnboardingTask, choice?: 'approved' | 'feedback' | 'rlm' | 'no-rlm') => {
      await completeTask(task, tasks, company.id, choice)
      await loadTasks()

      // Scroll to active task after animation
      setTimeout(() => {
        if (scrollRef.current) {
          const activeEl = scrollRef.current.querySelector('[data-active="true"]')
          if (activeEl) {
            activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
          }
        }
      }, 300)
    },
    [tasks, company.id, loadTasks]
  )

  const handleUpdateLinks = useCallback(
    async (taskId: string, links: { label: string; url: string }[]) => {
      await updateTaskLinks(taskId, links)
      await loadTasks()
    },
    [loadTasks]
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <button onClick={onBack} className="text-lg text-muted-foreground hover:text-foreground transition-colors">
          &larr; Terug naar overzicht
        </button>
        <p className="text-lg text-muted-foreground">Laden...</p>
      </div>
    )
  }

  // If onboarding is completed, show summary view
  if (company.onboarding_completed) {
    return <OnboardingCompleted company={company} tasks={tasks} onBack={onBack} />
  }

  const flow = buildTaskFlow()
  const activeIndex = flow.findIndex((t) => t.status === 'active')

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-lg text-muted-foreground hover:text-foreground transition-colors">
        &larr; Terug naar overzicht
      </button>

      <h2 className="text-3xl font-bold">{company.name}</h2>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Voortgang</span>
          <span>{flow.filter((t) => t.status === 'completed').length} / {flow.length} taken</span>
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-500"
            style={{ width: `${flow.length > 0 ? (flow.filter((t) => t.status === 'completed').length / flow.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Horizontal task flow */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory"
        style={{ scrollBehavior: 'smooth' }}
      >
        {flow.map((task, index) => {
          // Determine visibility relative to active task
          let visibility: 'full' | 'dimmed' | 'faded' | 'completed' = 'faded'
          if (task.status === 'completed') {
            visibility = 'completed'
          } else if (task.status === 'active') {
            visibility = 'full'
          } else if (activeIndex >= 0) {
            const distance = index - activeIndex
            if (distance === 1) visibility = 'dimmed'
            else if (distance === 2) visibility = 'faded'
          }

          return (
            <TaskBlock
              key={task.id}
              task={task}
              visibility={visibility}
              onComplete={handleComplete}
              onUpdateLinks={handleUpdateLinks}
            />
          )
        })}
      </div>
    </div>
  )
}
