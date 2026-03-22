import { ReactNode, ReactElement } from 'react'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog, Authors } from 'contentlayer/generated'
import { formatDate } from '@/lib/formatDate'
import Comments from '@/components/Comments'
import Link from '@/components/Link'
import PageTitle from '@/components/PageTitle'
import SectionContainer from '@/components/SectionContainer'
import Image from '@/components/Image'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import ScrollTopAndComment from '@/components/ScrollTopAndComment'
import ReadingProgressBar from '@/components/ReadingProgressBar'
import BlogAd, { BlogAdInlineWithInsertion } from '@/components/BlogAd'

// Fallback for Bleed component if not available
type BleedComponent = ({ children }: { children: ReactNode }) => ReactElement

let Bleed: BleedComponent
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const BleedModule = require('pliny/ui/Bleed')
  Bleed = BleedModule.default || BleedModule
} catch {
  const FallbackBleed = ({ children }: { children: ReactNode }) => <div>{children}</div>
  FallbackBleed.displayName = 'FallbackBleed'
  Bleed = FallbackBleed
}

const editUrl = (path) => `${siteMetadata.siteRepo}/blob/main/data/${path}`
const discussUrl = (path) =>
  `https://mobile.twitter.com/search?q=${encodeURIComponent(`${siteMetadata.siteUrl}/${path}`)}`

interface LayoutProps {
  content: CoreContent<Blog>
  authorDetails: CoreContent<Authors>[]
  next?: CoreContent<Blog>
  prev?: CoreContent<Blog>
  children: ReactNode
}

function heroThumbnailSrc(post: CoreContent<Blog>): string | undefined {
  const imgs = post.images
  if (!imgs) return undefined
  if (typeof imgs === 'string') {
    const s = imgs.trim()
    return s.length > 0 ? s : undefined
  }
  if (Array.isArray(imgs) && imgs.length > 0 && typeof imgs[0] === 'string') {
    return imgs[0]
  }
  return undefined
}

function PostFooterNavLink({ post }: { post: CoreContent<Blog> }) {
  const thumb = heroThumbnailSrc(post)
  if (!post.path) return null
  return (
    <Link href={`/${post.path}`} className="group mt-2 block max-w-[220px]" aria-label={post.title}>
      {thumb && (
        <div className="group-hover:ring-primary-400/50 relative mb-2 aspect-[16/9] w-full overflow-hidden rounded-md ring-1 ring-gray-200/80 transition dark:ring-gray-600/80">
          <Image src={thumb} alt="" fill className="object-cover" sizes="220px" />
        </div>
      )}
      <span className="text-primary-500 group-hover:text-primary-600 dark:group-hover:text-primary-400">
        {post.title}
      </span>
    </Link>
  )
}

export default function PostLayout({ content, authorDetails, next, prev, children }: LayoutProps) {
  const { filePath, path, slug, date, title, tags, images } = content
  const callout = (content as CoreContent<Blog> & { callout?: string }).callout
  const basePath = path.split('/')[0]
  const displayImage = images && images.length > 0 ? images[0] : null
  const hideInlineAd = slug === 'ai-agent-vs-chatbot-how-to-tell-youre-leaking-conversions'
  const useObjectTop =
    slug ===
    'from-chatbots-to-digital-employees-how-noah-muller-is-building-the-future-of-agentic-commerce'

  return (
    <>
      <ReadingProgressBar />
      <BlogAd />
      <SectionContainer>
        <ScrollTopAndComment />
        <article data-post-slug={slug}>
          <div className="xl:divide-y xl:divide-gray-200 xl:dark:divide-gray-700">
            <header className="pt-6 xl:ml-2.5 xl:pb-6">
              <div className="space-y-1 text-center">
                <dl className="space-y-10">
                  <div>
                    <dt className="sr-only">Published on</dt>
                    <dd className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
                      <time dateTime={date}>{formatDate(date, siteMetadata.locale)}</time>
                    </dd>
                  </div>
                </dl>
                <div>
                  <PageTitle>{title}</PageTitle>
                </div>
              </div>
            </header>
            {/* Full-width hero image below title */}
            {displayImage && (
              <div className="w-full pt-6 pb-8 xl:ml-2.5">
                <Bleed>
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
                    <Image
                      src={displayImage}
                      alt={title}
                      fill
                      className={useObjectTop ? 'object-cover object-top' : 'object-cover'}
                    />
                  </div>
                </Bleed>
              </div>
            )}
            {/* TLDR Callout */}
            {callout && (
              <div className="pb-6 xl:ml-2.5">
                <div className="border-primary-200 bg-primary-50 dark:border-primary-800 dark:bg-primary-950/30 flex gap-4 rounded-xl border px-6 py-5">
                  <div className="mt-0.5 flex-shrink-0">
                    <span className="bg-primary-500 inline-flex h-7 w-7 items-center justify-center rounded-full text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4"
                      >
                        <path d="M11.983 1.907a.75.75 0 0 0-1.292-.657l-8.5 9.5A.75.75 0 0 0 2.75 12h6.572l-1.305 6.093a.75.75 0 0 0 1.292.657l8.5-9.5A.75.75 0 0 0 17.25 8h-6.572l1.305-6.093Z" />
                      </svg>
                    </span>
                  </div>
                  <div>
                    <p className="text-primary-600 dark:text-primary-400 mb-1 text-xs font-semibold tracking-widest uppercase">
                      TL;DR
                    </p>
                    <p className="text-base leading-relaxed text-gray-700 dark:text-gray-200">
                      {callout}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="grid-rows-[auto_1fr] divide-y divide-gray-200 pb-8 xl:ml-2.5 xl:grid xl:grid-cols-5 xl:gap-x-8 xl:divide-y-0 dark:divide-gray-700">
              <dl className="pt-6 pb-10 xl:border-b xl:border-gray-200 xl:pt-11 xl:dark:border-gray-700">
                <dt className="sr-only">Authors</dt>
                <dd>
                  <ul className="flex flex-wrap justify-center gap-4 sm:space-x-12 xl:block xl:space-y-8 xl:space-x-0">
                    {authorDetails.map((author) => (
                      <li className="flex items-center space-x-2" key={author.name}>
                        {author.avatar && (
                          <Image
                            src={author.avatar}
                            width={38}
                            height={38}
                            alt="avatar"
                            className="h-10 w-10 rounded-full"
                          />
                        )}
                        <dl className="text-sm leading-5 font-medium whitespace-nowrap">
                          <dt className="sr-only">Name</dt>
                          <dd className="text-gray-900 dark:text-gray-100">{author.name}</dd>
                          <dt className="sr-only">Twitter</dt>
                          <dd>
                            {author.twitter && (
                              <Link
                                href={author.twitter}
                                className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                              >
                                {author.twitter
                                  .replace('https://twitter.com/', '@')
                                  .replace('https://x.com/', '@')}
                              </Link>
                            )}
                          </dd>
                        </dl>
                      </li>
                    ))}
                  </ul>
                </dd>
              </dl>
              <div className="divide-y divide-gray-200 xl:col-span-4 xl:row-span-2 xl:pb-0 dark:divide-gray-700">
                <div className="prose dark:prose-invert max-w-none pt-10 pb-8">{children}</div>
                {!hideInlineAd && <BlogAdInlineWithInsertion />}
                <div className="pt-6 pb-6 text-sm text-gray-700 dark:text-gray-300">
                  <Link href={discussUrl(path)} rel="nofollow">
                    Discuss on Twitter
                  </Link>
                  {` • `}
                  <Link href={editUrl(filePath)}>View on GitHub</Link>
                </div>
                {siteMetadata.comments && (
                  <div
                    className="pt-6 pb-6 text-center text-gray-700 dark:text-gray-300"
                    id="comment"
                  >
                    <Comments slug={slug} />
                  </div>
                )}
              </div>
              <footer>
                <div className="divide-gray-200 text-sm leading-5 font-medium xl:col-start-1 xl:row-start-2 xl:divide-y dark:divide-gray-700">
                  {tags && (
                    <div className="py-4 xl:py-8">
                      <h2 className="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">
                        Tags
                      </h2>
                      <div className="flex flex-wrap">
                        {tags.map((tag) => (
                          <Tag key={tag} text={tag} />
                        ))}
                      </div>
                    </div>
                  )}
                  {(next || prev) && (
                    <div className="flex justify-between py-4 xl:block xl:space-y-8 xl:py-8">
                      {prev && prev.path && (
                        <div>
                          <h2 className="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">
                            Previous Article
                          </h2>
                          <PostFooterNavLink post={prev} />
                        </div>
                      )}
                      {next && next.path && (
                        <div>
                          <h2 className="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">
                            Next Article
                          </h2>
                          <PostFooterNavLink post={next} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="pt-4 xl:pt-8">
                  <Link
                    href={`/${basePath}`}
                    className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                    aria-label="Back to the blog"
                  >
                    &larr; Back to the blog
                  </Link>
                </div>
              </footer>
            </div>
          </div>
        </article>
      </SectionContainer>
    </>
  )
}
