import { NewsletterAPI } from 'pliny/newsletter'
import siteMetadata from '@/data/siteMetadata'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const GHL_WEBHOOK_URL =
  'https://services.leadconnectorhq.com/hooks/YwFixzedrximlLRmcQo3/webhook-trigger/168165f1-975c-4127-b2be-01d3eac8856f'

const originalHandler = NewsletterAPI({
  // @ts-ignore
  provider: siteMetadata.newsletter.provider,
})

// Wrap the handler to send data to GHL webhook after successful subscription
async function handler(req: NextRequest) {
  // Handle GET requests normally
  if (req.method === 'GET') {
    return originalHandler(req)
  }

  // For POST requests, process the subscription first
  if (req.method === 'POST') {
    let bodyText: string
    try {
      // Read the body as text first to preserve it
      bodyText = await req.text()
    } catch (error) {
      // If we can't read the body, return an error
      return NextResponse.json({ error: 'Failed to read request body' }, { status: 400 })
    }

    try {
      const body = JSON.parse(bodyText)
      const email = body.email

      // Recreate the request for the original handler with the same body
      const newRequest = new NextRequest(req.url, {
        method: 'POST',
        headers: req.headers,
        body: bodyText,
      })

      // Call the original newsletter handler
      const response = await originalHandler(newRequest)

      // If subscription was successful, send to GHL webhook
      if (response && response.status === 200) {
        try {
          // Send subscription data to GHL webhook
          await fetch(GHL_WEBHOOK_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: email,
              source: 'newsletter_subscription',
              timestamp: new Date().toISOString(),
            }),
          })
        } catch (webhookError) {
          // Log error but don't fail the subscription
          console.error('Failed to send to GHL webhook:', webhookError)
        }
      }

      // Ensure we always return a valid response
      if (!response) {
        return NextResponse.json({ error: 'No response from newsletter service' }, { status: 500 })
      }

      return response
    } catch (error) {
      // If there's an error parsing or processing, try the original handler with the body we have
      try {
        const newRequest = new NextRequest(req.url, {
          method: 'POST',
          headers: req.headers,
          body: bodyText,
        })
        return originalHandler(newRequest)
      } catch (fallbackError) {
        // If all else fails, return a proper error response
        return NextResponse.json(
          { error: 'Failed to process newsletter subscription' },
          { status: 500 }
        )
      }
    }
  }

  return originalHandler(req)
}

export { handler as GET, handler as POST }
