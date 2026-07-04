import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const db = getDb();
  const patterns = db.prepare('SELECT * FROM design_patterns ORDER BY category').all();
  return NextResponse.json(patterns);
}
