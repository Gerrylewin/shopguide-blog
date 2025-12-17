'use client'

import { useEffect, Suspense, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-3BNNFQ6N5R'

// Type guard for gtag
function isGtagAvailable(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof (window as { gtag?: (...args: unknown[]) => void }).gtag === 'function'
  )
}

// Helper to call gtag safely
function callGtag(...args: unknown[]): void {
  if (isGtagAvailable()) {
    ;(window as { gtag: (...args: unknown[]) => void }).gtag(...args)
  }
}

function GoogleAnalyticsPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isInitialMount = useRef(true)

  useEffect(() => {
    // Skip the initial mount since gtag('config') in layout.tsx already tracks it
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    // Track pageviews on route changes
    if (
      pathname &&
      typeof window !== 'undefined' &&
      !window.location.host.includes('127.0.0.1') &&
      !window.location.host.includes('localhost') &&
      isGtagAvailable()
    ) {
      // Update page path to trigger page view event
      callGtag('config', GA_MEASUREMENT_ID, {
        page_path: pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : ''),
      })
    }
  }, [pathname, searchParams])

  return null
}

export function GoogleAnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <GoogleAnalyticsPageView />
      </Suspense>
      {children}
    </>
  )
}
