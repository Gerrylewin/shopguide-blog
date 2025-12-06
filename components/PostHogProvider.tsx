'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Initialize PostHog only on client side
    if (typeof window !== 'undefined') {
      // Don't send test data while developing
      if (
        !window.location.host.includes('127.0.0.1') &&
        !window.location.host.includes('localhost')
      ) {
        posthog.init('phc_kvJ3pTMrXx2oOOPFXH9z2epaoyoHUH5MLA6tMLIUXJk', {
          api_host: 'https://us.i.posthog.com',
          defaults: '2025-11-30',
          person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
        })
      }
    }
  }, [])

  useEffect(() => {
    // Track pageviews
    if (
      pathname &&
      typeof window !== 'undefined' &&
      !window.location.host.includes('127.0.0.1') &&
      !window.location.host.includes('localhost')
    ) {
      // Only capture if PostHog is initialized (check if it has the capture method)
      if (posthog && typeof posthog.capture === 'function') {
        let url = window.origin + pathname
        if (searchParams && searchParams.toString()) {
          url = url + `?${searchParams.toString()}`
        }
        posthog.capture('$pageview', {
          $current_url: url,
        })
      }
    }
  }, [pathname, searchParams])

  return <>{children}</>
}
