import { getSubscribers } from './newsletter-storage'
import siteMetadata from '@/data/siteMetadata'

interface BlogPost {
  title: string
  slug: string
  date: string
  summary?: string
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

    const postUrl = `${siteMetadata.siteUrl}/blog/${post.slug}`
    const unsubscribeUrl = `${siteMetadata.siteUrl}/unsubscribe`

    // Email content
    const emailSubject = `New Blog Post: ${post.title}`
    const emailHtml = `
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
          
          <h2 style="color: #2c3e50;">${post.title}</h2>
          
          ${post.summary ? `<p style="font-size: 16px; color: #666;">${post.summary}</p>` : ''}
          
          <div style="margin: 30px 0;">
            <a href="${postUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Read Full Article →
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            You're receiving this because you subscribed to our newsletter.<br>
            <a href="${unsubscribeUrl}" style="color: #999;">Unsubscribe</a>
          </p>
        </body>
      </html>
    `

    const emailText = `
${siteMetadata.title}

${post.title}

${post.summary || ''}

Read the full article: ${postUrl}

---
You're receiving this because you subscribed to our newsletter.
Unsubscribe: ${unsubscribeUrl}
    `.trim()

    // TODO: Integrate with your email service provider
    // Example with Resend (you'll need to install: npm install resend)
    /*
    import { Resend } from 'resend'
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    let sent = 0
    let failed = 0
    
    for (const subscriber of subscribers) {
      try {
        await resend.emails.send({
          from: `Newsletter <newsletter@${siteMetadata.siteUrl.replace('https://', '')}>`,
          to: subscriber.email,
          subject: emailSubject,
          html: emailHtml,
          text: emailText,
        })
        sent++
      } catch (error) {
        console.error(`Failed to send email to ${subscriber.email}:`, error)
        failed++
      }
    }
    
    return { sent, failed }
    */

    // For now, just log what would be sent
    console.log(`Would send email to ${subscribers.length} subscribers about: ${post.title}`)
    console.log(`Post URL: ${postUrl}`)

    return {
      sent: 0,
      failed: 0,
      message:
        'Email sending not configured. See lib/rss-email-sender.ts for integration instructions.',
      subscribers: subscribers.length,
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
