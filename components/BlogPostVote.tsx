'use client'

import { useCallback, useEffect, useState } from 'react'

const VOTER_STORAGE_KEY = 'shopguide-blog-voter-id'
const voteStorageKey = (slug: string) => `shopguide-blog-vote:${slug}`

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
      <div className="mt-10 border-t border-gray-200 pt-8 dark:border-gray-700" aria-hidden>
        <div className="text-sm text-gray-500 dark:text-gray-400">Loading feedback…</div>
      </div>
    )
  }

  if (!enabled) {
    return (
      <div className="mt-10 border-t border-gray-200 pt-8 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Reader feedback is not enabled in this environment.
        </p>
      </div>
    )
  }

  const total = thumbsUp + thumbsDown
  const upPct = total > 0 ? Math.round((thumbsUp / total) * 100) : null

  return (
    <div className="mt-10 border-t border-gray-200 pt-8 dark:border-gray-700">
      <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
        Was this article helpful?
      </p>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Quick feedback helps us improve. One vote per browser; you can change your vote.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => submit('up')}
          disabled={submitting}
          aria-pressed={currentVote === 'up'}
          className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
            currentVote === 'up'
              ? 'border-primary-600 bg-primary-50 text-primary-800 dark:border-primary-400 dark:bg-primary-950/40 dark:text-primary-200'
              : 'hover:border-primary-400 dark:hover:border-primary-500 border-gray-300 bg-white text-gray-800 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <span aria-hidden className="text-base leading-none select-none">
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
          className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
            currentVote === 'down'
              ? 'border-amber-600 bg-amber-50 text-amber-900 dark:border-amber-500 dark:bg-amber-950/40 dark:text-amber-100'
              : 'border-gray-300 bg-white text-gray-800 hover:border-amber-400 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:border-amber-500 dark:hover:bg-gray-800'
          }`}
        >
          <span aria-hidden className="text-base leading-none select-none">
            👎
          </span>
          Not helpful
          <span className="text-gray-500 dark:text-gray-400">({thumbsDown})</span>
        </button>
      </div>
      {total > 0 && (
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          {upPct !== null ? `${upPct}% marked helpful` : ''}
          {upPct !== null ? ` · ` : ''}
          {total} {total === 1 ? 'reader' : 'readers'} responded
        </p>
      )}
      {notice && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
          {notice}
        </p>
      )}
    </div>
  )
}
