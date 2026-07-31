'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

/**
 * De inlogpagina van het oude dashboard, tot in de kleuren nagebouwd.
 * Wie hier langskomt ziet een gewoon dashboard-login; het wachtwoordveld
 * neemt in werkelijkheid de pincode aan. Het e-mailveld doet niets en is
 * ook niet verplicht — dat scheelt typen zonder dat het opvalt.
 */
export function LegacyLogin({ frakturClassName }: { frakturClassName: string }) {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: password }),
      })
      if (response.ok) {
        router.replace(params.get('next') ?? '/')
        router.refresh()
        return
      }
      setError('Ongeldige inloggegevens')
    } catch {
      setError('Ongeldige inloggegevens')
    }
    setLoading(false)
  }

  return (
    <div className="parchment fixed inset-0 z-50 flex items-center justify-center overflow-auto p-4">
      <div
        className="w-full max-w-sm rounded-lg border p-8 shadow-lg"
        style={{
          background: 'oklch(0.95 0.025 75)',
          borderColor: 'oklch(0.82 0.04 65)',
          color: 'oklch(0.18 0.04 60)',
        }}
      >
        <div className="mb-8 text-center">
          <span className="text-4xl">⚔️</span>
          <h1 className={`mt-2 text-2xl font-bold ${frakturClassName}`}>NextWave</h1>
          <p className="mt-1 text-sm" style={{ color: 'oklch(0.50 0.04 60)' }}>
            Dashboard login
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              className="parchment-field w-full rounded-md border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Wachtwoord</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="parchment-field w-full rounded-md border px-3 py-2"
            />
          </div>

          {error && <p className="text-sm" style={{ color: 'oklch(0.55 0.22 25)' }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md px-4 py-2 font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: 'oklch(0.42 0.08 60)', color: 'oklch(0.95 0.02 75)' }}
          >
            {loading ? 'Inloggen...' : 'Inloggen'}
          </button>
        </form>
      </div>
    </div>
  )
}
