import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()

  const apiUrl = process.env.NEXT_PUBLIC_MERLIJN_API_URL
  const secret = process.env.NEXT_PUBLIC_BENJAMIN_SECRET

  if (!apiUrl || !secret) {
    return NextResponse.json({ error: 'Missing configuration' }, { status: 500 })
  }

  const response = await fetch(`${apiUrl}/api/incoming`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-benjamin-secret': secret,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text()
    return NextResponse.json({ error: text }, { status: response.status })
  }

  const data = await response.json().catch(() => ({}))
  return NextResponse.json(data, { status: 201 })
}
