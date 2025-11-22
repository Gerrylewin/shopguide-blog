import { NextRequest, NextResponse } from 'next/server'
import { recordClick } from '@/lib/newsletter-tracking'

export const dynamic = 'force-dynamic'

/**
 * Track email clicks and redirect to original URL
 * GET /api/newsletter/track/click?emailId=xxx&email=xxx&url=xxx
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const emailId = searchParams.get('emailId')
    const email = searchParams.get('email')
    const url = searchParams.get('url')

    if (!emailId || !email || !url) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    // Get IP and user agent
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined
    const userAgent = req.headers.get('user-agent') || undefined

    // Record the click
    await recordClick(
      emailId,
      decodeURIComponent(email),
      decodeURIComponent(url),
      ip,
      userAgent
    )

    // Redirect to the original URL
    return NextResponse.redirect(decodeURIComponent(url))
  } catch (error) {
    console.error('Error tracking email click:', error)
    // Try to redirect anyway
    const url = req.nextUrl.searchParams.get('url')
    if (url) {
      return NextResponse.redirect(decodeURIComponent(url))
    }
    return NextResponse.json({ error: 'Failed to track click' }, { status: 500 })
  }
}

