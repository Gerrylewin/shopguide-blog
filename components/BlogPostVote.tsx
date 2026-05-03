'use client'

import { useCallback, useEffect, useState } from 'react'

const VOTER_STORAGE_KEY = 'shopguide-blog-voter-id'
const voteStorageKey = (slug: string) => `shopguide-blog-vote:${slug}`

/** Fixed bottom-left; keep below floating BlogAd (z-40) unless stacking issues arise */
const FLOAT_SHELL =
  'blog-post-vote-floating pointer-events-auto fixed bottom-[max(1rem,env(safe-area-inset-bottom,0px))] left-[max(1rem,env(safe-area-inset-left,0px))] z-[35] w-[min(calc(100vw-2rem),17.5rem)] rounded-xl border border-gray-200/90 bg-white/95 p-3.5 shadow-lg backdrop-blur-md dark:border-gray-600 dark:bg-gray-950/95'

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

function setStoredVote(slug: string, vote: 'up' | 'down') {
  try {
    localStorage.setItem(voteStorageKey(slug), vote)
  } catch {
    /* ignore */
  }
}

type Props = {
  slug: string
}

export default function BlogPostVote({ slug }: Props) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
  const [thumbsUp, setThumbsUp] = useState(0)
  const [thumbsDown, setThumbsDown] = useState(0)
  const [enabled, setEnabled] = useState(true)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentVote, setCurrentVote] = useState<'up' | 'down' | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    setCurrentVote(getStoredVote(slug))
  }, [slug])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`${base}/api/blog-vote?slug=${encodeURIComponent(slug)}`, {
          cache: 'no-store',
        })
        if (cancelled) return
        if (!res.ok) {
          setEnabled(false)
          return
        }
        const data = await res.json()
        if (cancelled) return
        setThumbsUp(Number(data.thumbsUp) || 0)
        setThumbsDown(Number(data.thumbsDown) || 0)
        setEnabled(data.enabled !== false)
      } catch {
        if (!cancelled) setEnabled(false)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [slug, base])

  const submit = useCallback(
    async (vote: 'up' | 'down') => {
      if (!enabled || submitting) return
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
        setThumbsUp(Number(data.thumbsUp) || 0)
        setThumbsDown(Number(data.thumbsDown) || 0)
        setCurrentVote(vote)
        setStoredVote(slug, vote)
      } catch {
        setNotice('Could not reach the server. Try again later.')
      } finally {
        setSubmitting(false)
      }
    },
    [base, enabled, slug, submitting]
  )

  if (loading) {
    return (
      <aside className={FLOAT_SHELL} aria-hidden aria-busy="true">
        <div className="text-xs text-gray-500 dark:text-gray-400">Loading feedback…</div>
      </aside>
    )
  }

  if (!enabled) {
    return (
      <aside className={FLOAT_SHELL} aria-live="polite" aria-label="Article feedback unavailable">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          We couldn’t load reader feedback. Please try again later.
        </p>
      </aside>
    )
  }

  const total = thumbsUp + thumbsDown
  const upPct = total > 0 ? Math.round((thumbsUp / total) * 100) : null

  return (
    <aside className={FLOAT_SHELL} aria-label="Article feedback" data-blog-post-vote>
      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        Was this article helpful?
      </p>
      <p className="mt-0.5 text-[11px] leading-snug text-gray-600 dark:text-gray-400">
        One vote per browser; you can change it anytime.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => submit('up')}
          disabled={submitting}
          aria-pressed={currentVote === 'up'}
          className={`inline-flex min-w-[6.5rem] flex-1 items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
            currentVote === 'up'
              ? 'border-primary-600 bg-primary-50 text-primary-800 dark:border-primary-400 dark:bg-primary-950/40 dark:text-primary-200'
              : 'hover:border-primary-400 dark:hover:border-primary-500 border-gray-300 bg-white text-gray-800 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <span aria-hidden className="text-sm leading-none select-none">
            👍
          </span>
          Helpful
          <span className="text-gray-500 dark:text-gray-400">({thumbsUp})</span>
        </button>
        <button
          type="button"
          onClick={() => submit('down')}
          disabled={submitting}
          aria-pressed={currentVote === 'down'}
          className={`inline-flex min-w-[6.5rem] flex-1 items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
            currentVote === 'down'
              ? 'border-amber-600 bg-amber-50 text-amber-900 dark:border-amber-500 dark:bg-amber-950/40 dark:text-amber-100'
              : 'border-gray-300 bg-white text-gray-800 hover:border-amber-400 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:border-amber-500 dark:hover:bg-gray-800'
          }`}
        >
          <span aria-hidden className="text-sm leading-none select-none">
            👎
          </span>
          Not helpful
          <span className="text-gray-500 dark:text-gray-400">({thumbsDown})</span>
        </button>
      </div>
      {total > 0 && (
        <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
          {upPct !== null ? `${upPct}% marked helpful` : ''}
          {upPct !== null ? ` · ` : ''}
          {total} {total === 1 ? 'reader' : 'readers'} responded
        </p>
      )}
      {notice && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400" role="alert">
          {notice}
        </p>
      )}
    </aside>
  )
}
