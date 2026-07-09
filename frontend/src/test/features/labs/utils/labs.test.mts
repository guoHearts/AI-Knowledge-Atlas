import test from 'node:test';
import assert from 'node:assert/strict';

import { getLabById, listLabs } from '@/features/labs/api/labsApi';
import { hasVerifiedLabEvidence } from '@/features/labs/utils/labs';

const labs = [
  {
    id: 'secure-mcp-server',
    title: 'Secure MCP Server',
    status: 'Verified',
    difficulty: 'Intermediate',
    estimatedSetupTime: '15min',
    estimatedCost: '< $1',
    requiresApiKey: true,
    path: 'labs/secure-mcp-server',
    commands: ['python main.py'],
    summary: 'Secure MCP lab',
    lastVerifiedAt: '2026-07-09',
    packages: [{ name: 'fastapi', version: '0.104.1' }],
    expectedOutputs: ['pytest reports all Secure MCP Server tests passing.'],
    sources: [
      {
        type: 'official',
        title: 'Model Context Protocol specification',
        url: 'https://modelcontextprotocol.io/specification',
      },
    ],
    failureModes: [{ title: 'Missing API key', resolution: 'Set API_KEY in .env.' }],
    securityNotes: ['The tool allowlist blocks unknown tool names before parameter handling.'],
    knownLimitations: ['Rate limiting is documented but not implemented in the runnable sample.'],
    relatedRadarItemIds: ['mcp-security-boundary-2026-07'],
    relatedNodeIds: ['MCP'],
    relatedLearningPaths: [
      {
        title: 'MCP protocol principles',
        href: '/learn/agent-engineer/module-03-mcp/01-mcp-protocol-principles',
      },
    ],
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
    assert.equal(result[0].status, 'Verified');
    assert.equal(result[0].estimatedSetupTime, '15min');
    assert.equal(result[0].lastVerifiedAt, '2026-07-09');
    assert.equal(result[0].sources?.[0].type, 'official');
    assert.equal(result[0].expectedOutputs?.[0].includes('pytest'), true);
    assert.equal(result[0].relatedRadarItemIds?.[0], 'mcp-security-boundary-2026-07');
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

test('hasVerifiedLabEvidence requires trust evidence for verified labs', () => {
  assert.equal(hasVerifiedLabEvidence(labs[0]), true);
  assert.equal(hasVerifiedLabEvidence({ ...labs[0], sources: [] }), false);
  assert.equal(hasVerifiedLabEvidence(labs[1]), false);
});
