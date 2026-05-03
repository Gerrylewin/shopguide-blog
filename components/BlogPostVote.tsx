'use client'

import { useCallback, useEffect, useLayoutEffect, useState } from 'react'

const VOTER_STORAGE_KEY = 'shopguide-blog-voter-id'
const voteStorageKey = (slug: string) => `shopguide-blog-vote:${slug}`

/** Fixed bottom-left at lg+; keep below floating BlogAd (z-40) unless stacking issues arise */
const FLOAT_SHELL =
  'blog-post-vote-floating pointer-events-auto hidden fixed bottom-[max(1rem,env(safe-area-inset-bottom,0px))] left-[max(1rem,env(safe-area-inset-left,0px))] z-[35] w-[min(calc(100vw-2rem),17.5rem)] rounded-xl border border-gray-200/90 bg-white/95 px-3.5 pb-3.5 pt-4 shadow-lg backdrop-blur-md transition-opacity duration-300 ease-out dark:border-gray-600 dark:bg-gray-950/95 lg:block'

/** In-flow right after article body on mobile; CTA ad follows (see layouts + BlogAd insertion) */
const INLINE_SHELL =
  'blog-post-vote-inline relative mt-0 w-full max-w-none rounded-xl border border-gray-200/90 bg-white/95 px-3.5 pb-3.5 pt-4 shadow-sm backdrop-blur-md transition-opacity duration-300 ease-out dark:border-gray-600 dark:bg-gray-950/95 lg:hidden max-sm:pt-6'

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

type Phase = 'ask' | 'thanks' | 'gone'

type Props = {
  slug: string
  variant?: 'floating' | 'inline'
}

const THANKS_VISIBLE_MS = 2600
const FADE_OUT_MS = 360

export default function BlogPostVote({ slug, variant = 'floating' }: Props) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
  const [phase, setPhase] = useState<Phase>('ask')
  const [fadeOut, setFadeOut] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  useLayoutEffect(() => {
    setFadeOut(false)
    setNotice(null)
    if (getStoredVote(slug)) {
      setPhase('gone')
    } else {
      setPhase('ask')
    }
  }, [slug])

  useEffect(() => {
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent<{ slug: string }>).detail
      if (detail?.slug === slug && getStoredVote(slug)) {
        setPhase('gone')
      }
    }
    window.addEventListener(VOTE_UPDATE_EVENT, onUpdate)
    return () => window.removeEventListener(VOTE_UPDATE_EVENT, onUpdate)
  }, [slug])

  useEffect(() => {
    if (phase !== 'thanks') return
    const t1 = window.setTimeout(() => setFadeOut(true), THANKS_VISIBLE_MS)
    const t2 = window.setTimeout(() => {
      setPhase('gone')
      setFadeOut(false)
    }, THANKS_VISIBLE_MS + FADE_OUT_MS)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [phase])

  const submit = useCallback(
    async (vote: 'up' | 'down') => {
      if (submitting || phase !== 'ask') return
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
        setStoredVote(slug, vote)
        setPhase('thanks')
      } catch {
        setNotice('Could not reach the server. Try again later.')
      } finally {
        setSubmitting(false)
      }
    },
    [base, phase, slug, submitting]
  )

  if (phase === 'gone') {
    return null
  }

  const shellClass = variant === 'inline' ? INLINE_SHELL : FLOAT_SHELL
  const fadeClass = fadeOut ? 'pointer-events-none opacity-0' : 'opacity-100'

  return (
    <aside
      className={`${shellClass} ${fadeClass}`}
      aria-label={phase === 'thanks' ? 'Feedback received' : 'Article feedback'}
      data-blog-post-vote
      data-phase={phase}
    >
      {phase === 'thanks' ? (
        <div className="space-y-1">
          <p
            className="text-sm font-semibold text-gray-900 dark:text-gray-100"
            role="status"
            aria-live="polite"
          >
            Thanks — your feedback was received.
          </p>
          <p className="text-xs leading-snug text-gray-600 dark:text-gray-400">
            Your vote has been saved. We appreciate you taking a moment to respond.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Was this helpful?
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => submit('up')}
              disabled={submitting}
              aria-label="Thumbs up"
              className={`inline-flex min-w-[6.5rem] flex-1 items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                submitting
                  ? 'cursor-wait border-gray-200 opacity-70 dark:border-gray-700'
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
              aria-label="Thumbs down"
              className={`inline-flex min-w-[6.5rem] flex-1 items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                submitting
                  ? 'cursor-wait border-gray-200 opacity-70 dark:border-gray-700'
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
        </>
      )}
    </aside>
  )
}
