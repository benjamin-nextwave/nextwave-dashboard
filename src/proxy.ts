import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE, configuredPin, safeEqual, sessionToken } from '@/lib/auth'

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const pin = configuredPin()
  // Geen pincode ingesteld → geen slot op de deur. De instellingenpagina
  // wijst hierop zodat het niet ongemerkt open blijft staan.
  if (!pin) return NextResponse.next()

  if (pathname === '/login' || pathname.startsWith('/api/login')) {
    return NextResponse.next()
  }

  const cookie = request.cookies.get(SESSION_COOKIE)?.value
  const expected = await sessionToken(pin)
  if (cookie && safeEqual(cookie, expected)) return NextResponse.next()

  const url = new URL('/login', request.url)
  if (pathname !== '/') url.searchParams.set('next', pathname)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons/|manifest.webmanifest|sw.js).*)'],
}
