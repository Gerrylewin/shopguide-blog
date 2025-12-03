#!/usr/bin/env tsx
/**
 * Script to remove a subscriber directly from Cloudflare D1
 * This requires Cloudflare environment variables to be set
 *
 * Usage: npx tsx scripts/remove-from-cloudflare-d1.ts <email>
 *
 * Make sure you have these environment variables set:
 * - CLOUDFLARE_ACCOUNT_ID
 * - CLOUDFLARE_API_TOKEN
 * - CLOUDFLARE_D1_DATABASE_ID
 */

import { removeD1Subscriber, checkD1SubscriberExists } from '../lib/cloudflare-d1'

const email = process.argv[2]

if (!email) {
  console.error('❌ Please provide an email address')
  console.log('Usage: npx tsx scripts/remove-from-cloudflare-d1.ts <email>')
  process.exit(1)
}

// Check if Cloudflare D1 is configured
const hasConfig = !!(
  process.env.CLOUDFLARE_ACCOUNT_ID &&
  process.env.CLOUDFLARE_API_TOKEN &&
  process.env.CLOUDFLARE_D1_DATABASE_ID
)

if (!hasConfig) {
  console.error('❌ Cloudflare D1 is not configured!')
  console.log('\nPlease set these environment variables:')
  console.log('  - CLOUDFLARE_ACCOUNT_ID')
  console.log('  - CLOUDFLARE_API_TOKEN')
  console.log('  - CLOUDFLARE_D1_DATABASE_ID')
  console.log('\nYou can find these in your Vercel project settings or Cloudflare dashboard.')
  process.exit(1)
}

async function main() {
  try {
    const normalizedEmail = email.toLowerCase()
    console.log(`🔵 Checking if ${normalizedEmail} exists in Cloudflare D1...`)

    const exists = await checkD1SubscriberExists(normalizedEmail)

    if (!exists) {
      console.log(`⚠️  Email ${normalizedEmail} was not found in Cloudflare D1`)
      process.exit(0)
    }

    console.log(`✅ Email found! Removing ${normalizedEmail} from Cloudflare D1...`)
    const removed = await removeD1Subscriber(normalizedEmail)

    if (removed) {
      console.log(`✅ Successfully removed ${normalizedEmail} from Cloudflare D1`)
    } else {
      console.log(`⚠️  Failed to remove ${normalizedEmail} from Cloudflare D1`)
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Error removing subscriber from Cloudflare D1:', error)
    process.exit(1)
  }
}

main()



