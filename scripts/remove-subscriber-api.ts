#!/usr/bin/env tsx
/**
 * Script to remove a subscriber via API endpoint
 * This works with Cloudflare D1 storage
 * Usage: npx tsx scripts/remove-subscriber-api.ts <email> [baseUrl]
 *
 * Examples:
 *   npx tsx scripts/remove-subscriber-api.ts test@example.com
 *   npx tsx scripts/remove-subscriber-api.ts test@example.com http://localhost:3000
 *   npx tsx scripts/remove-subscriber-api.ts test@example.com https://blog.yourshopguide.com
 */

const email = process.argv[2]
const baseUrl = process.argv[3] || 'http://localhost:3000'

if (!email) {
  console.error('❌ Please provide an email address')
  console.log('Usage: npx tsx scripts/remove-subscriber-api.ts <email> [baseUrl]')
  process.exit(1)
}

async function main() {
  try {
    console.log(`🔵 Attempting to remove: ${email}`)
    console.log(`🔵 Using API endpoint: ${baseUrl}/api/newsletter/subscribers`)

    const response = await fetch(`${baseUrl}/api/newsletter/subscribers`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    const data = await response.json()

    if (response.ok) {
      console.log(`✅ Successfully removed ${email} from newsletter storage`)
      console.log(`📝 Response:`, data.message)
    } else {
      if (response.status === 404) {
        console.log(`⚠️  Email ${email} was not found in newsletter storage`)
        console.log(`📝 Response:`, data.message)
      } else {
        console.error(`❌ Error removing subscriber:`, data.error || data.message)
        process.exit(1)
      }
    }
  } catch (error) {
    console.error('❌ Error calling API:', error)
    console.error(
      '\n💡 Make sure your dev server is running (yarn dev) or provide the correct baseUrl'
    )
    process.exit(1)
  }
}

main()
