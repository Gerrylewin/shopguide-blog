import {
  isCloudflareD1Available,
  getD1Subscribers,
  addD1Subscriber,
  checkD1SubscriberExists,
  removeD1Subscriber,
} from './cloudflare-d1'

// Test email that can subscribe multiple times (for testing purposes)
const TEST_EMAIL = 'isaac.g.lewin@gmail.com'

export interface Subscriber {
  email: string
  subscribedAt: string
}

/**
 * Get all newsletter subscribers from Cloudflare D1
 */
export async function getSubscribers(): Promise<Subscriber[]> {
  if (!isCloudflareD1Available()) {
    throw new Error('Cloudflare D1 is not configured')
  }

  try {
    const subscribers = await getD1Subscribers()
    return subscribers
  } catch (error) {
    console.error('❌ [NEWSLETTER STORAGE] Error getting subscribers:', error)
    throw error
  }
}

/**
 * Add a new subscriber (checks for duplicates)
 */
export async function addSubscriber(email: string): Promise<boolean> {
  if (!isCloudflareD1Available()) {
    throw new Error('Cloudflare D1 is not configured')
  }

  const normalizedEmail = email.toLowerCase()
  const subscribedAt = new Date().toISOString()

  // TEST MODE: Allow test email to bypass duplicate check
  const isTestEmail = normalizedEmail === TEST_EMAIL.toLowerCase()
  if (isTestEmail) {
    console.log(
      '🧪 [NEWSLETTER STORAGE] Test email detected - allowing multiple subscriptions for testing'
    )
    // Remove existing entry first to allow re-subscription
    try {
      await removeD1Subscriber(normalizedEmail)
    } catch (error) {
      // Ignore if email doesn't exist - that's fine
    }
  } else {
    // Check if email already exists
    const emailExists = await checkD1SubscriberExists(normalizedEmail)
    if (emailExists) {
      console.log('⚠️ [NEWSLETTER STORAGE] Email already exists:', normalizedEmail)
      return false
    }
  }

  // Add new subscriber
  const success = await addD1Subscriber(normalizedEmail, subscribedAt)
  if (success) {
    console.log('✅ [NEWSLETTER STORAGE] Successfully saved subscriber to Cloudflare D1')
    return true
  }

  return false
}

/**
 * Remove a subscriber
 */
export async function removeSubscriber(email: string): Promise<boolean> {
  if (!isCloudflareD1Available()) {
    throw new Error('Cloudflare D1 is not configured')
  }

  const normalizedEmail = email.toLowerCase()
  const success = await removeD1Subscriber(normalizedEmail)
  return success
}

/**
 * Get subscriber count
 */
export async function getSubscriberCount(): Promise<number> {
  const subscribers = await getSubscribers()
  return subscribers.length
}
