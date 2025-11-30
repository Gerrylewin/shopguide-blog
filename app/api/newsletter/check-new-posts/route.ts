import { NextRequest, NextResponse } from 'next/server'
import { allBlogs } from 'contentlayer/generated'
import { checkAndSendNewPosts } from '@/lib/blog-post-tracker'

export const dynamic = 'force-dynamic'

/**
 * POST /api/newsletter/check-new-posts
 * Manually trigger a check for new blog posts and send emails
 *
 * This endpoint can be called:
 * - Manually via API
 * - Via a webhook when a new blog post is published
 * - Via a cron job
 */
export async function POST(req: NextRequest) {
  try {
    // Optional: Add authentication/authorization here
    const authHeader = req.headers.get('authorization')
    const expectedToken = process.env.NEWSLETTER_API_TOKEN

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔵 [NEWSLETTER CHECK] Checking for new blog posts to email...')

    const result = await checkAndSendNewPosts(allBlogs)

    return NextResponse.json({
      message: 'Blog post check completed',
      ...result,
    })
  } catch (error) {
    console.error('Failed to check for new blog posts:', error)
    return NextResponse.json(
      {
        error: 'Failed to check for new blog posts',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/newsletter/check-new-posts
 * Get status of sent posts
 */
export async function GET() {
  try {
    const { getSentPosts } = await import('@/lib/blog-post-tracker')
    const sentPosts = await getSentPosts()

    return NextResponse.json({
      sentPosts: sentPosts.length,
      posts: sentPosts,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get sent posts' }, { status: 500 })
  }
}
