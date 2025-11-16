import { promises as fs } from 'fs'
import path from 'path'

const EMAILS_FILE_PATH = path.join(process.cwd(), 'data', 'newsletter-subscribers.json')

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
    await fs.mkdir(dataDir, { recursive: true })

    // Read existing emails
    const subscribers = await getSubscribers()

    // Check if email already exists
    const emailExists = subscribers.some((s) => s.email.toLowerCase() === email.toLowerCase())

    if (emailExists) {
      return false // Email already subscribed
    }

    // Add new subscriber
    subscribers.push({
      email: email.toLowerCase(),
      subscribedAt: new Date().toISOString(),
    })

    // Write back to file
    await fs.writeFile(EMAILS_FILE_PATH, JSON.stringify(subscribers, null, 2), 'utf-8')
    return true
  } catch (error) {
    console.error('Failed to add subscriber:', error)
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
