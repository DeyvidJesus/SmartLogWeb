import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const origin = 'https://smartlog-next-2026.netlify.app';
const output = 'SmartLogWeb/dist/SmartLogWeb/browser';

// Compare deployed assets to the artifact produced by this workflow.
for (const path of ['/index.html', '/downloads/smartlog-arm64.apk']) {
  const response = await fetch(`${origin}${path}`, {
    headers: { 'Cache-Control': 'no-cache' },
    signal: AbortSignal.timeout(120_000),
  });
  assert.equal(response.status, 200, `${path}: HTTP ${response.status}`);
  const deployed = Buffer.from(await response.arrayBuffer());
  const expected = await readFile(`${output}${path}`);
  const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
  assert.equal(digest(deployed), digest(expected), `${path}: deployed artifact differs`);
  console.log(`Verified ${path}`);
}

for (const path of ['/home', '/login']) {
  const response = await fetch(`${origin}${path}`, {
    signal: AbortSignal.timeout(30_000),
  });
  assert.equal(response.status, 200, `${path}: SPA redirect failed`);
  assert.match(await response.text(), /<app-root/);
  console.log(`Verified ${path}`);
}

const api = await fetch(`${origin}/api/v1`, {
  signal: AbortSignal.timeout(30_000),
});
assert.equal(api.status, 200, 'Public API metadata unavailable');
assert.match(api.headers.get('content-type') ?? '', /application\/json/);
await api.json();
console.log('Verified API metadata');
