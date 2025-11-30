import { promises as fs } from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import { kv } from '@vercel/kv'
import {
  isCloudflareD1Available,
  getD1Subscribers,
  addD1Subscriber,
  checkD1SubscriberExists,
  removeD1Subscriber,
} from './cloudflare-d1'

// Use absolute path resolution for better reliability
const EMAILS_FILE_PATH = path.resolve(process.cwd(), 'data', 'newsletter-subscribers.json')
const KV_KEY = 'newsletter:subscribers'

export interface Subscriber {
  email: string
  subscribedAt: string
}

/**
 * Check if Cloudflare D1 is available
 */
function isCloudflareD1AvailableCheck(): boolean {
  return isCloudflareD1Available()
}

/**
 * Check if Supabase is available
 */
function isSupabaseAvailable(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

/**
 * Get Supabase client
 */
function getSupabaseClient() {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase is not configured')
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

/**
 * Check if Vercel KV is available
 */
function isKVAvailable(): boolean {
  return !!(process.env.KV_URL && process.env.KV_REST_API_TOKEN)
}

/**
 * Get all newsletter subscribers from Cloudflare D1, Supabase, KV, or file system
 */
export async function getSubscribers(): Promise<Subscriber[]> {
  // Priority 1: Cloudflare D1 (if already using Cloudflare)
  if (isCloudflareD1AvailableCheck()) {
    try {
      console.log('🔵 [NEWSLETTER STORAGE] Using Cloudflare D1 storage')
      const subscribers = await getD1Subscribers()
      console.log(
        '✅ [NEWSLETTER STORAGE] Found',
        subscribers.length,
        'subscribers in Cloudflare D1'
      )
      return subscribers
    } catch (error) {
      console.error('❌ [NEWSLETTER STORAGE] Error with Cloudflare D1:', error)
      // Fall through to next storage method
    }
  }

  // Priority 2: Supabase (works everywhere, free tier available)
  if (isSupabaseAvailable()) {
    try {
      console.log('🔵 [NEWSLETTER STORAGE] Using Supabase storage')
      const supabase = getSupabaseClient()

      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('email, subscribed_at')
        .order('subscribed_at', { ascending: false })

      if (error) {
        console.error('❌ [NEWSLETTER STORAGE] Error reading from Supabase:', error)
        // Fall through to next storage method
      } else if (data) {
        const subscribers: Subscriber[] = data.map((row) => ({
          email: row.email,
          subscribedAt: row.subscribed_at,
        }))
        console.log('✅ [NEWSLETTER STORAGE] Found', subscribers.length, 'subscribers in Supabase')
        return subscribers
      }
    } catch (error) {
      console.error('❌ [NEWSLETTER STORAGE] Error with Supabase:', error)
      // Fall through to next storage method
    }
  }

  // Priority 2: Vercel KV (if available)
  if (isKVAvailable()) {
    try {
      console.log('🔵 [NEWSLETTER STORAGE] Using Vercel KV storage')
      const subscribers = await kv.get<Subscriber[]>(KV_KEY)
      if (!subscribers || !Array.isArray(subscribers)) {
        console.log('🔵 [NEWSLETTER STORAGE] No subscribers found in KV, returning empty array')
        return []
      }
      console.log('✅ [NEWSLETTER STORAGE] Found', subscribers.length, 'subscribers in KV')
      return subscribers
    } catch (error) {
      console.error('❌ [NEWSLETTER STORAGE] Error reading from KV:', error)
      // Fall through to file system
    }
  }

  // Priority 3: File system (local development only)
  try {
    console.log('🔵 [NEWSLETTER STORAGE] Using file system storage')
    const fileContent = await fs.readFile(EMAILS_FILE_PATH, 'utf-8')
    const trimmedContent = fileContent.trim()

    // If file is empty or only whitespace, return empty array
    if (!trimmedContent) {
      return []
    }

    try {
      const parsed = JSON.parse(trimmedContent)
      // Validate it's an array
      if (!Array.isArray(parsed)) {
        console.error(
          '❌ [NEWSLETTER STORAGE] File content is not an array, resetting to empty array'
        )
        // In serverless environments, we can't write backups or fix files
        if (!process.env.VERCEL) {
          try {
            const backupPath = EMAILS_FILE_PATH + '.backup.' + Date.now()
            await fs.writeFile(backupPath, fileContent, 'utf-8')
            console.log('✅ [NEWSLETTER STORAGE] Backed up corrupted file to:', backupPath)
            await fs.writeFile(EMAILS_FILE_PATH, '[]', 'utf-8')
          } catch (writeError) {
            console.warn(
              '⚠️ [NEWSLETTER STORAGE] Could not fix corrupted file (read-only):',
              writeError
            )
          }
        }
        return []
      }
      return parsed
    } catch (parseError) {
      console.error('❌ [NEWSLETTER STORAGE] JSON parse error, file may be corrupted:', parseError)
      // In serverless environments, we can't write backups or fix files
      if (!process.env.VERCEL) {
        try {
          const backupPath = EMAILS_FILE_PATH + '.backup.' + Date.now()
          await fs.writeFile(backupPath, fileContent, 'utf-8')
          console.log('✅ [NEWSLETTER STORAGE] Backed up corrupted file to:', backupPath)
          await fs.writeFile(EMAILS_FILE_PATH, '[]', 'utf-8')
        } catch (writeError) {
          console.warn(
            '⚠️ [NEWSLETTER STORAGE] Could not fix corrupted file (read-only):',
            writeError
          )
        }
      }
      return []
    }
  } catch (error) {
    // File doesn't exist yet or can't be read, return empty array
    const errorCode = (error as NodeJS.ErrnoException).code
    if (errorCode === 'ENOENT') {
      console.log('🔵 [NEWSLETTER STORAGE] File does not exist yet, returning empty array')
      return []
    }
    // In serverless environments, file system errors are expected
    if (process.env.VERCEL) {
      console.log(
        '🔵 [NEWSLETTER STORAGE] Read-only file system (serverless), returning empty array'
      )
      return []
    }
    // For other errors, log and return empty array
    console.error('❌ [NEWSLETTER STORAGE] Error reading subscribers file:', error)
    return []
  }
}

/**
 * Add a new subscriber (checks for duplicates)
 */
export async function addSubscriber(email: string): Promise<boolean> {
  try {
    const normalizedEmail = email.toLowerCase()
    const subscribedAt = new Date().toISOString()

    // Priority 1: Cloudflare D1 (if already using Cloudflare)
    if (isCloudflareD1AvailableCheck()) {
      try {
        console.log('🔵 [NEWSLETTER STORAGE] Using Cloudflare D1 storage')

        // Check if email already exists
        const emailExists = await checkD1SubscriberExists(normalizedEmail)

        if (emailExists) {
          console.log(
            '⚠️ [NEWSLETTER STORAGE] Email already exists in Cloudflare D1:',
            normalizedEmail
          )
          return false // Email already subscribed
        }

        // Add new subscriber
        const success = await addD1Subscriber(normalizedEmail, subscribedAt)

        if (success) {
          console.log('✅ [NEWSLETTER STORAGE] Successfully saved subscriber to Cloudflare D1')
          return true
        }

        return false
      } catch (error) {
        console.error('❌ [NEWSLETTER STORAGE] Failed to add subscriber to Cloudflare D1:', error)
        // Fall through to next storage method
      }
    }

    // Priority 2: Supabase (works everywhere)
    if (isSupabaseAvailable()) {
      try {
        console.log('🔵 [NEWSLETTER STORAGE] Using Supabase storage')
        const supabase = getSupabaseClient()

        // Check if email already exists
        const { data: existing } = await supabase
          .from('newsletter_subscribers')
          .select('email')
          .eq('email', normalizedEmail)
          .single()

        if (existing) {
          console.log('⚠️ [NEWSLETTER STORAGE] Email already exists in Supabase:', normalizedEmail)
          return false // Email already subscribed
        }

        // Add new subscriber
        const { error } = await supabase.from('newsletter_subscribers').insert({
          email: normalizedEmail,
          subscribed_at: subscribedAt,
        })

        if (error) {
          console.error('❌ [NEWSLETTER STORAGE] Failed to add subscriber to Supabase:', error)
          throw error
        }

        console.log('✅ [NEWSLETTER STORAGE] Successfully saved subscriber to Supabase')
        return true
      } catch (error) {
        console.error('❌ [NEWSLETTER STORAGE] Failed to add subscriber to Supabase:', error)
        // Fall through to next storage method
      }
    }

    // Priority 2: Vercel KV (if available)
    if (isKVAvailable()) {
      try {
        console.log('🔵 [NEWSLETTER STORAGE] Using Vercel KV storage')
        const subscribers = await getSubscribers()

        // Check if email already exists
        const emailExists = subscribers.some((s) => s.email.toLowerCase() === normalizedEmail)

        if (emailExists) {
          console.log('⚠️ [NEWSLETTER STORAGE] Email already exists in KV:', normalizedEmail)
          return false // Email already subscribed
        }

        // Add new subscriber
        const newSubscriber: Subscriber = {
          email: normalizedEmail,
          subscribedAt: subscribedAt,
        }
        subscribers.push(newSubscriber)

        // Save to KV
        console.log('🔵 [NEWSLETTER STORAGE] Saving to KV...')
        await kv.set(KV_KEY, subscribers)
        console.log('✅ [NEWSLETTER STORAGE] Successfully saved subscriber to KV')
        return true
      } catch (error) {
        console.error('❌ [NEWSLETTER STORAGE] Failed to add subscriber to KV:', error)
        // Fall through to file system
      }
    }

    // Priority 3: File system (local development only)
    // Check if we're in a read-only environment BEFORE attempting write
    if (process.env.VERCEL) {
      console.error(
        '❌ [NEWSLETTER STORAGE] Cannot write to file system in Vercel production environment. File system is read-only.'
      )
      console.error(
        '❌ [NEWSLETTER STORAGE] Please configure Supabase (recommended) or Vercel KV for persistent storage.'
      )
      console.error(
        '❌ [NEWSLETTER STORAGE] Email subscription will still be sent to GHL webhook, but not saved locally.'
      )
      // Return true so the API doesn't fail, but log the issue
      return true
    }

    console.log('🔵 [NEWSLETTER STORAGE] Using file system storage')
    console.log('🔵 [NEWSLETTER STORAGE] File path:', EMAILS_FILE_PATH)
    console.log('🔵 [NEWSLETTER STORAGE] Process cwd:', process.cwd())

    // Ensure data directory exists
    const dataDir = path.dirname(EMAILS_FILE_PATH)
    console.log('🔵 [NEWSLETTER STORAGE] Ensuring data directory exists:', dataDir)
    try {
      await fs.mkdir(dataDir, { recursive: true })
      console.log('✅ [NEWSLETTER STORAGE] Data directory ready')
    } catch (mkdirError) {
      console.warn(
        '⚠️ [NEWSLETTER STORAGE] Could not create directory (may be read-only):',
        mkdirError
      )
      // Continue anyway - might be able to read existing file
    }

    // Read existing emails
    console.log('🔵 [NEWSLETTER STORAGE] Reading existing subscribers...')
    const subscribers = await getSubscribers()
    console.log('✅ [NEWSLETTER STORAGE] Found', subscribers.length, 'existing subscribers')

    // Check if email already exists
    const emailExists = subscribers.some((s) => s.email.toLowerCase() === normalizedEmail)

    if (emailExists) {
      console.log('⚠️ [NEWSLETTER STORAGE] Email already exists:', normalizedEmail)
      return false // Email already subscribed
    }

    // Add new subscriber
    subscribers.push({
      email: normalizedEmail,
      subscribedAt: subscribedAt,
    })

    // Write back to file
    console.log('🔵 [NEWSLETTER STORAGE] Writing subscribers to file:', EMAILS_FILE_PATH)

    try {
      // Ensure the file has proper formatting
      const fileContent = JSON.stringify(subscribers, null, 2)
      await fs.writeFile(EMAILS_FILE_PATH, fileContent, 'utf-8')

      // Verify the write was successful by reading it back
      const verifyContent = await fs.readFile(EMAILS_FILE_PATH, 'utf-8')
      const verifyParsed = JSON.parse(verifyContent)
      if (verifyParsed.length !== subscribers.length) {
        console.warn('⚠️ [NEWSLETTER STORAGE] Write verification failed - file length mismatch')
      }

      console.log(
        '✅ [NEWSLETTER STORAGE] Successfully wrote subscribers file with',
        subscribers.length,
        'subscribers'
      )
      return true
    } catch (writeError) {
      const errorCode = (writeError as NodeJS.ErrnoException).code
      console.error('❌ [NEWSLETTER STORAGE] Write error details:', {
        code: errorCode,
        message: writeError instanceof Error ? writeError.message : String(writeError),
        path: EMAILS_FILE_PATH,
        cwd: process.cwd(),
        vercel: !!process.env.VERCEL,
      })

      // In serverless environments (like Vercel), file system is read-only
      // This is expected and not a critical error - the webhook will still be sent
      if (errorCode === 'EROFS' || errorCode === 'EACCES' || process.env.VERCEL) {
        console.error(
          '❌ [NEWSLETTER STORAGE] File system is read-only (serverless environment). Please set up Supabase or Vercel KV for persistent storage.'
        )
        // Return true to indicate "success" - the subscription will be handled by webhook
        // But warn that storage isn't working
        return true
      }
      // For other errors, re-throw
      throw writeError
    }
  } catch (error) {
    console.error('❌ [NEWSLETTER STORAGE] Failed to add subscriber:', error)
    const errorDetails =
      error instanceof Error
        ? { message: error.message, stack: error.stack, name: error.name }
        : { error: String(error) }
    console.error('❌ [NEWSLETTER STORAGE] Error details:', errorDetails)
    console.error('❌ [NEWSLETTER STORAGE] File path:', EMAILS_FILE_PATH)
    console.error('❌ [NEWSLETTER STORAGE] Process cwd:', process.cwd())
    throw error
  }
}

/**
 * Remove a subscriber
 */
export async function removeSubscriber(email: string): Promise<boolean> {
  try {
    const normalizedEmail = email.toLowerCase()

    // Priority 1: Cloudflare D1
    if (isCloudflareD1AvailableCheck()) {
      const success = await removeD1Subscriber(normalizedEmail)
      return success
    }

    // Priority 2: Supabase
    if (isSupabaseAvailable()) {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('newsletter_subscribers')
        .delete()
        .eq('email', normalizedEmail)

      if (error) {
        console.error('❌ [NEWSLETTER STORAGE] Failed to remove subscriber from Supabase:', error)
        throw error
      }
      return true
    }

    // Priority 2: Vercel KV
    if (isKVAvailable()) {
      const subscribers = await getSubscribers()
      const initialLength = subscribers.length
      const filtered = subscribers.filter((s) => s.email.toLowerCase() !== normalizedEmail)

      if (filtered.length === initialLength) {
        return false // Email not found
      }

      await kv.set(KV_KEY, filtered)
      return true
    }

    // Priority 3: File system
    let subscribers = await getSubscribers()
    const initialLength = subscribers.length

    subscribers = subscribers.filter((s) => s.email.toLowerCase() !== normalizedEmail)

    if (subscribers.length === initialLength) {
      return false // Email not found
    }

    // Write back to file
    await fs.writeFile(EMAILS_FILE_PATH, JSON.stringify(subscribers, null, 2), 'utf-8')
    return true
  } catch (error) {
    console.error('Failed to remove subscriber:', error)
    throw error
  }
}

/**
 * Get subscriber count
 */
export async function getSubscriberCount(): Promise<number> {
  const subscribers = await getSubscribers()
  return subscribers.length
}
