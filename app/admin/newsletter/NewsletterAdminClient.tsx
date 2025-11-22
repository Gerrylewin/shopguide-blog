'use client'

import { useState } from 'react'
import Link from '@/components/Link'
import { formatDate } from 'pliny/utils/formatDate'
import siteMetadata from '@/data/siteMetadata'

interface Post {
  title: string
  slug: string[]
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

interface Props {
  posts: Post[]
  trackingData: TrackingData[]
}

export default function NewsletterAdminClient({ posts, trackingData }: Props) {
  const [sending, setSending] = useState<string | null>(null)
  const [sendStatus, setSendStatus] = useState<Record<string, any>>({})

  const handleSend = async (post: Post) => {
    const postSlug = Array.isArray(post.slug) ? post.slug.join('/') : post.slug
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
    const slug = Array.isArray(postSlug) ? postSlug.join('/') : postSlug
    return trackingData.find((t) => t.postSlug === slug)
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => {
        const postSlug = Array.isArray(post.slug) ? post.slug.join('/') : post.slug
        const stats = getPostStats(postSlug)
        const status = sendStatus[postSlug]
        const isSending = sending === postSlug

        return (
          <div
            key={postSlug}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex flex-col md:flex-row gap-6">
              {/* Post Preview */}
              <div className="flex-1">
                {post.images && post.images.length > 0 && (
                  <img
                    src={post.images[0]}
                    alt={post.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {post.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {formatDate(post.date, siteMetadata.locale)}
                </p>
                {post.summary && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{post.summary}</p>
                )}
                <Link
                  href={`/blog/${postSlug}`}
                  className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  View Post →
                </Link>
              </div>

              {/* Actions & Stats */}
              <div className="md:w-80 space-y-4">
                {/* Send Button */}
                <div>
                  <button
                    onClick={() => handleSend(post)}
                    disabled={isSending || !!stats}
                    className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                      stats
                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                        : isSending
                          ? 'bg-blue-400 text-white cursor-wait'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isSending
                      ? 'Sending...'
                      : stats
                        ? 'Already Sent'
                        : 'Send Newsletter'}
                  </button>

                  {/* Status Messages */}
                  {status?.status === 'success' && (
                    <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        ✅ Sent successfully! {status.data?.sent} emails sent.
                      </p>
                    </div>
                  )}
                  {status?.status === 'error' && (
                    <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        ❌ {status.error}
                      </p>
                    </div>
                  )}
                </div>

                {/* Statistics */}
                {stats && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Statistics
                    </h3>
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

