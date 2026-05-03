import { NextRequest, NextResponse } from 'next/server'
import { allBlogs } from 'contentlayer/generated'
import {
  isCloudflareD1Available,
  getBlogVoteCountsForSlug,
  recordBlogVote,
} from '@/lib/cloudflare-d1'

export const dynamic = 'force-dynamic'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

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
    return NextResponse.json({ error: 'Could not save vote' }, { status: 500 })
  }
}
