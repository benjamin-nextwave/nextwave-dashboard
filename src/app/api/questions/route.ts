import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const BENJAMIN_EMAIL = process.env.BENJAMIN_EMAIL || 'benjamin@nextwave-solutions.nl'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// GET /api/questions?status=open|answered
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServer()
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  let query = supabase
    .from('questions')
    .select('*, companies!inner(name)')
    .order('created_at', { ascending: false })

  if (status === 'open' || status === 'answered') {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const questions = (data || []).map((q: Record<string, unknown>) => ({
    ...q,
    company_name: (q.companies as { name: string })?.name ?? 'Onbekend',
    companies: undefined,
  }))

  return NextResponse.json(questions)
}

// POST /api/questions — create a new question (Merlijn)
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  const body = await request.json()

  const { title, body: questionBody, company_id } = body

  if (!title || !company_id) {
    return NextResponse.json(
      { error: 'title en company_id zijn verplicht' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('questions')
    .insert({ title, body: questionBody || null, company_id, status: 'open' })
    .select('*, companies!inner(name)')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Send email notification to Benjamin via Resend
  if (resend && data) {
    const companyName = (data.companies as { name: string })?.name ?? 'Onbekend'
    try {
      await resend.emails.send({
        from: 'NextWave <noreply@nextwave-solutions.nl>',
        to: BENJAMIN_EMAIL,
        subject: `Nieuwe vraag van Merlijn: ${title}`,
        html: `
          <h2>Nieuwe vraag</h2>
          <p><strong>Bedrijf:</strong> ${companyName}</p>
          <p><strong>Vraag:</strong> ${title}</p>
          ${questionBody ? `<p>${questionBody}</p>` : ''}
          <br/>
          <a href="${APP_URL}/benjamin/vragen/${data.id}">Bekijk en beantwoord de vraag</a>
        `,
      })
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError)
    }
  }

  return NextResponse.json(data, { status: 201 })
}
