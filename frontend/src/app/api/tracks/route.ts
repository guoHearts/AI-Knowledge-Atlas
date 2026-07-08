import { NextResponse } from 'next/server';
import { listPublishedTrackRows } from '@/features/learn/api/learningApi';

export async function GET() {
  return NextResponse.json(await listPublishedTrackRows());
}
