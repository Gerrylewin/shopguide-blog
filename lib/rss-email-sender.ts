import { getSubscribers } from './newsletter-storage'
import siteMetadata from '@/data/siteMetadata'
import { Resend } from 'resend'
import {
  generateEmailId,
  createTrackingRecord,
  getTrackingPixelUrl,
  getTrackedLinkUrl,
} from './newsletter-tracking'
import { extractMainPoints, formatMainPointsAsHTML, generateEmailSummary } from './blog-post-utils'

interface BlogPost {
  title: string
  slug: string
  date: string
  summary?: string
  images?: string[]
  mainPoints?: string[] // Optional: pre-extracted main points
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

    // Generate main points HTML if available
    const mainPointsHtml = post.mainPoints && post.mainPoints.length > 0 
      ? formatMainPointsAsHTML(post.mainPoints) 
      : ''

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
        <body style="font-family: 'Questrial', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #313131; background-color: #ffffff; margin: 0; padding: 0;">
          <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #ffffff;">
            <tr>
              <td style="padding: 0;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                  <!-- Header with brand color -->
                  <div style="background: linear-gradient(135deg, #2E9AB3 0%, #1e7a8f 100%); padding: 30px 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-family: 'Archivo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size: 24px; font-weight: 600;">
                      ${siteMetadata.title}
                    </h1>
                  </div>
                  
                  <!-- Content container -->
                  <div style="padding: 30px 20px;">
                    ${post.images && post.images.length > 0 ? `
                      <img src="${post.images[0]}" alt="${post.title}" style="max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 25px; display: block;" />
                    ` : ''}
                    
                    <h2 style="color: #0D0324; margin: 0 0 20px 0; font-family: 'Archivo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size: 28px; font-weight: 600; line-height: 1.3;">
                      ${post.title}
                    </h2>
                    
                    ${post.summary ? `
                      <div style="background-color: #E7E7E7; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #2E9AB3;">
                        <p style="font-size: 16px; color: #313131; margin: 0; line-height: 1.7;">
                          ${post.summary}
                        </p>
                      </div>
                    ` : ''}
                    
                    ${mainPointsHtml}
                    
                    <!-- CTA Button with brand color -->
                    <div style="margin: 30px 0; text-align: center;">
                      <a href="${trackedPostUrl}" 
                         style="background-color: #2E9AB3; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px; transition: background-color 0.3s;">
                        Read Full Article →
                      </a>
                    </div>
                    
                    <!-- Divider -->
                    <hr style="border: none; border-top: 2px solid #E7E7E7; margin: 35px 0;" />
                    
                    <!-- Footer -->
                    <p style="font-size: 13px; color: #666; text-align: center; margin: 0 0 10px 0;">
                      You're receiving this because you subscribed to our newsletter.
                    </p>
                    <p style="font-size: 13px; color: #666; text-align: center; margin: 0;">
                      <a href="${trackedUnsubscribeUrl}" style="color: #2E9AB3; text-decoration: underline;">Unsubscribe</a>
                    </p>
                  </div>
                  
                  <!-- Tracking pixel -->
                  <img src="${trackingPixel}" width="1" height="1" style="display: block; width: 1px; height: 1px; border: 0; margin: 0;" alt="" />
                </div>
              </td>
            </tr>
          </table>
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
