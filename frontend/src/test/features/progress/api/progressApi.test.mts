import test from 'node:test';
import assert from 'node:assert/strict';

import {
  markLessonProgress,
  saveExperimentProgress,
  verifyExperimentProgress,
} from '@/features/progress/api/progressApi';

test('markLessonProgress updates lesson progress through the frontend API route', async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    calls.push({ url: String(input), init });
    return new Response(JSON.stringify({ id: 'progress-1', status: 'completed' }));
  };

  try {
    const row = await markLessonProgress('lesson-1', 'completed');

    assert.equal(calls[0].url, '/api/progress');
    assert.equal(calls[0].init?.method, 'PUT');
    assert.equal(calls[0].init?.body, JSON.stringify({
      lessonId: 'lesson-1',
      status: 'completed',
    }));
    assert.equal(row.status, 'completed');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('saveExperimentProgress sends code and in-progress status through the frontend API route', async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    calls.push({ url: String(input), init });
    return new Response(JSON.stringify({ id: 'progress-1', experiment_status: 'in_progress' }));
  };

  try {
    await saveExperimentProgress('lesson-1', 'print("ok")');

    assert.equal(calls[0].url, '/api/progress');
    assert.equal(calls[0].init?.method, 'PUT');
    assert.equal(calls[0].init?.body, JSON.stringify({
      lessonId: 'lesson-1',
      experimentCode: 'print("ok")',
      experimentStatus: 'in_progress',
    }));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('verifyExperimentProgress marks experiment status as verified', async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    calls.push({ url: String(input), init });
    return new Response(JSON.stringify({ id: 'progress-1', experiment_status: 'verified' }));
  };

  try {
    await verifyExperimentProgress('lesson-1');

    assert.equal(calls[0].init?.body, JSON.stringify({
      lessonId: 'lesson-1',
      experimentStatus: 'verified',
    }));
  } finally {
    globalThis.fetch = originalFetch;
  }
});
