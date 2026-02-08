'use client'

import { useEffect, useState } from 'react'
import { differenceInCalendarDays, addDays, parseISO } from 'date-fns'
import { CheckCircle2, Circle } from 'lucide-react'
import type { Company, Task } from '@/types/database'
import { getTasksByCompanyId } from '@/lib/tasks'

interface SectionWarmupProgressProps {
  company: Company
}

export function SectionWarmupProgress({ company }: SectionWarmupProgressProps) {
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    if (!company.warmup_start_date) return
    getTasksByCompanyId(company.id).then(setTasks)
  }, [company.id, company.warmup_start_date])

  if (!company.warmup_start_date) {
    return null
  }

  const warmupStart = parseISO(company.warmup_start_date)
  const today = new Date()
  const currentDay = differenceInCalendarDays(today, warmupStart) + 1
  const warmupEnd = addDays(warmupStart, 13) // 14 days total (day 0-13)

  // Filter tasks within warmup period
  const warmupTasks = tasks.filter((task) => {
    const deadline = parseISO(task.deadline)
    return deadline >= warmupStart && deadline <= warmupEnd
  })

  const renderStatus = () => {
    if (currentDay < 1) {
      const daysUntil = Math.abs(currentDay) + 1
      return (
        <p className="text-sm text-muted-foreground">
          Warmup begint over {daysUntil} {daysUntil === 1 ? 'dag' : 'dagen'}
        </p>
      )
    }
    if (currentDay > 14) {
      return (
        <p className="text-sm text-green-600 font-medium">
          Warmup afgerond
        </p>
      )
    }
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium">
          Dag {currentDay} van 14
        </p>
        <div className="h-2 w-full rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-primary transition-all"
            style={{ width: `${Math.min(100, (currentDay / 14) * 100)}%` }}
          />
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-lg font-semibold">Warmup Voortgang</h2>
      <div className="mt-4 space-y-4">
        {renderStatus()}

        {warmupTasks.length > 0 && (
          <ul className="space-y-2">
            {warmupTasks.map((task) => (
              <li key={task.id} className="flex items-center gap-2 text-sm">
                {task.is_completed ? (
                  <CheckCircle2 className="size-4 text-green-600 shrink-0" />
                ) : (
                  <Circle className="size-4 text-muted-foreground shrink-0" />
                )}
                <span className={task.is_completed ? 'line-through text-muted-foreground' : ''}>
                  {task.title}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {task.deadline}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
