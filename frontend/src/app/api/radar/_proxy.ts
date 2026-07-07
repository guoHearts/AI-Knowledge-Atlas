import { NextResponse } from 'next/server'

const DEFAULT_BACKEND_URL = 'http://localhost:8000'

function getBackendBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL || DEFAULT_BACKEND_URL).replace(/\/$/, '')
}

export async function proxyRadarRequest(path: string) {
  try {
    const upstream = await fetch(`${getBackendBaseUrl()}${path}`, {
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
