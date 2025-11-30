import { NextRequest, NextResponse } from 'next/server'
import { getSubscribers } from '@/lib/newsletter-storage'

export const dynamic = 'force-dynamic'

/**
 * GET /api/newsletter/debug
 * Debug endpoint to check newsletter storage configuration
 */
export async function GET(req: NextRequest) {
  try {
    const kvUrl = process.env.KV_URL
    const kvToken = process.env.KV_REST_API_TOKEN
    const isVercel = !!process.env.VERCEL
    const nodeEnv = process.env.NODE_ENV

    const kvAvailable = !!(kvUrl && kvToken)

    // Try to get subscribers to see which storage is being used
    const subscribers = await getSubscribers()

    return NextResponse.json({
      environment: {
        nodeEnv,
        isVercel,
        kvConfigured: kvAvailable,
        kvUrl: kvUrl ? 'Set (hidden)' : 'Not set',
        kvToken: kvToken ? 'Set (hidden)' : 'Not set',
      },
      storage: {
        method: kvAvailable ? 'Vercel KV' : 'File System',
        subscriberCount: subscribers.length,
        subscribers: subscribers,
      },
      note: kvAvailable
        ? 'Using Vercel KV for storage (production-ready)'
        : 'Using file system storage. In production (Vercel), file system is read-only. Please configure Vercel KV.',
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
