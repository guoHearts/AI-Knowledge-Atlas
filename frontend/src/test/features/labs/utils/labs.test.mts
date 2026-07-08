import test from 'node:test';
import assert from 'node:assert/strict';

import { getLabById, listLabs } from '@/features/labs/api/labsApi';

const labs = [
  {
    id: 'secure-mcp-server',
    title: 'Secure MCP Server',
    status: 'Draft',
    difficulty: 'Intermediate',
    estimatedSetupTime: '15min',
    estimatedCost: '< $1',
    requiresApiKey: true,
    path: 'labs/secure-mcp-server',
    commands: ['python main.py'],
    summary: 'Secure MCP lab',
  },
  {
    id: 'production-agent-with-human-approval',
    title: 'Production Agent with Human Approval',
    status: 'Draft',
    difficulty: 'Intermediate',
    estimatedSetupTime: '20min',
    estimatedCost: '< $1',
    requiresApiKey: true,
    path: 'labs/production-agent-with-human-approval',
    commands: ['python src/main.py'],
    summary: 'Human approval lab',
  },
];

function installFetchMock(routes: Record<string, { status?: number; body: unknown }>) {
  process.env.BACKEND_INTERNAL_URL = 'http://backend.test';
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    const url = String(input);
    const route = routes[url];
    if (!route) {
      return new Response(`Missing mock for ${url}`, { status: 500 });
    }
    return new Response(JSON.stringify(route.body), { status: route.status || 200 });
  };

  return () => {
    globalThis.fetch = originalFetch;
  };
}

test('listLabs exposes list page metadata', async () => {
  const restore = installFetchMock({
    'http://backend.test/learning/labs': { body: labs },
  });

  try {
    const result = await listLabs();

    assert.deepEqual(result.map((lab) => lab.id), [
      'secure-mcp-server',
      'production-agent-with-human-approval',
    ]);
    assert.equal(result[0].estimatedSetupTime, '15min');
  } finally {
    restore();
  }
});

test('getLabById returns the matching lab or null', async () => {
  const restore = installFetchMock({
    'http://backend.test/learning/labs/secure-mcp-server': { body: labs[0] },
    'http://backend.test/learning/labs/missing': {
      status: 404,
      body: {
        success: false,
        error: { code: 'LEARNING_NOT_FOUND', message: 'lab not found' },
      },
    },
  });

  try {
    assert.equal((await getLabById('secure-mcp-server'))?.title, 'Secure MCP Server');
    assert.equal(await getLabById('missing'), null);
  } finally {
    restore();
  }
});
