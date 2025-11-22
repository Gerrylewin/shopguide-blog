import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'

const TRACKING_FILE_PATH = path.join(process.cwd(), 'data', 'newsletter-tracking.json')

export interface EmailTracking {
  emailId: string
  postSlug: string
  postTitle: string
  sentAt: string
  sentTo: number
  opens: {
    email: string
    openedAt: string
    ip?: string
    userAgent?: string
  }[]
  clicks: {
    email: string
    clickedAt: string
    url: string
    ip?: string
    userAgent?: string
  }[]
}

/**
 * Generate a unique tracking ID for an email
 */
export function generateEmailId(): string {
  return crypto.randomBytes(16).toString('hex')
}

/**
 * Get all tracking data
 */
export async function getTrackingData(): Promise<EmailTracking[]> {
  try {
    const fileContent = await fs.readFile(TRACKING_FILE_PATH, 'utf-8')
    return JSON.parse(fileContent)
  } catch (error) {
    return []
  }
}

/**
 * Get tracking data for a specific email
 */
export async function getEmailTracking(emailId: string): Promise<EmailTracking | null> {
  const allTracking = await getTrackingData()
  return allTracking.find((t) => t.emailId === emailId) || null
}

/**
 * Create a new tracking record
 */
export async function createTrackingRecord(
  emailId: string,
  postSlug: string,
  postTitle: string,
  sentTo: number
): Promise<void> {
  const allTracking = await getTrackingData()

  const newRecord: EmailTracking = {
    emailId,
    postSlug,
    postTitle,
    sentAt: new Date().toISOString(),
    sentTo,
    opens: [],
    clicks: [],
  }

  allTracking.push(newRecord)

  // Ensure data directory exists
  const dataDir = path.dirname(TRACKING_FILE_PATH)
  await fs.mkdir(dataDir, { recursive: true })

  await fs.writeFile(TRACKING_FILE_PATH, JSON.stringify(allTracking, null, 2), 'utf-8')
}

/**
 * Record an email open
 */
export async function recordOpen(
  emailId: string,
  email: string,
  ip?: string,
  userAgent?: string
): Promise<void> {
  const allTracking = await getTrackingData()
  const record = allTracking.find((t) => t.emailId === emailId)

  if (!record) {
    console.error(`Tracking record not found for emailId: ${emailId}`)
    return
  }

  // Check if this email already opened (avoid duplicates)
  const alreadyOpened = record.opens.some((o) => o.email === email)
  if (alreadyOpened) {
    return
  }

  record.opens.push({
    email,
    openedAt: new Date().toISOString(),
    ip,
    userAgent,
  })

  await fs.writeFile(TRACKING_FILE_PATH, JSON.stringify(allTracking, null, 2), 'utf-8')
}

/**
 * Record a click
 */
export async function recordClick(
  emailId: string,
  email: string,
  url: string,
  ip?: string,
  userAgent?: string
): Promise<void> {
  const allTracking = await getTrackingData()
  const record = allTracking.find((t) => t.emailId === emailId)

  if (!record) {
    console.error(`Tracking record not found for emailId: ${emailId}`)
    return
  }

  record.clicks.push({
    email,
    clickedAt: new Date().toISOString(),
    url,
    ip,
    userAgent,
  })

  await fs.writeFile(TRACKING_FILE_PATH, JSON.stringify(allTracking, null, 2), 'utf-8')
}

/**
 * Generate tracking pixel URL
 */
export function getTrackingPixelUrl(emailId: string, email: string, baseUrl: string): string {
  return `${baseUrl}/api/newsletter/track/open?emailId=${emailId}&email=${encodeURIComponent(email)}`
}

/**
 * Generate tracked link URL
 */
export function getTrackedLinkUrl(
  emailId: string,
  email: string,
  originalUrl: string,
  baseUrl: string
): string {
  return `${baseUrl}/api/newsletter/track/click?emailId=${emailId}&email=${encodeURIComponent(email)}&url=${encodeURIComponent(originalUrl)}`
}
