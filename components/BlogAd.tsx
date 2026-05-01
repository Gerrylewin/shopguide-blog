'use client'

import React, { useState, useEffect } from 'react'
import Link from './Link'
import Image from './Image'
import { SHOPIFY_GREEN_WORDMARK_URL } from '@/lib/shopify-brand'

const SHOPIFY_APP_URL = 'https://apps.shopify.com/shopguide'

/**
 * Redesigned BlogAd - More Professional, Shopify-focused.
 * Transitioning away from terminal-only to a mix of professional SaaS and Shopify App Store aesthetic.
 */
function BlogAdCard({
  centeredText = false,
  compact = false,
}: {
  centeredText?: boolean
  compact?: boolean
}) {
  const pad = compact ? 'p-4' : 'p-6'
  const headMb = compact ? 'mb-3' : 'mb-4'
  const iconBox = compact ? 'h-7 w-7' : 'h-8 w-8'
  const iconSvg = compact ? 'h-4 w-4' : 'h-5 w-5'
  const titleCls = compact
    ? 'mb-1.5 text-base font-extrabold text-gray-900 dark:text-gray-100'
    : 'mb-2 text-xl font-extrabold text-gray-900 dark:text-gray-100'
  const bodyCls = compact
    ? 'mb-4 text-xs leading-relaxed text-gray-600 dark:text-gray-400'
    : 'mb-6 text-sm leading-relaxed text-gray-600 dark:text-gray-400'
  const logoWrap = compact
    ? 'mb-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50'
    : 'mb-6 rounded-xl bg-gray-50 p-4 dark:bg-gray-900/50'
  const logoH = compact ? 'h-9' : 'h-12'
  const btnCls = compact
    ? 'flex w-full items-center justify-center rounded-lg bg-[#008060] py-2 text-xs font-bold text-white transition-all hover:bg-[#006e52] hover:shadow-lg active:scale-[0.98]'
    : 'flex w-full items-center justify-center rounded-xl bg-[#008060] py-3 text-sm font-bold text-white transition-all hover:bg-[#006e52] hover:shadow-lg active:scale-[0.98]'

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl transition-all duration-300 hover:shadow-2xl dark:border-gray-800 dark:bg-gray-950 ${pad}`}
    >
      {/* Background Accent */}
      <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[#008060]/5 transition-transform duration-500 group-hover:scale-150" />

      <div className="relative z-10">
        <div className={`${headMb} flex items-center justify-between gap-2`}>
          <div className="flex min-w-0 items-center space-x-2">
            <div
              className={`flex ${iconBox} flex-shrink-0 items-center justify-center rounded-lg bg-[#008060] text-white shadow-lg`}
            >
              <svg className={iconSvg} fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
            <span
              className={`font-bold tracking-widest text-gray-500 uppercase ${compact ? 'text-[10px]' : 'text-xs'}`}
            >
              Agentic Tool
            </span>
          </div>
          <div
            className={`flex-shrink-0 rounded-full bg-emerald-100 font-bold text-emerald-700 uppercase dark:bg-emerald-900/30 dark:text-emerald-400 ${compact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]'}`}
          >
            Live in App Store
          </div>
        </div>

        <div className={centeredText ? 'text-center' : undefined}>
          <h3 className={titleCls}>Deploy Your AI Agent</h3>
          <p className={bodyCls}>
            Scale your Shopify catalog with autonomous agents that guide customers to checkout 24/7.
          </p>
        </div>

        <div className={logoWrap}>
          <div className={`relative w-full ${logoH}`}>
            <Image src={SHOPIFY_GREEN_WORDMARK_URL} alt="Shopify" fill className="object-contain" />
          </div>
        </div>

        <Link href={SHOPIFY_APP_URL} target="_blank" rel="noopener noreferrer" className={btnCls}>
          Install ShopGuide
          <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </Link>

        <p
          className={`text-center font-medium tracking-tighter text-gray-400 uppercase ${compact ? 'mt-3 text-[9px]' : 'mt-4 text-[10px]'}`}
        >
          Free Trial Available • No Coding Required
        </p>
      </div>
    </div>
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

      if (scrollPercentage >= 35) setShowAd(true)
      else setShowAd(false)
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
    <div className="hidden lg:block">
      <div
        className={`blog-ad-floating fixed top-24 right-3 z-40 w-[15.5rem] transition-all duration-500 ease-out sm:right-4 ${
          showAd ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-12 opacity-0'
        }`}
      >
        <BlogAdCard compact />
      </div>
    </div>
  )
}

export function BlogAdInline() {
  return (
    <div
      className="blog-ad-inline not-prose my-12 lg:hidden"
      id="blog-ad-inline-mobile"
      style={{ display: 'none' }}
    >
      <div className="mx-auto w-full max-w-lg">
        <BlogAdCard centeredText />
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

      const faqHeading = Array.from(proseElement.querySelectorAll('h2')).find((heading) => {
        const text = heading.textContent?.trim().toLowerCase()
        return text === 'frequently asked questions' || text === 'faq'
      })

      if (faqHeading && faqHeading.parentNode) {
        adElement.style.display = 'block'
        faqHeading.parentNode.insertBefore(adElement, faqHeading)
      } else {
        adElement.style.display = 'block'
        proseElement.appendChild(adElement)
      }
    }

    insertAd()
  }, [])

  return <BlogAdInline />
}
