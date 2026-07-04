import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const db = getDb();
  const tracks = db.prepare(
    "SELECT * FROM learning_tracks WHERE status = 'published' ORDER BY sort_order"
  ).all();
  return NextResponse.json(tracks);
}
