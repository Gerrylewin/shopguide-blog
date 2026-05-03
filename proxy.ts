import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextFetchEvent } from 'next/server'
import type { NextRequest } from 'next/server'

const clerkAuth = clerkMiddleware(async (auth, req) => {
  const p = req.nextUrl.pathname
  if (p.startsWith('/admin') && !p.startsWith('/admin/forbidden')) {
    await auth.protect()
  }
})

function mergeApiCors(request: NextRequest, response: Response): Response {
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return response
  }
  const origin = request.headers.get('origin')
  const headers = new Headers(response.headers)
  if (origin) {
    headers.set('Access-Control-Allow-Origin', origin)
  } else {
    headers.set('Access-Control-Allow-Origin', '*')
  }
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key')
  headers.set('Access-Control-Allow-Credentials', 'true')
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

export default async function proxy(request: NextRequest, event: NextFetchEvent) {
  const pathname = request.nextUrl.pathname
  const method = request.method

  if (pathname.startsWith('/api') && method === 'OPTIONS') {
    const origin = request.headers.get('origin')
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

  const result = await clerkAuth(request, event)
  const res = result ?? NextResponse.next()
  if (pathname.startsWith('/api')) {
    return mergeApiCors(request, res)
  }
  return res
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
