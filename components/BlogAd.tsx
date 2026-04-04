'use client'

import Image from 'next/image'
import Link from '@/components/Link'
import { useEffect, useState } from 'react'

const TERMINAL_MESSAGES = ['npm install agentic-commerce', 'click here for a free trial'] as const

/** Per-character delays; full cycle is roughly 9–12s per message. */
const TYPE_MS = 45
const HOLD_MS = 5000
const ERASE_MS = 38

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
}

type BlogAdVariant = 'floating' | 'inline'

function BlogAdTerminalPrompt({ variant }: { variant: BlogAdVariant }) {
  const [line, setLine] = useState('')
  const [msgIdx, setMsgIdx] = useState(0)

  useEffect(() => {
    let cancelled = false
    const full = TERMINAL_MESSAGES[msgIdx]

    async function run() {
      for (let i = 0; i <= full.length; i++) {
        if (cancelled) return
        setLine(full.slice(0, i))
        await delay(TYPE_MS)
      }
      await delay(HOLD_MS)
      if (cancelled) return
      for (let i = full.length; i >= 0; i--) {
        if (cancelled) return
        setLine(full.slice(0, i))
        await delay(ERASE_MS)
      }
      if (!cancelled) {
        setMsgIdx((j) => (j + 1) % TERMINAL_MESSAGES.length)
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [msgIdx])

  if (variant === 'floating') {
    return (
      <div className="mt-2 flex justify-center font-mono text-[8px] text-emerald-500/70">
        <div className="flex min-h-[1.25rem] w-full max-w-full min-w-0 items-center justify-center gap-1">
          <span className="shrink-0 text-emerald-400">$</span>
          <span className="min-w-0 text-center leading-tight break-words whitespace-normal">
            {line}
          </span>
          <span className="h-2.5 w-1 shrink-0 animate-pulse bg-emerald-500" aria-hidden />
        </div>
      </div>
    )
  }

  return (
    <div className="mt-3 flex justify-center border-t border-emerald-500/15 pt-2 font-mono text-[10px] text-emerald-500/70 sm:text-xs">
      <div className="flex min-h-[1.35rem] w-full max-w-full min-w-0 items-center justify-center gap-1.5">
        <span className="shrink-0 text-emerald-400">$</span>
        <span className="min-w-0 text-center leading-tight break-words whitespace-normal">
          {line}
        </span>
        <span className="h-3 w-0.5 shrink-0 animate-pulse bg-emerald-500" aria-hidden />
      </div>
    </div>
  )
}

/**
 * `floating` — fixed scroll-in card (desktop): original compact terminal, unchanged.
 * `inline` — bottom-of-article ad only: wider, moderately larger type and logo.
 */
function AdContent({ variant }: { variant: BlogAdVariant }) {
  const isFloating = variant === 'floating'

  return (
    <Link
      href="https://apps.shopify.com/die-ai-agent-official-app"
      target="_blank"
      rel="noopener noreferrer"
      className={
        isFloating
          ? 'group relative block overflow-hidden rounded-lg border-2 border-emerald-500/30 bg-gradient-to-br from-gray-900 via-gray-800 to-black p-3 shadow-2xl transition-all duration-300 hover:border-emerald-400 hover:shadow-emerald-500/20 dark:border-emerald-400/40 dark:from-black dark:via-gray-900 dark:to-gray-800 dark:hover:border-emerald-300'
          : 'group relative block w-full overflow-hidden rounded-xl border-2 border-emerald-500/30 bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 shadow-2xl transition-all duration-300 hover:border-emerald-400 hover:shadow-emerald-500/20 sm:p-5 dark:border-emerald-400/40 dark:from-black dark:via-gray-900 dark:to-gray-800 dark:hover:border-emerald-300'
      }
    >
      {/* Tron Grid Background with Scanning Effect */}
      <div className="tron-grid-bg pointer-events-none absolute inset-0 opacity-[0.15]">
        <div className="animate-grid-scan absolute inset-0 h-20 w-full bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent" />
      </div>

      {/* Border Beam Animation (Racing Light Trail) */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="animate-border-beam absolute h-[2px] w-24 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
          style={{
            offsetPath: isFloating ? 'inset(0% round 0.5rem)' : 'inset(0% round 0.75rem)',
            offsetAnchor: '50% 50%',
          }}
        />
      </div>

      {/* Glitch effect overlay */}
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent" />
      </div>

      {/* Terminal-style header */}
      <div
        className={
          isFloating
            ? 'relative z-10 mb-2 flex items-center gap-2 border-b border-emerald-500/20 pb-1.5'
            : 'relative z-10 mb-3 flex items-center gap-2 border-b border-emerald-500/20 pb-2'
        }
      >
        <div className="flex gap-1.5">
          <div className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
          <div className="h-2 w-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
          <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        </div>
        <span
          className={
            isFloating
              ? 'font-mono text-[9px] text-emerald-400/60'
              : 'font-mono text-[10px] text-emerald-400/60 sm:text-xs'
          }
        >
          agentic_commerce.exe
        </span>
      </div>

      {isFloating ? (
        <div className="relative z-10 space-y-2">
          <div className="text-center">
            <p className="text-glow-primary font-mono text-[10px] font-semibold tracking-wider text-emerald-400 uppercase">
              &gt; Deploy AI Agent
            </p>
            <p className="mt-0.5 font-mono text-[9px] text-gray-400">for Shopify stores</p>
          </div>

          <div className="mt-2 flex justify-center">
            <div className="relative h-10 w-16">
              <Image
                src="https://storage.googleapis.com/msgsndr/YwFixzedrximlLRmcQo3/media/691725b623d72d77dc280d33.png"
                alt="Shopify"
                fill
                sizes="64px"
                className="object-contain transition-all duration-300 group-hover:scale-110 group-hover:opacity-90"
                priority
              />
            </div>
          </div>

          <BlogAdTerminalPrompt variant="floating" />
        </div>
      ) : (
        <div className="relative z-10">
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
            <div className="min-w-0 flex-1 space-y-1 text-center sm:text-left">
              <p className="text-glow-primary font-mono text-xs font-semibold tracking-wide text-emerald-400 uppercase sm:text-sm">
                &gt; Deploy AI Agent
              </p>
              <p className="font-mono text-[11px] text-gray-400 sm:text-xs">for Shopify stores</p>
            </div>
            <div className="flex shrink-0 justify-center sm:justify-end">
              <div className="relative h-12 w-20 sm:h-14 sm:w-[5.5rem]">
                <Image
                  src="https://storage.googleapis.com/msgsndr/YwFixzedrximlLRmcQo3/media/691725b623d72d77dc280d33.png"
                  alt="Shopify"
                  fill
                  sizes="(max-width: 640px) 80px, 96px"
                  className="object-contain transition-all duration-300 group-hover:scale-110 group-hover:opacity-90"
                  priority
                />
              </div>
            </div>
          </div>

          <BlogAdTerminalPrompt variant="inline" />
        </div>
      )}

      {/* Scanline effect */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </Link>
  )
}

export default function BlogAd() {
  const [showAd, setShowAd] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY || document.documentElement.scrollTop

      // Calculate the total scrollable height
      const totalScrollableHeight = documentHeight - windowHeight

      // Calculate scroll percentage
      const scrollPercentage =
        totalScrollableHeight > 0 ? (scrollTop / totalScrollableHeight) * 100 : 0

      // Show ad when user scrolls 25% down the page
      if (scrollPercentage >= 25) {
        setShowAd(true)
      } else {
        setShowAd(false)
      }
    }

    // Initial calculation
    handleScroll()

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  return (
    <>
      {/* Desktop: Fixed on the side, slides in from right at 25% scroll */}
      <div className="hidden lg:block">
        <div
          className={`fixed top-24 right-4 z-40 w-52 transition-all duration-500 ease-out ${
            showAd ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-full opacity-0'
          }`}
        >
          <AdContent variant="floating" />
        </div>
      </div>
    </>
  )
}

// Mobile/Tablet inline version
export function BlogAdInline() {
  return (
    <div
      className="prose prose-lg dark:prose-invert my-8 block max-w-none lg:hidden"
      style={{ display: 'none' }}
      id="blog-ad-inline-mobile"
    >
      <div className="not-prose flex justify-center">
        <div className="w-full max-w-xl">
          <AdContent variant="inline" />
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
      const proseElement =
        Array.from(proseElements).find((el) => el.querySelector('h2') !== null) || proseElements[0]

      if (!proseElement) return

      const adElement = document.getElementById('blog-ad-inline-mobile')
      if (!adElement) return

      // If there's an About Author section, anchor the ad before it
      const aboutAuthorAnchor =
        proseElement.querySelector('#about-author') ||
        Array.from(proseElement.querySelectorAll('h2')).find(
          (heading) => heading.textContent?.trim().toLowerCase() === 'about author'
        )

      if (aboutAuthorAnchor && aboutAuthorAnchor.parentNode) {
        adElement.style.display = 'block'
        if (adElement.parentNode) {
          adElement.parentNode.removeChild(adElement)
        }
        aboutAuthorAnchor.parentNode.insertBefore(adElement, aboutAuthorAnchor)
        return
      }

      // Place ad before FAQ so accordion expansion doesn't move the ad around
      const faqHeading = Array.from(proseElement.querySelectorAll('h2')).find((heading) => {
        const normalizedHeading = heading.textContent?.trim().toLowerCase()
        return normalizedHeading === 'frequently asked questions' || normalizedHeading === 'faq'
      })

      if (faqHeading && faqHeading.parentNode) {
        adElement.style.display = 'block'
        if (adElement.parentNode) {
          adElement.parentNode.removeChild(adElement)
        }
        faqHeading.parentNode.insertBefore(adElement, faqHeading)
        return
      }

      // Look for h2 with "References" text
      const headings = proseElement.querySelectorAll('h2')
      let referencesHeading: Element | null = null

      for (let i = 0; i < headings.length; i++) {
        const heading = headings[i]
        if (heading.textContent?.trim().toLowerCase() === 'references') {
          referencesHeading = heading
          break
        }
      }

      // If found, insert the ad before it
      if (referencesHeading && referencesHeading.parentNode) {
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
