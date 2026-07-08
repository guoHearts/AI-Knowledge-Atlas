import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getModuleRowWithLessonRows } from '@/features/learn/server/learningService';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const moduleWithLessons = getModuleRowWithLessonRows(getDb(), id);
  if (!moduleWithLessons) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(moduleWithLessons);
}
