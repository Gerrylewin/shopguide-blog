import integrationsData from '@/data/integrationsData'
import Card from '@/components/Card'
import NewsletterFormWithLogging from '@/components/NewsletterFormWithLogging'
import siteMetadata from '@/data/siteMetadata'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({ title: 'Integrations' })

export default function Integrations() {
  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="pt-6 pb-8">
          <div className="to-primary-50/30 relative overflow-hidden rounded-3xl border border-gray-200/90 bg-gradient-to-br from-gray-50 via-white px-5 py-9 shadow-sm ring-1 ring-gray-900/5 sm:px-8 sm:py-11 dark:border-gray-800 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900/80 dark:ring-white/10">
            {/* Even, full-width texture so the section feels balanced (not “heavy” on one side) */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.55] dark:opacity-[0.35]"
              aria-hidden
            >
              <div
                className="absolute inset-0 bg-[linear-gradient(to_right,#64748b14_1px,transparent_1px),linear-gradient(to_bottom,#64748b14_1px,transparent_1px)] bg-[length:28px_28px] dark:bg-[linear-gradient(to_right,#ffffff0d_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0d_1px,transparent_1px)]"
                style={{
                  maskImage:
                    'radial-gradient(ellipse 85% 75% at 50% 45%, black 20%, transparent 72%)',
                  WebkitMaskImage:
                    'radial-gradient(ellipse 85% 75% at 50% 45%, black 20%, transparent 72%)',
                }}
              />
            </div>
            <div className="relative z-10 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,36rem)] lg:items-center lg:gap-12 xl:gap-14">
              <div className="min-w-0 space-y-3 md:space-y-4">
                <h1 className="font-heading text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-[1.12] md:text-5xl md:leading-[1.1] dark:text-gray-100">
                  Integrations
                </h1>
                <p className="max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg dark:text-gray-400">
                  Discover powerful integrations for your Shopify store
                </p>
              </div>
              {siteMetadata.newsletter?.provider ? (
                <div className="w-full lg:flex lg:justify-end">
                  <NewsletterFormWithLogging variant="narrow" />
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div className="container py-12">
          <div className="-m-4 flex flex-wrap">
            {integrationsData.map((d) => (
              <Card
                key={d.title}
                title={d.title}
                description={d.description}
                imgSrc={d.imgSrc}
                href={d.href}
                target="_self"
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
