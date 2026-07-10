import { NextResponse } from 'next/server';
import {
  listUserProgressRows,
  upsertLessonProgress,
} from '@/features/progress/api/progressServerApi';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default';
    return NextResponse.json(await listUserProgressRows(userId));
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'PROGRESS_FETCH_FAILED', message: error instanceof Error ? error.message : 'Unknown error' } },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
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
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'PROGRESS_UPSERT_FAILED', message: error instanceof Error ? error.message : 'Unknown error' } },
      { status: 500 },
    );
  }
}
