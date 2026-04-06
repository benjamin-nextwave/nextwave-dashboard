import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseMiddleware } from '@/lib/supabase-middleware'

// Public routes that don't require auth
const publicRoutes = ['/login', '/benjamin-login']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip static files and API routes that handle their own auth
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/api/')
  ) {
    return NextResponse.next()
  }

  // Public routes — always accessible
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  const { response, user, supabase } = await createSupabaseMiddleware(request)

  // Not logged in → redirect to appropriate login
  if (!user) {
    const loginUrl = pathname.startsWith('/benjamin')
      ? '/benjamin-login'
      : '/login'
    return NextResponse.redirect(new URL(loginUrl, request.url))
  }

  // Get user role
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  const role = roleData?.role

  // Merlijn trying to access main dashboard routes
  if (role === 'merlijn' && !pathname.startsWith('/benjamin')) {
    return NextResponse.redirect(new URL('/benjamin/vragen', request.url))
  }

  // Benjamin trying to access limited portal routes
  if (role === 'benjamin' && pathname.startsWith('/benjamin')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // No role found — redirect to login
  if (!role) {
    const loginUrl = pathname.startsWith('/benjamin')
      ? '/benjamin-login'
      : '/login'
    return NextResponse.redirect(new URL(loginUrl, request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
