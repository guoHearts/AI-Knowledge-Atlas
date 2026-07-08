import test from 'node:test';
import assert from 'node:assert/strict';

import {
  listUserProgressRows,
  upsertLessonProgress,
} from '@/features/progress/api/progressServerApi';

test('listUserProgressRows reads progress rows from backend learning API', async () => {
  process.env.BACKEND_INTERNAL_URL = 'http://backend.test';
  const calls: string[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    calls.push(String(input));
    return new Response(JSON.stringify([
      { id: 'progress-1', user_id: 'default', lesson_id: 'lesson-1', status: 'completed' },
    ]));
  };

  try {
    const rows = await listUserProgressRows('default');

    assert.equal(calls[0], 'http://backend.test/learning/progress?userId=default');
    assert.equal(rows[0].id, 'progress-1');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('upsertLessonProgress writes progress through backend learning API', async () => {
  process.env.BACKEND_INTERNAL_URL = 'http://backend.test';
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    calls.push({ url: String(input), init });
    return new Response(JSON.stringify({
      id: 'progress-1',
      user_id: 'default',
      lesson_id: 'lesson-1',
      status: 'completed',
    }));
  };

  try {
    const row = await upsertLessonProgress({
      lessonId: 'lesson-1',
      userId: 'default',
      status: 'completed',
      experimentCode: 'print("ok")',
    });

    assert.equal(calls[0].url, 'http://backend.test/learning/progress');
    assert.equal(calls[0].init?.method, 'PUT');
    assert.equal(calls[0].init?.body, JSON.stringify({
      lessonId: 'lesson-1',
      userId: 'default',
      status: 'completed',
      experimentCode: 'print("ok")',
    }));
    assert.equal(row.status, 'completed');
  } finally {
    globalThis.fetch = originalFetch;
  }
});
