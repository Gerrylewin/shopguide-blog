import { NextRequest, NextResponse } from 'next/server'
import { allBlogs } from 'contentlayer/generated'
import {
  isCloudflareD1Available,
  getBlogVoteCountsForSlug,
  recordBlogVote,
} from '@/lib/cloudflare-d1'

export const dynamic = 'force-dynamic'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/** Maps Cloudflare D1 failures to a safe client message (see Vercel logs for full detail). */
function voteStorageResponse(e: unknown): { status: number; error: string } {
  const msg = e instanceof Error ? e.message : String(e)

  if (/Cloudflare D1 API error:\s*404/i.test(msg)) {
    return {
      status: 503,
      error:
        'Vote database was not found. Check CLOUDFLARE_D1_DATABASE_ID and that the D1 database exists in the Cloudflare account matching CLOUDFLARE_ACCOUNT_ID.',
    }
  }

  if (
    /7500|permission|not authorized|Cloudflare D1 API error:\s*(401|403)|D1 API error:\s*(401|403)/i.test(
      msg
    )
  ) {
    return {
      status: 503,
      error:
        'Vote storage rejected the request. Create a Cloudflare API token with Account → D1 → Edit (not read-only), scoped to the account that owns the database.',
    }
  }

  if (/Cloudflare D1 query failed/i.test(msg) && /7500|permission|authorize/i.test(msg)) {
    return {
      status: 503,
      error:
        'Vote storage permission denied. Confirm the API token has D1 Edit access for CLOUDFLARE_ACCOUNT_ID.',
    }
  }

  return {
    status: 500,
    error: 'Could not save vote',
  }
}

function allowedSlugs(): Set<string> {
  const isProduction = process.env.NODE_ENV === 'production'
  const posts = isProduction ? allBlogs.filter((p) => p.draft !== true) : allBlogs
  return new Set(posts.map((p) => p.slug))
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug || slug.length > 200) {
    return NextResponse.json({ error: 'Missing or invalid slug' }, { status: 400 })
  }
  if (!allowedSlugs().has(slug)) {
    return NextResponse.json({ error: 'Unknown post' }, { status: 404 })
  }
  if (!isCloudflareD1Available()) {
    return NextResponse.json({
      thumbsUp: 0,
      thumbsDown: 0,
      enabled: false,
    })
  }
  try {
    const counts = await getBlogVoteCountsForSlug(slug)
    return NextResponse.json({
      thumbsUp: counts.thumbsUp,
      thumbsDown: counts.thumbsDown,
      enabled: true,
    })
  } catch (e) {
    console.error('[blog-vote] GET counts failed', e)
    return NextResponse.json({
      thumbsUp: 0,
      thumbsDown: 0,
      enabled: false,
    })
  }
}

export async function POST(req: NextRequest) {
  if (!isCloudflareD1Available()) {
    return NextResponse.json({ error: 'Voting is not available' }, { status: 503 })
  }

  let body: { slug?: string; vote?: string; voterId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const slug = typeof body.slug === 'string' ? body.slug : ''
  const voteRaw = typeof body.vote === 'string' ? body.vote : ''
  const voterId = typeof body.voterId === 'string' ? body.voterId : ''

  if (!slug || slug.length > 200 || !allowedSlugs().has(slug)) {
    return NextResponse.json({ error: 'Invalid post' }, { status: 400 })
  }

  if (!UUID_RE.test(voterId)) {
    return NextResponse.json({ error: 'Invalid voter id' }, { status: 400 })
  }

  const vote = voteRaw === 'up' || voteRaw === 'down' ? voteRaw : null
  if (!vote) {
    return NextResponse.json({ error: 'Vote must be up or down' }, { status: 400 })
  }

  try {
    const counts = await recordBlogVote(slug, voterId, vote)
    return NextResponse.json({
      thumbsUp: counts.thumbsUp,
      thumbsDown: counts.thumbsDown,
      enabled: true,
    })
  } catch (e) {
    console.error('[blog-vote] record failed', e)
    const { status, error } = voteStorageResponse(e)
    return NextResponse.json({ error }, { status })
  }
}
