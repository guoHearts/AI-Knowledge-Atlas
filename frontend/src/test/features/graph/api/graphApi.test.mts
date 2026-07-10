import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getGraphSubgraph,
  listGraphNodes,
  searchGraphNodes,
} from '@/features/graph/api/graphApi';

test('listGraphNodes requests node type and limit and unwraps items', async () => {
  let requestedUrl = '';
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    requestedUrl = String(input);
    return new Response(
      JSON.stringify({
        success: true,
        data: { items: [{ id: 'rag', node_type: 'Technology' }] },
        message: 'ok',
        requestId: 'req_test',
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );
  }) as typeof fetch;

  const nodes = await listGraphNodes({ type: 'Technology', limit: 25 });

  assert.equal(requestedUrl, 'http://localhost:8000/graph/nodes?node_type=Technology&limit=25');
  assert.deepEqual(nodes, [{ id: 'rag', node_type: 'Technology' }]);
});

test('searchGraphNodes encodes query text', async () => {
  let requestedUrl = '';
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    requestedUrl = String(input);
    return new Response(
      JSON.stringify({
        success: true,
        data: { items: [] },
        message: 'ok',
        requestId: 'req_test',
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );
  }) as typeof fetch;

  await searchGraphNodes('agent graph');

  assert.equal(requestedUrl, 'http://localhost:8000/graph/nodes/search?q=agent+graph');
});

test('getGraphSubgraph appends every id and depth', async () => {
  let requestedUrl = '';
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    requestedUrl = String(input);
    return new Response(
      JSON.stringify({
        success: true,
        data: { nodes: [], edges: [] },
        message: 'ok',
        requestId: 'req_test',
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );
  }) as typeof fetch;

  const subgraph = await getGraphSubgraph(['rag', 'mcp'], 2);

  assert.equal(requestedUrl, 'http://localhost:8000/graph/subgraph?ids=rag&ids=mcp&depth=2');
  assert.deepEqual(subgraph, { nodes: [], edges: [] });
});
