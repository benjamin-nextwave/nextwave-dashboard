import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'

// PUT /api/tasks/:id — update task status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createSupabaseServer()
  const body = await request.json()

  const { is_completed, is_urgent, assigned_to } = body

  const update: Record<string, unknown> = {}
  if (typeof is_completed === 'boolean') update.is_completed = is_completed
  if (typeof is_urgent === 'boolean') update.is_urgent = is_urgent
  if (assigned_to !== undefined) update.assigned_to = assigned_to

  if (Object.keys(update).length === 0) {
    return NextResponse.json(
      { error: 'Geen velden om bij te werken' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
