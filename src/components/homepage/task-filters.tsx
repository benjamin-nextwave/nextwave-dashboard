'use client'

import { useMemo } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DEFAULT_TASKS } from '@/lib/default-tasks'
import type { TodayTask } from '@/lib/homepage'

const WARMUP_TITLES = new Set(DEFAULT_TASKS.map((t) => t.title))

export function isWarmupTask(title: string): boolean {
  return WARMUP_TITLES.has(title)
}

interface TaskFiltersProps {
  tasks: TodayTask[]
  companyFilter: string
  warmupOnly: boolean
  onCompanyFilterChange: (companyId: string) => void
  onWarmupOnlyChange: (warmupOnly: boolean) => void
  onClearFilters: () => void
}

export function TaskFilters({
  tasks,
  companyFilter,
  warmupOnly,
  onCompanyFilterChange,
  onWarmupOnlyChange,
  onClearFilters,
}: TaskFiltersProps) {
  const companies = useMemo(() => {
    const map = new Map<string, string>()
    for (const t of tasks) {
      map.set(t.task.company_id, t.companyName)
    }
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, 'nl'))
  }, [tasks])

  const hasActiveFilter = companyFilter !== '' || warmupOnly

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={companyFilter}
        onChange={(e) => onCompanyFilterChange(e.target.value)}
        className="h-8 rounded-md border border-input bg-background text-foreground px-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <option value="">Alle bedrijven</option>
        {companies.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <Button
        variant={warmupOnly ? 'default' : 'outline'}
        size="sm"
        className="h-8 text-xs"
        onClick={() => onWarmupOnlyChange(!warmupOnly)}
      >
        Warmup taken
      </Button>

      {hasActiveFilter && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-muted-foreground"
          onClick={onClearFilters}
        >
          <X className="size-3" />
          Filters wissen
        </Button>
      )}
    </div>
  )
}
