import test from 'node:test';
import assert from 'node:assert/strict';

import { getCmsDashboardData } from '@/features/cms/api/cmsApi';

test('getCmsDashboardData reads CMS dashboard data from backend learning API', async () => {
  process.env.BACKEND_INTERNAL_URL = 'http://backend.test';
  const calls: string[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    calls.push(String(input));
    return new Response(JSON.stringify({
      stats: {
        trackCount: 1,
        publishedLessonCount: 2,
        draftLessonCount: 1,
        designPatternCount: 3,
      },
      tracks: [
        {
          id: 'track-1',
          slug: 'agent-engineer',
          title: 'Agent Engineer',
          icon: 'AI',
          status: 'published',
          moduleCount: 2,
          lessonCount: 3,
        },
      ],
    }));
  };

  try {
    const data = await getCmsDashboardData();

    assert.equal(calls[0], 'http://backend.test/learning/cms/dashboard');
    assert.equal(data.stats.designPatternCount, 3);
    assert.equal(data.tracks[0].moduleCount, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
