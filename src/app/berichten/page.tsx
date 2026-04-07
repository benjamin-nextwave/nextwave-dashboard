'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Company, SentMessage } from '@/types/database'

type Tab = 'stuur' | 'verzonden'

export default function BerichtenPage() {
  const [tab, setTab] = useState<Tab>('stuur')
  const [companies, setCompanies] = useState<Company[]>([])
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([])
  const [loadingSent, setLoadingSent] = useState(false)

  // Form state
  const [type, setType] = useState<'task' | 'question'>('task')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [companyId, setCompanyId] = useState('')
  const [sending, setSending] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    supabase
      .from('companies')
      .select('id, name')
      .order('name')
      .then(({ data }) => {
        if (data) setCompanies(data as Company[])
      })
  }, [])

  const loadSentMessages = useCallback(async () => {
    setLoadingSent(true)
    const { data } = await supabase
      .from('sent_messages')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setSentMessages(data as SentMessage[])
    setLoadingSent(false)
  }, [])

  useEffect(() => {
    if (tab === 'verzonden') loadSentMessages()
  }, [tab, loadSentMessages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    setSending(true)
    setFeedback(null)

    const selectedCompany = companies.find((c) => c.id === companyId)

    try {
      const response = await fetch(
        'https://nextwave-ddashboard-backend-production.up.railway.app/api/incoming',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-benjamin-secret': process.env.NEXT_PUBLIC_BENJAMIN_SECRET || '',
          },
          body: JSON.stringify({
            type: type,
            title: title.trim(),
            body: body.trim() || undefined,
            company_id: companyId || undefined,
            company_name: selectedCompany?.name || undefined,
          }),
        }
      )

      if (!response.ok) throw new Error('Request failed')

      // Save to sent_messages
      await supabase.from('sent_messages').insert({
        type,
        title: title.trim(),
        body: body.trim() || null,
        company_name: selectedCompany?.name || null,
      })

      setFeedback({ type: 'success', message: 'Bericht ontvangen door Merlijn' })
      setTitle('')
      setBody('')
      setCompanyId('')
      setType('task')
    } catch {
      setFeedback({ type: 'error', message: 'Versturen mislukt — probeer opnieuw' })
    } finally {
      setSending(false)
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <main className="p-6 max-w-2xl">
      <h1
        className="text-2xl font-bold mb-6"
        style={{ fontFamily: 'var(--font-medieval)', color: '#4a3a20' }}
      >
        Berichten aan Merlijn
      </h1>

      {/* Tabs */}
      <div className="flex gap-1 rounded-md border border-border p-0.5 mb-6 w-fit">
        {([['stuur', 'Stuur bericht'], ['verzonden', 'Verzonden']] as const).map(([key, label]) => (
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

      {tab === 'stuur' ? (
        <form onSubmit={handleSend} className="space-y-4">
          {/* Type */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'task' | 'question')}
              className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="task">Taak</option>
              <option value="question">Vraag</option>
            </select>
          </div>

          {/* Titel */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Titel</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Titel van je bericht"
              required
            />
          </div>

          {/* Beschrijving */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Beschrijving (optioneel)</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
              placeholder="Extra context of details..."
            />
          </div>

          {/* Bedrijf */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Bedrijf (optioneel)</label>
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">— Geen bedrijf —</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              className={`px-4 py-3 rounded-md text-sm font-medium ${
                feedback.type === 'success'
                  ? 'bg-green-500/10 text-green-600'
                  : 'bg-red-500/10 text-red-600'
              }`}
            >
              {feedback.message}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={sending || !title.trim()}
            className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {sending ? 'Versturen...' : 'Verstuur'}
          </button>
        </form>
      ) : (
        <div>
          {loadingSent ? (
            <p className="text-muted-foreground">Laden...</p>
          ) : sentMessages.length === 0 ? (
            <p className="text-muted-foreground">Nog geen berichten verzonden.</p>
          ) : (
            <div className="space-y-2">
              {sentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-4 rounded-lg border border-border bg-card"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        msg.type === 'task'
                          ? 'bg-blue-500/10 text-blue-500'
                          : 'bg-amber-500/10 text-amber-500'
                      }`}
                    >
                      {msg.type === 'task' ? 'Taak' : 'Vraag'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(msg.created_at)}
                    </span>
                  </div>
                  <h3 className="font-medium text-foreground">{msg.title}</h3>
                  {msg.company_name && (
                    <p className="text-sm text-muted-foreground">{msg.company_name}</p>
                  )}
                  {msg.body && (
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{msg.body}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  )
}
