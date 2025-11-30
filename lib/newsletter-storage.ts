import { promises as fs } from 'fs'
import path from 'path'
import { kv } from '@vercel/kv'

// Use absolute path resolution for better reliability
const EMAILS_FILE_PATH = path.resolve(process.cwd(), 'data', 'newsletter-subscribers.json')
const KV_KEY = 'newsletter:subscribers'

export interface Subscriber {
  email: string
  subscribedAt: string
}

/**
 * Check if Vercel KV is available
 */
function isKVAvailable(): boolean {
  return !!(process.env.KV_URL && process.env.KV_REST_API_TOKEN)
}

/**
 * Get all newsletter subscribers from KV or file system
 */
export async function getSubscribers(): Promise<Subscriber[]> {
  // Use Vercel KV if available (production)
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
      // Fallback to empty array if KV fails
      return []
    }
  }

  // Fallback to file system (local development)
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

    // Use Vercel KV if available (production)
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
          subscribedAt: new Date().toISOString(),
        }
        subscribers.push(newSubscriber)

        // Save to KV
        console.log('🔵 [NEWSLETTER STORAGE] Saving to KV...')
        await kv.set(KV_KEY, subscribers)
        console.log('✅ [NEWSLETTER STORAGE] Successfully saved subscriber to KV')
        return true
      } catch (error) {
        console.error('❌ [NEWSLETTER STORAGE] Failed to add subscriber to KV:', error)
        throw error
      }
    }

    // Fallback to file system (local development)
    console.log('🔵 [NEWSLETTER STORAGE] Using file system storage')
    console.log('🔵 [NEWSLETTER STORAGE] File path:', EMAILS_FILE_PATH)
    console.log('🔵 [NEWSLETTER STORAGE] Process cwd:', process.cwd())
    console.log('🔵 [NEWSLETTER STORAGE] Vercel environment:', !!process.env.VERCEL)

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
      subscribedAt: new Date().toISOString(),
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
        console.warn(
          '⚠️ [NEWSLETTER STORAGE] File system is read-only (serverless environment). Please set up Vercel KV for persistent storage.'
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

    // Use Vercel KV if available
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

    // Fallback to file system
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
