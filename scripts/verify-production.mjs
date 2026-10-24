import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile, readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const entryAssets = html => [...html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)=["']([^"']+\.(?:js|css))["']/g)]
  .map(match => match[1]).sort();

export async function verifyProduction({
  origin = 'https://smartlog-next-2026.netlify.app',
  output = 'SmartLogWeb/dist/SmartLogWeb/browser',
  fetchImpl = fetch,
  log = console.log,
} = {}) {
  const get = async path => {
    const response = await fetchImpl(`${origin}${path}`, {
      headers: {'Cache-Control': 'no-cache'}, signal: AbortSignal.timeout(120000),
    });
    assert.equal(response.status, 200, `${path}: HTTP ${response.status}`);
    return response;
  };
  const expectedHtml = await readFile(resolve(output, 'index.html'), 'utf8');
  const actualHtml = await (await get('/index.html')).text();
  assert.match(actualHtml, /<app-root\b/, 'Angular application root missing');
  const expectedEntries = entryAssets(expectedHtml);
  assert.ok(expectedEntries.length > 0, 'Build contains no application assets');
  // Hosting may rewrite HTML. Verify the intended Angular entry points and every
  // compiled JS/CSS file, including lazy routes, against the exact build artifact.
  assert.deepEqual(entryAssets(actualHtml), expectedEntries, 'Published HTML points to a different application build');
  const files = await readdir(output, {withFileTypes: true});
  const bundles = files.filter(file => file.isFile() && /\.(js|css)$/.test(file.name)).map(file => file.name);
  assert.ok(bundles.length > 0, 'Compiled application files missing');
  for (const name of bundles) {
    const deployed = Buffer.from(await (await get('/' + encodeURIComponent(name))).arrayBuffer());
    const expected = await readFile(resolve(output, name));
    assert.equal(digest(deployed), digest(expected), `${name}: deployed artifact differs`);
  }
  log(`Verified Angular entry points and ${bundles.length} JS/CSS artifacts`);
  const apk = Buffer.from(await (await get('/downloads/smartlog-arm64.apk')).arrayBuffer());
  assert.equal(digest(apk), digest(await readFile(resolve(output, 'downloads/smartlog-arm64.apk'))), 'APK: deployed artifact differs');
  log('Verified APK');
  for (const path of ['/home', '/login']) {
    assert.match(await (await get(path)).text(), /<app-root\b/, `${path}: SPA redirect failed`);
    log(`Verified ${path}`);
  }
  const api = await get('/api/v1');
  assert.match(api.headers.get('content-type') ?? '', /application\/json/);
  assert.equal((await api.json()).plataforma, 'netlify-functions', 'Unexpected API deployment');
  log('Verified API metadata');
  const tracking = await fetchImpl(`${origin}/api/v1/rastreamento/invalid-link`, {signal: AbortSignal.timeout(30000)});
  assert.equal(tracking.status, 404, 'Tracking API must reject an invalid public link with 404');
  assert.match(tracking.headers.get('content-type') ?? '', /application\/json/, 'Tracking route is not served by the API');
  log('Verified public tracking API rejects invalid links');
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  await verifyProduction();
}
