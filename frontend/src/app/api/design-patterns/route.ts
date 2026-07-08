import { NextResponse } from 'next/server';
import { listDesignPatternRows } from '@/features/learn/api/learningApi';

export async function GET() {
  try {
    return NextResponse.json(await listDesignPatternRows());
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'PATTERNS_FETCH_FAILED', message: error instanceof Error ? error.message : 'Unknown error' } },
      { status: 500 },
    );
  }
}
