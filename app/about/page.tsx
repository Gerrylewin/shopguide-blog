import { Authors, allAuthors } from 'contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import AuthorLayout from '@/layouts/AuthorLayout'
import { coreContent } from 'pliny/utils/contentlayer'
import { genPageMetadata } from 'app/seo'
import Image from '@/components/Image'
import BinaryFlowOverlay from '@/components/BinaryFlowOverlay'
import SocialIcon from '@/components/social-icons'

const MIRRORED_IMAGE =
  'https://assets.cdn.filesafe.space/YwFixzedrximlLRmcQo3/media/6935a537e0f092039328389d.png'
const NOAH_LINKEDIN = 'https://www.linkedin.com/in/noah-m%C3%BCller-18684b311/'

export const metadata = genPageMetadata({ title: 'Team' })

export default function Page() {
  const author = allAuthors.find((p) => p.slug === 'default') as Authors
  const mainContent = coreContent(author)

  const mirroredAvatar = (
    <Image
      src={MIRRORED_IMAGE}
      alt="Noah Müller"
      width={192}
      height={192}
      className="h-48 w-48 rounded-full object-cover"
    />
  )
  const mirroredAvatarWithGlow = (
    <div className="group/avatar relative isolate inline-flex">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-[-10px] rounded-full bg-cyan-500/25 blur-xl transition-opacity duration-300 group-hover/avatar:opacity-95"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-[-3px] rounded-full bg-cyan-400/45 blur-md transition-opacity duration-300 group-hover/avatar:opacity-100"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-cyan-300/50"
      />
      <span className="relative z-10 inline-flex rounded-full">{mirroredAvatar}</span>
    </div>
  )

  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
            Team
          </h1>
        </div>

        {/* Founder section: photo left, text right (same layout as Isaac) */}
        <div className="items-start space-y-2 pt-8 pb-8 xl:grid xl:grid-cols-3 xl:space-y-0 xl:gap-x-8">
          <div className="relative overflow-hidden rounded-2xl border border-gray-200/70 bg-white/70 px-6 pt-8 pb-6 dark:border-gray-700/70 dark:bg-gray-900/60">
            <BinaryFlowOverlay accentColor="#0891b2" />
            <div className="relative z-10 flex flex-col items-center space-x-2">
              <a
                href={NOAH_LINKEDIN}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer transition-opacity hover:opacity-80"
              >
                {mirroredAvatarWithGlow}
              </a>
              <h3 className="pt-4 pb-2 text-2xl leading-8 font-bold tracking-tight">Noah Müller</h3>
              <div className="text-gray-600 dark:text-gray-300">Founder</div>
              <div className="flex space-x-3 pt-6">
                <SocialIcon kind="linkedin" href={NOAH_LINKEDIN} />
              </div>
            </div>
          </div>
          <div className="prose dark:prose-invert max-w-none pt-8 pb-8 xl:col-span-2">
            <p>
              <strong>Young and dynamic</strong> – I am 24 years old and have taught myself about
              the world of AI during my studies here in Germany.
            </p>
            <p>
              <strong>Specialized</strong> – With &quot;The Ai-Agents&quot; I focus exclusively on
              Shopify stores.
            </p>
            <p>
              <strong>Salesperson</strong> – It quickly became clear to me: &quot;Sales is
              everything.&quot; I now have over three years of experience in various sales
              scenarios, which benefit the AI agent.
            </p>
          </div>
        </div>

        {/* Isaac Lewin section: image left, text right */}
        <div className="pt-8">
          <AuthorLayout content={mainContent} hideHeading>
          <MDXLayoutRenderer code={author.body.code} />
          </AuthorLayout>
        </div>
      </div>
    </>
  )
}
