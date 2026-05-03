import { NextRequest, NextResponse } from 'next/server'

/** HttpOnly session cookie set by middleware after a valid `?token=` visit */
export const ADMIN_SESSION_COOKIE = 'sg_admin_session'

/**
 * Prefer ADMIN_ACCESS_SECRET; fall back to BLOG_VOTES_ADMIN_SECRET so existing setups keep working.
 */
export function getAdminSecret(): string | undefined {
  const v = process.env.ADMIN_ACCESS_SECRET || process.env.BLOG_VOTES_ADMIN_SECRET
  return typeof v === 'string' && v.length > 0 ? v : undefined
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let out = 0
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return out === 0
}

/**
 * Valid admin session: Bearer token equals admin secret, or HttpOnly cookie equals secret (set by middleware).
 */
export function isAdminRequest(request: NextRequest, secret: string): boolean {
  const auth = request.headers.get('authorization')
  if (auth === `Bearer ${secret}`) return true
  const cookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  return !!cookie && timingSafeEqual(cookie, secret)
}

export function requireAdminApi(request: NextRequest): NextResponse | null {
  const secret = getAdminSecret()
  if (!secret) {
    return NextResponse.json(
      {
        error:
          'Admin access is not configured (set ADMIN_ACCESS_SECRET or BLOG_VOTES_ADMIN_SECRET).',
      },
      { status: 503 }
    )
  }
  if (!isAdminRequest(request, secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

/**
 * For cron / check-new-posts: allow `NEWSLETTER_API_TOKEN` bearer, or admin session / admin bearer.
 */
export function requireCronOrAdminApi(request: NextRequest): NextResponse | null {
  const cron = process.env.NEWSLETTER_API_TOKEN
  const adminSecret = getAdminSecret()
  const auth = request.headers.get('authorization')

  if (cron && auth === `Bearer ${cron}`) return null

  if (adminSecret) {
    if (isAdminRequest(request, adminSecret)) return null
    if (auth === `Bearer ${adminSecret}`) return null
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
