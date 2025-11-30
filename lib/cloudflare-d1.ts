/**
 * Cloudflare D1 Database Client
 * Uses the Cloudflare D1 REST API to interact with the database
 */

export interface Subscriber {
  email: string
  subscribedAt: string
}

/**
 * Check if Cloudflare D1 is available
 */
export function isCloudflareD1Available(): boolean {
  return !!(
    process.env.CLOUDFLARE_ACCOUNT_ID &&
    process.env.CLOUDFLARE_API_TOKEN &&
    process.env.CLOUDFLARE_D1_DATABASE_ID
  )
}

/**
 * Get Cloudflare D1 REST API base URL
 */
function getD1ApiUrl(): string {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID
  return `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`
}

/**
 * Execute a query on Cloudflare D1
 */
async function executeD1Query(query: string, params: any[] = []): Promise<any> {
  if (!isCloudflareD1Available()) {
    throw new Error('Cloudflare D1 is not configured')
  }

  const apiToken = process.env.CLOUDFLARE_API_TOKEN
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
    throw new Error(`Cloudflare D1 API error: ${response.status} ${errorText}`)
  }

  const result = await response.json()

  if (!result.success) {
    throw new Error(`Cloudflare D1 query failed: ${JSON.stringify(result.errors)}`)
  }

  return result.result
}

/**
 * Get all newsletter subscribers from Cloudflare D1
 */
export async function getD1Subscribers(): Promise<Subscriber[]> {
  try {
    const result = await executeD1Query(
      'SELECT email, subscribed_at FROM newsletter_subscribers ORDER BY subscribed_at DESC'
    )

    if (!result || !Array.isArray(result)) {
      return []
    }

    return result.map((row: any) => ({
      email: row.email,
      subscribedAt: row.subscribed_at,
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
  } catch (error: any) {
    // Check if it's a unique constraint violation (email already exists)
    if (error.message?.includes('UNIQUE constraint') || error.message?.includes('already exists')) {
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

    return result && Array.isArray(result) && result.length > 0
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
    return result && result.meta && result.meta.changes > 0
  } catch (error) {
    console.error('❌ [CLOUDFLARE D1] Error removing subscriber:', error)
    throw error
  }
}
