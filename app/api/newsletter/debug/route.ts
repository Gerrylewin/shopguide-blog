import { NextRequest, NextResponse } from 'next/server'
import { getSubscribers } from '@/lib/newsletter-storage'

export const dynamic = 'force-dynamic'

/**
 * GET /api/newsletter/debug
 * Debug endpoint to check newsletter storage configuration
 */
export async function GET(req: NextRequest) {
  try {
    const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID
    const cloudflareApiToken = process.env.CLOUDFLARE_API_TOKEN
    const cloudflareD1Id = process.env.CLOUDFLARE_D1_DATABASE_ID
    const isVercel = !!process.env.VERCEL
    const nodeEnv = process.env.NODE_ENV

    const cloudflareD1Available = !!(cloudflareAccountId && cloudflareApiToken && cloudflareD1Id)

    // Try to get subscribers
    const subscribers = await getSubscribers()

    return NextResponse.json({
      environment: {
        nodeEnv,
        isVercel,
        cloudflareD1Configured: cloudflareD1Available,
        cloudflareAccountId: cloudflareAccountId ? 'Set (hidden)' : 'Not set',
        cloudflareApiToken: cloudflareApiToken ? 'Set (hidden)' : 'Not set',
        cloudflareD1Id: cloudflareD1Id ? 'Set (hidden)' : 'Not set',
      },
      storage: {
        method: 'Cloudflare D1',
        subscriberCount: subscribers.length,
        subscribers: subscribers,
      },
      note: cloudflareD1Available
        ? 'Using Cloudflare D1 for storage'
        : 'Cloudflare D1 is not configured. Please set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, and CLOUDFLARE_D1_DATABASE_ID environment variables.',
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to get debug info',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
