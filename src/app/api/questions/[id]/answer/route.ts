import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'

// PUT /api/questions/:id/answer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createSupabaseServer()
  const body = await request.json()

  const { answer } = body

  if (!answer?.trim()) {
    return NextResponse.json(
      { error: 'answer is verplicht' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('questions')
    .update({
      answer: answer.trim(),
      status: 'answered',
      answered_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
