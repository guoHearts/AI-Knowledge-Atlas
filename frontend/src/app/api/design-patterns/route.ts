import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { listDesignPatternRows } from '@/features/learn/server/learningService';

export async function GET() {
  return NextResponse.json(listDesignPatternRows(getDb()));
}
