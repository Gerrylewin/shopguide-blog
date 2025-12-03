#!/usr/bin/env tsx
/**
 * Script to remove a subscriber from newsletter storage
 * Usage: npx tsx scripts/remove-subscriber.ts <email>
 */

import { removeSubscriber } from '../lib/newsletter-storage'

const email = process.argv[2]

if (!email) {
  console.error('❌ Please provide an email address')
  console.log('Usage: npx tsx scripts/remove-subscriber.ts <email>')
  process.exit(1)
}

async function main() {
  try {
    console.log(`🔵 Attempting to remove: ${email}`)
    const removed = await removeSubscriber(email)

    if (removed) {
      console.log(`✅ Successfully removed ${email} from newsletter storage`)
    } else {
      console.log(`⚠️  Email ${email} was not found in newsletter storage`)
    }
  } catch (error) {
    console.error('❌ Error removing subscriber:', error)
    process.exit(1)
  }
}

main()



