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
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
            <div className="min-w-0 space-y-2 md:space-y-5 lg:max-w-xl">
              <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
                Integrations
              </h1>
              <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
                Discover powerful integrations for your Shopify store
              </p>
            </div>
            {siteMetadata.newsletter?.provider ? (
              <div className="shrink-0 lg:ml-auto lg:pt-1">
                <NewsletterFormWithLogging variant="narrow" />
              </div>
            ) : null}
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
