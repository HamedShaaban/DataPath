import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
const url = process.env.DATAPATH_SMOKE_DATABASE_URL;
if (!url || !new URL(url).pathname.endsWith('/datapath_smoke_test')) throw new Error('Supply the disposable DATAPATH_SMOKE_DATABASE_URL');
const output = '.vercel/output';
const config = JSON.parse(await readFile(`${output}/config.json`, 'utf8'));
assert.equal(config.version, 3);
for (const route of ['/api/trpc/auth.me', '/p/example'])
  assert.equal(config.routes.find(rule => rule.dest && rule.src && new RegExp(rule.src).test(route))?.dest, '/backend');
const sqlWorker = (await readdir(`${output}/static/assets`)).find(name => /^sql-worker-.*\.js$/.test(name));
assert.ok(sqlWorker);
for (const [route, marker] of [[`/assets/${sqlWorker}`, "'wasm-unsafe-eval'"], ['/python-worker.js', '/python-runtime/']]) {
  const policies = config.routes.filter(rule => rule.src && new RegExp(rule.src).test(route) && rule.headers?.['Content-Security-Policy']);
  assert.equal(policies.length, 1);
  assert.ok(policies[0].headers['Content-Security-Policy'].includes(marker));
  assert.ok(!policies[0].headers['Content-Security-Policy'].includes("connect-src 'self'"));
}
const temporary = await mkdtemp(path.join(tmpdir(), 'datapath-vercel-'));
try {
  await cp(`${output}/functions/backend.func`, temporary, { recursive: true, verbatimSymlinks: true });
  const result = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['--input-type=module', '-e', `
      import assert from 'node:assert/strict';
      import app from './dist/vercel.js';
      const server = app.listen(0, '127.0.0.1');
      await new Promise(resolve => server.once('listening', resolve));
      const base = 'http://127.0.0.1:' + server.address().port;
      let cookie = '';
      async function rpc(name, input, method = 'POST') {
        const response = await fetch(base + '/api/trpc/' + name + (method === 'GET' ? '?input=' + encodeURIComponent(JSON.stringify({json: input})) : ''), {
          method, headers: { 'content-type': 'application/json', origin: 'https://datapath.example', cookie },
          ...(method === 'POST' ? {body: JSON.stringify({json: input})} : {})
        });
        const value = await response.json();
        assert.equal(response.status, 200, name + ': ' + JSON.stringify(value));
        if (response.headers.get('set-cookie')) {
          assert.match(response.headers.get('set-cookie'), /HttpOnly/i);
          assert.match(response.headers.get('set-cookie'), /Secure/i);
          cookie = response.headers.get('set-cookie').split(';')[0];
        }
        return value.result.data.json;
      }
      try {
        assert.equal((await fetch(base + '/api/health')).status, 200);
        const crossOrigin = await fetch(base + '/api/trpc/auth.login', {method:'POST', headers:{origin:'https://evil.example','content-type':'application/json'},body:'{}'});
        assert.equal(crossOrigin.status,403);
        const stamp = Date.now();
        await rpc('auth.register', {name:'Deployment Test', email:'deploy-' + stamp + '@example.test', password:'Disposable-deployment-pass-123'});
        const grade = await rpc('grading.sql', {challengeId:'sql-select-filter', sector:'banking', query:"SELECT transaction_id, amount FROM transactions WHERE status = 'completed' AND amount >= 500 ORDER BY amount DESC"});
        assert.equal(grade.passed,true);
        const handle = 'deploy-' + stamp;
        await rpc('proof.enable', {handle});
        let publicPage = await fetch(base + '/p/' + handle);
        assert.equal(publicPage.status,200);
        assert.equal(publicPage.headers.get('cache-control'),'no-store');
        assert.ok((await publicPage.text()).includes('Verified SQL lab'));
        const settings = await rpc('proof.settings', undefined, 'GET');
        assert.equal(settings.credentials.length,1);
        await rpc('proof.setCredentialVisibility', {credentialId:settings.credentials[0].id,visible:false});
        assert.ok((await (await fetch(base + '/p/' + handle)).text()).includes('No public credentials yet'));
        await rpc('proof.disable');
        assert.equal((await fetch(base + '/p/' + handle)).status,404);
        console.log('PASS: isolated deployment package, HTTPS-cookie flags, origin rejection, PostgreSQL signup, SQL worker grading, proof privacy and static worker policies');
      } finally {
        await new Promise(resolve => server.close(resolve));
      }
    `], { cwd: temporary, stdio: 'inherit', env: { ...process.env, NODE_ENV:'production', VERCEL:'1', VERCEL_URL:'', VERCEL_REGION:'', APP_ORIGIN:'https://datapath.example', DATABASE_URL:url, BUILT_IN_FORGE_API_KEY:'', SENTRY_DSN:'', VITE_SENTRY_DSN:'', OAUTH_SERVER_URL:'', VITE_OAUTH_PORTAL_URL:'', VITE_APP_ID:'' } });
    const timer = setTimeout(() => { child.kill(); reject(new Error('Deployment package check timed out')); }, 60_000);
    child.once('error', reject);
    child.once('exit', code => { clearTimeout(timer); resolve(code); });
  });
  assert.equal(result, 0);
} finally {
  await rm(temporary, { recursive: true, force: true });
}
