import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getLessonPageData,
  getLessonRow,
  getTrackPageData,
  getTrackRowWithModuleRows,
  listPublishedTrackRows,
} from '@/features/learn/api/learningApi';

const trackRow = {
  id: 'track-1',
  slug: 'agent-engineer',
  title: 'Agent Engineer',
  subtitle: 'Build agents',
  description: 'Learning track',
  difficulty: 'beginner',
  estimated_hours: 12,
  prerequisites: '',
  outcome_skills: '["Ship agents"]',
  outcome_project: 'Production agent',
  icon: 'AI',
  sort_order: 1,
  status: 'published',
  created_at: 'now',
  updated_at: 'now',
};

const moduleOne = {
  id: 'module-1',
  track_id: 'track-1',
  title: 'MCP',
  description: 'Protocol',
  stage: 1,
  sort_order: 1,
  estimated_hours: 2,
  difficulty: 'beginner',
  status: 'published',
  created_at: 'now',
  updated_at: 'now',
};

const moduleTwo = {
  ...moduleOne,
  id: 'module-2',
  title: 'Production',
  sort_order: 2,
};

const lessonOne = {
  id: 'lesson-1',
  module_id: 'module-1',
  title: 'Protocol',
  slug: 'protocol',
  content_path: 'module/protocol.mdx',
  sort_order: 1,
  difficulty: 'beginner',
  estimated_minutes: 45,
  analogy: '',
  one_liner: '',
  experiment_config: null,
  design_pattern_id: null,
  graph_node_ids: '[]',
  tags: '[]',
  status: 'published',
  created_at: 'now',
  updated_at: 'now',
};

const lessonTwo = {
  ...lessonOne,
  id: 'lesson-2',
  title: 'Client',
  slug: 'client',
  sort_order: 2,
};

const lessonThree = {
  ...lessonOne,
  id: 'lesson-3',
  module_id: 'module-2',
  title: 'Deploy',
  slug: 'deploy',
};

const progressRow = {
  id: 'progress-1',
  user_id: 'default',
  lesson_id: 'lesson-1',
  status: 'completed',
  experiment_status: null,
  experiment_code: null,
  notes: null,
  started_at: null,
  completed_at: 'now',
  time_spent_seconds: 0,
};

function installFetchMock(routes: Record<string, { status?: number; body: unknown }>) {
  process.env.BACKEND_INTERNAL_URL = 'http://backend.test';
  const calls: string[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    const url = String(input);
    calls.push(url);
    const route = routes[url];
    if (!route) {
      return new Response(`Missing mock for ${url}`, { status: 500 });
    }
    return new Response(JSON.stringify(route.body), { status: route.status || 200 });
  };

  return {
    calls,
    restore: () => {
      globalThis.fetch = originalFetch;
    },
  };
}

test('listPublishedTrackRows and detail helpers proxy backend learning endpoints', async () => {
  const mock = installFetchMock({
    'http://backend.test/learning/tracks': { body: [trackRow] },
    'http://backend.test/learning/tracks/agent-engineer': {
      body: { ...trackRow, modules: [moduleOne] },
    },
    'http://backend.test/learning/lessons/lesson-1': { body: lessonOne },
  });

  try {
    const tracks = await listPublishedTrackRows();
    const track = await getTrackRowWithModuleRows('agent-engineer');
    const lesson = await getLessonRow('lesson-1');

    assert.deepEqual(mock.calls, [
      'http://backend.test/learning/tracks',
      'http://backend.test/learning/tracks/agent-engineer',
      'http://backend.test/learning/lessons/lesson-1',
    ]);
    assert.equal(tracks[0].slug, 'agent-engineer');
    assert.equal(track?.modules[0].id, 'module-1');
    assert.equal(lesson?.slug, 'protocol');
  } finally {
    mock.restore();
  }
});

test('getTrackPageData composes backend track, module, lesson, and progress data', async () => {
  const mock = installFetchMock({
    'http://backend.test/learning/tracks/agent-engineer': {
      body: { ...trackRow, modules: [moduleOne, moduleTwo] },
    },
    'http://backend.test/learning/progress?userId=default': { body: [progressRow] },
    'http://backend.test/learning/modules/module-1': {
      body: { ...moduleOne, lessons: [lessonOne, lessonTwo] },
    },
    'http://backend.test/learning/modules/module-2': {
      body: { ...moduleTwo, lessons: [lessonThree] },
    },
  });

  try {
    const data = await getTrackPageData('agent-engineer');

    assert.equal(data?.track.slug, 'agent-engineer');
    assert.deepEqual(data?.modules.map((item) => item.id), ['module-1', 'module-2']);
    assert.deepEqual(data?.allLessons.map((item) => item.lesson.id), ['lesson-1', 'lesson-2', 'lesson-3']);
    assert.equal(data?.completedCount, 1);
    assert.equal(data?.overallPercent, 33);
    assert.deepEqual(mock.calls, [
      'http://backend.test/learning/tracks/agent-engineer',
      'http://backend.test/learning/progress?userId=default',
      'http://backend.test/learning/modules/module-1',
      'http://backend.test/learning/modules/module-2',
    ]);
  } finally {
    mock.restore();
  }
});

test('getLessonPageData maps lesson dependencies and next-module navigation', async () => {
  const mock = installFetchMock({
    'http://backend.test/learning/tracks/agent-engineer': {
      body: { ...trackRow, modules: [moduleOne, moduleTwo] },
    },
    'http://backend.test/learning/modules/module-1': {
      body: { ...moduleOne, lessons: [lessonOne, lessonTwo] },
    },
    'http://backend.test/learning/progress?userId=default': { body: [progressRow] },
    'http://backend.test/learning/modules/module-2': {
      body: { ...moduleTwo, lessons: [lessonThree] },
    },
  });

  try {
    const data = await getLessonPageData({
      trackSlug: 'agent-engineer',
      moduleId: 'module-1',
      lessonSlug: 'client',
    });

    assert.equal(data?.track.slug, 'agent-engineer');
    assert.equal(data?.module.id, 'module-1');
    assert.equal(data?.lesson.id, 'lesson-2');
    assert.deepEqual(data?.navigation.prev, {
      title: 'Protocol',
      href: '/learn/agent-engineer/module-1/protocol',
    });
    assert.deepEqual(data?.navigation.next, {
      title: 'Deploy',
      href: '/learn/agent-engineer/module-2/deploy',
    });
    assert.deepEqual(mock.calls, [
      'http://backend.test/learning/tracks/agent-engineer',
      'http://backend.test/learning/modules/module-1',
      'http://backend.test/learning/progress?userId=default',
      'http://backend.test/learning/modules/module-2',
    ]);
  } finally {
    mock.restore();
  }
});

test('detail helpers return null for backend not found responses', async () => {
  const mock = installFetchMock({
    'http://backend.test/learning/lessons/missing': {
      status: 404,
      body: {
        success: false,
        error: { code: 'LEARNING_NOT_FOUND', message: 'lesson not found' },
      },
    },
  });

  try {
    assert.equal(await getLessonRow('missing'), null);
  } finally {
    mock.restore();
  }
});
