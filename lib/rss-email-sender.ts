import { getSubscribers } from './newsletter-storage'
import siteMetadata from '@/data/siteMetadata'
import { Resend } from 'resend'
import {
  generateEmailId,
  createTrackingRecord,
  getTrackingPixelUrl,
  getTrackedLinkUrl,
} from './newsletter-tracking'

interface BlogPost {
  title: string
  slug: string
  date: string
  summary?: string
  images?: string[]
}

/**
 * Send email notifications for new blog posts to all subscribers
 * This function can be called when a new blog post is published
 *
 * Note: You'll need to integrate with an email service provider like:
 * - Resend (recommended for Next.js)
 * - SendGrid
 * - AWS SES
 * - Nodemailer with SMTP
 */
export async function sendBlogPostEmails(post: BlogPost) {
  try {
    const subscribers = await getSubscribers()

    if (subscribers.length === 0) {
      console.log('No subscribers to notify')
      return { sent: 0, failed: 0 }
    }

    // Generate tracking ID for this email send
    const emailId = generateEmailId()
    const postUrl = `${siteMetadata.siteUrl}/blog/${post.slug}`
    const unsubscribeUrl = `${siteMetadata.siteUrl}/unsubscribe`

    // Create tracking record
    await createTrackingRecord(emailId, post.slug, post.title, subscribers.length)

    // Email content with tracking
    const emailSubject = `New Blog Post: ${post.title}`

    // Generate email HTML with tracking for each subscriber
    const generateEmailHtml = (subscriberEmail: string) => {
      const trackingPixel = getTrackingPixelUrl(emailId, subscriberEmail, siteMetadata.siteUrl)
      const trackedPostUrl = getTrackedLinkUrl(
        emailId,
        subscriberEmail,
        postUrl,
        siteMetadata.siteUrl
      )
      const trackedUnsubscribeUrl = getTrackedLinkUrl(
        emailId,
        subscriberEmail,
        unsubscribeUrl,
        siteMetadata.siteUrl
      )

      return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${post.title}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
            <h1 style="color: #333; margin-top: 0;">${siteMetadata.title}</h1>
          </div>
          
          ${post.images && post.images.length > 0 ? `<img src="${post.images[0]}" alt="${post.title}" style="max-width: 100%; height: auto; border-radius: 5px; margin-bottom: 20px;" />` : ''}
          
          <h2 style="color: #2c3e50;">${post.title}</h2>
          
          ${post.summary ? `<p style="font-size: 16px; color: #666;">${post.summary}</p>` : ''}
          
          <div style="margin: 30px 0;">
            <a href="${trackedPostUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Read Full Article →
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            You're receiving this because you subscribed to our newsletter.<br>
            <a href="${trackedUnsubscribeUrl}" style="color: #999;">Unsubscribe</a>
          </p>
          
          <!-- Tracking pixel -->
          <img src="${trackingPixel}" width="1" height="1" style="display: block; width: 1px; height: 1px; border: 0;" alt="" />
        </body>
      </html>
    `
    }

    const emailText = `
${siteMetadata.title}

${post.title}

${post.summary || ''}

Read the full article: ${postUrl}

---
You're receiving this because you subscribed to our newsletter.
Unsubscribe: ${unsubscribeUrl}
    `.trim()

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set in environment variables')
      return {
        sent: 0,
        failed: 0,
        message:
          'Resend API key not configured. Please set RESEND_API_KEY in your environment variables.',
        subscribers: subscribers.length,
        emailId,
      }
    }

    // Initialize Resend lazily to avoid build-time errors
    const resend = new Resend(process.env.RESEND_API_KEY)

    let sent = 0
    let failed = 0
    const failedEmails: string[] = []

    // Send emails to all subscribers
    for (const subscriber of subscribers) {
      try {
        const trackedPostUrl = getTrackedLinkUrl(
          emailId,
          subscriber.email,
          postUrl,
          siteMetadata.siteUrl
        )
        const emailHtml = generateEmailHtml(subscriber.email)

        // Use verified domain from Resend, or fallback to test domain
        // Your verified domain: updates.yourshopguide.com
        // Use: newsletter@updates.yourshopguide.com (or any email on your verified domain)
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'newsletter@updates.yourshopguide.com'

        await resend.emails.send({
          from: `Newsletter <${fromEmail}>`,
          to: subscriber.email,
          subject: emailSubject,
          html: emailHtml,
          text: `${siteMetadata.title}\n\n${post.title}\n\n${post.summary || ''}\n\nRead the full article: ${trackedPostUrl}\n\n---\nYou're receiving this because you subscribed to our newsletter.\nUnsubscribe: ${unsubscribeUrl}`,
        })
        sent++
      } catch (error) {
        console.error(`Failed to send email to ${subscriber.email}:`, error)
        failed++
        failedEmails.push(subscriber.email)
      }
    }

    return {
      sent,
      failed,
      emailId,
      subscribers: subscribers.length,
      failedEmails: failedEmails.length > 0 ? failedEmails : undefined,
    }
  } catch (error) {
    console.error('Failed to send blog post emails:', error)
    throw error
  }
}

/**
 * Generate RSS feed content for email
 */
export function generateRSSEmailContent(posts: BlogPost[]) {
  const feedUrl = `${siteMetadata.siteUrl}/feed.xml`

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Latest Blog Posts</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h1>Latest Blog Posts</h1>
        ${posts
          .map(
            (post) => `
          <div style="margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #eee;">
            <h2><a href="${siteMetadata.siteUrl}/blog/${post.slug}">${post.title}</a></h2>
            <p style="color: #666;">${post.summary || ''}</p>
            <p style="font-size: 12px; color: #999;">Published: ${new Date(post.date).toLocaleDateString()}</p>
          </div>
        `
          )
          .join('')}
        <p style="text-align: center; margin-top: 30px;">
          <a href="${feedUrl}">Subscribe to RSS Feed</a>
        </p>
      </body>
    </html>
  `
}
