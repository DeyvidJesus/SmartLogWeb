// Administrative diagnosis. Credentials and session tokens stay in memory only.
import {spawnSync} from 'node:child_process';
import {readFile, appendFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';

const siteId = '2e4e6ab4-bb98-4100-80db-4a074a4ecb66';
const origin = 'https://smartlog-next-2026.netlify.app';
const requireApi = createRequire(resolve('SmartLogAPI/netlify/package.json'));
const {initializeApp, cert, deleteApp} = requireApi('firebase-admin/app');
const {getAuth} = requireApi('firebase-admin/auth');
const {getFirestore} = requireApi('firebase-admin/firestore');
const lines = ['## SmartLog production integration diagnosis', ''];
let failures = 0;
function report(name, ok, detail = '') {
  const line = `- ${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ': ' + detail : ''}`;
  console.log(line); lines.push(line); if (!ok) failures++;
  console.log(`::${ok ? 'notice' : 'error'} title=SmartLog integration::${line}`);
}
function cli(args) {
  const result = spawnSync('npx', ['--yes', 'netlify-cli@27.14.2', ...args], {
    encoding: 'utf8', maxBuffer: 4 * 1024 * 1024, timeout: 120000,
  });
  if (result.status !== 0) throw new Error('NETLIFY_CONFIGURATION_UNAVAILABLE');
  try { return JSON.parse(result.stdout); } catch { throw new Error('NETLIFY_CONFIGURATION_FORMAT'); }
}
const request = (url, options = {}) => fetch(url, {...options, signal: AbortSignal.timeout(35000)});
async function inspect(url, options = {}) {
  const response = await request(url, options);
  const contentType = response.headers.get('content-type') || '';
  let body = null;
  if (contentType.includes('application/json')) { try { body = await response.json(); } catch {} }
  return {status: response.status, contentType, body};
}
let app;
try {
  if (!process.env.NETLIFY_AUTH_TOKEN) throw new Error('NETLIFY_TOKEN_MISSING');
  const env = cli(['env:list', '--site', siteId, '--context', 'production', '--scope', 'functions', '--json']);
  const site = cli(['api', 'getSite', '--data', JSON.stringify({site_id: siteId})]);
  if (site.id !== siteId || site.name !== 'smartlog-next-2026') throw new Error('UNEXPECTED_SITE');
  report('Netlify destination', true);
  report('Published commit', true, /^[a-f0-9]{7,40}$/.test(site.published_deploy?.commit_ref || '') ? site.published_deploy.commit_ref : 'manual deploy');
  report('Git-connected build', true, String(!!site.build_settings?.repo_url));
  report('Firebase service identity configured', !!env.FIREBASE_SERVICE_ACCOUNT_JSON);
  report('Gemini key configured in functions scope', !!env.GEMINI_API_KEY);
  const model = env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
  if (!/^[a-zA-Z0-9._-]+$/.test(model)) throw new Error('INVALID_MODEL_CONFIGURATION');
  report('Configured Gemini model', true, model);
  const output = resolve('SmartLogWeb/dist/SmartLogWeb/browser');
  const hash = bytes => createHash('sha256').update(bytes).digest('hex');
  const expectedHtml = await readFile(resolve(output, 'index.html'), 'utf8');
  const actualHtml = await (await request(origin + '/index.html', {headers: {'Cache-Control': 'no-cache'}})).text();
  const assets = html => [...html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)=["']([^"']+\.(?:js|css))["']/g)].map(match => match[1]).sort();
  report('Published HTML bytes', true, hash(actualHtml) === hash(expectedHtml) ? 'identical to artifact' : 'different from artifact');
  report('Published application asset names', JSON.stringify(assets(actualHtml)) === JSON.stringify(assets(expectedHtml)) && assets(expectedHtml).length > 0);
  const expectedApk = await readFile(resolve(output, 'downloads/smartlog-arm64.apk'));
  const actualApk = await request(origin + '/downloads/smartlog-arm64.apk');
  report('Published APK matches production artifact', actualApk.status === 200 && hash(Buffer.from(await actualApk.arrayBuffer())) === hash(expectedApk), `HTTP ${actualApk.status}`);
  const metadata = await inspect(origin + '/api/v1');
  report('Public API routing', metadata.status === 200 && metadata.body?.plataforma === 'netlify-functions', `HTTP ${metadata.status}, ${metadata.contentType}`);
  const unauthorized = await inspect(origin + '/api/v1/me');
  report('API rejects anonymous session', unauthorized.status === 401, `HTTP ${unauthorized.status}`);
  const tracking = await inspect(origin + '/api/v1/rastreamento/invalid-link');
  report('Public tracking routing', tracking.status === 404 && !!tracking.body, `HTTP ${tracking.status}`);

  if (env.GEMINI_API_KEY) {
    const probe = await inspect('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
      method: 'POST', headers: {'Content-Type': 'application/json', Authorization: 'Bearer ' + env.GEMINI_API_KEY},
      body: JSON.stringify({model, max_tokens: 2048, reasoning_effort: 'minimal',
        messages: [{role: 'user', content: 'Responda apenas OK.'}]}),
    });
    const error = probe.body?.error;
    const tags = ['model', 'reasoning', 'quota', 'billing', 'expired', 'leaked', 'blocked', 'not found', 'not supported', 'invalid argument']
      .filter(tag => String(error?.message || '').toLowerCase().includes(tag));
    report('Gemini provider actual request', probe.status === 200 && !!probe.body?.choices?.[0]?.message?.content,
      `HTTP ${probe.status}${error ? ', ' + String(error.status || error.code || 'PROVIDER_ERROR').replace(/[^A-Z0-9_]/g, '') + ', tags=' + tags.join('/') : ''}`);
    if (probe.status !== 200) {
      const catalog = await inspect('https://generativelanguage.googleapis.com/v1beta/models', {
        headers: {'x-goog-api-key': env.GEMINI_API_KEY},
      });
      const names = (catalog.body?.models || []).filter(row => /gemini.*flash/.test(row.name) && row.supportedGenerationMethods?.includes('generateContent'))
        .map(row => row.name).filter(name => /^models\/[a-zA-Z0-9._-]+$/.test(name)).slice(0, 20);
      lines.push(`Gemini model catalog: HTTP ${catalog.status}; available Flash models: ${names.join(', ') || 'unavailable'}`);
    }
  }
  if (env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    let account;
    try { account = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON); } catch { throw new Error('INVALID_FIREBASE_IDENTITY'); }
    if (account.type !== 'service_account' || account.project_id !== 'smartlog-b9b37') throw new Error('UNEXPECTED_FIREBASE_PROJECT');
    app = initializeApp({credential: cert(account)}, 'smartlog-integration-diagnosis');
    const auth = getAuth(app), db = getFirestore(app);
    const source = await readFile(resolve('SmartLogWeb/src/environments/environment.ts'), 'utf8');
    const apiKey = source.match(/firebaseApiKey:\s*'([^']+)'/)?.[1];
    if (!apiKey) throw new Error('FIREBASE_CLIENT_CONFIGURATION_MISSING');
    for (const [alias, role] of [['admin', 'ADMIN'], ['motorista1', 'MOTORISTA'], ['cliente1', 'CLIENTE']]) {
      const user = await auth.getUserByEmail(`${alias}.next2026@example.test`);
      const profile = await db.collection('usuarios').doc(user.uid).get();
      if (profile.get('empresaId') !== 'smartlog-next-demo-2026' || profile.get('ativo') === false || user.disabled)
        throw new Error('DEMO_PROFILE_NOT_CONFIRMED');
      const token = await auth.createCustomToken(user.uid);
      const login = await inspect('https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=' + apiKey, {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({token, returnSecureToken: true}),
      });
      report(`${role} Firebase login`, login.status === 200 && !!login.body?.idToken, `HTTP ${login.status}`);
      if (!login.body?.idToken) continue;
      const headers = {Authorization: 'Bearer ' + login.body.idToken, 'Content-Type': 'application/json', Origin: origin};
      const session = await inspect(origin + '/api/v1/me', {headers});
      report(`${role} API identity`, session.status === 200 && session.body?.role === role && session.body?.empresaId === 'smartlog-next-demo-2026', `HTTP ${session.status}`);
      const deliveries = await inspect(origin + '/api/v1/entregas', {headers});
      report(`${role} persisted deliveries`, deliveries.status === 200 && Array.isArray(deliveries.body?.data), `HTTP ${deliveries.status}, count=${deliveries.body?.data?.length ?? 'unavailable'}`);
      const chat = await inspect(origin + '/api/v1/chat', {method: 'POST', headers,
        body: JSON.stringify({pergunta: 'Quais entregas do meu escopo precisam de atenção e por quê?', historico: []})});
      report(`${role} API to Gemini`, chat.status === 200 && chat.body?.provedor === 'gemini' && !chat.body?.degradado,
        `HTTP ${chat.status}, provider=${['gemini', 'operacao'].includes(chat.body?.provedor) ? chat.body.provedor : 'unavailable'}, degraded=${!!chat.body?.degradado}`);
    }
  }
} catch (error) {
  // Never print raw provider/SDK errors: these may contain credentials or tokens.
  const code = /^[A-Z_]+$/.test(error.message || '') ? error.message : 'DIAGNOSIS_INTERRUPTED';
  report('Diagnostic execution', false, code);
} finally {
  if (app) await deleteApp(app);
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, lines.join('\n') + '\n');
  process.exitCode = failures ? 1 : 0;
}
