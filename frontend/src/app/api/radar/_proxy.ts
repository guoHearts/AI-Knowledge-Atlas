import { NextResponse } from 'next/server'
import { getBackendInternalUrl } from '@/lib/env'

export async function proxyRadarRequest(path: string) {
  try {
    const upstream = await fetch(`${getBackendInternalUrl()}${path}`, {
      cache: 'no-store',
    })
    const body = await upstream.text()
    const contentType = upstream.headers.get('content-type') || 'application/json'

    return new Response(body, {
      status: upstream.status,
      headers: {
        'content-type': contentType,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown backend error'

    return NextResponse.json(
      { error: 'Radar backend is unavailable', detail: message },
      { status: 502 },
    )
  }
}
