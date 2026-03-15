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
const NOAH_GITHUB = 'https://github.com/ChefNoah007'
const NOAH_EMAIL = 'noah.mueller@yourshopguide.com'
const NOAH_BOOKING = 'https://api.leadconnectorhq.com/widget/booking/HIMiIRSQCRrr1QBz2Ai7'

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
                <SocialIcon kind="mail" href={`mailto:${NOAH_EMAIL}`} />
                <SocialIcon kind="linkedin" href={NOAH_LINKEDIN} />
                <SocialIcon kind="github" href={NOAH_GITHUB} />
              </div>
              <a
                href={NOAH_BOOKING}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-sm font-medium text-primary-500 underline hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Book a meeting
              </a>
            </div>
          </div>
          <div className="prose dark:prose-invert max-w-none pt-8 pb-8 xl:col-span-2">
            <p>
              <strong>At the forefront of agentic commerce</strong> – Noah is 24, based in Freiburg,
              Germany, and taught himself AI during his studies. He founded ShopGuide (Die
              Ai-Agents) in 2024 to help big-catalog Shopify stores add agentic commerce in one
              click—driving up to 30% higher AOV and 5× higher customer engagement.
            </p>
            <p>
              <strong>Proven impact</strong> – ShopGuide’s AI agents have generated over $250,000 in
              revenue for merchants. What started as a prototype and a cold call to{' '}
              <a
                href="https://goodbean.de"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-500 underline hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Goodbean.de
              </a>{' '}
              grew into a full Shopify app: weekly build cycles, context-aware agents on every page, and
              chat-to-purchase tracking. That first partner now sees the agent regularly close
              sales.
            </p>
            <p>
              <strong>Sales and execution</strong> – Noah’s background is in sales and
              entrepreneurship: pre-sales at Enpal (renewables), co-founder of Spotee-Golf, and
              three-plus years across sales roles. He believes &quot;Sales is everything&quot;—and
              built ShopGuide so the agent does the selling, not just the talking.
            </p>
            <p>
              <strong>Focused on Shopify</strong> – Noah and the team specialize only on Shopify:
              big catalogs, high AOV, and measurable outcomes. Young, technical, and
              merchant-obsessed.
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
