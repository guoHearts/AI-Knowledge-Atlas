import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'default';
  const db = getDb();

  const progress = db.prepare(
    'SELECT * FROM user_progress WHERE user_id = ?'
  ).all(userId);

  return NextResponse.json(progress);
}

export async function PUT(request: Request) {
  const db = getDb();
  const body = await request.json();
  const { lessonId, status, experimentCode, experimentStatus } = body;
  const userId = body.userId || 'default';
  const now = new Date().toISOString();

  // Upsert progress
  const existing = db.prepare(
    'SELECT * FROM user_progress WHERE user_id = ? AND lesson_id = ?'
  ).get(userId, lessonId) as any;

  if (existing) {
    const updates: string[] = [];
    const values: any[] = [];

    if (status) { updates.push('status = ?'); values.push(status); }
    if (experimentCode) { updates.push('experiment_code = ?'); values.push(experimentCode); }
    if (experimentStatus) { updates.push('experiment_status = ?'); values.push(experimentStatus); }
    if (status === 'completed') {
      updates.push('completed_at = ?');
      values.push(now);
    }
    if (status === 'in_progress' && !existing.started_at) {
      updates.push('started_at = ?');
      values.push(now);
    }

    if (updates.length > 0) {
      values.push(userId, lessonId);
      db.prepare(
        `UPDATE user_progress SET ${updates.join(', ')} WHERE user_id = ? AND lesson_id = ?`
      ).run(...values);
    }
  } else {
    const id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });

    db.prepare(`
      INSERT INTO user_progress (id, user_id, lesson_id, status, experiment_status, experiment_code, started_at, completed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, userId, lessonId,
      status || 'in_progress',
      experimentStatus || null,
      experimentCode || null,
      status === 'in_progress' ? now : null,
      status === 'completed' ? now : null,
    );
  }

  const updated = db.prepare(
    'SELECT * FROM user_progress WHERE user_id = ? AND lesson_id = ?'
  ).get(userId, lessonId);

  return NextResponse.json(updated);
}
