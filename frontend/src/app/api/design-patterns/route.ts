import { NextResponse } from 'next/server';
import { listDesignPatternRows } from '@/features/learn/api/learningApi';

export async function GET() {
  return NextResponse.json(await listDesignPatternRows());
}
