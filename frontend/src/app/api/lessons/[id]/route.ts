import { NextResponse } from 'next/server';
import { getLessonRow } from '@/features/learn/api/learningApi';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const lesson = await getLessonRow(id);
    if (!lesson) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Lesson not found' } }, { status: 404 });
    return NextResponse.json(lesson);
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'LESSON_FETCH_FAILED', message: error instanceof Error ? error.message : 'Unknown error' } },
      { status: 500 },
    );
  }
}
