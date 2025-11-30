import { NextRequest, NextResponse } from 'next/server'
import { getSubscribers } from '@/lib/newsletter-storage'

export const dynamic = 'force-dynamic'

/**
 * GET /api/newsletter/debug
 * Debug endpoint to check newsletter storage configuration
 */
export async function GET(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const kvUrl = process.env.KV_URL
    const kvToken = process.env.KV_REST_API_TOKEN
    const isVercel = !!process.env.VERCEL
    const nodeEnv = process.env.NODE_ENV

    const supabaseAvailable = !!(supabaseUrl && supabaseKey)
    const kvAvailable = !!(kvUrl && kvToken)

    // Try to get subscribers to see which storage is being used
    const subscribers = await getSubscribers()

    // Determine which storage method is being used
    let storageMethod = 'File System'
    if (supabaseAvailable) {
      storageMethod = 'Supabase'
    } else if (kvAvailable) {
      storageMethod = 'Vercel KV'
    }

    return NextResponse.json({
      environment: {
        nodeEnv,
        isVercel,
        supabaseConfigured: supabaseAvailable,
        supabaseUrl: supabaseUrl ? 'Set (hidden)' : 'Not set',
        supabaseKey: supabaseKey ? 'Set (hidden)' : 'Not set',
        kvConfigured: kvAvailable,
        kvUrl: kvUrl ? 'Set (hidden)' : 'Not set',
        kvToken: kvToken ? 'Set (hidden)' : 'Not set',
      },
      storage: {
        method: storageMethod,
        subscriberCount: subscribers.length,
        subscribers: subscribers,
      },
      note: supabaseAvailable
        ? 'Using Supabase for storage (recommended - works everywhere)'
        : kvAvailable
          ? 'Using Vercel KV for storage (production-ready)'
          : 'Using file system storage. In production (Vercel), file system is read-only. Please configure Supabase (recommended) or Vercel KV.',
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
