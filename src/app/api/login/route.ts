import { NextResponse } from 'next/server'
import { SESSION_COOKIE, SESSION_MAX_AGE, configuredPin, safeEqual, sessionToken } from '@/lib/auth'

export async function POST(request: Request) {
  const pin = configuredPin()
  if (!pin) {
    return NextResponse.json({ ok: true })
  }

  let submitted = ''
  try {
    const body = await request.json()
    submitted = typeof body?.pin === 'string' ? body.pin : ''
  } catch {
    return NextResponse.json({ ok: false, error: 'Ongeldig verzoek.' }, { status: 400 })
  }

  if (!safeEqual(submitted, pin)) {
    // Kleine vertraging zodat blind proberen traag blijft.
    await new Promise((resolve) => setTimeout(resolve, 400))
    return NextResponse.json({ ok: false, error: 'Onjuiste pincode.' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(SESSION_COOKIE, await sessionToken(pin), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
  return response
}
