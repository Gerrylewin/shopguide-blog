import { promises as fs } from 'fs'
import path from 'path'

// Use absolute path resolution for better reliability
const EMAILS_FILE_PATH = path.resolve(process.cwd(), 'data', 'newsletter-subscribers.json')

export interface Subscriber {
  email: string
  subscribedAt: string
}

/**
 * Get all newsletter subscribers
 */
export async function getSubscribers(): Promise<Subscriber[]> {
  try {
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
    // Log file path for debugging
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
    const emailExists = subscribers.some((s) => s.email.toLowerCase() === email.toLowerCase())

    if (emailExists) {
      console.log('⚠️ [NEWSLETTER STORAGE] Email already exists:', email)
      return false // Email already subscribed
    }

    // Add new subscriber
    subscribers.push({
      email: email.toLowerCase(),
      subscribedAt: new Date().toISOString(),
    })

    // Write back to file
    console.log('🔵 [NEWSLETTER STORAGE] Writing subscribers to file:', EMAILS_FILE_PATH)
    try {
      await fs.writeFile(EMAILS_FILE_PATH, JSON.stringify(subscribers, null, 2), 'utf-8')
      console.log('✅ [NEWSLETTER STORAGE] Successfully wrote subscribers file')
      return true
    } catch (writeError) {
      // In serverless environments (like Vercel), file system is read-only
      // This is expected and not a critical error - the webhook will still be sent
      const errorCode = (writeError as NodeJS.ErrnoException).code
      if (errorCode === 'EROFS' || errorCode === 'EACCES' || process.env.VERCEL) {
        console.warn(
          '⚠️ [NEWSLETTER STORAGE] File system is read-only (serverless environment). Local storage skipped, but subscription will continue via webhook.'
        )
        // Return true to indicate "success" - the subscription will be handled by webhook
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
    let subscribers = await getSubscribers()
    const initialLength = subscribers.length

    subscribers = subscribers.filter((s) => s.email.toLowerCase() !== email.toLowerCase())

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
