import { NextResponse } from 'next/server';
import { getBackendInternalUrl } from '@/lib/env';

export async function proxyCompareRequest(path: string) {
  try {
    const upstream = await fetch(`${getBackendInternalUrl()}${path}`, {
      cache: 'no-store',
    });
    const body = await upstream.text();
    const contentType = upstream.headers.get('content-type') || 'application/json';

    if (!upstream.ok) {
      try {
        const errorBody = JSON.parse(body);
        return NextResponse.json(errorBody, { status: upstream.status });
      } catch {
        return NextResponse.json(
          { error: { code: 'UPSTREAM_ERROR', message: body || `Upstream responded with ${upstream.status}` } },
          { status: upstream.status },
        );
      }
    }

    return new Response(body, {
      status: upstream.status,
      headers: { 'content-type': contentType },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown backend error';
    return NextResponse.json(
      { error: { code: 'BACKEND_UNAVAILABLE', message: 'Compare backend is unavailable', details: { detail: message } } },
      { status: 502 },
    );
  }
}
