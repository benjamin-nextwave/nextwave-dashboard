'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Company, OnboardingTask } from '@/types/database'

type Props = {
  company: Company
  onBack: () => void
}

export function OnboardingDetail({ company, onBack }: Props) {
  const [tasks, setTasks] = useState<OnboardingTask[]>([])
  const [loading, setLoading] = useState(true)
  const [debugInfo, setDebugInfo] = useState('Initialiseren...')

  useEffect(() => {
    const load = async () => {
      try {
        const { fetchOnboardingTasks, initializeOnboarding } = await import('@/lib/onboarding')
        setDebugInfo('Taken ophalen...')
        let data = await fetchOnboardingTasks(company.id)
        if (data.length === 0) {
          setDebugInfo('Geen taken gevonden, initialiseren...')
          data = await initializeOnboarding(company.id)
        }
        setDebugInfo(`${data.length} taken geladen. Eerste: ${JSON.stringify(data[0]).substring(0, 200)}`)
        setTasks(data)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        setDebugInfo(`FOUT: ${msg}`)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [company.id])

  return (
    <div className="space-y-6 p-6">
      <button onClick={onBack} className="text-lg text-muted-foreground hover:text-foreground transition-colors">
        Terug
      </button>
      <h2 className="text-3xl font-bold">{String(company.name || '')}</h2>
      <p className="text-lg">Status: {loading ? 'Laden...' : 'Geladen'}</p>
      <p className="text-sm text-muted-foreground break-all">{String(debugInfo)}</p>
      <p className="text-lg">Aantal taken: {String(tasks.length)}</p>
      {!loading && tasks.length > 0 && (
        <div className="space-y-2">
          {tasks.map((t) => (
            <div key={String(t.id)} className="p-4 border rounded-xl">
              <p className="font-semibold">
                {String(t.task_number)} - {String(t.task_type)} ({String(t.status)})
              </p>
              <p className="text-sm text-muted-foreground">
                Iteration: {String(t.iteration)} | Links: {String(Array.isArray(t.links) ? t.links.length : 'N/A')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
