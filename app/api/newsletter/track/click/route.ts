import { NextRequest, NextResponse } from 'next/server'
import { recordClick, generateTrackingSignature } from '@/lib/newsletter-tracking'
import siteMetadata from '@/data/siteMetadata'

export const dynamic = 'force-dynamic'

/**
 * Check if a URL is safe to redirect to without a signature
 * (e.g. it's on the same domain as the site)
 */
function isSafeUrl(url: string): boolean {
  try {
    // Relative URLs are always safe
    if (url.startsWith('/') && !url.startsWith('//')) {
      return true
    }

    const siteUrl = new URL(siteMetadata.siteUrl)
    const targetUrl = new URL(url)

    return targetUrl.hostname === siteUrl.hostname
  } catch (e) {
    return false
  }
}

/**
 * Track email clicks and redirect to original URL
 * GET /api/newsletter/track/click?emailId=xxx&email=xxx&url=xxx&sig=xxx
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const emailId = searchParams.get('emailId')
    const email = searchParams.get('email')
    const url = searchParams.get('url')
    const sig = searchParams.get('sig')

    if (!emailId || !email || !url) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    // Verify signature to prevent open redirect for external URLs
    // We allow internal URLs without a signature for backward compatibility
    if (!isSafeUrl(url)) {
      if (!sig) {
        return NextResponse.json({ error: 'Missing signature for external URL' }, { status: 400 })
      }

      const expectedSig = generateTrackingSignature(emailId, email, url)
      if (sig !== expectedSig) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
      }
    }

    // Get IP and user agent
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined
    const userAgent = req.headers.get('user-agent') || undefined

    // Record the click
    await recordClick(emailId, email, url, ip, userAgent)

    // Redirect to the original URL
    return NextResponse.redirect(url)
  } catch (error) {
    console.error('Error tracking email click:', error)
    return NextResponse.json({ error: 'Failed to track click' }, { status: 500 })
  }
}
