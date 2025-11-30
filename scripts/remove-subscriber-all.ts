#!/usr/bin/env tsx
/**
 * Script to remove a subscriber from Cloudflare D1
 * Usage: npx tsx scripts/remove-subscriber-all.ts <email>
 *
 * Make sure your .env.local file has the necessary Cloudflare credentials:
 * - CLOUDFLARE_ACCOUNT_ID
 * - CLOUDFLARE_API_TOKEN
 * - CLOUDFLARE_D1_DATABASE_ID
 */

import { removeSubscriber } from '../lib/newsletter-storage'
import { removeD1Subscriber } from '../lib/cloudflare-d1'

const email = process.argv[2]

if (!email) {
  console.error('❌ Please provide an email address')
  console.log('Usage: npx tsx scripts/remove-subscriber-all.ts <email>')
  process.exit(1)
}

async function removeFromCloudflareD1(email: string): Promise<boolean> {
  const hasConfig = !!(
    process.env.CLOUDFLARE_ACCOUNT_ID &&
    process.env.CLOUDFLARE_API_TOKEN &&
    process.env.CLOUDFLARE_D1_DATABASE_ID
  )

  if (!hasConfig) {
    console.log('⏭️  Cloudflare D1 not configured, skipping...')
    return false
  }

  try {
    console.log('🔵 Attempting to remove from Cloudflare D1...')
    const removed = await removeD1Subscriber(email.toLowerCase())
    if (removed) {
      console.log('✅ Removed from Cloudflare D1')
      return true
    } else {
      console.log('⚠️  Email not found in Cloudflare D1')
      return false
    }
  } catch (error) {
    console.error('❌ Error removing from Cloudflare D1:', error)
    return false
  }
}

async function main() {
  const normalizedEmail = email.toLowerCase()
  console.log(`\n🔍 Removing ${normalizedEmail} from Cloudflare D1...\n`)

  let removed = false

  // Try Cloudflare D1 directly
  if (await removeFromCloudflareD1(normalizedEmail)) {
    removed = true
  }

  // Also try using the removeSubscriber function
  console.log('\n🔵 Attempting to remove using removeSubscriber function...')
  try {
    const result = await removeSubscriber(normalizedEmail)
    if (result) {
      console.log('✅ Removed using removeSubscriber function')
      removed = true
    } else {
      console.log('⚠️  Email not found via removeSubscriber function')
    }
  } catch (error) {
    console.error('❌ Error using removeSubscriber function:', error)
  }

  console.log('\n' + '='.repeat(50))
  if (removed) {
    console.log(`✅ Successfully removed ${normalizedEmail} from Cloudflare D1`)
  } else {
    console.log(`⚠️  Email ${normalizedEmail} was not found in Cloudflare D1`)
    console.log("\n💡 If you're testing on a deployed site, check your Vercel environment variables:")
    console.log('   - CLOUDFLARE_ACCOUNT_ID')
    console.log('   - CLOUDFLARE_API_TOKEN')
    console.log('   - CLOUDFLARE_D1_DATABASE_ID')
    console.log('\n💡 To remove from production, you can:')
    console.log(
      '   1. Use the API: curl -X DELETE https://your-site.com/api/newsletter/subscribers -H "Content-Type: application/json" -d \'{"email":"' +
        normalizedEmail +
        '"}\''
    )
    console.log('   2. Or run this script with production environment variables set')
  }
  console.log('='.repeat(50) + '\n')
}

main()
