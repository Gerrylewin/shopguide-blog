import { NextRequest, NextResponse } from 'next/server'
import { sendBlogPostEmails } from '@/lib/rss-email-sender'
import { isPostAlreadySent, markPostAsSentBySlug } from '@/lib/blog-post-tracker'

export const dynamic = 'force-dynamic'

/**
 * POST /api/newsletter/send-post
 * Send a new blog post notification to all subscribers.
 * Idempotent: if this post was already sent, returns success without sending again.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, slug, date, summary, images } = body

    // Validate required fields
    if (!title || !slug || !date) {
      return NextResponse.json(
        { error: 'Missing required fields: title, slug, date' },
        { status: 400 }
      )
    }

    // Skip if already sent (prevents duplicate emails from double-clicks or repeated webhooks)
    const alreadySent = await isPostAlreadySent(slug)
    if (alreadySent) {
      return NextResponse.json({
        message: 'This post was already sent; no emails sent.',
        sent: 0,
        alreadySent: true,
      })
    }

    // Send emails to all subscribers
    const result = await sendBlogPostEmails({
      title,
      slug,
      date,
      summary,
      images,
    })

    // Mark as sent so future calls are idempotent
    if (result.sent > 0) {
      await markPostAsSentBySlug(slug, title, date)
    }

    return NextResponse.json({
      message: 'Blog post notification sent',
      ...result,
    })
  } catch (error) {
    console.error('Failed to send blog post notification:', error)
    return NextResponse.json(
      { error: 'Failed to send blog post notification', details: String(error) },
      { status: 500 }
    )
  }
}
