'use client'

import NewsletterForm from 'pliny/ui/NewsletterForm'
import { useEffect } from 'react'

// Client-side logging wrapper for newsletter form
export default function NewsletterFormWithLogging() {
  useEffect(() => {
    console.log('🟢 [CLIENT] Newsletter form component mounted')

    // Intercept fetch calls to newsletter API
    const originalFetch = window.fetch
    window.fetch = async function (...args) {
      const url = args[0]
      if (typeof url === 'string' && url.includes('/api/newsletter')) {
        console.log('🟢 [CLIENT] Newsletter form submitting:', {
          url: url,
          method: args[1]?.method || 'GET',
          body: args[1]?.body,
          headers: args[1]?.headers,
          timestamp: new Date().toISOString(),
        })

        try {
          const response = await originalFetch.apply(this, args)
          const clonedResponse = response.clone()

          // Log response
          try {
            const data = await clonedResponse.json()
            console.log('🟢 [CLIENT] Newsletter API response:', {
              status: response.status,
              statusText: response.statusText,
              data: data,
              ok: response.ok,
              headers: Object.fromEntries(response.headers.entries()),
            })
          } catch (e) {
            const text = await response.text()
            console.log('🟢 [CLIENT] Newsletter API response (text):', {
              status: response.status,
              statusText: response.statusText,
              text: text,
              ok: response.ok,
            })
          }

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
      console.log('🟢 [CLIENT] Newsletter form component unmounted, fetch restored')
    }
  }, [])

  return <NewsletterForm />
}
