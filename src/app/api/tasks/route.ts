import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'

// GET /api/tasks?assigned_to=benjamin
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServer()
  const { searchParams } = new URL(request.url)
  const assignedTo = searchParams.get('assigned_to')

  let query = supabase
    .from('tasks')
    .select('*, companies!inner(name)')
    .order('deadline', { ascending: true })

  if (assignedTo) {
    query = query.eq('assigned_to', assignedTo)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const tasks = (data || []).map((t: Record<string, unknown>) => ({
    ...t,
    company_name: (t.companies as { name: string })?.name ?? 'Onbekend',
    companies: undefined,
  }))

  return NextResponse.json(tasks)
}
