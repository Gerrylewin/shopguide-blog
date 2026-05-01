import React from 'react'
import Link from './Link'
import Image from './Image'

interface ShopifyCTAProps {
  title?: string
  description?: string
  buttonText?: string
  href?: string
}

const ShopifyCTA = ({
  title = 'Scale your Shopify store with AI Agents',
  description = 'Join the leading Shopify merchants using ShopGuide to automate discovery and increase AOV.',
  buttonText = 'View on Shopify App Store',
  href = 'https://apps.shopify.com/shopguide',
}: ShopifyCTAProps) => {
  return (
    <div className="my-8 overflow-hidden rounded-xl border border-gray-200 bg-[#f6f6f7] shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-col items-center p-6 sm:flex-row sm:p-8">
        <div className="mb-6 flex-shrink-0 sm:mr-8 sm:mb-0">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-lg bg-white p-2 shadow-sm dark:bg-gray-800">
            <Image
              src="/static/images/blog/shopify-bag-only.svg"
              alt="Shopify"
              width={40}
              height={40}
            />
          </div>
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h3>
          <p className="mb-6 text-gray-600 dark:text-gray-400">{description}</p>
          <div className="flex flex-wrap justify-center gap-4 sm:justify-start">
            <Link
              href={href}
              className="inline-flex items-center rounded-md bg-[#008060] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#006e52] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#008060]"
            >
              {buttonText}
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
            <div className="flex items-center text-sm font-medium text-gray-500">
              <svg
                className="mr-1.5 h-5 w-5 text-[#008060]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Shopify Partner
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-100/50 px-6 py-3 dark:bg-gray-800/50">
        <p className="text-center text-xs font-medium tracking-wider text-gray-500 uppercase">
          Trusted by 2,500+ Shopify Merchants worldwide
        </p>
      </div>
    </div>
  )
}

export default ShopifyCTA
