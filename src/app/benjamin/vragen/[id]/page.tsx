'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { QuestionWithCompany } from '@/types/database'

export default function BenjaminVraagDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [question, setQuestion] = useState<QuestionWithCompany | null>(null)
  const [loading, setLoading] = useState(true)
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadQuestion()
  }, [id])

  async function loadQuestion() {
    const { data, error: fetchError } = await supabase
      .from('questions')
      .select('*, companies!inner(name)')
      .eq('id', id)
      .single()

    if (fetchError || !data) {
      console.error('Error loading question:', fetchError)
      setLoading(false)
      return
    }

    const q = {
      ...data,
      company_name: (data.companies as { name: string })?.name ?? 'Onbekend',
      companies: undefined,
    } as QuestionWithCompany

    setQuestion(q)
    if (q.answer) setAnswer(q.answer)
    setLoading(false)
  }

  async function handleSubmitAnswer(e: React.FormEvent) {
    e.preventDefault()
    if (!answer.trim()) return

    setSubmitting(true)
    setError('')

    const { error: updateError } = await supabase
      .from('questions')
      .update({
        answer: answer.trim(),
        status: 'answered',
        answered_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      setError('Fout bij het opslaan van het antwoord')
      setSubmitting(false)
      return
    }

    router.push('/benjamin/vragen')
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return <p className="text-muted-foreground">Laden...</p>
  }

  if (!question) {
    return <p className="text-muted-foreground">Vraag niet gevonden.</p>
  }

  return (
    <div className="max-w-2xl">
      {/* Back link */}
      <button
        onClick={() => router.push('/benjamin/vragen')}
        className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1"
      >
        &larr; Terug naar vragen
      </button>

      {/* Question */}
      <div className="p-6 rounded-lg border border-border bg-card">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">{question.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {question.company_name} &middot; {formatDate(question.created_at)}
            </p>
          </div>
          <span
            className={`shrink-0 px-2 py-0.5 text-xs font-medium rounded-full ${
              question.status === 'open'
                ? 'bg-amber-500/10 text-amber-500'
                : 'bg-green-500/10 text-green-500'
            }`}
          >
            {question.status === 'open' ? 'Open' : 'Beantwoord'}
          </span>
        </div>

        {question.body && (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-foreground whitespace-pre-wrap">{question.body}</p>
          </div>
        )}
      </div>

      {/* Answer form */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">
          {question.status === 'answered' ? 'Jouw antwoord' : 'Antwoord geven'}
        </h3>

        <form onSubmit={handleSubmitAnswer}>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Typ je antwoord hier..."
            rows={6}
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-y"
            disabled={submitting}
          />

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <div className="flex gap-2 mt-3">
            <button
              type="submit"
              disabled={submitting || !answer.trim()}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {submitting ? 'Versturen...' : question.status === 'answered' ? 'Antwoord bijwerken' : 'Verstuur antwoord'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
