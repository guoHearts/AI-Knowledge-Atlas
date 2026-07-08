import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { listPublishedTrackRows } from '@/features/learn/server/learningService';

export async function GET() {
  return NextResponse.json(listPublishedTrackRows(getDb()));
}
