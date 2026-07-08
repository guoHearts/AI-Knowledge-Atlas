import { NextResponse } from 'next/server';
import { getDesignPatternRow } from '@/features/learn/api/learningApi';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const pattern = await getDesignPatternRow(id);
    if (!pattern) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Design pattern not found' } }, { status: 404 });
    return NextResponse.json(pattern);
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'PATTERN_FETCH_FAILED', message: error instanceof Error ? error.message : 'Unknown error' } },
      { status: 500 },
    );
  }
}
