import { NextResponse } from 'next/server';
import { getModuleRowWithLessonRows } from '@/features/learn/api/learningApi';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const row = await getModuleRowWithLessonRows(id);
    if (!row) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Module not found' } }, { status: 404 });
    return NextResponse.json(row);
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'MODULE_FETCH_FAILED', message: error instanceof Error ? error.message : 'Unknown error' } },
      { status: 500 },
    );
  }
}
