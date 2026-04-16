'use client'

import React, { useState, useEffect } from 'react'
import { SHOPIFY_BAG_MARK_PATH } from '@/lib/shopify-brand'
import Image from './Image'

export type NewsletterFormVariant = 'default' | 'narrow'

type NewsletterFormWithLoggingProps = {
  /** Wider, low-profile layout for hero columns (horizontal field + button, tight vertical rhythm). */
  variant?: NewsletterFormVariant
}

/**
 * Enhanced Newsletter Form with Shopify-inspired design and social proof.
 */
export default function NewsletterFormWithLogging({
  variant = 'default',
}: NewsletterFormWithLoggingProps) {
  const narrow = variant === 'narrow'
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  // This part remains to intercept fetch calls if needed by the parent system
  useEffect(() => {
    if (typeof window === 'undefined') return
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const [url, config] = args
      if (typeof url === 'string' && url.includes('/api/newsletter') && config?.method === 'POST') {
        try {
          const response = await originalFetch.apply(window, args)
          return response
        } catch (error) {
          console.error('🟢 [CLIENT] Newsletter form submission error:', error)
          throw error
        }
      }
      return originalFetch.apply(this, args)
    }

    return () => {
      window.fetch = originalFetch
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message || 'Successfully subscribed!')
        setEmail('')
      } else {
        setStatus('error')
        const errorMessage = data.error || 'Something went wrong. Please try again.'
        setMessage(errorMessage)
      }
    } catch (error) {
      setStatus('error')
      setMessage('Failed to subscribe. Please try again.')
      console.error('Newsletter subscription error:', error)
    }
  }

  return (
    <div
      className={`w-full overflow-hidden rounded-2xl border border-gray-100 bg-white p-1 shadow-xl dark:border-gray-800 dark:bg-gray-900 ${narrow ? 'max-w-[min(100%,30rem)]' : 'max-w-lg'}`}
    >
      <div className={`bg-[#f6f6f7] dark:bg-gray-800/50 ${narrow ? 'px-4 py-3' : 'p-6'}`}>
        <div
          className={`flex items-center space-x-2 ${narrow ? 'mb-2 justify-start' : 'mb-4 justify-center'}`}
        >
          <div
            className={`rounded-full bg-white p-1.5 shadow-sm dark:bg-gray-700 ${narrow ? 'h-7 w-7' : 'h-8 w-8'}`}
          >
            <Image
              src={SHOPIFY_BAG_MARK_PATH}
              alt="Shopify"
              width={narrow ? 18 : 20}
              height={narrow ? 18 : 20}
            />
          </div>
          <span
            className={`font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400 ${narrow ? 'text-[10px] sm:text-xs' : 'text-xs'}`}
          >
            Official ShopGuide Updates
          </span>
        </div>
        <h2
          className={`font-extrabold text-gray-900 dark:text-gray-100 ${narrow ? 'mb-1 text-left text-lg leading-tight' : 'mb-2 text-center text-2xl'}`}
        >
          Master Agentic Commerce
        </h2>
        <p
          className={`text-gray-600 dark:text-gray-400 ${narrow ? 'mb-3 text-left text-xs leading-snug sm:text-sm' : 'mb-6 text-center text-sm'}`}
        >
          Join 2,500+ Shopify founders receiving weekly insights on AI agents and autonomous growth.
        </p>

        <form onSubmit={handleSubmit} className="relative">
          <div
            className={
              narrow
                ? 'flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-2'
                : 'flex flex-col gap-3 sm:flex-row'
            }
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your Shopify store email"
              required
              className={`min-w-0 flex-1 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#008060] focus:ring-2 focus:ring-[#008060]/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ${narrow ? 'px-3 py-2 text-sm' : 'px-4 py-3'}`}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className={`shrink-0 rounded-lg bg-[#008060] font-bold text-white transition-all hover:bg-[#006e52] focus:ring-2 focus:ring-[#008060] focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${narrow ? 'px-4 py-2 text-sm sm:w-auto sm:min-w-[7.5rem]' : 'w-full px-6 py-3 sm:w-auto'}`}
            >
              {status === 'loading' ? (
                <span className="flex items-center">
                  <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Joining...
                </span>
              ) : (
                'Subscribe'
              )}
            </button>
          </div>
          {message && (
            <div
              className={`rounded-md ${narrow ? 'mt-2 p-2' : 'mt-4 p-3'} ${status === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}
            >
              <p className={`text-center font-medium ${narrow ? 'text-xs' : 'text-sm'}`}>
                {message}
              </p>
            </div>
          )}
        </form>
      </div>
      <div
        className={`flex items-center border-t border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900 ${narrow ? 'justify-start gap-2.5 px-4 py-2' : 'justify-center space-x-4 px-6 py-3'}`}
      >
        <div className={`flex ${narrow ? '-space-x-1.5' : '-space-x-2'}`}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`rounded-full border-2 border-white bg-gray-200 dark:border-gray-900 ${narrow ? 'h-5 w-5' : 'h-6 w-6'}`}
            >
              <img
                src={`https://i.pravatar.cc/40?img=${i + 10}`}
                alt="Merchant"
                className="rounded-full"
              />
            </div>
          ))}
        </div>
        <p
          className={`font-medium text-gray-500 ${narrow ? 'text-[10px] leading-tight sm:text-xs' : 'text-xs'}`}
        >
          Trusted by top Shopify Plus brands
        </p>
      </div>
    </div>
  )
}
