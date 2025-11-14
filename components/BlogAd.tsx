'use client'

import Link from '@/components/Link'

export default function BlogAd() {
  return (
    <div className="hidden xl:block">
      <div className="fixed top-24 right-8 z-[60] w-48">
        <Link
          href="https://apps.shopify.com/die-ai-agent-official-app"
          target="_blank"
          rel="noopener noreferrer"
          className="group block rounded-lg border border-gray-200 bg-white p-4 shadow-lg transition-all hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="mb-3 text-center">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Try Agentic Commerce for
            </p>
          </div>
          <div className="flex justify-center">
            <ShopifyLogo />
          </div>
        </Link>
      </div>
    </div>
  )
}

function ShopifyLogo() {
  return (
    <svg
      width="120"
      height="30"
      viewBox="0 0 120 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="dark:opacity-90"
      aria-label="Shopify"
    >
      {/* Shopping Bag Icon - simplified version */}
      <g transform="translate(0, 2)">
        {/* Bag front face (lighter green) */}
        <rect x="8" y="2" width="12" height="12" rx="1" fill="#95BF47" />
        {/* Bag side panel (darker green) */}
        <path d="M20 2L24 2L24 14L20 14L20 2Z" fill="#5E8E3E" />
        {/* Bag handles */}
        <rect x="10" y="1" width="4" height="2" rx="0.5" fill="#95BF47" />
        <rect x="14" y="1" width="4" height="2" rx="0.5" fill="#95BF47" />
        {/* White S on bag */}
        <text
          x="14"
          y="10"
          fontSize="9"
          fontWeight="bold"
          fill="white"
          textAnchor="middle"
          fontFamily="Arial, sans-serif"
        >
          S
        </text>
      </g>
      {/* Shopify wordmark */}
      <text
        x="32"
        y="20"
        fontSize="18"
        fontWeight="bold"
        fill="currentColor"
        className="text-gray-900 dark:text-white"
        fontFamily="Arial, sans-serif"
        fontStyle="italic"
      >
        shopify
      </text>
    </svg>
  )
}
