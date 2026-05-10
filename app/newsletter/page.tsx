import { genPageMetadata } from 'app/seo'
import NewsletterFormWithLogging from '@/components/NewsletterFormWithLogging'

export const metadata = genPageMetadata({ title: 'Newsletter - ShopGuide Blog' })

export default function Newsletter() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center py-12">
      <div className="w-full max-w-2xl px-4 sm:px-6 xl:px-0">
        <div className="mb-10 text-center">
          <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-5xl md:leading-14 dark:text-gray-100">
            Subscribe to our Newsletter
          </h1>
          <p className="mt-4 text-lg leading-7 text-gray-500 dark:text-gray-400">
            Get the latest insights on Agentic Commerce, AI trends, and Shopify growth strategies
            delivered straight to your inbox.
          </p>
        </div>
        <div className="flex justify-center">
          <NewsletterFormWithLogging />
        </div>
      </div>
    </div>
  )
}
