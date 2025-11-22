'use client'

import { useEffect, useState } from 'react'

// Custom newsletter form with logging
export default function NewsletterFormWithLogging() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

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
        setMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Failed to subscribe. Please try again.')
      console.error('Newsletter subscription error:', error)
    }
  }

  return (
    <div className="w-full max-w-md">
      <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Get updates on agentic commerce
      </h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="youremail@here.com"
            required
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-primary-500"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="rounded-lg bg-primary-500 px-6 py-2 font-medium text-white transition-colors hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary-600 dark:hover:bg-primary-700"
          >
            {status === 'loading' ? '...' : 'Stay Updated'}
          </button>
        </div>
        {message && (
          <p
            className={`text-center text-sm ${
              status === 'success'
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  )
}
