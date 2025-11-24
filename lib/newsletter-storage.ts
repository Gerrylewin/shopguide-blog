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
        console.error('❌ [NEWSLETTER STORAGE] File content is not an array, resetting to empty array')
        // Backup the corrupted file
        const backupPath = EMAILS_FILE_PATH + '.backup.' + Date.now()
        await fs.writeFile(backupPath, fileContent, 'utf-8')
        console.log('✅ [NEWSLETTER STORAGE] Backed up corrupted file to:', backupPath)
        // Reset to empty array
        await fs.writeFile(EMAILS_FILE_PATH, '[]', 'utf-8')
        return []
      }
      return parsed
    } catch (parseError) {
      console.error('❌ [NEWSLETTER STORAGE] JSON parse error, file may be corrupted:', parseError)
      // Backup the corrupted file
      const backupPath = EMAILS_FILE_PATH + '.backup.' + Date.now()
      await fs.writeFile(backupPath, fileContent, 'utf-8')
      console.log('✅ [NEWSLETTER STORAGE] Backed up corrupted file to:', backupPath)
      // Reset to empty array
      await fs.writeFile(EMAILS_FILE_PATH, '[]', 'utf-8')
      return []
    }
  } catch (error) {
    // File doesn't exist yet or can't be read, return empty array
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.log('🔵 [NEWSLETTER STORAGE] File does not exist yet, returning empty array')
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
    
    // Ensure data directory exists
    const dataDir = path.dirname(EMAILS_FILE_PATH)
    console.log('🔵 [NEWSLETTER STORAGE] Ensuring data directory exists:', dataDir)
    await fs.mkdir(dataDir, { recursive: true })
    console.log('✅ [NEWSLETTER STORAGE] Data directory ready')

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
    await fs.writeFile(EMAILS_FILE_PATH, JSON.stringify(subscribers, null, 2), 'utf-8')
    console.log('✅ [NEWSLETTER STORAGE] Successfully wrote subscribers file')
    return true
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
