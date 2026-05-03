import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import Link from '@/components/Link'
import { getAllBlogVoteCountRows, isCloudflareD1Available } from '@/lib/cloudflare-d1'

export const dynamic = 'force-dynamic'

type Row = {
  slug: string
  title: string
  path: string
  thumbsUp: number
  thumbsDown: number
  net: number
  total: number
  pctHelpful: number | null
}

export default async function BlogVotesAdminPage() {
  if (!isCloudflareD1Available()) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10 dark:bg-gray-900">
        <div className="mx-auto max-w-3xl rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Blog votes</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Cloudflare D1 is not configured. Add{' '}
            <code className="rounded bg-gray-100 px-1 dark:bg-gray-700">CLOUDFLARE_ACCOUNT_ID</code>
            ,{' '}
            <code className="rounded bg-gray-100 px-1 dark:bg-gray-700">CLOUDFLARE_API_TOKEN</code>,
            and{' '}
            <code className="rounded bg-gray-100 px-1 dark:bg-gray-700">
              CLOUDFLARE_D1_DATABASE_ID
            </code>{' '}
            to your environment (same as newsletter storage).
          </p>
        </div>
      </div>
    )
  }

  const isProduction = process.env.NODE_ENV === 'production'
  const publishedPosts = isProduction ? allBlogs.filter((p) => p.draft !== true) : allBlogs
  const posts = allCoreContent(sortPosts(publishedPosts))

  let countRows: Awaited<ReturnType<typeof getAllBlogVoteCountRows>> = []
  let loadError: string | null = null
  try {
    countRows = await getAllBlogVoteCountRows()
  } catch (e) {
    loadError = e instanceof Error ? e.message : String(e)
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10 dark:bg-gray-900">
        <div className="mx-auto max-w-3xl rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Blog votes</h1>
          <p className="mt-2 text-red-600 dark:text-red-400">{loadError}</p>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Create a Cloudflare API token with{' '}
            <strong className="text-gray-800 dark:text-gray-200">Account → D1 → Edit</strong> for
            the account that owns your D1 database (not D1 Read). Confirm{' '}
            <code className="rounded bg-gray-100 px-1 dark:bg-gray-700">CLOUDFLARE_ACCOUNT_ID</code>{' '}
            matches Workers dashboard → your account ID, and{' '}
            <code className="rounded bg-gray-100 px-1 dark:bg-gray-700">
              CLOUDFLARE_D1_DATABASE_ID
            </code>{' '}
            is the database UUID. Docs:{' '}
            <a
              className="text-primary-600 dark:text-primary-400 underline"
              href="https://developers.cloudflare.com/d1/tutorials/import-to-d1-with-rest-api/"
            >
              D1 REST API token setup
            </a>
            .
          </p>
        </div>
      </div>
    )
  }

  const countMap = new Map(countRows.map((r) => [r.slug, r]))

  const merged: Row[] = posts.map((p) => {
    const r = countMap.get(p.slug)
    const thumbsUp = r?.thumbsUp ?? 0
    const thumbsDown = r?.thumbsDown ?? 0
    const total = thumbsUp + thumbsDown
    const net = thumbsUp - thumbsDown
    const pctHelpful = total > 0 ? Math.round((thumbsUp / total) * 100) : null
    return {
      slug: p.slug,
      title: p.title,
      path: p.path,
      thumbsUp,
      thumbsDown,
      net,
      total,
      pctHelpful,
    }
  })

  merged.sort((a, b) => {
    if (b.net !== a.net) return b.net - a.net
    if (b.total !== a.total) return b.total - a.total
    return a.title.localeCompare(b.title)
  })

  const totals = merged.reduce(
    (acc, r) => {
      acc.up += r.thumbsUp
      acc.down += r.thumbsDown
      return acc
    },
    { up: 0, down: 0 }
  )
  const allTotal = totals.up + totals.down

  return (
    <div className="min-h-screen bg-gray-50 py-8 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Blog reader feedback
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Thumbs up/down collected from post pages. Higher &quot;Net&quot; means more readers
            found the post helpful. Admin routes require signing in with Clerk.
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
              <div className="text-sm text-gray-500 dark:text-gray-400">Total helpful votes</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totals.up}</div>
            </div>
            <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
              <div className="text-sm text-gray-500 dark:text-gray-400">Total not helpful</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {totals.down}
              </div>
            </div>
            <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
              <div className="text-sm text-gray-500 dark:text-gray-400">All responses</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{allTotal}</div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg bg-white shadow dark:bg-gray-800">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400"
                >
                  Post
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400"
                >
                  Up
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400"
                >
                  Down
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400"
                >
                  Net
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400"
                >
                  % helpful
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400"
                >
                  Responses
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {merged.map((row) => (
                <tr key={row.slug} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                  <td className="px-4 py-3 text-sm">
                    <Link
                      href={`/${row.path}`}
                      className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                    >
                      {row.title}
                    </Link>
                    <div className="mt-0.5 font-mono text-xs text-gray-500 dark:text-gray-400">
                      {row.slug}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900 tabular-nums dark:text-gray-100">
                    {row.thumbsUp}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900 tabular-nums dark:text-gray-100">
                    {row.thumbsDown}
                  </td>
                  <td className="px-4 py-3 text-right text-sm tabular-nums">
                    <span
                      className={
                        row.net > 0
                          ? 'text-green-700 dark:text-green-400'
                          : row.net < 0
                            ? 'text-red-700 dark:text-red-400'
                            : 'text-gray-900 dark:text-gray-100'
                      }
                    >
                      {row.net > 0 ? '+' : ''}
                      {row.net}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-700 tabular-nums dark:text-gray-300">
                    {row.pctHelpful !== null ? `${row.pctHelpful}%` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-700 tabular-nums dark:text-gray-300">
                    {row.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
