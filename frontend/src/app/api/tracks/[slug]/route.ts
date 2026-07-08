import { NextResponse } from 'next/server';
import { getTrackRowWithModuleRows } from '@/features/learn/server/learningService';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const track = await getTrackRowWithModuleRows(slug);
  if (!track) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(track);
}
