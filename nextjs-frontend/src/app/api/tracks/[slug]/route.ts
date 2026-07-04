import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const db = getDb();
  const track = db.prepare('SELECT * FROM learning_tracks WHERE slug = ?').get(slug);
  if (!track) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const modules = db.prepare(
    'SELECT * FROM modules WHERE track_id = ? ORDER BY sort_order'
  ).all((track as any).id);

  return NextResponse.json({ ...(track as any), modules });
}
