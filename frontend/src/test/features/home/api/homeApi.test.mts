import test from 'node:test';
import assert from 'node:assert/strict';

import { getHomeContent, getHomeStats } from '@/features/home/api/homeApi';

test('getHomeStats reads home stats from backend learning API', async () => {
  process.env.BACKEND_INTERNAL_URL = 'http://backend.test';
  const calls: string[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    calls.push(String(input));
    return new Response(JSON.stringify({
      totalModules: 2,
      totalLessons: 4,
      completedLessons: 1,
      totalPatterns: 3,
      completionRate: 25,
    }));
  };

  try {
    const stats = await getHomeStats('default');

    assert.equal(calls[0], 'http://backend.test/learning/home/stats?userId=default');
    assert.equal(stats.completionRate, 25);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('getHomeContent reads roadmap content from backend learning API', async () => {
  process.env.BACKEND_INTERNAL_URL = 'http://backend.test';
  const calls: string[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    calls.push(String(input));
    return new Response(JSON.stringify({
      roadmap: [
        {
          layer: '01',
          title: 'Agent foundations',
          eyebrow: 'Concepts',
          description: 'Foundations',
          modules: 'Modules 1-5',
          accent: 'bg-stellar-blue',
        },
      ],
      nextSteps: ['Ship Radar'],
    }));
  };

  try {
    const content = await getHomeContent();

    assert.equal(calls[0], 'http://backend.test/learning/home/content');
    assert.equal(content.roadmap[0].layer, '01');
    assert.equal(content.nextSteps[0], 'Ship Radar');
  } finally {
    globalThis.fetch = originalFetch;
  }
});
