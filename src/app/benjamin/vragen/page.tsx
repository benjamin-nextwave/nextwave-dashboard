'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { QuestionWithCompany } from '@/types/database'

export default function BenjaminVragenPage() {
  const [questions, setQuestions] = useState<QuestionWithCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'open' | 'answered' | 'all'>('open')

  useEffect(() => {
    loadQuestions()
  }, [filter])

  async function loadQuestions() {
    setLoading(true)

    let query = supabase
      .from('questions')
      .select('*, companies!inner(name)')
      .order('created_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error loading questions:', error)
      setQuestions([])
    } else {
      setQuestions(
        (data || []).map((q: Record<string, unknown>) => ({
          ...q,
          company_name: (q.companies as { name: string })?.name ?? 'Onbekend',
          companies: undefined,
        })) as unknown as QuestionWithCompany[]
      )
    }

    setLoading(false)
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Vragen</h2>

        <div className="flex gap-1 rounded-md border border-border p-0.5">
          {(['open', 'answered', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f === 'open' ? 'Open' : f === 'answered' ? 'Beantwoord' : 'Alles'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Laden...</p>
      ) : questions.length === 0 ? (
        <p className="text-muted-foreground">
          {filter === 'open' ? 'Geen openstaande vragen.' : 'Geen vragen gevonden.'}
        </p>
      ) : (
        <div className="space-y-2">
          {questions.map((q) => (
            <Link
              key={q.id}
              href={`/benjamin/vragen/${q.id}`}
              className="block p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate">{q.title}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {q.company_name} &middot; {formatDate(q.created_at)}
                  </p>
                </div>
                <span
                  className={`shrink-0 px-2 py-0.5 text-xs font-medium rounded-full ${
                    q.status === 'open'
                      ? 'bg-amber-500/10 text-amber-500'
                      : 'bg-green-500/10 text-green-500'
                  }`}
                >
                  {q.status === 'open' ? 'Open' : 'Beantwoord'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
