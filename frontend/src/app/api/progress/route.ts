import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import {
  listUserProgressRows,
  upsertLessonProgress,
} from '@/features/progress/server/progressService';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'default';
  return NextResponse.json(listUserProgressRows(getDb(), userId));
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { lessonId, status, experimentCode, experimentStatus } = body;
  const userId = body.userId || 'default';

  return NextResponse.json(upsertLessonProgress(getDb(), {
    lessonId,
    userId,
    status,
    experimentCode,
    experimentStatus,
  }));
}
