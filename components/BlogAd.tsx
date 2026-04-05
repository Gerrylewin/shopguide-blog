'use client'

import Image from 'next/image'
import Link from '@/components/Link'
import { SHOPIFY_GREEN_WORDMARK_URL } from '@/lib/shopify-brand'
import { useEffect, useState } from 'react'

const TERMINAL_MESSAGES = ['npm install agentic-commerce', 'click here for a free trial'] as const

const SHOPIFY_APP_URL = 'https://apps.shopify.com/die-ai-agent-official-app'

/** Edit `floating` vs `inline` below independently — they do not share Tailwind strings. */
type BlogAdPlacement = 'floating' | 'inline'

type BlogAdLayout = {
  /** Root Link + optional hook class for global CSS (e.g. `.blog-ad-inline .tron-grid-bg`) */
  link: string
  gridScan: string
  borderBeam: string
  borderBeamOffsetRound: string
  header: string
  trafficFlex: string
  trafficRed: string
  trafficYellow: string
  trafficGreen: string
  titleBar: string
  mainStack: string
  headline: string
  subhead: string
  logoSection: string
  logoBox: string
  imageSizes: string
  promptOuter: string
  promptInner: string
  promptCursor: string
}

const BLOG_AD_LAYOUT: Record<BlogAdPlacement, BlogAdLayout> = {
  /** ~1.5× scale vs original floating ad (fixed column + typography + logo). */
  floating: {
    link: 'blog-ad-floating group relative block overflow-hidden rounded-xl border-[3px] border-emerald-500/30 bg-gradient-to-br from-gray-900 via-gray-800 to-black p-[18px] shadow-2xl transition-all duration-300 hover:border-emerald-400 hover:shadow-emerald-500/20 dark:border-emerald-400/40 dark:from-black dark:via-gray-900 dark:to-gray-800 dark:hover:border-emerald-300',
    gridScan:
      'animate-grid-scan absolute inset-0 h-[7.5rem] w-full bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent',
    borderBeam:
      'animate-border-beam absolute h-[3px] w-36 bg-gradient-to-r from-transparent via-emerald-400 to-transparent',
    borderBeamOffsetRound: '0.75rem',
    header: 'relative z-10 mb-3 flex items-center gap-3 border-b border-emerald-500/20 pb-2',
    trafficFlex: 'flex gap-2.5',
    trafficRed: 'h-3 w-3 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]',
    trafficYellow: 'h-3 w-3 rounded-full bg-yellow-500 shadow-[0_0_12px_rgba(234,179,8,0.5)]',
    trafficGreen: 'h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]',
    titleBar: 'font-mono text-[13.5px] text-emerald-400/60',
    mainStack: 'relative z-10 space-y-3',
    headline:
      'text-glow-primary font-mono text-[15px] font-semibold tracking-wider text-emerald-400 uppercase',
    subhead: 'mt-[3px] font-mono text-[13.5px] text-gray-400',
    logoSection: 'mt-3 flex justify-center',
    logoBox: 'relative h-[3.75rem] w-24',
    imageSizes: '96px',
    promptOuter: 'mt-3 flex justify-center font-mono text-xs text-emerald-500/70',
    promptInner:
      'flex min-h-[1.875rem] w-full max-w-full min-w-0 items-center justify-center gap-1.5',
    promptCursor: 'h-3.5 w-1.5 shrink-0 animate-pulse bg-emerald-500',
  },
  inline: {
    link: 'blog-ad-inline group relative block overflow-hidden rounded-xl border-4 border-emerald-500/30 bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8 shadow-2xl transition-all duration-300 hover:border-emerald-400 hover:shadow-emerald-500/20 dark:border-emerald-400/40 dark:from-black dark:via-gray-900 dark:to-gray-800 dark:hover:border-emerald-300',
    gridScan:
      'animate-grid-scan absolute inset-0 h-32 w-full bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent',
    borderBeam:
      'animate-border-beam absolute h-[4px] w-48 bg-gradient-to-r from-transparent via-emerald-400 to-transparent',
    borderBeamOffsetRound: '0.75rem',
    header: 'relative z-10 mb-4 flex items-center gap-4 border-b border-emerald-500/20 pb-3',
    trafficFlex: 'flex gap-3',
    trafficRed: 'h-4 w-4 rounded-full bg-red-500 shadow-[0_0_16px_rgba(239,68,68,0.5)]',
    trafficYellow: 'h-4 w-4 rounded-full bg-yellow-500 shadow-[0_0_16px_rgba(234,179,8,0.5)]',
    trafficGreen: 'h-4 w-4 rounded-full bg-emerald-500 shadow-[0_0_16px_rgba(16,185,129,0.5)]',
    titleBar: 'font-mono text-sm text-emerald-400/60',
    mainStack: 'relative z-10 space-y-5',
    headline:
      'text-glow-primary font-mono text-lg font-semibold tracking-wider text-emerald-400 uppercase sm:text-xl',
    subhead: 'mt-1 font-mono text-base text-gray-400 sm:text-lg',
    logoSection: 'mt-4 flex justify-center',
    logoBox: 'relative h-28 w-44 sm:h-32 sm:w-52',
    imageSizes: '(max-width:640px) 176px, 208px',
    promptOuter: 'mt-4 flex justify-center font-mono text-sm text-emerald-500/70 sm:text-base',
    promptInner:
      'flex min-h-[2.75rem] w-full max-w-full min-w-0 items-center justify-center gap-2 sm:min-h-[3rem]',
    promptCursor: 'h-5 w-1.5 shrink-0 animate-pulse bg-emerald-500 sm:h-6 sm:w-2',
  },
}

/** Per-character delays; full cycle is roughly 9–12s per message. */
const TYPE_MS = 45
const HOLD_MS = 5000
const ERASE_MS = 38

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
}

function BlogAdTerminalPrompt({ placement }: { placement: BlogAdPlacement }) {
  const [line, setLine] = useState('')
  const [msgIdx, setMsgIdx] = useState(0)
  const p = BLOG_AD_LAYOUT[placement]

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

  return (
    <div className={p.promptOuter}>
      <div className={p.promptInner}>
        <span className="shrink-0 text-emerald-400">$</span>
        <span className="min-w-0 text-center leading-tight break-words whitespace-normal">
          {line}
        </span>
        <span className={p.promptCursor} aria-hidden />
      </div>
    </div>
  )
}

function BlogAdCard({ placement }: { placement: BlogAdPlacement }) {
  const v = BLOG_AD_LAYOUT[placement]

  return (
    <Link href={SHOPIFY_APP_URL} target="_blank" rel="noopener noreferrer" className={v.link}>
      <div className="tron-grid-bg pointer-events-none absolute inset-0 opacity-[0.15]">
        <div className={v.gridScan} />
      </div>

      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className={v.borderBeam}
          style={{
            offsetPath: `inset(0% round ${v.borderBeamOffsetRound})`,
            offsetAnchor: '50% 50%',
          }}
        />
      </div>

      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent" />
      </div>

      <div className={v.header}>
        <div className={v.trafficFlex}>
          <div className={v.trafficRed} />
          <div className={v.trafficYellow} />
          <div className={v.trafficGreen} />
        </div>
        <span className={v.titleBar}>agentic_commerce.exe</span>
      </div>

      <div className={v.mainStack}>
        <div className="text-center">
          <p className={v.headline}>&gt; Deploy AI Agent</p>
          <p className={v.subhead}>for Shopify stores</p>
        </div>

        <div className={v.logoSection}>
          <div className={v.logoBox}>
            <Image
              src={SHOPIFY_GREEN_WORDMARK_URL}
              alt="Shopify"
              fill
              sizes={v.imageSizes}
              className="object-contain transition-all duration-300 group-hover:scale-110 group-hover:opacity-90"
              priority
            />
          </div>
        </div>

        <BlogAdTerminalPrompt placement={placement} />
      </div>

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

      const totalScrollableHeight = documentHeight - windowHeight

      const scrollPercentage =
        totalScrollableHeight > 0 ? (scrollTop / totalScrollableHeight) * 100 : 0

      if (scrollPercentage >= 35) {
        setShowAd(true)
      } else {
        setShowAd(false)
      }
    }

    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  return (
    <>
      <div className="hidden lg:block">
        <div
          className={`fixed top-24 right-4 z-40 w-[19.5rem] transition-all duration-500 ease-out ${
            showAd ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-full opacity-0'
          }`}
        >
          <BlogAdCard placement="floating" />
        </div>
      </div>
    </>
  )
}

export function BlogAdInline() {
  return (
    <div
      className="prose prose-lg dark:prose-invert my-8 block max-w-none lg:hidden"
      style={{ display: 'none' }}
      id="blog-ad-inline-mobile"
    >
      <div className="not-prose flex justify-center">
        <div className="w-full max-w-6xl">
          <BlogAdCard placement="inline" />
        </div>
      </div>
    </div>
  )
}

export function BlogAdInlineWithInsertion() {
  useEffect(() => {
    const insertAd = () => {
      const proseElements = document.querySelectorAll('.prose')
      const proseElement =
        Array.from(proseElements).find((el) => el.querySelector('h2') !== null) || proseElements[0]

      if (!proseElement) return

      const adElement = document.getElementById('blog-ad-inline-mobile')
      if (!adElement) return

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

      const headings = proseElement.querySelectorAll('h2')
      let referencesHeading: Element | null = null

      for (let i = 0; i < headings.length; i++) {
        const heading = headings[i]
        if (heading.textContent?.trim().toLowerCase() === 'references') {
          referencesHeading = heading
          break
        }
      }

      if (referencesHeading && referencesHeading.parentNode) {
        adElement.style.display = 'block'
        if (adElement.parentNode) {
          adElement.parentNode.removeChild(adElement)
        }
        referencesHeading.parentNode.insertBefore(adElement, referencesHeading)
      } else {
        adElement.style.display = 'block'
        if (adElement.parentNode) {
          adElement.parentNode.removeChild(adElement)
        }
        proseElement.appendChild(adElement)
      }
    }

    insertAd()
    const timeoutId = setTimeout(insertAd, 100)

    return () => clearTimeout(timeoutId)
  }, [])

  return <BlogAdInline />
}
