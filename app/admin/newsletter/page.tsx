import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import { getSubscribers } from '@/lib/newsletter-storage'
import { getTrackingData } from '@/lib/newsletter-tracking'
import NewsletterAdminClient from './NewsletterAdminClient'

export const dynamic = 'force-dynamic'

export default async function NewsletterAdminPage() {
  // Get all blog posts
  const posts = allCoreContent(sortPosts(allBlogs))

  // Get subscriber count
  const subscribers = await getSubscribers()

  // Get tracking data
  const trackingData = await getTrackingData()

  return (
    <div className="min-h-screen bg-gray-50 py-8 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Newsletter Admin</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Send blog posts as newsletters and track performance
          </p>
          <div className="mt-4 flex gap-4">
            <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Subscribers</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {subscribers.length}
              </div>
            </div>
            <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
              <div className="text-sm text-gray-500 dark:text-gray-400">Newsletters Sent</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {trackingData.length}
              </div>
            </div>
          </div>
        </div>

        <NewsletterAdminClient posts={posts} trackingData={trackingData} />
      </div>
    </div>
  )
}
