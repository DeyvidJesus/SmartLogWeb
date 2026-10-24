import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {verifyProduction} from './verify-production.mjs';

async function fixture(run) {
  const output = await mkdtemp(join(tmpdir(), 'smartlog-deploy-test-'));
  const index = '<html>\n<app-root></app-root>\n<script src="main-123.js" type="module"></script><link href="styles-123.css" rel="stylesheet">\n</html>';
  const files = {'index.html': index, 'main-123.js': 'console.log("SmartLog")', 'lazy-456.js': 'export const route="tracking";',
    'styles-123.css': 'body{color:navy}', 'downloads/smartlog-arm64.apk': 'binary-apk-fixture'};
  await mkdir(join(output, 'downloads'));
  for (const [path, content] of Object.entries(files)) await writeFile(join(output, path), content);
  const remote = new Map(Object.entries(files).map(([path, content]) => ['/' + path, content]));
  remote.set('/index.html', index.replaceAll('\n', ''));
  const fetchImpl = async url => {
    const path = new URL(url).pathname;
    if (['/home', '/login'].includes(path)) return new Response(index);
    if (path === '/api/v1') return Response.json({plataforma: 'netlify-functions'});
    if (path === '/api/v1/rastreamento/invalid-link') return Response.json({message: 'Link inválido'}, {status: 404});
    return new Response(remote.get(path) || 'Not found', {status: remote.has(path) ? 200 : 404});
  };
  try { await run({remote, verify: () => verifyProduction({origin: 'https://test.invalid', output, fetchImpl, log: () => {}})}); }
  finally { await rm(output, {recursive: true, force: true}); }
}

test('hosting HTML changes do not fail a deployment whose compiled files and APK match', () => fixture(async ({verify}) => {
  await verify();
}));
test('different HTML entry points, corrupted lazy JavaScript and replaced APKs still fail verification', async () => {
  for (const [path, value] of [['/index.html', '<app-root></app-root><script src="another-build.js"></script>'],
    ['/lazy-456.js', 'corrupted'], ['/downloads/smartlog-arm64.apk', 'wrong-apk']]) {
    await fixture(async ({remote, verify}) => {remote.set(path, value); await assert.rejects(verify(), assert.AssertionError);});
  }
});
