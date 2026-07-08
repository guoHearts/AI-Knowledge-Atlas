import { NextResponse } from 'next/server';
import { listPublishedTrackRows } from '@/features/learn/server/learningService';

export async function GET() {
  return NextResponse.json(await listPublishedTrackRows());
}
