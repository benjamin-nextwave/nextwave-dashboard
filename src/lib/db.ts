import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

function connect(): SupabaseClient {
  if (client) return client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error(
      'Ontbrekende Supabase-omgevingsvariabelen. Zet NEXT_PUBLIC_SUPABASE_URL en ' +
        'SUPABASE_SERVICE_ROLE_KEY in .env.local en in Vercel → Settings → Environment Variables.'
    )
  }

  client = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return client
}

/**
 * Service-role-client. Draait uitsluitend server-side; de tabellen hebben
 * RLS aan zonder policies, dus dit is de enige weg naar de data.
 *
 * De verbinding wordt pas bij het eerste gebruik opgezet — anders zou het
 * ontbreken van een sleutel de build al laten klappen in plaats van het
 * verzoek dat de data echt nodig heeft.
 */
export const db = new Proxy({} as SupabaseClient, {
  get(_target, property) {
    const instance = connect()
    const value = Reflect.get(instance, property)
    return typeof value === 'function' ? value.bind(instance) : value
  },
})
