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
    return JSON.parse(fileContent)
  } catch (error) {
    // File doesn't exist yet, return empty array
    return []
  }
}

/**
 * Add a new subscriber (checks for duplicates)
 */
export async function addSubscriber(email: string): Promise<boolean> {
  try {
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
