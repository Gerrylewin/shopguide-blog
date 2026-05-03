import { ReactNode, ReactElement } from 'react'
import Image from '@/components/Image'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import Comments from '@/components/Comments'
import Link from '@/components/Link'
import PageTitle from '@/components/PageTitle'
import SectionContainer from '@/components/SectionContainer'
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

interface LayoutProps {
  content: CoreContent<Blog>
  children: ReactNode
  next?: { path: string; title: string }
  prev?: { path: string; title: string }
}

export default function PostBanner({ content, next, prev, children }: LayoutProps) {
  const { slug, title, images } = content
  const displayImage = images && images.length > 0 ? images[0] : null
  const useObjectTop =
    slug ===
    'from-chatbots-to-digital-employees-how-noah-muller-is-building-the-future-of-agentic-commerce'

  return (
    <>
      <ReadingProgressBar />
      <BlogAd />
      <SectionContainer>
        <ScrollTopAndComment />
        <article>
          <div>
            <div className="space-y-1 pb-10 text-center dark:border-gray-700">
              {/* Title first */}
              <div className="relative pb-8">
                <PageTitle>{title}</PageTitle>
              </div>
              {/* Full-width hero image below title */}
              {displayImage && (
                <div className="w-full pb-8">
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
            </div>
            <div className="prose dark:prose-invert max-w-none py-4">{children}</div>
            <BlogAdInlineWithInsertion />
            {siteMetadata.comments && (
              <div className="pt-6 pb-6 text-center text-gray-700 dark:text-gray-300" id="comment">
                <Comments slug={slug} />
              </div>
            )}
            <footer>
              <div className="flex flex-col text-sm font-medium sm:flex-row sm:justify-between sm:text-base">
                {prev && prev.path && (
                  <div className="pt-4 xl:pt-8">
                    <Link
                      href={`/${prev.path}`}
                      className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                      aria-label={`Previous post: ${prev.title}`}
                    >
                      &larr; {prev.title}
                    </Link>
                  </div>
                )}
                {next && next.path && (
                  <div className="pt-4 xl:pt-8">
                    <Link
                      href={`/${next.path}`}
                      className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                      aria-label={`Next post: ${next.title}`}
                    >
                      {next.title} &rarr;
                    </Link>
                  </div>
                )}
              </div>
            </footer>
          </div>
        </article>
      </SectionContainer>
    </>
  )
}
