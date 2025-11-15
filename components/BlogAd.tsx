'use client'

import Link from '@/components/Link'
import { useEffect } from 'react'

const AdContent = () => (
  <Link
    href="https://apps.shopify.com/die-ai-agent-official-app"
    target="_blank"
    rel="noopener noreferrer"
    className="group relative block overflow-hidden rounded-lg border-2 border-emerald-500/30 bg-gradient-to-br from-gray-900 via-gray-800 to-black p-3 shadow-2xl transition-all duration-300 hover:border-emerald-400 hover:shadow-emerald-500/20 dark:border-emerald-400/40 dark:from-black dark:via-gray-900 dark:to-gray-800 dark:hover:border-emerald-300"
  >
    {/* Glitch effect overlay */}
    <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
      <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent" />
    </div>

    {/* Terminal-style header */}
    <div className="mb-2 flex items-center gap-2 border-b border-emerald-500/20 pb-1.5">
      <div className="flex gap-1.5">
        <div className="h-2 w-2 rounded-full bg-red-500" />
        <div className="h-2 w-2 rounded-full bg-yellow-500" />
        <div className="h-2 w-2 rounded-full bg-emerald-500" />
      </div>
      <span className="font-mono text-[9px] text-emerald-400/60">agentic_commerce.exe</span>
    </div>

    {/* Main content */}
    <div className="relative space-y-2">
      <div className="text-center">
        <p className="font-mono text-[10px] font-semibold tracking-wider text-emerald-400 uppercase">
          &gt; Deploy AI Agent
        </p>
        <p className="mt-0.5 font-mono text-[9px] text-gray-400">for Shopify stores</p>
      </div>

      {/* Shopify Logo */}
      <div className="mt-2 flex justify-center">
        <div className="relative">
          <img
            src="https://storage.googleapis.com/msgsndr/YwFixzedrximlLRmcQo3/media/691725b623d72d77dc280d33.png"
            alt="Shopify"
            className="h-auto w-16 transition-all duration-300 group-hover:opacity-90"
          />
        </div>
      </div>

      {/* Terminal prompt */}
      <div className="mt-2 flex items-center justify-center gap-1 font-mono text-[8px] text-emerald-500/70">
        <span className="text-emerald-400">$</span>
        <span className="animate-pulse">npm install agentic-commerce</span>
      </div>
    </div>

    {/* Scanline effect */}
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
  </Link>
)

export default function BlogAd() {
  return (
    <>
      {/* Desktop: Fixed on the side */}
      <div className="hidden lg:block">
        <div className="fixed top-24 right-8 z-40 w-52">
          <AdContent />
        </div>
      </div>
    </>
  )
}

// Mobile/Tablet inline version
export function BlogAdInline() {
  return (
    <div
      className="block lg:hidden my-8 prose prose-lg max-w-none dark:prose-invert"
      style={{ display: 'none' }}
      id="blog-ad-inline-mobile"
    >
      <div className="flex justify-center not-prose">
        <div className="w-full max-w-md">
          <AdContent />
        </div>
      </div>
    </div>
  )
}

// Client component to handle insertion before references
export function BlogAdInlineWithInsertion() {
  useEffect(() => {
    // Wait for content to be ready
    const insertAd = () => {
      // Find the prose element (the one containing the blog content)
      const proseElements = document.querySelectorAll('.prose')
      // Get the main prose element (usually the first one with content)
      const proseElement = Array.from(proseElements).find(
        (el) => el.querySelector('h2') !== null
      ) || proseElements[0]

      if (!proseElement) return

      const adElement = document.getElementById('blog-ad-inline-mobile')
      if (!adElement) return

      // Look for h2 with "References" text
      const headings = proseElement.querySelectorAll('h2')
      let referencesHeading: Element | null = null

      headings.forEach((heading) => {
        if (heading.textContent?.trim().toLowerCase() === 'references') {
          referencesHeading = heading
        }
      })

      // If found, insert the ad before it
      if (referencesHeading?.parentNode) {
        adElement.style.display = 'block'
        // Remove from current position if already in DOM
        if (adElement.parentNode) {
          adElement.parentNode.removeChild(adElement)
        }
        referencesHeading.parentNode.insertBefore(adElement, referencesHeading)
      } else {
        // If no references found, show at the end of prose content
        adElement.style.display = 'block'
        // Remove from current position if already in DOM
        if (adElement.parentNode) {
          adElement.parentNode.removeChild(adElement)
        }
        proseElement.appendChild(adElement)
      }
    }

    // Try immediately, then with a small delay to ensure DOM is ready
    insertAd()
    const timeoutId = setTimeout(insertAd, 100)

    return () => clearTimeout(timeoutId)
  }, [])

  return <BlogAdInline />
}
