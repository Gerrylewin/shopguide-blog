import { NextRequest, NextResponse } from 'next/server'
import { recordOpen } from '@/lib/newsletter-tracking'

export const dynamic = 'force-dynamic'

/**
 * Track email opens via 1x1 pixel
 * GET /api/newsletter/track/open?emailId=xxx&email=xxx
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const emailId = searchParams.get('emailId')
    const email = searchParams.get('email')

    if (!emailId || !email) {
      return new NextResponse('Missing parameters', { status: 400 })
    }

    // Get IP and user agent
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined
    const userAgent = req.headers.get('user-agent') || undefined

    // Record the open
    await recordOpen(emailId, decodeURIComponent(email), ip, userAgent)

    // Return a 1x1 transparent pixel
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    )

    return new NextResponse(pixel, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    console.error('Error tracking email open:', error)
    // Still return pixel even if tracking fails
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    )
    return new NextResponse(pixel, {
      headers: {
        'Content-Type': 'image/gif',
      },
    })
  }
}

