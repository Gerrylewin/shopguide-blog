import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.GA_MEASUREMENT_ID || 'G-3BNNFQ6N5R'
const GA_MP_API_SECRET = process.env.GA_MP_API_SECRET
const ANALYTICS_COLLECT_TOKEN = process.env.ANALYTICS_COLLECT_TOKEN

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export async function POST(req: NextRequest) {
  if (!GA_MP_API_SECRET) {
    return jsonError('GA_MP_API_SECRET is not configured on the server', 500)
  }
  if (!GA_MEASUREMENT_ID) {
    return jsonError('GA measurement ID is not configured', 500)
  }

  if (ANALYTICS_COLLECT_TOKEN) {
    const provided = req.headers.get('x-api-key')
    if (provided !== ANALYTICS_COLLECT_TOKEN) {
      return jsonError('Unauthorized', 401)
    }
  }

  let payload: unknown
  try {
    payload = await req.json()
  } catch (error) {
    return jsonError('Invalid JSON body', 400)
  }

  if (typeof payload !== 'object' || payload === null) {
    return jsonError('Request body must be a JSON object', 400)
  }

  const { client_id, user_id, events } = payload as {
    client_id?: unknown
    user_id?: unknown
    events?: unknown
  }

  if (!client_id && !user_id) {
    return jsonError('client_id or user_id is required', 400)
  }

  if (!Array.isArray(events) || events.length === 0) {
    return jsonError('events array is required', 400)
  }

  const debug = req.nextUrl.searchParams.get('debug') === 'true'
  const endpoint = debug
    ? 'https://www.google-analytics.com/debug/mp/collect'
    : 'https://www.google-analytics.com/mp/collect'

  const url = `${endpoint}?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_MP_API_SECRET}`

  const gaResponse = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
    body: JSON.stringify(payload),
  })

  const responseText = await gaResponse.text()

  if (debug) {
    let parsed
    try {
      parsed = JSON.parse(responseText)
    } catch {
      parsed = responseText
    }
    return NextResponse.json(
      {
        forwarded: true,
        debugResponse: parsed,
      },
      { status: gaResponse.ok ? 200 : gaResponse.status }
    )
  }

  return NextResponse.json(
    {
      forwarded: true,
      ok: gaResponse.ok,
      status: gaResponse.status,
    },
    { status: gaResponse.ok ? 200 : gaResponse.status }
  )
}
