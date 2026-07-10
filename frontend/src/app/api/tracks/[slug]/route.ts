import { NextResponse } from 'next/server';
import { getTrackRowWithModuleRows } from '@/features/learn/api/learningApi';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const track = await getTrackRowWithModuleRows(slug);
    if (!track) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Track not found' } }, { status: 404 });
    return NextResponse.json(track);
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'TRACK_FETCH_FAILED', message: error instanceof Error ? error.message : 'Unknown error' } },
      { status: 500 },
    );
  }
}
