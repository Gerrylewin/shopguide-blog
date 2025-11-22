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
      // Check if ButtonDown API key is configured
      if (!process.env.BUTTONDOWN_API_KEY) {
        console.error('BUTTONDOWN_API_KEY is not set in environment variables')
        // Still try to save locally and send to GHL even if ButtonDown fails
        if (email) {
          saveEmailLocally(email).catch((err) => console.error('Background save failed:', err))
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
        return NextResponse.json(
          {
            error: 'Newsletter service is not configured. Please contact the site administrator.',
          },
          { status: 500 }
        )
      }

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
        console.error('No response from ButtonDown API')
        return NextResponse.json({ error: 'No response from newsletter service' }, { status: 500 })
      }

      // Clone response before reading so we can log and return
      const responseClone = response.clone()
      const responseStatus = response.status

      // Read and log the response for debugging
      let responseData: any
      try {
        responseData = await responseClone.json()
        console.log('ButtonDown API response:', {
          status: responseStatus,
          data: responseData,
          email: email,
        })
      } catch (jsonError) {
        // Response might not be JSON, clone again and try reading as text
        try {
          const textClone = response.clone()
          const text = await textClone.text()
          console.log('ButtonDown API response (non-JSON):', {
            status: responseStatus,
            text: text,
            email: email,
          })
          responseData = { message: text || 'Subscription processed' }
        } catch (textError) {
          // If both fail, create a default response
          console.error('Failed to read ButtonDown response:', textError)
          responseData = {
            error: 'Failed to parse response from newsletter service',
            message: 'Subscription may have failed',
          }
        }
      }

      // Check if subscription was successful (status 200-299)
      const isSuccess = responseStatus >= 200 && responseStatus < 300

      // Always save locally and send to GHL, even if ButtonDown fails
      // This ensures we don't lose subscribers if ButtonDown has issues
      if (email) {
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
            buttondownSuccess: isSuccess, // Include whether ButtonDown succeeded
          }),
        }).catch((webhookError) => {
          console.error('Failed to send to GHL webhook:', webhookError)
        })
      }

      if (!isSuccess) {
        // Log the error for debugging
        console.error('ButtonDown subscription failed:', {
          status: responseStatus,
          response: responseData,
          email: email,
        })
        // Note: Email was still saved locally and sent to GHL above
      }

      // Return the response from ButtonDown (which includes error messages)
      return NextResponse.json(responseData, { status: responseStatus })
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      // Still try to save locally even if ButtonDown fails
      if (email) {
        saveEmailLocally(email).catch((err) => console.error('Background save failed:', err))
      }
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
