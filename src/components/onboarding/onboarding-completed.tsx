'use client'

import type { Company, OnboardingTask } from '@/types/database'
import { getTaskLabel } from '@/lib/onboarding'

type Props = {
  company: Company
  tasks: OnboardingTask[]
  onBack: () => void
}

export function OnboardingCompleted({ company, tasks, onBack }: Props) {
  // Show only completed tasks, sorted by task_number then iteration
  const completedTasks = tasks
    .filter((t) => t.status === 'completed')
    .sort((a, b) => a.task_number - b.task_number || a.iteration - b.iteration)

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-lg text-muted-foreground hover:text-foreground transition-colors">
        &larr; Terug naar overzicht
      </button>

      <div className="flex items-center gap-4">
        <h2 className="text-3xl font-bold">{company.name}</h2>
        <span className="rounded-full bg-green-200 px-4 py-1 text-lg font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
          Onboarding afgerond
        </span>
      </div>

      <div className="space-y-4">
        {completedTasks.map((task) => (
          <div
            key={task.id}
            className="rounded-xl border-2 border-green-200 bg-green-50/50 p-6 dark:bg-green-950/20 dark:border-green-800"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl font-bold text-muted-foreground">
                {task.task_number}
              </span>
              <h3 className="text-xl font-semibold">{getTaskLabel(task)}</h3>
            </div>

            {Array.isArray(task.links) && task.links.length > 0 && (
              <div className="mt-3 space-y-1">
                {task.links.map((link, i) => (
                  <a
                    key={i}
                    href={String(link.url || '')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-lg text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {String(link.label || '')}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
