'use client'

import { useState } from 'react'
import Link from '@/components/Link'
import { formatDate } from 'pliny/utils/formatDate'
import siteMetadata from '@/data/siteMetadata'

interface Post {
  title: string
  slug: string
  date: string
  summary?: string
  images?: string[]
}

interface TrackingData {
  emailId: string
  postSlug: string
  postTitle: string
  sentAt: string
  sentTo: number
  opens: Array<{ email: string; openedAt: string }>
  clicks: Array<{ email: string; clickedAt: string; url: string }>
}

interface SendStatus {
  status: 'sending' | 'success' | 'error'
  data?: { sent?: number }
  error?: string
}

interface Props {
  posts: Post[]
  trackingData: TrackingData[]
}

export default function NewsletterAdminClient({ posts, trackingData }: Props) {
  const [sending, setSending] = useState<string | null>(null)
  const [sendStatus, setSendStatus] = useState<Record<string, SendStatus>>({})

  const handleSend = async (post: Post) => {
    const postSlug = post.slug
    setSending(postSlug)
    setSendStatus((prev) => ({ ...prev, [postSlug]: { status: 'sending' } }))

    try {
      const response = await fetch('/api/newsletter/send-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: post.title,
          slug: postSlug,
          date: post.date,
          summary: post.summary,
          images: post.images,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSendStatus((prev) => ({
          ...prev,
          [postSlug]: {
            status: 'success',
            data: data,
          },
        }))
        // Refresh page after 2 seconds to show updated stats
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setSendStatus((prev) => ({
          ...prev,
          [postSlug]: {
            status: 'error',
            error: data.error || 'Failed to send newsletter',
          },
        }))
      }
    } catch (error) {
      setSendStatus((prev) => ({
        ...prev,
        [postSlug]: {
          status: 'error',
          error: 'Network error. Please try again.',
        },
      }))
    } finally {
      setSending(null)
    }
  }

  const getPostStats = (postSlug: string) => {
    return trackingData.find((t) => t.postSlug === postSlug)
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => {
        const postSlug = post.slug
        const stats = getPostStats(postSlug)
        const status = sendStatus[postSlug]
        const isSending = sending === postSlug

        return (
          <div
            key={postSlug}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex flex-col gap-6 md:flex-row">
              {/* Post Preview */}
              <div className="flex-1">
                {post.images && post.images.length > 0 && (
                  <img
                    src={post.images[0]}
                    alt={post.title}
                    className="mb-4 h-48 w-full rounded-lg object-cover"
                  />
                )}
                <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {post.title}
                </h2>
                <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(post.date, siteMetadata.locale)}
                </p>
                {post.summary && (
                  <p className="mb-4 text-gray-600 dark:text-gray-400">{post.summary}</p>
                )}
                <Link
                  href={`/blog/${postSlug}`}
                  className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  View Post →
                </Link>
              </div>

              {/* Actions & Stats */}
              <div className="space-y-4 md:w-80">
                {/* Send Button */}
                <div>
                  <button
                    onClick={() => handleSend(post)}
                    disabled={isSending || !!stats}
                    className={`w-full rounded-lg px-4 py-2 font-medium transition-colors ${
                      stats
                        ? 'cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-600'
                        : isSending
                          ? 'cursor-wait bg-blue-400 text-white'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isSending ? 'Sending...' : stats ? 'Already Sent' : 'Send Newsletter'}
                  </button>

                  {/* Status Messages */}
                  {status?.status === 'success' && (
                    <div className="mt-2 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        ✅ Sent successfully! {status.data?.sent} emails sent.
                      </p>
                    </div>
                  )}
                  {status?.status === 'error' && (
                    <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                      <p className="text-sm text-red-800 dark:text-red-200">❌ {status.error}</p>
                    </div>
                  )}
                </div>

                {/* Statistics */}
                {stats && (
                  <div className="space-y-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Statistics</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">Sent</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {stats.sentTo}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">Opens</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {stats.opens.length}
                        </div>
                        <div className="text-xs text-gray-400">
                          {stats.sentTo > 0
                            ? `${Math.round((stats.opens.length / stats.sentTo) * 100)}%`
                            : '0%'}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">Clicks</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {stats.clicks.length}
                        </div>
                        <div className="text-xs text-gray-400">
                          {stats.sentTo > 0
                            ? `${Math.round((stats.clicks.length / stats.sentTo) * 100)}%`
                            : '0%'}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">Sent At</div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">
                          {new Date(stats.sentAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
