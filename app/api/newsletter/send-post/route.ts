import { NextRequest, NextResponse } from 'next/server'
import { sendBlogPostEmails } from '@/lib/rss-email-sender'

export const dynamic = 'force-dynamic'

/**
 * POST /api/newsletter/send-post
 * Send a new blog post notification to all subscribers
 * 
 * This endpoint can be called manually or via a webhook when a new post is published
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, slug, date, summary } = body

    // Validate required fields
    if (!title || !slug || !date) {
      return NextResponse.json(
        { error: 'Missing required fields: title, slug, date' },
        { status: 400 }
      )
    }

    // Send emails to all subscribers
    const result = await sendBlogPostEmails({
      title,
      slug,
      date,
      summary,
    })

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

