import { NextRequest, NextResponse } from 'next/server'
import { addSubscriber, getSubscribers } from '@/lib/newsletter-storage'

export const dynamic = 'force-dynamic'

const GHL_WEBHOOK_URL =
  'https://services.leadconnectorhq.com/hooks/YwFixzedrximlLRmcQo3/webhook-trigger/cd4a2975-f836-4de6-8c86-ad61618ff1e6'

// Helper function to send email to GHL webhook
async function sendToGHLWebhook(email: string, success: boolean) {
  try {
    console.log('🔵 [GHL WEBHOOK] Sending to GHL webhook:', GHL_WEBHOOK_URL)
    await fetch(GHL_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        source: 'newsletter_subscription',
        timestamp: new Date().toISOString(),
        success: success,
      }),
    })
    console.log('✅ [GHL WEBHOOK] GHL webhook sent successfully')
  } catch (webhookError) {
    console.error('❌ [GHL WEBHOOK] Failed to send to GHL webhook:', webhookError)
    // Don't throw - webhook failure shouldn't fail the subscription
  }
}

// Newsletter subscription handler (no ButtonDown - using local storage only)
async function handler(req: NextRequest) {
  console.log('🔵 [NEWSLETTER API] Request received:', {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
    hasBody: !!req.body,
  })

  // Handle GET requests - return subscriber count
  if (req.method === 'GET') {
    console.log('🔵 [NEWSLETTER API] Handling GET request')
    try {
      const subscribers = await getSubscribers()
      return NextResponse.json({
        subscribers: subscribers.length,
        message: 'Newsletter subscription endpoint',
      })
    } catch (error) {
      return NextResponse.json({ error: 'Failed to get subscriber count' }, { status: 500 })
    }
  }

  // For POST requests, process the subscription first
  if (req.method === 'POST') {
    console.log('🔵 [NEWSLETTER API] Handling POST request - starting subscription process')
    let bodyText: string
    let email: string | undefined

    try {
      console.log('🔵 [NEWSLETTER API] Reading request body...')
      // Read the body as text first to preserve it
      bodyText = await req.text()
      console.log('🔵 [NEWSLETTER API] Request body received:', {
        bodyLength: bodyText.length,
        bodyPreview: bodyText.substring(0, 100),
      })

      // Validate body is not empty
      if (!bodyText || bodyText.trim().length === 0) {
        console.error('❌ [NEWSLETTER API] Request body is empty')
        return NextResponse.json({ error: 'Request body is empty' }, { status: 400 })
      }

      // Parse JSON to extract email
      console.log('🔵 [NEWSLETTER API] Parsing JSON body...')
      try {
        const body = JSON.parse(bodyText)
        email = body.email
        console.log('🔵 [NEWSLETTER API] Email extracted from body:', {
          email: email,
          emailType: typeof email,
        })
      } catch (parseError) {
        console.error('❌ [NEWSLETTER API] JSON parse error:', parseError)
        return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
      }

      // Validate email exists
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        console.error('❌ [NEWSLETTER API] Invalid email format:', email)
        return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
      }
      console.log('✅ [NEWSLETTER API] Email validation passed:', email)
    } catch (error) {
      console.error('❌ [NEWSLETTER API] Error reading request body:', error)
      return NextResponse.json(
        { error: 'Failed to read request body', details: String(error) },
        { status: 400 }
      )
    }

    try {
      // Save email to local storage (primary source of truth)
      console.log('🔵 [NEWSLETTER API] Saving email to local storage...')
      const added = await addSubscriber(email)

      if (!added) {
        console.log('⚠️ [NEWSLETTER API] Email already subscribed:', email)
        // Still send to GHL to update CRM
        await sendToGHLWebhook(email, false)
        return NextResponse.json(
          {
            error: 'This email is already subscribed to the newsletter.',
          },
          { status: 400 }
        )
      }

      console.log('✅ [NEWSLETTER API] Email saved to local storage successfully')

      // Send to GHL webhook (fire and forget - don't block response)
      sendToGHLWebhook(email, true).catch((err) => {
        console.error('❌ [NEWSLETTER API] GHL webhook failed (non-blocking):', err)
      })

      // Return success response
      console.log('✅ [NEWSLETTER API] Subscription successful, returning success response')
      return NextResponse.json(
        {
          message: 'Successfully subscribed to the newsletter!',
          email: email,
        },
        { status: 200 }
      )
    } catch (error) {
      console.error('❌ [NEWSLETTER API] Newsletter subscription error:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      const errorStack = error instanceof Error ? error.stack : undefined
      const errorName = error instanceof Error ? error.name : undefined
      const errorType = error?.constructor?.name || typeof error

      console.error('❌ [NEWSLETTER API] Error details:', {
        message: errorMessage,
        stack: errorStack,
        name: errorName,
        type: errorType,
        NODE_ENV: process.env.NODE_ENV,
      })

      // Always include details in development, and also log them
      const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV
      const errorDetails = isDevelopment
        ? {
            message: errorMessage,
            stack: errorStack,
            name: errorName,
            type: errorType,
          }
        : undefined

      return NextResponse.json(
        {
          error: 'Failed to process newsletter subscription',
          details: errorDetails,
        },
        { status: 500 }
      )
    }
  }

  // Method not allowed
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export { handler as GET, handler as POST }
