import { NextResponse } from 'next/server'
import siteMetadata from '@/data/siteMetadata'
import { allBlogs } from 'contentlayer/generated'
import { sortPosts } from 'pliny/utils/contentlayer'
import { escape } from 'pliny/utils/htmlEscaper.js'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour

function generateRssItem(config: typeof siteMetadata, post: any) {
  return `
  <item>
    <guid>${config.siteUrl}/blog/${post.slug}</guid>
    <title>${escape(post.title)}</title>
    <link>${config.siteUrl}/blog/${post.slug}</link>
    ${post.summary ? `<description>${escape(post.summary)}</description>` : ''}
    <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    <author>${config.email} (${config.author})</author>
    ${post.tags ? post.tags.map((t: string) => `<category>${t}</category>`).join('') : ''}
  </item>
`
}

function generateRss(config: typeof siteMetadata, posts: any[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(config.title)}</title>
    <link>${config.siteUrl}/blog</link>
    <description>${escape(config.description)}</description>
    <language>${config.language}</language>
    <managingEditor>${config.email} (${config.author})</managingEditor>
    <webMaster>${config.email} (${config.author})</webMaster>
    <lastBuildDate>${new Date(posts[0]?.date || Date.now()).toUTCString()}</lastBuildDate>
    <atom:link href="${config.siteUrl}/api/feed" rel="self" type="application/rss+xml"/>
    ${posts.map((post) => generateRssItem(config, post)).join('')}
  </channel>
</rss>`
}

export async function GET() {
  try {
    // Filter out drafts and sort posts
    const publishPosts = allBlogs.filter((post) => post.draft !== true)
    const sortedPosts = sortPosts(publishPosts)

    if (sortedPosts.length === 0) {
      return new NextResponse('No posts available', { status: 404 })
    }

    // Generate RSS feed
    const rssContent = generateRss(siteMetadata, sortedPosts)

    // Return with proper caching headers to prevent rate limiting
    return new NextResponse(rssContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
        'Vary': 'Accept-Encoding',
      },
    })
  } catch (error) {
    console.error('Error generating RSS feed:', error)
    return new NextResponse('Error generating RSS feed', { status: 500 })
  }
}

