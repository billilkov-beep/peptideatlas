import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../server/app.js';
import { createUser } from '../server/auth.js';
import { LoginRateLimiter } from '../server/login-rate-limit.js';

let app: FastifyInstance;
let cookie: string;
let csrf: string;
before(async () => {
  app = await buildApp({ dataDir: ':memory:', publicUrl: 'http://localhost:3000' });
  await createUser(app.atlasDb, { email: 'security-review@example.test', password: 'Testing-only-passphrase-42!', role: 'admin' });
  const login = await app.inject({ method: 'POST', url: '/api/auth/login', payload: { email: 'security-review@example.test', password: 'Testing-only-passphrase-42!' } });
  assert.equal(login.statusCode, 200);
  cookie = String(login.headers['set-cookie']).split(';')[0];
  csrf = login.json().csrfToken;
});
after(async () => { await app?.close(); });

const draft = () => ({
  slug: 'encoded-route-security-probe', name: 'Security test record', categories: ['skin'],
  summary: 'A nonclinical test record used to verify authorization.',
  description: 'This must never be writable without a valid staff session and CSRF token.',
});

test('encoded static routes cannot bypass authentication or expose drafts', async () => {
  for (const url of ['/api/%61dmin/peptides', '/%61pi/admin/peptides', '/api/a%64min/overview', '/api/%61uth/me']) {
    const result = await app.inject(url);
    assert.equal(result.statusCode, 401, `${url}: ${result.body}`);
  }
  const write = await app.inject({ method: 'POST', url: '/api/%61dmin/peptides', payload: draft() });
  assert.equal(write.statusCode, 401, write.body);
  const update = await app.inject({ method: 'PUT', url: '/api/%61dmin/peptides/00000000-0000-4000-8000-000000000001', payload: { ...draft(), expectedRevision: 1 } });
  assert.equal(update.statusCode, 401, update.body);
  const records = await app.atlasDb.query('SELECT id FROM atlas_peptides');
  assert.equal(records.rows.length, 0, 'the unauthorized request must not create a draft');
});

test('encoded admin routes retain CSRF/origin protection and private cache policy', async () => {
  const missingToken = await app.inject({ method: 'POST', url: '/%61pi/admin/peptides', headers: { cookie }, payload: draft() });
  assert.equal(missingToken.statusCode, 403, missingToken.body);
  const foreignOrigin = await app.inject({ method: 'POST', url: '/api/%61dmin/peptides', headers: { cookie, 'x-csrf-token': csrf, origin: 'https://untrusted.example' }, payload: draft() });
  assert.equal(foreignOrigin.statusCode, 403, foreignOrigin.body);
  const readable = await app.inject({ url: '/api/%61dmin/peptides', headers: { cookie } });
  assert.equal(readable.statusCode, 200, readable.body);
  assert.equal(readable.headers['cache-control'], 'no-store');
});

test('rotating email addresses cannot bypass the IP-wide login budget', async () => {
  for (let attempt = 0; attempt < 60; attempt++) {
    const result = await app.inject({ method: 'POST', url: '/api/auth/login', remoteAddress: '192.0.2.80', payload: { email: `unknown-${attempt}@example.test`, password: 'Intentionally-wrong-password' } });
    assert.equal(result.statusCode, 401, `attempt ${attempt}: ${result.body}`);
  }
  const blocked = await app.inject({ method: 'POST', url: '/api/auth/login', remoteAddress: '192.0.2.80', payload: { email: 'another-new-address@example.test', password: 'Intentionally-wrong-password' } });
  assert.equal(blocked.statusCode, 429);
  assert.ok(Number(blocked.headers['retry-after']) > 0);
  const unaffected = await app.inject({ method: 'POST', url: '/api/auth/login', remoteAddress: '192.0.2.81', payload: { email: 'security-review@example.test', password: 'Testing-only-passphrase-42!' } });
  assert.equal(unaffected.statusCode, 200, unaffected.body);
});

test('rate-limit state remains bounded and expired budgets recover without resetting active protection', () => {
  let clock = 1000;
  const limiter = new LoginRateLimiter({ now: () => clock, maxEntries: 6, ipLimit: 4, accountLimit: 2, windowMs: 60000 });
  for (let ip = 0; ip < 3; ip++) assert.equal(limiter.consume(`192.0.2.${ip}`, 'unknown@example.test').allowed, true);
  for (let ip = 3; ip < 100; ip++) assert.equal(limiter.consume(`192.0.2.${ip}`, `new-${ip}@example.test`).allowed, false);
  assert.equal(limiter.trackedBuckets, 6);
  assert.equal(limiter.consume('192.0.2.0', 'unknown@example.test').allowed, true);
  assert.equal(limiter.consume('192.0.2.0', 'unknown@example.test').allowed, false, 'existing account budget survives the capacity attack');
  clock += 60001;
  assert.equal(limiter.consume('192.0.2.200', 'new@example.test').allowed, true);
  assert.equal(limiter.trackedBuckets, 2);
  const successes = new LoginRateLimiter({ now: () => clock, ipLimit: 2 });
  assert.equal(successes.consume('192.0.2.210', 'known@example.test').allowed, true);
  successes.successfulLogin('192.0.2.210', 'known@example.test');
  assert.equal(successes.consume('192.0.2.210', 'known@example.test').allowed, true);
  successes.successfulLogin('192.0.2.210', 'known@example.test');
  assert.equal(successes.consume('192.0.2.210', 'different@example.test').allowed, false);
});
