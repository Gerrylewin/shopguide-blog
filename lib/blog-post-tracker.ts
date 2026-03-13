import { promises as fs } from 'fs'
import path from 'path'
import type { Blog } from 'contentlayer/generated'
import { sendBlogPostEmails } from './rss-email-sender'
import { extractMainPoints } from './blog-post-utils'
import {
  isCloudflareD1Available,
  getD1SentPosts,
  checkD1PostSent,
  markD1PostAsSent,
} from './cloudflare-d1'

const SENT_POSTS_FILE = path.resolve(process.cwd(), 'data', 'sent-blog-posts.json')

export interface SentPost {
  slug: string
  title: string
  date: string
  sentAt: string
}

/**
 * Get list of blog posts that have already been sent.
 * Uses D1 in production (persistent across serverless) so we don't resend on every cron run.
 */
export async function getSentPosts(): Promise<SentPost[]> {
  if (isCloudflareD1Available()) {
    try {
      const rows = await getD1SentPosts()
      return rows
    } catch (error) {
      console.error('Error reading sent posts from D1, falling back to file:', error)
    }
  }
  try {
    const fileContent = await fs.readFile(SENT_POSTS_FILE, 'utf-8')
    const parsed = JSON.parse(fileContent.trim() || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    const errorCode = (error as NodeJS.ErrnoException).code
    if (errorCode === 'ENOENT') return []
    console.error('Error reading sent posts file:', error)
    return []
  }
}

/**
 * Mark a blog post as sent (D1 in production, file locally).
 */
export async function markPostAsSent(post: Blog): Promise<void> {
  if (isCloudflareD1Available()) {
    try {
      const already = await checkD1PostSent(post.slug)
      if (already) {
        console.log(`Post ${post.slug} already marked as sent`)
        return
      }
      await markD1PostAsSent(post.slug, post.title, post.date)
      console.log(`✅ Marked post ${post.slug} as sent (D1)`)
      return
    } catch (error) {
      console.error('Error marking post as sent in D1:', error)
    }
  }
  try {
    const sentPosts = await getSentPosts()
    if (sentPosts.some((p) => p.slug === post.slug)) {
      console.log(`Post ${post.slug} already marked as sent`)
      return
    }
    sentPosts.push({
      slug: post.slug,
      title: post.title,
      date: post.date,
      sentAt: new Date().toISOString(),
    })
    const dataDir = path.dirname(SENT_POSTS_FILE)
    await fs.mkdir(dataDir, { recursive: true })
    await fs.writeFile(SENT_POSTS_FILE, JSON.stringify(sentPosts, null, 2), 'utf-8')
    console.log(`✅ Marked post ${post.slug} as sent`)
  } catch (error) {
    console.error('Error marking post as sent:', error)
  }
}

/**
 * Check if a post has already been sent (for idempotent send-post API).
 */
export async function isPostAlreadySent(slug: string): Promise<boolean> {
  if (isCloudflareD1Available()) {
    try {
      return await checkD1PostSent(slug)
    } catch {
      return false
    }
  }
  const sent = await getSentPosts()
  return sent.some((p) => p.slug === slug)
}

/**
 * Mark a post as sent by slug/title/date (for send-post API which doesn't have a full Blog object).
 */
export async function markPostAsSentBySlug(
  slug: string,
  title: string,
  date: string
): Promise<void> {
  if (isCloudflareD1Available()) {
    try {
      if (await checkD1PostSent(slug)) return
      await markD1PostAsSent(slug, title, date)
      console.log(`✅ Marked post ${slug} as sent (D1)`)
      return
    } catch (error) {
      console.error('Error marking post as sent in D1:', error)
    }
  }
  try {
    const sentPosts = await getSentPosts()
    if (sentPosts.some((p) => p.slug === slug)) return
    sentPosts.push({ slug, title, date, sentAt: new Date().toISOString() })
    const dataDir = path.dirname(SENT_POSTS_FILE)
    await fs.mkdir(dataDir, { recursive: true })
    await fs.writeFile(SENT_POSTS_FILE, JSON.stringify(sentPosts, null, 2), 'utf-8')
    console.log(`✅ Marked post ${slug} as sent`)
  } catch (error) {
    console.error('Error marking post as sent:', error)
  }
}

/**
 * Check for new blog posts and send emails for unpublished ones
 * Only sends for posts that are not drafts and haven't been sent before
 */
export async function checkAndSendNewPosts(allBlogs: Blog[]): Promise<{
  checked: number
  sent: number
  skipped: number
  errors: string[]
}> {
  const result = {
    checked: 0,
    sent: 0,
    skipped: 0,
    errors: [] as string[],
  }

  try {
    const sentPosts = await getSentPosts()
    const sentSlugs = new Set(sentPosts.map((p) => p.slug))

    // Filter for published, non-draft posts
    const publishedPosts = allBlogs.filter(
      (post) => !post.draft && post.date && new Date(post.date) <= new Date()
    )

    result.checked = publishedPosts.length

    for (const post of publishedPosts) {
      // Skip if already sent
      if (sentSlugs.has(post.slug)) {
        result.skipped++
        continue
      }

      try {
        console.log(`📧 Sending email for new blog post: ${post.title}`)

        // Extract main points
        const mainPoints = extractMainPoints(post, 5)

        // Send emails
        const emailResult = await sendBlogPostEmails({
          title: post.title,
          slug: post.slug,
          date: post.date,
          summary: post.summary || undefined,
          images: Array.isArray(post.images)
            ? post.images
            : post.images
              ? [post.images]
              : undefined,
          mainPoints: mainPoints.length > 0 ? mainPoints : undefined,
        })

        if (emailResult.sent > 0) {
          // Mark as sent only if emails were actually sent
          await markPostAsSent(post)
          result.sent++
          console.log(`✅ Successfully sent ${emailResult.sent} emails for: ${post.title}`)
        } else {
          result.errors.push(
            `No emails sent for ${post.slug}: ${emailResult.message || 'Unknown error'}`
          )
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        result.errors.push(`Failed to send emails for ${post.slug}: ${errorMsg}`)
        console.error(`❌ Error sending emails for ${post.slug}:`, error)
      }
    }
  } catch (error) {
    console.error('Error checking for new posts:', error)
    result.errors.push(
      `Failed to check for new posts: ${error instanceof Error ? error.message : String(error)}`
    )
  }

  return result
}
