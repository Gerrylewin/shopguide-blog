'use client'

import Link from '@/components/Link'

export default function BlogAd() {
  return (
    <div className="hidden lg:block">
      <div className="fixed top-24 right-8 z-40 w-56">
        <Link
          href="https://apps.shopify.com/die-ai-agent-official-app"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block overflow-hidden rounded-lg border-2 border-emerald-500/30 bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 shadow-2xl transition-all duration-300 hover:border-emerald-400 hover:shadow-emerald-500/20 dark:border-emerald-400/40 dark:from-black dark:via-gray-900 dark:to-gray-800 dark:hover:border-emerald-300"
        >
          {/* Glitch effect overlay */}
          <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent" />
          </div>

          {/* Terminal-style header */}
          <div className="mb-3 flex items-center gap-2 border-b border-emerald-500/20 pb-2">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </div>
            <span className="font-mono text-[10px] text-emerald-400/60">agentic_commerce.exe</span>
          </div>

          {/* Main content */}
          <div className="relative space-y-3">
            <div className="text-center">
              <p className="font-mono text-xs font-semibold tracking-wider text-emerald-400 uppercase">
                &gt; Deploy AI Agent
              </p>
              <p className="mt-1 font-mono text-[10px] text-gray-400">for Shopify stores</p>
            </div>

            {/* Shopify Logo */}
            <div className="mt-3 flex justify-center">
              <div className="relative">
                <img
                  src="https://storage.googleapis.com/msgsndr/YwFixzedrximlLRmcQo3/media/691725b623d72d77dc280d33.png"
                  alt="Shopify"
                  className="h-auto w-20 transition-all duration-300 group-hover:opacity-90"
                />
              </div>
            </div>

            {/* Terminal prompt */}
            <div className="mt-3 flex items-center justify-center gap-1 font-mono text-[9px] text-emerald-500/70">
              <span className="text-emerald-400">$</span>
              <span className="animate-pulse">npm install agentic-commerce</span>
            </div>
          </div>

          {/* Scanline effect */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </Link>
      </div>
    </div>
  )
}
