import { mkdir, readFile, writeFile, rename, rm } from 'node:fs/promises';
import { dirname } from 'node:path';
import { createHash } from 'node:crypto';

export const CATEGORY_LABELS = Object.freeze({
  brain: 'Brain & sleep', skin: 'Skin & aging', digestive: 'Digestive & metabolism',
  immune: 'Immune system', hormones: 'Hormones', musculoskeletal: 'Bones & muscles',
  cardiovascular: 'Heart & circulation', reproductive: 'Reproductive system'
});
const CATEGORY_IDS = Object.keys(CATEGORY_LABELS);
const MAX_AGE_SECONDS = 86400;

export class ConnectionError extends Error {
  constructor(message, status = 503) { super(message); this.status = status; }
}

export function validateBaseUrl(raw, allowLocal = false) {
  const url = new URL(raw);
  const isLoopback = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname.toLowerCase());
  if (url.username || url.password || url.search || url.hash ||
      (url.protocol !== 'https:' && !(allowLocal && isLoopback && url.protocol === 'http:'))) {
    throw new Error('ATLAS_URL must be HTTPS. Explicit ATLAS_ALLOW_LOCAL=true permits HTTP loopback development.');
  }
  return url.href.replace(/\/+$/, '');
}

export function normalizeSnapshot(source, now = Date.now()) {
  if (!source || source.schemaVersion !== 1 || !source.node || !Array.isArray(source.items) || source.items.length > 10000 || typeof source.version !== 'string') {
    throw new ConnectionError('The central application returned an unsupported snapshot.');
  }
  if (source.node.enabled === false) throw new ConnectionError('This website connection is disabled.', 403);
  const generatedAt = Date.parse(source.generatedAt);
  const requestedAge = Number(source.maxAgeSeconds ?? MAX_AGE_SECONDS);
  if (!Number.isFinite(requestedAge) || requestedAge <= 0) throw new ConnectionError('The snapshot expiry is invalid.');
  const age = Math.min(MAX_AGE_SECONDS, requestedAge) * 1000;
  if (!Number.isFinite(generatedAt) || generatedAt > now + 300000 || generatedAt + age <= now) {
    throw new ConnectionError('The central application returned expired content.');
  }
  const scope = Array.isArray(source.node.categories) ? source.node.categories.filter(id => CATEGORY_IDS.includes(id)) : [];
  const items = source.items.flatMap(record => {
    if (!record || typeof record.id !== 'string' || typeof record.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.slug) || typeof record.name !== 'string' || !Array.isArray(record.categories)) {
      throw new ConnectionError('The central application returned an invalid record.');
    }
    if (record.publicationState !== 'published') return [];
    const categories = record.categories.filter(id => CATEGORY_IDS.includes(id));
    if (scope.length && !categories.some(id => scope.includes(id))) return [];
    const item = { id: record.id, slug: record.slug, name: record.name, categories, publicationState: 'published' };
    for (const field of ['summary', 'description', 'mechanism', 'evidenceLevel', 'regulatoryStatus', 'jurisdiction', 'reviewer', 'reviewStatus', 'updatedAt', 'molecularClass', 'keyTakeaway', 'catalogRelease']) {
      item[field] = typeof record[field] === 'string' ? record[field] : '';
    }
    item.displayStatus = ['fda_approved','clinical_trial','not_fda_approved','cosmetic'].includes(record.displayStatus) ? record.displayStatus : '';
    item.displayStatusNote = typeof record.displayStatusNote==='string' ? record.displayStatusNote.slice(0,600) : '';
    item.aliases = Array.isArray(record.aliases) ? record.aliases.filter(value => typeof value === 'string') : [];
    item.reviewedAt = typeof record.reviewedAt === 'string' ? record.reviewedAt : null;
    item.revision = Number.isInteger(record.revision) ? record.revision : 0;
    const referenceMap = new Map();
    item.references = [];
    for (const [index, ref] of (Array.isArray(record.references) ? record.references : []).entries()) {
      try {
        const url = new URL(ref.url);
        if (typeof ref.title !== 'string' || !['http:', 'https:'].includes(url.protocol) || url.username || url.password) continue;
        item.references.push({title:ref.title,url:ref.url,...(typeof ref.kind==='string'?{kind:ref.kind}:{}),...(typeof ref.accessedAt==='string'?{accessedAt:ref.accessedAt}:{})});
        referenceMap.set(index+1,item.references.length);
      } catch { /* An unsafe source cannot enter the delivered reference list. */ }
    }
    item.atAGlance = (Array.isArray(record.atAGlance) ? record.atAGlance : []).filter(row => row && typeof row.label==='string' && typeof row.value==='string').slice(0,20).map(row=>({label:row.label,value:row.value}));
    item.sections = (Array.isArray(record.sections) ? record.sections : []).filter(section=>section && /^[a-z0-9][a-z0-9-]*$/.test(section.id) && typeof section.title==='string' && typeof section.body==='string').slice(0,30).map(section=>({id:section.id,title:section.title,body:section.body,citations:[...new Set((Array.isArray(section.citations)?section.citations:[]).filter(n=>referenceMap.has(n)).map(n=>referenceMap.get(n)))]}));
    item.referenceNames = (Array.isArray(record.referenceNames) ? record.referenceNames : []).filter(x=>typeof x==='string').slice(0,20);
    item.relatedSlugs = (Array.isArray(record.relatedSlugs) ? record.relatedSlugs : []).filter(x=>typeof x==='string'&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(x)).slice(0,12);
    return [item];
  });
  const theme = source.node.theme || {};
  const safeColour = value => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) ? value : null;
  return {
    schemaVersion: 1, version: source.version, generatedAt: new Date(generatedAt).toISOString(),
    fetchedAt: now, expiresAt: Math.min(now + age, generatedAt + age),
    viewerVersion: typeof source.viewerVersion === 'string' ? source.viewerVersion : '1.0.0',
    node: {
      id: String(source.node.id || ''), name: String(source.node.name || ''), categories: scope,
      theme: { accent: safeColour(theme.accent), background: safeColour(theme.background), font: ['inherit','system','serif'].includes(theme.font) ? theme.font : 'inherit' }
    },
    categories: CATEGORY_LABELS, items
  };
}

async function limitedJson(response) {
  const maximum = 8 * 1024 * 1024;
  if (Number(response.headers.get('content-length')) > maximum) throw new ConnectionError('Snapshot is too large.');
  if (!response.body) throw new ConnectionError('Snapshot response is empty.');
  const reader = response.body.getReader();
  const chunks = []; let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read(); if (done) break;
      total += value.byteLength;
      if (total > maximum) { await reader.cancel(); throw new ConnectionError('Snapshot is too large.'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

/** Server-only adapter. Never serialize the instance or its credential to a browser. */
export class SnapshotCache {
  #base; #key; #file; #fetch; #now; #fingerprint; #snapshot = null; #pending = null;
  constructor({ baseUrl, apiKey, cacheFile, allowLocal = false, fetchImpl = fetch, now = Date.now }) {
    this.#base = validateBaseUrl(baseUrl, allowLocal);
    if (typeof apiKey !== 'string' || !apiKey || /\s/.test(apiKey) || apiKey.length > 512) throw new Error('ATLAS_NODE_KEY must contain a valid server-side node key.');
    this.#key = apiKey; this.#file = cacheFile; this.#fetch = fetchImpl; this.#now = now;
    this.#fingerprint = createHash('sha256').update(this.#base + '\0' + apiKey).digest('hex');
  }
  async load() {
    if (!this.#file) return;
    try {
      const envelope = JSON.parse(await readFile(this.#file, 'utf8'));
      if (envelope.connectionFingerprint !== this.#fingerprint) return;
      const stored = envelope.snapshot;
      // A persisted snapshot never gains more time by restarting this connector.
      if (Number.isFinite(stored.expiresAt) && stored.expiresAt > this.#now()) {
        const restored = normalizeSnapshot({ ...stored, maxAgeSeconds: Math.min(MAX_AGE_SECONDS, (stored.expiresAt - Date.parse(stored.generatedAt)) / 1000) }, this.#now());
        restored.expiresAt = Math.min(stored.expiresAt, restored.expiresAt);
        this.#snapshot = restored;
      }
    } catch { /* A missing or invalid cache must not block a fresh authenticated request. */ }
  }
  current() { return this.#snapshot && this.#snapshot.expiresAt > this.#now() ? structuredClone(this.#snapshot) : null; }
  async clear() { this.#snapshot = null; if (this.#file) await rm(this.#file, { force: true }); }
  async refresh() {
    if (this.#pending) return this.#pending;
    this.#pending = this.#update().finally(() => { this.#pending = null; });
    return this.#pending;
  }
  async #update() {
    const response = await this.#fetch(this.#base + '/api/v1/node/snapshot', {
      headers: { Authorization: 'Bearer ' + this.#key, Accept: 'application/json', 'X-Atlas-Connector': 'javascript/1.1.0' },
      redirect: 'error', signal: AbortSignal.timeout(15000)
    });
    if (response.status === 401 || response.status === 403) { await this.clear(); throw new ConnectionError('Website connection access was rejected.', response.status); }
    if (!response.ok) throw new ConnectionError('Central application is temporarily unavailable.');
    let next;
    try { next = normalizeSnapshot(await limitedJson(response), this.#now()); }
    catch (error) { if (error.status === 403) await this.clear(); throw error; }
    if (this.#file) {
      await mkdir(dirname(this.#file), { recursive: true, mode: 0o700 });
      const temporary = this.#file + '.tmp';
      await writeFile(temporary, JSON.stringify({ connectionFingerprint: this.#fingerprint, snapshot: next }), { mode: 0o600 });
      await rename(temporary, this.#file);
    }
    this.#snapshot = next;
    return this.current();
  }
  async get() {
    const current = this.current(); if (current) return current;
    await this.refresh();
    const next = this.current();
    if (!next) throw new ConnectionError('No current published snapshot is available.');
    return next;
  }
}
