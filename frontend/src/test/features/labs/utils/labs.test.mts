import test from 'node:test';
import assert from 'node:assert/strict';

import { getLabById, LABS } from '@/features/labs/utils/labs';

test('LABS exposes list page metadata', () => {
  assert.deepEqual(LABS.map((lab) => lab.id), [
    'secure-mcp-server',
    'production-agent-with-human-approval',
  ]);
  assert.equal(LABS[0].estimatedSetupTime, '15min');
});

test('getLabById returns the matching lab or null', () => {
  assert.equal(getLabById('secure-mcp-server')?.title, 'Secure MCP Server');
  assert.equal(getLabById('missing'), null);
});
