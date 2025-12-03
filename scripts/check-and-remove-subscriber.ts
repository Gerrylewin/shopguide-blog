#!/usr/bin/env tsx
/**
 * Script to check what subscribers exist and remove a specific one
 * This directly queries Cloudflare D1 to see what's actually stored
 *
 * Usage: npx tsx scripts/check-and-remove-subscriber.ts [email-to-remove]
 */

import { getD1Subscribers, checkD1SubscriberExists, removeD1Subscriber } from '../lib/cloudflare-d1'

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
  console.log('\n💡 You can get these from your Vercel project settings:')
  console.log('   1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables')
  console.log('   2. Copy the values and set them locally')
  process.exit(1)
}

async function main() {
  try {
    console.log('🔍 Checking all subscribers in Cloudflare D1...\n')

    const subscribers = await getD1Subscribers()
    console.log(`📊 Found ${subscribers.length} subscriber(s):\n`)

    subscribers.forEach((sub, index) => {
      console.log(`  ${index + 1}. ${sub.email} (subscribed: ${sub.subscribedAt})`)
    })

    const emailToRemove = process.argv[2]

    if (emailToRemove) {
      console.log(`\n🔵 Attempting to remove: ${emailToRemove}`)
      const normalizedEmail = emailToRemove.toLowerCase()

      // Check if it exists
      const exists = await checkD1SubscriberExists(normalizedEmail)
      console.log(`   Exists: ${exists}`)

      if (exists) {
        const removed = await removeD1Subscriber(normalizedEmail)
        if (removed) {
          console.log(`✅ Successfully removed ${normalizedEmail}`)
        } else {
          console.log(`❌ Failed to remove ${normalizedEmail}`)
        }
      } else {
        console.log(`⚠️  Email ${normalizedEmail} not found in Cloudflare D1`)
        console.log('\n💡 Available emails:')
        subscribers.forEach((sub) => {
          console.log(`   - ${sub.email}`)
        })
      }
    } else {
      console.log('\n💡 To remove an email, run:')
      console.log(`   npx tsx scripts/check-and-remove-subscriber.ts <email>`)
    }
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

main()
