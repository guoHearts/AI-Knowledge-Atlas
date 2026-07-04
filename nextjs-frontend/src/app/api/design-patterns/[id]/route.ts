import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();
  const pattern = db.prepare('SELECT * FROM design_patterns WHERE id = ? OR name = ?').get(id, id);
  if (!pattern) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(pattern);
}
