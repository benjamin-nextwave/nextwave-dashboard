'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useToday } from '@/lib/today-provider'
import {
  getVandaagCheckenEntries,
  sortVandaagCheckenEntries,
  addCompanyToTodo,
  removeCompanyFromTodo,
  type VandaagCheckenEntry,
} from '@/lib/vandaag-checken'
import { formatDutchDateCapitalized } from '@/lib/dates'
import { VandaagCheckenOverzichtTab } from './vandaag-checken-overzicht-tab'
import { VandaagCheckenTodoTab } from './vandaag-checken-todo-tab'

type Tab = 'overzicht' | 'todo'

export function VandaagCheckenPage() {
  const today = useToday()
  const [entries, setEntries] = useState<VandaagCheckenEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('overzicht')

  const loadData = useCallback(async () => {
    try {
      const raw = await getVandaagCheckenEntries(today)
      setEntries(sortVandaagCheckenEntries(raw))
    } catch (error) {
      console.error('Failed to load vandaag checken:', error)
    } finally {
      setLoading(false)
    }
  }, [today])

  useEffect(() => {
    loadData()
  }, [loadData])

  const todoEntries = useMemo(
    () => entries.filter((e) => e.inTodoToday),
    [entries]
  )

  const handleAddToTodo = useCallback(
    async (companyId: string) => {
      try {
        await addCompanyToTodo(companyId, today)
        setEntries((prev) =>
          prev.map((e) =>
            e.company.id === companyId ? { ...e, inTodoToday: true } : e
          )
        )
      } catch (error) {
        console.error('Failed to add to todo:', error)
      }
    },
    [today]
  )

  const handleRemoveFromTodo = useCallback(async (companyId: string) => {
    try {
      await removeCompanyFromTodo(companyId)
      setEntries((prev) =>
        prev.map((e) =>
          e.company.id === companyId ? { ...e, inTodoToday: false } : e
        )
      )
    } catch (error) {
      console.error('Failed to remove from todo:', error)
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between flex-wrap gap-3">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: 'var(--font-fraktur)', color: '#4a3a20' }}
          >
            Vandaag checken
          </h1>
          <p
            className="text-sm mt-1 capitalize"
            style={{ color: '#8b7d60', fontFamily: 'var(--font-medieval)' }}
          >
            {formatDutchDateCapitalized(today)}
          </p>
        </div>
        <div className="text-sm" style={{ color: '#8b7d60' }}>
          {entries.length} {entries.length === 1 ? 'klant' : 'klanten'} in beeld
          {todoEntries.length > 0 && (
            <> · {todoEntries.length} in To do</>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-md border border-border p-0.5 w-fit">
        {([
          ['overzicht', `Overzicht (${entries.length})`],
          ['todo', `To do (${todoEntries.length})`],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-1.5 text-sm rounded transition-colors ${
              tab === key
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-muted-foreground">Laden...</p>
      ) : tab === 'overzicht' ? (
        <VandaagCheckenOverzichtTab
          entries={entries}
          onAddToTodo={handleAddToTodo}
          onRemoveFromTodo={handleRemoveFromTodo}
        />
      ) : (
        <VandaagCheckenTodoTab
          entries={todoEntries}
          onRemoveFromTodo={handleRemoveFromTodo}
          onRefresh={loadData}
        />
      )}
    </div>
  )
}
