'use client'

import { useCallback, useEffect, useState } from 'react'

const VOTER_STORAGE_KEY = 'shopguide-blog-voter-id'
const voteStorageKey = (slug: string) => `shopguide-blog-vote:${slug}`

/** Fixed bottom-left at lg+; keep below floating BlogAd (z-40) unless stacking issues arise */
const FLOAT_SHELL =
  'blog-post-vote-floating pointer-events-auto hidden fixed bottom-[max(1rem,env(safe-area-inset-bottom,0px))] left-[max(1rem,env(safe-area-inset-left,0px))] z-[35] w-[min(calc(100vw-2rem),17.5rem)] rounded-xl border border-gray-200/90 bg-white/95 p-3.5 shadow-lg backdrop-blur-md dark:border-gray-600 dark:bg-gray-950/95 lg:block'

/** In-flow at end of article on smaller viewports only */
const INLINE_SHELL =
  'blog-post-vote-inline relative mt-10 w-full max-w-none rounded-xl border border-gray-200/90 bg-white/95 p-3.5 shadow-sm backdrop-blur-md dark:border-gray-600 dark:bg-gray-950/95 lg:hidden'

function getOrCreateVoterId(): string {
  if (typeof window === 'undefined') return ''
  try {
    let id = localStorage.getItem(VOTER_STORAGE_KEY)
    if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
      id = crypto.randomUUID()
      localStorage.setItem(VOTER_STORAGE_KEY, id)
    }
    return id
  } catch {
    return ''
  }
}

function getStoredVote(slug: string): 'up' | 'down' | null {
  if (typeof window === 'undefined') return null
  try {
    const v = localStorage.getItem(voteStorageKey(slug))
    return v === 'up' || v === 'down' ? v : null
  } catch {
    return null
  }
}

const VOTE_UPDATE_EVENT = 'shopguide-vote-update'

function setStoredVote(slug: string, vote: 'up' | 'down') {
  try {
    localStorage.setItem(voteStorageKey(slug), vote)
  } catch {
    /* ignore */
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(VOTE_UPDATE_EVENT, { detail: { slug } }))
  }
}

type Props = {
  slug: string
  variant?: 'floating' | 'inline'
}

export default function BlogPostVote({ slug, variant = 'floating' }: Props) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
  const [submitting, setSubmitting] = useState(false)
  const [currentVote, setCurrentVote] = useState<'up' | 'down' | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    setCurrentVote(getStoredVote(slug))
  }, [slug])

  useEffect(() => {
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent<{ slug: string }>).detail
      if (detail?.slug === slug) {
        setCurrentVote(getStoredVote(slug))
      }
    }
    window.addEventListener(VOTE_UPDATE_EVENT, onUpdate)
    return () => window.removeEventListener(VOTE_UPDATE_EVENT, onUpdate)
  }, [slug])

  const submit = useCallback(
    async (vote: 'up' | 'down') => {
      if (submitting) return
      const voterId = getOrCreateVoterId()
      if (!voterId) {
        setNotice('Unable to store your preference in this browser.')
        return
      }
      setSubmitting(true)
      setNotice(null)
      try {
        const res = await fetch(`${base}/api/blog-vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, vote, voterId }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setNotice(typeof data.error === 'string' ? data.error : 'Something went wrong.')
          return
        }
        setCurrentVote(vote)
        setStoredVote(slug, vote)
      } catch {
        setNotice('Could not reach the server. Try again later.')
      } finally {
        setSubmitting(false)
      }
    },
    [base, slug, submitting]
  )

  const shellClass = variant === 'inline' ? INLINE_SHELL : FLOAT_SHELL

  return (
    <aside className={shellClass} aria-label="Article feedback" data-blog-post-vote>
      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Was this helpful?</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => submit('up')}
          disabled={submitting}
          aria-pressed={currentVote === 'up'}
          aria-label="Thumbs up"
          className={`inline-flex min-w-[6.5rem] flex-1 items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
            currentVote === 'up'
              ? 'border-primary-600 bg-primary-50 text-primary-800 dark:border-primary-400 dark:bg-primary-950/40 dark:text-primary-200'
              : 'hover:border-primary-400 dark:hover:border-primary-500 border-gray-300 bg-white text-gray-800 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <span aria-hidden className="text-base leading-none select-none">
            👍
          </span>
          Yes
        </button>
        <button
          type="button"
          onClick={() => submit('down')}
          disabled={submitting}
          aria-pressed={currentVote === 'down'}
          aria-label="Thumbs down"
          className={`inline-flex min-w-[6.5rem] flex-1 items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
            currentVote === 'down'
              ? 'border-amber-600 bg-amber-50 text-amber-900 dark:border-amber-500 dark:bg-amber-950/40 dark:text-amber-100'
              : 'border-gray-300 bg-white text-gray-800 hover:border-amber-400 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:border-amber-500 dark:hover:bg-gray-800'
          }`}
        >
          <span aria-hidden className="text-base leading-none select-none">
            👎
          </span>
          No
        </button>
      </div>
      {notice && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400" role="alert">
          {notice}
        </p>
      )}
    </aside>
  )
}
