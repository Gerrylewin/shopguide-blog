import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ADMIN_SESSION_COOKIE, getAdminSecret, timingSafeEqual } from '@/lib/admin-access'

function hasAdminCookie(request: NextRequest, secret: string): boolean {
  const cookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  return !!cookie && timingSafeEqual(cookie, secret)
}

function isProtectedNewsletterApi(pathname: string): boolean {
  return (
    pathname === '/api/newsletter/send-post' ||
    pathname === '/api/newsletter/subscribers' ||
    pathname === '/api/newsletter/debug'
  )
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const method = request.method

  // --- Admin HTML routes: secret cookie or ?token= (sets cookie + strips token) ---
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/forbidden') {
      return NextResponse.next()
    }

    const secret = getAdminSecret()
    if (!secret) {
      return NextResponse.next()
    }

    const token = request.nextUrl.searchParams.get('token')
    if (token && timingSafeEqual(token, secret)) {
      const url = request.nextUrl.clone()
      url.searchParams.delete('token')
      const res = NextResponse.redirect(url)
      const secure =
        process.env.VERCEL === '1' ||
        process.env.NODE_ENV === 'production' ||
        request.nextUrl.protocol === 'https:'
      res.cookies.set(ADMIN_SESSION_COOKIE, secret, {
        httpOnly: true,
        secure,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })
      return res
    }

    if (hasAdminCookie(request, secret)) {
      return NextResponse.next()
    }

    return NextResponse.rewrite(new URL('/admin/forbidden', request.url))
  }

  // --- API: optional admin gate (skip OPTIONS so CORS preflight succeeds) ---
  if (pathname.startsWith('/api')) {
    const adminSecret = getAdminSecret()

    if (method !== 'OPTIONS' && adminSecret && isProtectedNewsletterApi(pathname)) {
      const auth = request.headers.get('authorization')
      const bearerOk = auth === `Bearer ${adminSecret}`
      const cookieOk = hasAdminCookie(request, adminSecret)
      if (!bearerOk && !cookieOk) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const origin = request.headers.get('origin')

    if (method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': origin || '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
          'Access-Control-Max-Age': '86400',
        },
      })
    }

    const response = NextResponse.next()

    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    } else {
      response.headers.set('Access-Control-Allow-Origin', '*')
    }
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key')
    response.headers.set('Access-Control-Allow-Credentials', 'true')

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*', '/admin/:path*'],
}
