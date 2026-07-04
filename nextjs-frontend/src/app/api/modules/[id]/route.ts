import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();
  const mod = db.prepare('SELECT * FROM modules WHERE id = ?').get(id);
  if (!mod) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const lessons = db.prepare(
    "SELECT * FROM lessons WHERE module_id = ? AND status = 'published' ORDER BY sort_order"
  ).all(id);

  return NextResponse.json({ ...(mod as any), lessons });
}
