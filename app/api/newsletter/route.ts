import { NewsletterAPI } from 'pliny/newsletter'
import siteMetadata from '@/data/siteMetadata'
import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

const GHL_WEBHOOK_URL =
  'https://services.leadconnectorhq.com/hooks/YwFixzedrximlLRmcQo3/webhook-trigger/168165f1-975c-4127-b2be-01d3eac8856f'

// Path to store emails locally
const EMAILS_FILE_PATH = path.join(process.cwd(), 'data', 'newsletter-subscribers.json')

const originalHandler = NewsletterAPI({
  // @ts-ignore
  provider: siteMetadata.newsletter.provider,
})

// Helper function to save email to local storage
async function saveEmailLocally(email: string) {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(EMAILS_FILE_PATH)
    await fs.mkdir(dataDir, { recursive: true })

    // Read existing emails
    let emails: Array<{ email: string; subscribedAt: string }> = []
    try {
      const fileContent = await fs.readFile(EMAILS_FILE_PATH, 'utf-8')
      emails = JSON.parse(fileContent)
    } catch (error) {
      // File doesn't exist yet, start with empty array
      emails = []
    }

    // Check if email already exists
    const emailExists = emails.some((e) => e.email.toLowerCase() === email.toLowerCase())
    if (!emailExists) {
      // Add new email
      emails.push({
        email: email.toLowerCase(),
        subscribedAt: new Date().toISOString(),
      })

      // Write back to file
      await fs.writeFile(EMAILS_FILE_PATH, JSON.stringify(emails, null, 2), 'utf-8')
    }
  } catch (error) {
    console.error('Failed to save email locally:', error)
    // Don't throw - we don't want to fail the subscription if local save fails
  }
}

// Wrap the handler to send data to GHL webhook and save locally
async function handler(req: NextRequest) {
  // Handle GET requests normally
  if (req.method === 'GET') {
    return originalHandler(req)
  }

  // For POST requests, process the subscription first
  if (req.method === 'POST') {
    let bodyText: string
    let email: string | undefined

    try {
      // Read the body as text first to preserve it
      bodyText = await req.text()

      // Validate body is not empty
      if (!bodyText || bodyText.trim().length === 0) {
        return NextResponse.json({ error: 'Request body is empty' }, { status: 400 })
      }

      // Parse JSON to extract email
      try {
        const body = JSON.parse(bodyText)
        email = body.email
      } catch (parseError) {
        return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
      }

      // Validate email exists
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to read request body', details: String(error) },
        { status: 400 }
      )
    }

    try {
      // Recreate the request for the original handler using the body we already read
      const newRequest = new NextRequest(req.url, {
        method: 'POST',
        headers: {
          ...Object.fromEntries(req.headers.entries()),
          'Content-Type': 'application/json',
        },
        body: bodyText,
      })

      // Call the original newsletter handler
      const response = await originalHandler(newRequest)

      // Ensure we have a valid response
      if (!response) {
        return NextResponse.json({ error: 'No response from newsletter service' }, { status: 500 })
      }

      // Check if subscription was successful (status 200-299)
      const isSuccess = response.status >= 200 && response.status < 300

      if (isSuccess && email) {
        // Save email locally (don't await - fire and forget)
        saveEmailLocally(email).catch((err) => console.error('Background save failed:', err))

        // Send to GHL webhook (don't await - fire and forget)
        fetch(GHL_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            source: 'newsletter_subscription',
            timestamp: new Date().toISOString(),
          }),
        }).catch((webhookError) => {
          console.error('Failed to send to GHL webhook:', webhookError)
        })
      }

      // Ensure response is valid JSON
      try {
        const responseData = await response.json()
        return NextResponse.json(responseData, { status: response.status })
      } catch (jsonError) {
        // If response is not JSON, return a success message
        return NextResponse.json(
          { message: 'Subscription successful' },
          { status: response.status }
        )
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      return NextResponse.json(
        {
          error: 'Failed to process newsletter subscription',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        { status: 500 }
      )
    }
  }

  return originalHandler(req)
}

export { handler as GET, handler as POST }
