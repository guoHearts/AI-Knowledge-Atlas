import test from 'node:test';
import assert from 'node:assert/strict';
import Database from 'better-sqlite3';

import {
  listUserProgressRows,
  upsertLessonProgress,
} from './progressService.ts';

function createProgressDb() {
  const db = new Database(':memory:');
  db.exec(`
    CREATE TABLE user_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'default',
      lesson_id TEXT NOT NULL,
      status TEXT DEFAULT 'not_started',
      experiment_status TEXT,
      experiment_code TEXT,
      notes TEXT,
      started_at TEXT,
      completed_at TEXT,
      time_spent_seconds INTEGER DEFAULT 0,
      UNIQUE(user_id, lesson_id)
    );
  `);
  return db;
}

test('listUserProgressRows returns progress for one user', () => {
  const db = createProgressDb();
  db.prepare(`
    INSERT INTO user_progress (id, user_id, lesson_id, status)
    VALUES (?, ?, ?, ?), (?, ?, ?, ?)
  `).run(
    'p1', 'default', 'lesson-1', 'completed',
    'p2', 'other', 'lesson-1', 'in_progress',
  );

  const rows = listUserProgressRows(db, 'default');

  assert.deepEqual(rows.map((row) => row.id), ['p1']);
  db.close();
});

test('upsertLessonProgress inserts new progress with started and completed timestamps', () => {
  const db = createProgressDb();

  const inserted = upsertLessonProgress(db, {
    lessonId: 'lesson-1',
    status: 'completed',
    experimentCode: 'print("ok")',
    userId: 'default',
    now: () => '2026-07-08T00:00:00.000Z',
    createId: () => 'progress-1',
  });

  assert.equal(inserted.id, 'progress-1');
  assert.equal(inserted.status, 'completed');
  assert.equal(inserted.completed_at, '2026-07-08T00:00:00.000Z');
  assert.equal(inserted.started_at, null);
  db.close();
});

test('upsertLessonProgress updates only provided fields and sets started_at once', () => {
  const db = createProgressDb();
  db.prepare(`
    INSERT INTO user_progress (id, user_id, lesson_id, status, started_at, completed_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('progress-1', 'default', 'lesson-1', 'not_started', null, null);

  const updated = upsertLessonProgress(db, {
    lessonId: 'lesson-1',
    status: 'in_progress',
    experimentStatus: 'verified',
    userId: 'default',
    now: () => '2026-07-08T00:00:00.000Z',
    createId: () => 'unused',
  });

  assert.equal(updated.id, 'progress-1');
  assert.equal(updated.status, 'in_progress');
  assert.equal(updated.experiment_status, 'verified');
  assert.equal(updated.started_at, '2026-07-08T00:00:00.000Z');
  assert.equal(updated.completed_at, null);
  db.close();
});
