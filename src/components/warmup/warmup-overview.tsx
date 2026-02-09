'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  differenceInCalendarDays,
  parseISO,
  addDays,
  format,
} from 'date-fns'
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react'
import { useToday } from '@/lib/today-provider'
import { getCompaniesWithTasks } from '@/lib/companies'
import { cn } from '@/lib/utils'
import type { CompanyWithTasks, Task } from '@/types/database'

type SortOption = 'go-live' | 'name' | 'progress'

function getWarmupDay(warmupStart: string, today: string): number {
  return differenceInCalendarDays(parseISO(today), parseISO(warmupStart)) + 1
}

function getGoLiveCounter(goLiveDate: string | null, today: string): number | null {
  if (!goLiveDate) return null
  return differenceInCalendarDays(parseISO(goLiveDate), parseISO(today))
}

function getWarmupTasks(company: CompanyWithTasks): Task[] {
  if (!company.warmup_start_date) return []
  const warmupStart = parseISO(company.warmup_start_date)
  const warmupEnd = addDays(warmupStart, 13)
  return company.tasks.filter((task) => {
    const deadline = parseISO(task.deadline)
    return deadline >= warmupStart && deadline <= warmupEnd
  })
}

function getTaskDayIndex(task: Task, warmupStart: string): number {
  return differenceInCalendarDays(parseISO(task.deadline), parseISO(warmupStart))
}

export function WarmupOverview() {
  const today = useToday()
  const [companies, setCompanies] = useState<CompanyWithTasks[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<SortOption>('go-live')
  const [hideCompleted, setHideCompleted] = useState(false)

  const loadCompanies = useCallback(async () => {
    const data = await getCompaniesWithTasks()
    setCompanies(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadCompanies()
  }, [loadCompanies])

  function toggleExpanded(companyId: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(companyId)) {
        next.delete(companyId)
      } else {
        next.add(companyId)
      }
      return next
    })
  }

  // Filter to companies with warmup periods
  const warmupCompanies = companies.filter((c) => {
    if (!c.warmup_start_date) return false
    if (hideCompleted) {
      const warmupDay = getWarmupDay(c.warmup_start_date, today)
      if (warmupDay > 14) return false
    }
    return true
  })

  // Sort companies
  const sortedCompanies = [...warmupCompanies].sort((a, b) => {
    switch (sortBy) {
      case 'go-live': {
        const aCounter = getGoLiveCounter(a.go_live_date, today)
        const bCounter = getGoLiveCounter(b.go_live_date, today)
        if (aCounter === null && bCounter === null) return a.name.localeCompare(b.name, 'nl')
        if (aCounter === null) return 1
        if (bCounter === null) return -1
        return aCounter - bCounter
      }
      case 'progress': {
        const aDay = a.warmup_start_date ? getWarmupDay(a.warmup_start_date, today) : 0
        const bDay = b.warmup_start_date ? getWarmupDay(b.warmup_start_date, today) : 0
        return bDay - aDay
      }
      case 'name':
      default:
        return a.name.localeCompare(b.name, 'nl')
    }
  })

  if (loading) {
    return <p className="text-muted-foreground">Laden...</p>
  }

  if (sortedCompanies.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Warmup Overzicht</h1>
        <p className="text-muted-foreground text-sm">
          Geen bedrijven met warmup periodes gevonden.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">Warmup Overzicht</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setHideCompleted(!hideCompleted)}
            className={cn(
              'h-8 rounded-md border px-3 text-xs transition-colors',
              hideCompleted
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-foreground border-input hover:bg-muted'
            )}
          >
            Afgeronde verbergen
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="h-8 rounded-md border border-input bg-background text-foreground px-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="go-live">Sorteer op go-live</option>
            <option value="progress">Sorteer op voortgang</option>
            <option value="name">Sorteer op naam</option>
          </select>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-blue-500/70" /> Verlopen dagen
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-blue-500 ring-2 ring-blue-600" /> Vandaag
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-blue-100 dark:bg-blue-900/40" /> Toekomstige dagen
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle2 className="size-3 text-green-600" /> Taak klaar
        </span>
        <span className="flex items-center gap-1">
          <Circle className="size-3 text-orange-500" /> Taak open
        </span>
      </div>

      {/* Timeline grid */}
      <div className="border rounded-lg overflow-hidden">
        {/* Header row */}
        <div
          className="grid border-b bg-muted/30"
          style={{ gridTemplateColumns: '180px repeat(14, 1fr) 60px 80px' }}
        >
          <div className="p-2 font-medium text-sm flex items-center border-r">
            Bedrijf
          </div>
          {Array.from({ length: 14 }, (_, i) => (
            <div
              key={i}
              className="p-1 text-center text-xs font-medium text-muted-foreground border-r"
            >
              D{i + 1}
            </div>
          ))}
          <div className="p-1 text-center text-xs font-medium text-muted-foreground border-r">
            Taken
          </div>
          <div className="p-1 text-center text-xs font-medium text-muted-foreground">
            Go-live
          </div>
        </div>

        {/* Company rows */}
        {sortedCompanies.map((company) => (
          <CompanyRow
            key={company.id}
            company={company}
            today={today}
            isExpanded={expandedIds.has(company.id)}
            onToggle={() => toggleExpanded(company.id)}
          />
        ))}
      </div>

      {/* Summary stats */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>{sortedCompanies.length} bedrijven</span>
        <span>
          {sortedCompanies.filter((c) => {
            const day = c.warmup_start_date ? getWarmupDay(c.warmup_start_date, today) : 0
            return day >= 1 && day <= 14
          }).length}{' '}
          actief in warmup
        </span>
        <span>
          {sortedCompanies.filter((c) => {
            const counter = getGoLiveCounter(c.go_live_date, today)
            return counter !== null && counter >= 0 && counter <= 3
          }).length}{' '}
          binnenkort live
        </span>
      </div>
    </div>
  )
}

function CompanyRow({
  company,
  today,
  isExpanded,
  onToggle,
}: {
  company: CompanyWithTasks
  today: string
  isExpanded: boolean
  onToggle: () => void
}) {
  const warmupStart = company.warmup_start_date!
  const currentDay = getWarmupDay(warmupStart, today)
  const goLiveCounter = getGoLiveCounter(company.go_live_date, today)
  const warmupTasks = getWarmupTasks(company)
  const completedCount = warmupTasks.filter((t) => t.is_completed).length

  // Map tasks to their day index (0-13)
  const tasksByDay = new Map<number, Task[]>()
  for (const task of warmupTasks) {
    const dayIdx = getTaskDayIndex(task, warmupStart)
    if (dayIdx >= 0 && dayIdx < 14) {
      const existing = tasksByDay.get(dayIdx) ?? []
      existing.push(task)
      tasksByDay.set(dayIdx, existing)
    }
  }

  return (
    <>
      <div
        className="grid border-b hover:bg-muted/20 transition-colors"
        style={{ gridTemplateColumns: '180px repeat(14, 1fr) 60px 80px' }}
      >
        {/* Company name */}
        <button
          type="button"
          className="p-2 flex items-center gap-1 border-r text-left hover:bg-muted/40 transition-colors"
          onClick={onToggle}
        >
          {isExpanded ? (
            <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
          )}
          <span className="text-sm font-medium truncate">{company.name}</span>
        </button>

        {/* 14 day cells */}
        {Array.from({ length: 14 }, (_, i) => {
          const dayNum = i + 1
          const isToday = currentDay === dayNum
          const isPast = currentDay > dayNum
          const isFuture = currentDay < dayNum
          const notStarted = currentDay < 1
          const tasksOnDay = tasksByDay.get(i) ?? []
          const allDone = tasksOnDay.length > 0 && tasksOnDay.every((t) => t.is_completed)
          const hasOpen = tasksOnDay.some((t) => !t.is_completed)

          return (
            <div
              key={i}
              className={cn(
                'relative flex items-center justify-center border-r h-10',
                notStarted && 'bg-muted/10',
                isPast && 'bg-blue-500/20 dark:bg-blue-700/30',
                isToday && 'bg-blue-500/40 dark:bg-blue-600/50 ring-1 ring-inset ring-blue-500',
                isFuture && !notStarted && 'bg-blue-50 dark:bg-blue-950/20'
              )}
            >
              {tasksOnDay.length > 0 && (
                <div className="flex items-center gap-0.5">
                  {allDone ? (
                    <CheckCircle2 className="size-3.5 text-green-600" />
                  ) : hasOpen ? (
                    <Circle
                      className={cn(
                        'size-3.5',
                        isPast || isToday
                          ? 'text-orange-500'
                          : 'text-muted-foreground'
                      )}
                    />
                  ) : null}
                </div>
              )}
            </div>
          )
        })}

        {/* Task completion count */}
        <div className="flex items-center justify-center border-r text-xs">
          <span
            className={cn(
              'font-medium',
              completedCount === warmupTasks.length && warmupTasks.length > 0
                ? 'text-green-600'
                : 'text-muted-foreground'
            )}
          >
            {completedCount}/{warmupTasks.length}
          </span>
        </div>

        {/* Go-live counter */}
        <div className="flex items-center justify-center">
          {goLiveCounter !== null ? (
            <span
              className={cn(
                'text-sm font-bold tabular-nums',
                goLiveCounter > 3 && 'text-muted-foreground',
                goLiveCounter >= 1 && goLiveCounter <= 3 && 'text-orange-500',
                goLiveCounter === 0 && 'text-red-600',
                goLiveCounter < 0 && 'text-red-500'
              )}
            >
              {goLiveCounter > 0 && '+'}
              {goLiveCounter}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">-</span>
          )}
        </div>
      </div>

      {/* Expanded task list */}
      {isExpanded && (
        <div className="border-b bg-muted/10 px-4 py-3">
          <div className="ml-[180px] max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-semibold">Warmup taken</h3>
              {company.go_live_date && (
                <span className="text-xs text-muted-foreground">
                  Go-live: {format(parseISO(company.go_live_date), 'd MMM yyyy')}
                </span>
              )}
              {currentDay >= 1 && currentDay <= 14 && (
                <span className="text-xs text-muted-foreground">
                  Dag {currentDay} van 14
                </span>
              )}
              {currentDay > 14 && (
                <span className="text-xs text-green-600 font-medium">
                  Warmup afgerond
                </span>
              )}
              {currentDay < 1 && (
                <span className="text-xs text-muted-foreground">
                  Start over {Math.abs(currentDay - 1)} {Math.abs(currentDay - 1) === 1 ? 'dag' : 'dagen'}
                </span>
              )}
            </div>

            {/* Progress bar */}
            {currentDay >= 1 && (
              <div className="h-1.5 w-full rounded-full bg-muted mb-3">
                <div
                  className="h-1.5 rounded-full bg-blue-500 transition-all"
                  style={{ width: `${Math.min(100, (Math.max(0, currentDay) / 14) * 100)}%` }}
                />
              </div>
            )}

            {warmupTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">Geen warmup taken gevonden.</p>
            ) : (
              <ul className="space-y-1.5">
                {warmupTasks.map((task) => {
                  const taskDay = getTaskDayIndex(task, warmupStart) + 1
                  const isOverdue = !task.is_completed && currentDay > taskDay

                  return (
                    <li key={task.id} className="flex items-center gap-2 text-sm">
                      {task.is_completed ? (
                        <CheckCircle2 className="size-4 text-green-600 shrink-0" />
                      ) : isOverdue ? (
                        <AlertTriangle className="size-4 text-orange-500 shrink-0" />
                      ) : (
                        <Circle className="size-4 text-muted-foreground shrink-0" />
                      )}
                      <span
                        className={cn(
                          task.is_completed && 'line-through text-muted-foreground',
                          isOverdue && !task.is_completed && 'text-orange-600 dark:text-orange-400'
                        )}
                      >
                        {task.title}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto shrink-0">
                        Dag {taskDay}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  )
}
