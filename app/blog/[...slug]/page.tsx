import 'css/prism.css'
import 'katex/dist/katex.css'

import PageTitle from '@/components/PageTitle'
import { components } from '@/components/MDXComponents'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { sortPosts, coreContent, allCoreContent } from 'pliny/utils/contentlayer'
import { allBlogs, allAuthors } from 'contentlayer/generated'
import type { Authors, Blog } from 'contentlayer/generated'
import PostSimple from '@/layouts/PostSimple'
import PostLayout from '@/layouts/PostLayout'
import PostBanner from '@/layouts/PostBanner'
import BlogPostVote from '@/components/BlogPostVote'
import { isBlogVoteStorageAvailable } from '@/lib/cloudflare-d1'
import { Metadata } from 'next'
import siteMetadata from '@/data/siteMetadata'
import { notFound } from 'next/navigation'

const defaultLayout = 'PostLayout'
const layouts = {
  PostSimple,
  PostLayout,
  PostBanner,
}

const isProduction = process.env.NODE_ENV === 'production'
const publishedPosts = isProduction ? allBlogs.filter((p) => p.draft !== true) : allBlogs
const sortedCoreContents = allCoreContent(sortPosts(publishedPosts))

// Pre-compute maps for O(1) lookups
const postMap = new Map(publishedPosts.map((post) => [post.slug, post]))
const postIndexMap = new Map(sortedCoreContents.map((post, index) => [post.slug, index]))
const authorMap = new Map(allAuthors.map((author) => [author.slug, coreContent(author as Authors)]))

export async function generateMetadata(props: {
  params: Promise<{ slug: string[] }>
}): Promise<Metadata | undefined> {
  const params = await props.params
  const slug = decodeURI(params.slug.join('/'))
  // Filter out drafts in production
  const post = postMap.get(slug)
  const authorList = post?.authors || ['default']
  const authorDetails = authorList
    .map((author) => authorMap.get(author) || authorMap.get('default'))
    .filter((a): a is NonNullable<typeof a> => !!a)
  if (!post) {
    return
  }
  const canonicalPath = `/${post.path}`
  const canonicalUrl = `${siteMetadata.siteUrl}${canonicalPath}`

  const publishedAt = new Date(post.date).toISOString()
  const modifiedAt = new Date(post.lastmod || post.date).toISOString()
  const authors = authorDetails.map((author) => author.name)
  // Default to ShopGuide logo for social sharing
  let imageList = [siteMetadata.socialBanner]
  // Only use post.images if it's a non-empty array or a non-empty string
  if (post.images) {
    if (typeof post.images === 'string' && post.images.trim().length > 0) {
      imageList = [post.images]
    } else if (Array.isArray(post.images) && post.images.length > 0) {
      imageList = post.images
    }
    // If post.images is empty array or empty string, keep default socialBanner
  }
  // Ensure all images are absolute URLs
  const absoluteImageList = imageList.map((img) => {
    if (img && img.includes('http')) {
      return img
    }
    return siteMetadata.siteUrl + img
  })
  // LinkedIn prefers images with width and height specified
  // Using standard social media image dimensions (1200x630 is recommended)
  const ogImages = absoluteImageList.map((img) => {
    return {
      url: img,
      width: 1200,
      height: 630,
      alt: post.title,
    }
  })

  return {
    title: post.title,
    description: post.summary,
    alternates: {
      canonical: canonicalPath,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: post.title,
      description: post.summary,
      siteName: siteMetadata.title,
      locale: 'en_US',
      type: 'article',
      publishedTime: publishedAt,
      modifiedTime: modifiedAt,
      url: canonicalUrl,
      images: ogImages,
      authors: authors.length > 0 ? authors : [siteMetadata.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
      images: absoluteImageList,
    },
  }
}

export const generateStaticParams = async () => {
  // Filter out drafts in production
  return publishedPosts.map((p) => ({ slug: p.slug.split('/').map((name) => decodeURI(name)) }))
}

export default async function Page(props: { params: Promise<{ slug: string[] }> }) {
  const params = await props.params
  const slug = decodeURI(params.slug.join('/'))
  // Filter out drafts in production
  const postIndex = postIndexMap.get(slug) ?? -1
  if (postIndex === -1) {
    return notFound()
  }

  const prev = sortedCoreContents[postIndex + 1]
  const next = sortedCoreContents[postIndex - 1]
  const post = postMap.get(slug) as Blog
  const authorList = post?.authors || ['default']
  const authorDetails = authorList
    .map((author) => authorMap.get(author) || authorMap.get('default'))
    .filter((a): a is NonNullable<typeof a> => !!a)
  const mainContent = coreContent(post)
  const canonicalPath = `/${post.path}`
  const canonicalUrl = `${siteMetadata.siteUrl}${canonicalPath}`
  const jsonLd = post.structuredData
  jsonLd['publisher'] = {
    '@type': 'Organization',
    name: siteMetadata.title,
    logo: {
      '@type': 'ImageObject',
      url: `${siteMetadata.siteUrl}${siteMetadata.siteLogo}`,
    },
  }
  jsonLd['mainEntityOfPage'] = {
    '@type': 'WebPage',
    '@id': canonicalUrl,
  }
  jsonLd['author'] = authorDetails.map((author) => {
    return {
      '@type': 'Person',
      name: author.name,
    }
  })

  const layoutName = (post.layout || defaultLayout).trim()
  const Layout = layouts[layoutName]

  if (!Layout) {
    console.error(`Layout "${layoutName}" not found. Available layouts:`, Object.keys(layouts))
    return notFound()
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Layout content={mainContent} authorDetails={authorDetails} next={next} prev={prev}>
        <MDXLayoutRenderer code={post.body.code} components={components} toc={post.toc} />
      </Layout>
      {isBlogVoteStorageAvailable() ? <BlogPostVote slug={slug} variant="floating" /> : null}
    </>
  )
}
