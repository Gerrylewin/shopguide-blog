import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Legacy service/CLI access: `ADMIN_ACCESS_SECRET` or `BLOG_VOTES_ADMIN_SECRET` as Bearer token.
 */
export function getAdminSecret(): string | undefined {
  const v = process.env.ADMIN_ACCESS_SECRET || process.env.BLOG_VOTES_ADMIN_SECRET
  return typeof v === 'string' && v.length > 0 ? v : undefined
}

/** Protected newsletter/admin APIs: signed-in Clerk user OR cron Bearer OR legacy admin Bearer */
export async function requireAdminApi(request: NextRequest): Promise<NextResponse | null> {
  const cron = process.env.NEWSLETTER_API_TOKEN
  const legacy = getAdminSecret()
  const authHeader = request.headers.get('authorization')

  if (cron && authHeader === `Bearer ${cron}`) return null
  if (legacy && authHeader === `Bearer ${legacy}`) return null

  const { userId } = await auth()
  if (userId) return null

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

/** Cron jobs and dashboards: `NEWSLETTER_API_TOKEN`, legacy Bearer, or Clerk session */
export async function requireCronOrAdminApi(request: NextRequest): Promise<NextResponse | null> {
  return requireAdminApi(request)
}
