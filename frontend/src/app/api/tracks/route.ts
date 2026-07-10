import { NextResponse } from 'next/server';
import { listPublishedTrackRows } from '@/features/learn/api/learningApi';

export async function GET() {
  try {
    return NextResponse.json(await listPublishedTrackRows());
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'TRACKS_FETCH_FAILED', message: error instanceof Error ? error.message : 'Unknown error' } },
      { status: 500 },
    );
  }
}
