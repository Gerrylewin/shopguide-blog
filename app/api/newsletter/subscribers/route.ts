import { NextRequest, NextResponse } from 'next/server'
import { getSubscribers, addSubscriber, removeSubscriber } from '@/lib/newsletter-storage'

export const dynamic = 'force-dynamic'

/**
 * GET /api/newsletter/subscribers
 * Get all newsletter subscribers (admin only - you may want to add auth)
 */
export async function GET() {
  try {
    const subscribers = await getSubscribers()
    return NextResponse.json({ subscribers, count: subscribers.length })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 })
  }
}

/**
 * POST /api/newsletter/subscribers
 * Add a subscriber manually
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const added = await addSubscriber(email)
    if (!added) {
      return NextResponse.json({ message: 'Email already subscribed' }, { status: 200 })
    }

    return NextResponse.json({ message: 'Subscriber added successfully' }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add subscriber' }, { status: 500 })
  }
}

/**
 * DELETE /api/newsletter/subscribers
 * Remove a subscriber
 */
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const removed = await removeSubscriber(email)
    if (!removed) {
      return NextResponse.json({ message: 'Email not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Subscriber removed successfully' }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove subscriber' }, { status: 500 })
  }
}
