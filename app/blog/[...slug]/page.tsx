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
import { Metadata } from 'next'
import siteMetadata from '@/data/siteMetadata'
import { notFound } from 'next/navigation'

const defaultLayout = 'PostLayout'
const layouts = {
  PostSimple,
  PostLayout,
  PostBanner,
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string[] }>
}): Promise<Metadata | undefined> {
  const params = await props.params
  const slug = decodeURI(params.slug.join('/'))
  // Filter out drafts in production
  const isProduction = process.env.NODE_ENV === 'production'
  const publishedPosts = isProduction ? allBlogs.filter((p) => p.draft !== true) : allBlogs
  const post = publishedPosts.find((p) => p.slug === slug)
  const authorList = post?.authors || ['default']
  const authorDetails = authorList.map((author) => {
    const authorResults = allAuthors.find((p) => p.slug === author)
    return coreContent(authorResults as Authors)
  })
  if (!post) {
    return
  }

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
    openGraph: {
      title: post.title,
      description: post.summary,
      siteName: siteMetadata.title,
      locale: 'en_US',
      type: 'article',
      publishedTime: publishedAt,
      modifiedTime: modifiedAt,
      url: `${siteMetadata.siteUrl}/${post.slug}`,
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
  const isProduction = process.env.NODE_ENV === 'production'
  const publishedPosts = isProduction ? allBlogs.filter((p) => p.draft !== true) : allBlogs
  return publishedPosts.map((p) => ({ slug: p.slug.split('/').map((name) => decodeURI(name)) }))
}

export default async function Page(props: { params: Promise<{ slug: string[] }> }) {
  const params = await props.params
  const slug = decodeURI(params.slug.join('/'))
  // Filter out drafts in production
  const isProduction = process.env.NODE_ENV === 'production'
  const publishedPosts = isProduction ? allBlogs.filter((p) => p.draft !== true) : allBlogs
  const sortedCoreContents = allCoreContent(sortPosts(publishedPosts))
  const postIndex = sortedCoreContents.findIndex((p) => p.slug === slug)
  if (postIndex === -1) {
    return notFound()
  }

  const prev = sortedCoreContents[postIndex + 1]
  const next = sortedCoreContents[postIndex - 1]
  const post = publishedPosts.find((p) => p.slug === slug) as Blog
  const authorList = post?.authors || ['default']
  const authorDetails = authorList.map((author) => {
    const authorResults = allAuthors.find((p) => p.slug === author)
    return coreContent(authorResults as Authors)
  })
  const mainContent = coreContent(post)
  const jsonLd = post.structuredData
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
    </>
  )
}
