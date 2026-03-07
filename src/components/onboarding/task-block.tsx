'use client'

import { useState } from 'react'
import type { OnboardingTask } from '@/types/database'
import { getTaskLabel } from '@/lib/onboarding'
import { cn } from '@/lib/utils'

type Props = {
  task: OnboardingTask
  visibility: 'full' | 'dimmed' | 'faded' | 'completed'
  onComplete: (task: OnboardingTask, choice?: 'approved' | 'feedback' | 'rlm' | 'no-rlm') => Promise<void>
  onUpdateLinks: (taskId: string, links: { label: string; url: string }[]) => Promise<void>
}

const CHOICE_TASKS = [4, 6, 9] // Goedgekeurd / Feedback
const RLM_CHOICE_TASK = 7 // RLM / Geen RLM

export function TaskBlock({ task, visibility, onComplete, onUpdateLinks }: Props) {
  const [newLabel, setNewLabel] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [saving, setSaving] = useState(false)

  const isActive = task.status === 'active'
  const isChoiceTask = CHOICE_TASKS.includes(task.task_number)
  const isRlmChoice = task.task_number === RLM_CHOICE_TASK

  const handleAddLink = async () => {
    if (!newLabel.trim() || !newUrl.trim()) return
    const updatedLinks = [...(task.links || []), { label: newLabel.trim(), url: newUrl.trim() }]
    await onUpdateLinks(task.id, updatedLinks)
    setNewLabel('')
    setNewUrl('')
  }

  const handleRemoveLink = async (index: number) => {
    const updatedLinks = (task.links || []).filter((_, i) => i !== index)
    await onUpdateLinks(task.id, updatedLinks)
  }

  const handleAction = async (choice?: 'approved' | 'feedback' | 'rlm' | 'no-rlm') => {
    setSaving(true)
    try {
      await onComplete(task, choice)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      data-active={isActive}
      className={cn(
        'flex-shrink-0 w-[400px] rounded-2xl border-2 p-6 snap-center transition-all duration-500 overflow-hidden',
        visibility === 'full' && 'border-blue-400 bg-card shadow-xl scale-100 opacity-100',
        visibility === 'completed' && 'border-green-300 bg-green-50/50 dark:bg-green-950/20 scale-95 opacity-80',
        visibility === 'dimmed' && 'border-muted bg-muted/30 scale-95 opacity-50 pointer-events-none',
        visibility === 'faded' && 'border-muted bg-muted/10 scale-90 opacity-25 pointer-events-none',
      )}
    >
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl font-bold text-muted-foreground">
            {task.task_number}
          </span>
          <StatusBadge status={task.status} />
        </div>
        <h3 className="text-xl font-semibold leading-tight">
          {getTaskLabel(task)}
        </h3>
      </div>

      {/* Links */}
      <div className="space-y-2 mb-4">
        {(Array.isArray(task.links) ? task.links : []).map((link, i) => (
          <div key={i} className="flex items-center gap-2">
            <a
              href={String(link.url || '')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline text-lg truncate"
            >
              {String(link.label || '')}
            </a>
            {isActive && (
              <button
                onClick={() => handleRemoveLink(i)}
                className="text-red-400 hover:text-red-600 text-sm flex-shrink-0"
              >
                &times;
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add link form - only for active tasks */}
      {isActive && (
        <div className="space-y-2 mb-6">
          <input
            type="text"
            placeholder="Label"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
          />
          <input
            type="url"
            placeholder="URL"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
          />
          <button
            onClick={handleAddLink}
            disabled={!newLabel.trim() || !newUrl.trim()}
            className="w-full rounded-lg border border-dashed border-muted-foreground/30 py-2 text-sm text-muted-foreground hover:border-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            + Link toevoegen
          </button>
        </div>
      )}

      {/* Action buttons - only for active tasks */}
      {isActive && !saving && (
        <div className="space-y-2">
          {isChoiceTask ? (
            <>
              <button
                onClick={() => handleAction('approved')}
                className="w-full rounded-xl bg-green-600 py-3 text-lg font-semibold text-white hover:bg-green-700 transition-colors"
              >
                Goedgekeurd
              </button>
              <button
                onClick={() => handleAction('feedback')}
                className="w-full rounded-xl bg-orange-500 py-3 text-lg font-semibold text-white hover:bg-orange-600 transition-colors"
              >
                Feedback ontvangen
              </button>
            </>
          ) : isRlmChoice ? (
            <>
              <button
                onClick={() => handleAction('rlm')}
                className="w-full rounded-xl bg-blue-600 py-3 text-lg font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                RLM maken
              </button>
              <button
                onClick={() => handleAction('no-rlm')}
                className="w-full rounded-xl bg-gray-500 py-3 text-lg font-semibold text-white hover:bg-gray-600 transition-colors"
              >
                Geen RLM
              </button>
            </>
          ) : (
            <button
              onClick={() => handleAction()}
              className="w-full rounded-xl bg-green-600 py-3 text-lg font-semibold text-white hover:bg-green-700 transition-colors"
            >
              Markeer als afgerond
            </button>
          )}
        </div>
      )}

      {saving && (
        <p className="text-center text-muted-foreground py-3">Opslaan...</p>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: OnboardingTask['status'] }) {
  return (
    <span
      className={cn(
        'inline-block rounded-full px-3 py-1 text-sm font-medium',
        status === 'active' && 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        status === 'completed' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        status === 'locked' && 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
      )}
    >
      {status === 'active' ? 'Actief' : status === 'completed' ? 'Afgerond' : 'Vergrendeld'}
    </span>
  )
}
