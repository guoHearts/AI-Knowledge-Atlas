import type Database from 'better-sqlite3';
import type { UserProgressRow } from '../../../types/learning';

type ProgressDatabase = Pick<Database.Database, 'prepare'>;

export type ProgressUpsertInput = {
  lessonId: string;
  userId?: string;
  status?: string;
  experimentStatus?: string;
  experimentCode?: string;
  now?: () => string;
  createId?: () => string;
};

export function listUserProgressRows(
  db: ProgressDatabase,
  userId = 'default',
): UserProgressRow[] {
  return db.prepare('SELECT * FROM user_progress WHERE user_id = ?')
    .all(userId) as UserProgressRow[];
}

export function upsertLessonProgress(
  db: ProgressDatabase,
  input: ProgressUpsertInput,
): UserProgressRow {
  const userId = input.userId || 'default';
  const now = (input.now || (() => new Date().toISOString()))();
  const createId = input.createId || (() => crypto.randomUUID());

  const existing = db.prepare(
    'SELECT * FROM user_progress WHERE user_id = ? AND lesson_id = ?',
  ).get(userId, input.lessonId) as UserProgressRow | undefined;

  if (existing) {
    const updates: string[] = [];
    const values: string[] = [];

    if (input.status) {
      updates.push('status = ?');
      values.push(input.status);
    }
    if (input.experimentCode) {
      updates.push('experiment_code = ?');
      values.push(input.experimentCode);
    }
    if (input.experimentStatus) {
      updates.push('experiment_status = ?');
      values.push(input.experimentStatus);
    }
    if (input.status === 'completed') {
      updates.push('completed_at = ?');
      values.push(now);
    }
    if (input.status === 'in_progress' && !existing.started_at) {
      updates.push('started_at = ?');
      values.push(now);
    }

    if (updates.length > 0) {
      db.prepare(
        `UPDATE user_progress SET ${updates.join(', ')} WHERE user_id = ? AND lesson_id = ?`,
      ).run(...values, userId, input.lessonId);
    }
  } else {
    db.prepare(`
      INSERT INTO user_progress (
        id,
        user_id,
        lesson_id,
        status,
        experiment_status,
        experiment_code,
        started_at,
        completed_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      createId(),
      userId,
      input.lessonId,
      input.status || 'in_progress',
      input.experimentStatus || null,
      input.experimentCode || null,
      input.status === 'in_progress' ? now : null,
      input.status === 'completed' ? now : null,
    );
  }

  return db.prepare(
    'SELECT * FROM user_progress WHERE user_id = ? AND lesson_id = ?',
  ).get(userId, input.lessonId) as UserProgressRow;
}
