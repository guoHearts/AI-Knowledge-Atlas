import { NextResponse } from 'next/server';
import {
  listUserProgressRows,
  upsertLessonProgress,
} from '@/features/progress/api/progressServerApi';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'default';
  return NextResponse.json(await listUserProgressRows(userId));
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { lessonId, status, experimentCode, experimentStatus } = body;
  const userId = body.userId || 'default';

  return NextResponse.json(await upsertLessonProgress({
    lessonId,
    userId,
    status,
    experimentCode,
    experimentStatus,
  }));
}
