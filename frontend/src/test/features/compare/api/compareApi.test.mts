import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getCompareArticleFromBackend,
  listCompareArticlesFromBackend,
} from '@/features/compare/api/compareApi';

const article = {
  id: 'mcp-vs-function-calling-vs-rest',
  title: 'MCP vs Function Calling vs REST',
  category: 'mcp',
  status: 'Verified',
  summary: 'one-liner',
  contenders: [{ name: 'MCP', vendor: 'x', latest_version: '1', one_liner: 'y' }],
  dimensions: [{ name: 'Reuse', values: { MCP: 'high' } }],
  use_when: [{ contender: 'MCP', scenario: 'shared tools' }],
  avoid_when: [{ contender: 'MCP', scenario: 'single app' }],
  decision_tree: [{ condition: 'shared', recommendation: 'MCP' }],
  cost_notes: ['deploy a server'],
  sources: [{ type: 'official', title: 'Spec', url: 'https://example.com' }],
  related_lab_ids: ['secure-mcp-server'],
  related_radar_item_ids: ['mcp-security-boundary-2026-07'],
  related_node_ids: ['MCP'],
  related_learning_paths: ['/learn/agent-engineer'],
  published_at: '2026-07-09T10:00:00Z',
  created_at: '2026-07-09T10:00:00Z',
  updated_at: '2026-07-09T10:00:00Z',
  last_verified_at: '2026-07-09T10:00:00Z',
};

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

test('listCompareArticlesFromBackend returns the articles list', async () => {
  const restore = installFetchMock({
    'http://backend.test/compare/articles': {
      body: { success: true, data: { articles: [article] } },
    },
  });

  try {
    const result = await listCompareArticlesFromBackend();
    assert.equal(result.articles.length, 1);
    assert.equal(result.articles[0].id, 'mcp-vs-function-calling-vs-rest');
    assert.equal(result.articles[0].related_lab_ids[0], 'secure-mcp-server');
  } finally {
    restore();
  }
});

test('getCompareArticleFromBackend returns a single article', async () => {
  const restore = installFetchMock({
    'http://backend.test/compare/articles/mcp-vs-function-calling-vs-rest': {
      body: { success: true, data: article },
    },
  });

  try {
    const result = await getCompareArticleFromBackend('mcp-vs-function-calling-vs-rest');
    assert.equal(result.title, 'MCP vs Function Calling vs REST');
    assert.equal(result.contenders.length, 1);
  } finally {
    restore();
  }
});
