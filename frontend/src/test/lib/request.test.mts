import test from 'node:test';
import assert from 'node:assert/strict';

import { ApiError, request } from '@/lib/request';

test('request unwraps unified success responses', async () => {
  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({
        success: true,
        data: { items: [{ id: 'radar-1' }] },
        message: 'ok',
        requestId: 'req_test',
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    )) as typeof fetch;

  const data = await request<{ items: Array<{ id: string }> }>('/api/radar/items');

  assert.deepEqual(data, { items: [{ id: 'radar-1' }] });
});

test('request keeps legacy direct responses during migration', async () => {
  globalThis.fetch = (async () =>
    new Response(JSON.stringify([{ id: 'legacy-radar' }]), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })) as typeof fetch;

  const data = await request<Array<{ id: string }>>('/api/radar/items');

  assert.deepEqual(data, [{ id: 'legacy-radar' }]);
});

test('request throws ApiError for unified error responses', async () => {
  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'RADAR_ITEM_NOT_FOUND',
          message: 'Radar item not found',
          details: { itemId: 'missing' },
        },
        requestId: 'req_test',
      }),
      { status: 404, headers: { 'content-type': 'application/json' } },
    )) as typeof fetch;

  await assert.rejects(
    () => request('/api/radar/items/missing'),
    (error) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.code, 'RADAR_ITEM_NOT_FOUND');
      assert.equal(error.message, 'Radar item not found');
      assert.equal(error.status, 404);
      assert.equal(error.requestId, 'req_test');
      assert.deepEqual(error.details, { itemId: 'missing' });
      return true;
    },
  );
});
