import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SnapshotCache, normalizeSnapshot, validateBaseUrl } from '../examples/brand-site/lib/snapshot-cache.mjs';
import { profileArticle } from '../examples/brand-site/lib/profile-html.mjs';

const start = Date.parse('2026-01-01T12:00:00Z');
function sample() {
  return {
    schemaVersion: 1, version: 'revision-1', generatedAt: new Date(start).toISOString(), maxAgeSeconds: 3600,
    node: { id: 'node-a', name: 'Example', categories: ['skin'], theme: { accent: '#123456', background: 'red;display:none', font: 'serif' } },
    apiKey: 'upstream-secret-that-must-never-leak',
    items: [
      { id: 'a', slug: 'published-skin', name: 'Published skin', categories: ['skin'], publicationState: 'published', summary: 'Visible', references: [{ title: 'Source', url: 'https://example.org/source' }, { title: 'Unsafe', url: 'javascript:alert(1)' }], hiddenSecret: 'private' },
      { id: 'b', slug: 'draft-skin', name: 'Draft', categories: ['skin'], publicationState: 'draft' },
      { id: 'c', slug: 'published-brain', name: 'Other scope', categories: ['brain'], publicationState: 'published' }
    ]
  };
}
const response = (payload = sample(), status = 200) => new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } });

test('snapshot delivery excludes drafts, out-of-scope records, unknown secrets, and unsafe links', () => {
  const normalized = normalizeSnapshot(sample(), start);
  assert.equal(normalized.items.length, 1);
  assert.equal(normalized.items[0].id, 'a');
  assert.equal((normalized.items[0].references as unknown[]).length, 1);
  assert.equal(JSON.stringify(normalized).includes('secret'), false);
  assert.equal(JSON.stringify(normalized).includes('private'), false);
  assert.equal((normalized.node.theme as Record<string, unknown>).background, null);
  assert.throws(() => normalizeSnapshot({ ...sample(), schemaVersion: 2 }, start));
});

test('rich article fields survive delivery and citation numbering follows sanitized references',()=>{
  const input:any=sample();const item=input.items[0];
  item.references.push({title:'Second safe source',url:'https://example.org/second',kind:'primary_research',accessedAt:'2026-10-27'});
  Object.assign(item,{molecularClass:'Test class',keyTakeaway:'Test takeaway',reviewStatus:'source_checked',referenceNames:['Canonical name','Alternate name'],relatedSlugs:['another-profile'],atAGlance:[{label:'Identity',value:'A test compound'}],sections:[{id:'safety',title:'Safety & limitations',body:'<script>Text must be escaped</script>',citations:[1,2,3,99]}]});
  const output:any=normalizeSnapshot(input,start).items[0];
  assert.equal(output.keyTakeaway,item.keyTakeaway);assert.deepEqual(output.atAGlance,item.atAGlance);
  assert.deepEqual(output.referenceNames,item.referenceNames);assert.deepEqual(output.relatedSlugs,item.relatedSlugs);
  assert.deepEqual(output.sections[0].citations,[1,2]);assert.equal(output.sections[0].body,item.sections[0].body);
  assert.equal(output.references[1].kind,'primary_research');assert.equal(output.references[1].accessedAt,'2026-10-27');
});

test('public status preserves explicit FDA scope and never upgrades legacy or invalid statuses',()=>{
  const source:any=sample();
  Object.assign(source.items[0],{regulatoryStatus:'approved_medicine',displayStatus:'not_fda_approved',displayStatusNote:'Approved outside the U.S. <script>must be escaped</script>'});
  const foreign:any=normalizeSnapshot(source,start).items[0];
  assert.equal(foreign.displayStatus,'not_fda_approved');
  const html=profileArticle(foreign);
  assert.match(html,/Not FDA approved/);assert.match(html,/Approved outside the U.S./);assert.ok(!html.includes('<script>must be escaped</script>'));
  delete source.items[0].displayStatus;
  const legacy:any=normalizeSnapshot(source,start).items[0];
  assert.equal(legacy.displayStatus,'');assert.match(profileArticle(legacy),/Status needs review/);
  source.items[0].displayStatus='fda_approved malicious';
  const invalid:any=normalizeSnapshot(source,start).items[0];assert.equal(invalid.displayStatus,'');
});

test('published snapshot TTL is bounded and expired snapshots are rejected', () => {
  const result = normalizeSnapshot({ ...sample(), maxAgeSeconds: 99999999 }, start);
  assert.equal(result.expiresAt, start + 86400000);
  assert.throws(() => normalizeSnapshot(sample(), start + 3600001));
  assert.throws(() => normalizeSnapshot({ ...sample(), generatedAt: new Date(start + 600000).toISOString() }, start));
});

test('only HTTPS is allowed except explicitly enabled loopback development', () => {
  assert.equal(validateBaseUrl('https://knowledge.example.org/'), 'https://knowledge.example.org');
  assert.throws(() => validateBaseUrl('http://knowledge.example.org'));
  assert.throws(() => validateBaseUrl('https://user:secret@example.org'));
  assert.throws(() => validateBaseUrl('https://example.org/?token=a'));
  assert.throws(() => validateBaseUrl('http://localhost:3000'));
  assert.equal(validateBaseUrl('http://localhost:3000/', true), 'http://localhost:3000');
  assert.throws(() => validateBaseUrl('http://192.168.1.1:3000', true));
});

test('credentials remain server-side; auth rejection clears cache; network failures retain unexpired content', async () => {
  let clock = start; let mode = 'ok'; let callCount = 0;
  const mock: typeof fetch = async (_input, init) => {
    callCount++;
    assert.equal((init?.headers as Record<string, string>).Authorization, 'Bearer my-node-key');
    assert.equal(init?.redirect, 'error');
    if (mode === 'network') throw new Error('Network unavailable');
    if (mode === 'revoked') return response(sample(), 403);
    return response();
  };
  const cache = new SnapshotCache({ baseUrl: 'https://central.example', apiKey: 'my-node-key', fetchImpl: mock, now: () => clock });
  await cache.refresh();
  assert.equal((await cache.get()).items.length, 1);
  assert.equal(callCount, 1, 'Cached delivery should not request central on each visitor request');
  mode = 'network'; await assert.rejects(cache.refresh());
  assert.ok(cache.current());
  clock = start + 3600001; assert.equal(cache.current(), null);
  clock = start; mode = 'revoked'; await assert.rejects(cache.refresh());
  assert.equal(cache.current(), null);
});

test('durable cache survives restart without extending expiry and is bound to its node credentials', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'atlas-connector-'));
  try {
    const file = join(directory, 'snapshot.json');
    const cache = new SnapshotCache({ baseUrl: 'https://central.example', apiKey: 'my-node-key', cacheFile: file, fetchImpl: async () => response(), now: () => start });
    await cache.refresh();
    assert.equal((await readFile(file, 'utf8')).includes('my-node-key'), false);
    const restored = new SnapshotCache({ baseUrl: 'https://central.example', apiKey: 'my-node-key', cacheFile: file, now: () => start + 120000 });
    await restored.load();
    assert.equal(restored.current()?.expiresAt, start + 3600000);
    const changed = new SnapshotCache({ baseUrl: 'https://central.example', apiKey: 'another-node-key', cacheFile: file, now: () => start + 120000 });
    await changed.load(); assert.equal(changed.current(), null);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('synchronization atomically replaces withdrawn records and consolidates concurrent requests', async () => {
  let count = 0; let payload = sample();
  const cache = new SnapshotCache({ baseUrl: 'https://central.example', apiKey: 'my-node-key', now: () => start,
    fetchImpl: async () => { count++; await new Promise(resolve => setTimeout(resolve, 10)); return response(payload); }
  });
  await Promise.all([cache.refresh(), cache.refresh()]); assert.equal(count, 1);
  payload = { ...sample(), items: [] };
  await cache.refresh(); assert.equal(cache.current()?.items.length, 0);
});
