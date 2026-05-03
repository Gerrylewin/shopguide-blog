/**
 * Cloudflare D1 Database Client
 * Uses the Cloudflare D1 REST API to interact with the database
 */

export interface Subscriber {
  email: string
  subscribedAt: string
}

/**
 * Check if Cloudflare D1 is available (newsletter, sent-posts tracking, scripts).
 * Uses `CLOUDFLARE_API_TOKEN` only.
 */
export function isCloudflareD1Available(): boolean {
  return !!(
    process.env.CLOUDFLARE_ACCOUNT_ID &&
    process.env.CLOUDFLARE_API_TOKEN &&
    process.env.CLOUDFLARE_D1_DATABASE_ID
  )
}

/**
 * Token used for blog thumbs up/down D1 calls. When set, votes never use `CLOUDFLARE_API_TOKEN`.
 * Falls back to `CLOUDFLARE_API_TOKEN` when unset (single-token setups).
 */
function blogVoteD1ApiToken(): string | undefined {
  if (process.env.CLOUDFLARE_API_TOKEN_BLOG_VOTES) {
    return process.env.CLOUDFLARE_API_TOKEN_BLOG_VOTES
  }
  return process.env.CLOUDFLARE_API_TOKEN
}

/**
 * Whether blog vote storage can call D1 (same DB as newsletter; optional dedicated vote token).
 */
export function isBlogVoteStorageAvailable(): boolean {
  return !!(
    process.env.CLOUDFLARE_ACCOUNT_ID &&
    process.env.CLOUDFLARE_D1_DATABASE_ID &&
    blogVoteD1ApiToken()
  )
}

type D1SqlParam = string | number | boolean | null

/** First batch object from D1 HTTP `query` response */
interface D1QueryBatch {
  results?: Array<Record<string, unknown>>
  meta?: { changes?: number }
}

interface D1HttpEnvelope {
  success?: boolean
  errors?: unknown
  result?: D1QueryBatch[] | D1QueryBatch | null
}

/**
 * Get Cloudflare D1 REST API base URL
 */
function getD1ApiUrl(): string {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID
  return `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`
}

type D1TokenMode = 'default' | 'blogVotes'

/**
 * Execute a query on Cloudflare D1
 */
async function executeD1Query(
  query: string,
  params: D1SqlParam[] = [],
  tokenMode: D1TokenMode = 'default'
): Promise<D1QueryBatch> {
  const tokenVarHint =
    tokenMode === 'blogVotes'
      ? 'CLOUDFLARE_API_TOKEN_BLOG_VOTES (or CLOUDFLARE_API_TOKEN if the vote-specific token is unset)'
      : 'CLOUDFLARE_API_TOKEN'

  if (tokenMode === 'default') {
    if (!isCloudflareD1Available()) {
      throw new Error('Cloudflare D1 is not configured')
    }
  } else if (!isBlogVoteStorageAvailable()) {
    throw new Error('Blog vote D1 storage is not configured')
  }

  const apiToken =
    tokenMode === 'blogVotes' ? blogVoteD1ApiToken()! : process.env.CLOUDFLARE_API_TOKEN!
  const url = getD1ApiUrl()

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sql: query,
      params: params,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    let hint = ''
    if (/7500|permission/i.test(errorText)) {
      hint =
        tokenMode === 'blogVotes'
          ? ` Hint: ${tokenVarHint} needs Account → D1 → Edit on the same account as CLOUDFLARE_ACCOUNT_ID. Read-only D1 tokens will fail. See https://developers.cloudflare.com/d1/tutorials/import-to-d1-with-rest-api/`
          : ' Hint: Your CLOUDFLARE_API_TOKEN needs Account → D1 → Edit on the same account as CLOUDFLARE_ACCOUNT_ID. Read-only D1 tokens will fail. See https://developers.cloudflare.com/d1/tutorials/import-to-d1-with-rest-api/'
    }
    throw new Error(`Cloudflare D1 API error: ${response.status} ${errorText}${hint}`)
  }

  const result = (await response.json()) as D1HttpEnvelope

  if (!result.success) {
    const errStr = JSON.stringify(result.errors)
    let hint = ''
    if (/7500|permission/i.test(errStr)) {
      hint =
        tokenMode === 'blogVotes'
          ? ` Hint: Use Account → D1 → Edit on ${tokenVarHint}. Match CLOUDFLARE_ACCOUNT_ID to the account that owns the database.`
          : ' Hint: Use an API token with Account → D1 → Edit (not D1 Read only). Match CLOUDFLARE_ACCOUNT_ID to the account that owns the database.'
    }
    throw new Error(`Cloudflare D1 query failed: ${errStr}${hint}`)
  }

  // Cloudflare D1 REST API returns: { success: true, result: [{ results: [...], meta: {...} }] }
  // For SELECT queries, the actual rows are in result.result[0].results
  // For INSERT/DELETE queries, metadata is in result.result[0].meta
  if (result.result && Array.isArray(result.result) && result.result.length > 0) {
    return result.result[0]
  }

  if (result.result && !Array.isArray(result.result)) {
    return result.result
  }

  return {}
}

/**
 * Get all newsletter subscribers from Cloudflare D1
 */
export async function getD1Subscribers(): Promise<Subscriber[]> {
  try {
    const result = await executeD1Query(
      'SELECT email, subscribed_at FROM newsletter_subscribers ORDER BY subscribed_at DESC'
    )

    // Cloudflare D1 returns: { results: [...], success: true, meta: {...} }
    const rows = result?.results || []

    if (!Array.isArray(rows)) {
      return []
    }

    return rows.map((row) => ({
      email: String((row as Record<string, unknown>).email ?? ''),
      subscribedAt: String((row as Record<string, unknown>).subscribed_at ?? ''),
    }))
  } catch (error) {
    console.error('❌ [CLOUDFLARE D1] Error getting subscribers:', error)
    throw error
  }
}

/**
 * Add a subscriber to Cloudflare D1
 */
export async function addD1Subscriber(email: string, subscribedAt: string): Promise<boolean> {
  try {
    await executeD1Query(
      'INSERT INTO newsletter_subscribers (email, subscribed_at) VALUES (?, ?)',
      [email.toLowerCase(), subscribedAt]
    )
    return true
  } catch (error: unknown) {
    // Check if it's a unique constraint violation (email already exists)
    const message = error instanceof Error ? error.message : String(error)
    if (message.includes('UNIQUE constraint') || message.includes('already exists')) {
      console.log('⚠️ [CLOUDFLARE D1] Email already exists:', email)
      return false
    }
    console.error('❌ [CLOUDFLARE D1] Error adding subscriber:', error)
    throw error
  }
}

/**
 * Check if email exists in Cloudflare D1
 */
export async function checkD1SubscriberExists(email: string): Promise<boolean> {
  try {
    const result = await executeD1Query(
      'SELECT email FROM newsletter_subscribers WHERE email = ? LIMIT 1',
      [email.toLowerCase()]
    )

    // Cloudflare D1 returns: { results: [...], success: true, meta: {...} }
    const rows = result?.results || []
    return Array.isArray(rows) && rows.length > 0
  } catch (error) {
    console.error('❌ [CLOUDFLARE D1] Error checking subscriber:', error)
    return false
  }
}

/**
 * Remove a subscriber from Cloudflare D1
 */
export async function removeD1Subscriber(email: string): Promise<boolean> {
  try {
    const result = await executeD1Query('DELETE FROM newsletter_subscribers WHERE email = ?', [
      email.toLowerCase(),
    ])

    // Check if any rows were affected
    // DELETE returns: { success: true, meta: { changes: number } }
    return (result?.meta?.changes ?? 0) > 0
  } catch (error) {
    console.error('❌ [CLOUDFLARE D1] Error removing subscriber:', error)
    // Return false if email doesn't exist or other non-critical errors
    return false
  }
}

// --- Newsletter sent posts (persistent state so we don't resend on every serverless invocation) ---

const SENT_POSTS_TABLE = 'newsletter_sent_posts'

/**
 * Ensure newsletter_sent_posts table exists (idempotent).
 */
export async function ensureSentPostsTable(): Promise<void> {
  const sql = `CREATE TABLE IF NOT EXISTS ${SENT_POSTS_TABLE} (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  sent_at TEXT NOT NULL
)`
  await executeD1Query(sql)
}

export interface SentPostRow {
  slug: string
  title: string
  date: string
  sentAt: string
}

/**
 * Get all sent post slugs from D1 (used to avoid resending on cron/serverless).
 */
export async function getD1SentPosts(): Promise<SentPostRow[]> {
  await ensureSentPostsTable()
  const result = await executeD1Query(
    `SELECT slug, title, date, sent_at FROM ${SENT_POSTS_TABLE} ORDER BY sent_at DESC`
  )
  const rows = result?.results || []
  if (!Array.isArray(rows)) return []
  return rows.map((row) => {
    const r = row as Record<string, unknown>
    return {
      slug: String(r.slug ?? ''),
      title: String(r.title ?? ''),
      date: String(r.date ?? ''),
      sentAt: String(r.sent_at ?? ''),
    }
  })
}

/**
 * Check if a post (by slug) has already been sent.
 */
export async function checkD1PostSent(slug: string): Promise<boolean> {
  await ensureSentPostsTable()
  const result = await executeD1Query(`SELECT 1 FROM ${SENT_POSTS_TABLE} WHERE slug = ? LIMIT 1`, [
    slug,
  ])
  const rows = result?.results || []
  return Array.isArray(rows) && rows.length > 0
}

/**
 * Mark a post as sent in D1 (persistent across serverless invocations).
 * Uses INSERT OR IGNORE so concurrent marks for the same slug don't fail.
 */
export async function markD1PostAsSent(slug: string, title: string, date: string): Promise<void> {
  await ensureSentPostsTable()
  const sentAt = new Date().toISOString()
  await executeD1Query(
    `INSERT OR IGNORE INTO ${SENT_POSTS_TABLE} (slug, title, date, sent_at) VALUES (?, ?, ?, ?)`,
    [slug, title, date, sentAt]
  )
}

// --- Blog post thumbs up / thumbs down (one vote per browser via anonymous voter id) ---

const BLOG_VOTE_COUNTS_TABLE = 'blog_vote_counts'
const BLOG_VOTERS_TABLE = 'blog_voters'

function executeD1BlogVoteQuery(query: string, params: D1SqlParam[] = []): Promise<D1QueryBatch> {
  return executeD1Query(query, params, 'blogVotes')
}

export interface BlogVoteCounts {
  thumbsUp: number
  thumbsDown: number
}

export async function ensureBlogVoteTables(): Promise<void> {
  await executeD1BlogVoteQuery(`CREATE TABLE IF NOT EXISTS ${BLOG_VOTE_COUNTS_TABLE} (
  slug TEXT PRIMARY KEY,
  thumbs_up INTEGER NOT NULL DEFAULT 0,
  thumbs_down INTEGER NOT NULL DEFAULT 0
)`)
  await executeD1BlogVoteQuery(`CREATE TABLE IF NOT EXISTS ${BLOG_VOTERS_TABLE} (
  slug TEXT NOT NULL,
  voter_id TEXT NOT NULL,
  vote TEXT NOT NULL CHECK (vote IN ('up', 'down')),
  PRIMARY KEY (slug, voter_id)
)`)
}

export async function getBlogVoteCountsForSlug(slug: string): Promise<BlogVoteCounts> {
  await ensureBlogVoteTables()
  const result = await executeD1BlogVoteQuery(
    `SELECT thumbs_up, thumbs_down FROM ${BLOG_VOTE_COUNTS_TABLE} WHERE slug = ? LIMIT 1`,
    [slug]
  )
  const row = result?.results?.[0]
  if (!row) {
    return { thumbsUp: 0, thumbsDown: 0 }
  }
  return {
    thumbsUp: Number(row['thumbs_up']) || 0,
    thumbsDown: Number(row['thumbs_down']) || 0,
  }
}

export async function getAllBlogVoteCountRows(): Promise<
  Array<{ slug: string; thumbsUp: number; thumbsDown: number }>
> {
  await ensureBlogVoteTables()
  const result = await executeD1BlogVoteQuery(
    `SELECT slug, thumbs_up, thumbs_down FROM ${BLOG_VOTE_COUNTS_TABLE} ORDER BY slug ASC`
  )
  const rows = result?.results || []
  if (!Array.isArray(rows)) return []
  return rows.map((row) => {
    const r = row as Record<string, unknown>
    return {
      slug: String(r.slug ?? ''),
      thumbsUp: Number(r.thumbs_up) || 0,
      thumbsDown: Number(r.thumbs_down) || 0,
    }
  })
}

function isSqliteUniqueConstraintError(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e)
  return /UNIQUE constraint|SQLITE_CONSTRAINT_UNIQUE|constraint failed/i.test(msg)
}

/**
 * Record or update a vote. Same voter can change from up to down (counts adjusted).
 */
export async function recordBlogVote(
  slug: string,
  voterId: string,
  vote: 'up' | 'down',
  /** @internal retry after concurrent INSERT race */
  _retryDepth = 0
): Promise<BlogVoteCounts> {
  await ensureBlogVoteTables()
  await executeD1BlogVoteQuery(
    `INSERT OR IGNORE INTO ${BLOG_VOTE_COUNTS_TABLE} (slug, thumbs_up, thumbs_down) VALUES (?, 0, 0)`,
    [slug]
  )

  const existingResult = await executeD1BlogVoteQuery(
    `SELECT vote FROM ${BLOG_VOTERS_TABLE} WHERE slug = ? AND voter_id = ? LIMIT 1`,
    [slug, voterId]
  )
  const existingRow = existingResult?.results?.[0]
  const previousVote = existingRow?.vote as 'up' | 'down' | undefined

  if (previousVote === vote) {
    return getBlogVoteCountsForSlug(slug)
  }

  if (!previousVote) {
    try {
      await executeD1BlogVoteQuery(
        `INSERT INTO ${BLOG_VOTERS_TABLE} (slug, voter_id, vote) VALUES (?, ?, ?)`,
        [slug, voterId, vote]
      )
    } catch (e) {
      if (_retryDepth < 1 && isSqliteUniqueConstraintError(e)) {
        return recordBlogVote(slug, voterId, vote, _retryDepth + 1)
      }
      throw e
    }
    if (vote === 'up') {
      await executeD1BlogVoteQuery(
        `UPDATE ${BLOG_VOTE_COUNTS_TABLE} SET thumbs_up = thumbs_up + 1 WHERE slug = ?`,
        [slug]
      )
    } else {
      await executeD1BlogVoteQuery(
        `UPDATE ${BLOG_VOTE_COUNTS_TABLE} SET thumbs_down = thumbs_down + 1 WHERE slug = ?`,
        [slug]
      )
    }
    return getBlogVoteCountsForSlug(slug)
  }

  await executeD1BlogVoteQuery(
    `UPDATE ${BLOG_VOTERS_TABLE} SET vote = ? WHERE slug = ? AND voter_id = ?`,
    [vote, slug, voterId]
  )
  if (previousVote === 'up' && vote === 'down') {
    await executeD1BlogVoteQuery(
      `UPDATE ${BLOG_VOTE_COUNTS_TABLE} SET thumbs_up = thumbs_up - 1, thumbs_down = thumbs_down + 1 WHERE slug = ?`,
      [slug]
    )
  } else if (previousVote === 'down' && vote === 'up') {
    await executeD1BlogVoteQuery(
      `UPDATE ${BLOG_VOTE_COUNTS_TABLE} SET thumbs_down = thumbs_down - 1, thumbs_up = thumbs_up + 1 WHERE slug = ?`,
      [slug]
    )
  }

  return getBlogVoteCountsForSlug(slug)
}
