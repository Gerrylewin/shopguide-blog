import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'
import siteMetadata from '@/data/siteMetadata'

export const dynamic = 'force-static'
export const revalidate = 3600 // Revalidate every hour

async function GET(req: NextRequest) {
  try {
    // Read the RSS feed file from the public folder
    const feedPath = join(process.cwd(), 'public', 'feed.xml')
    const feedContent = readFileSync(feedPath, 'utf-8')

    // Return the feed with proper caching headers
    return new NextResponse(feedContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('Error reading RSS feed:', error)
    return new NextResponse('RSS feed not found', { status: 404 })
  }
}

export { GET }

