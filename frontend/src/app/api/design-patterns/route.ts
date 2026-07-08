import { NextResponse } from 'next/server';
import { listDesignPatternRows } from '@/features/learn/server/learningService';

export async function GET() {
  return NextResponse.json(await listDesignPatternRows());
}
