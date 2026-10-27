import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { SnapshotCache } from './lib/snapshot-cache.mjs';
import {profileArticle} from './lib/profile-html.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const project = resolve(here, '../..');
const port = Number(process.env.BRAND_PORT || 3100);
const host = process.env.BRAND_HOST || '127.0.0.1';
if (!process.env.ATLAS_URL || !process.env.ATLAS_NODE_KEY) {
  console.error('Set ATLAS_URL and ATLAS_NODE_KEY in the server environment. Never place the node key in public HTML or JavaScript.');
  process.exit(1);
}
const cache = new SnapshotCache({
  baseUrl: process.env.ATLAS_URL, apiKey: process.env.ATLAS_NODE_KEY,
  allowLocal: process.env.ATLAS_ALLOW_LOCAL === 'true',
  cacheFile: process.env.ATLAS_CACHE_FILE || resolve(project, 'data/brand-site/snapshot.json')
});
await cache.load();
try { await cache.refresh(); } catch { console.warn('Central connection is not currently available. A valid persisted snapshot will be used if one exists.'); }
const refresh = setInterval(() => cache.refresh().catch(() => {}), 5 * 60 * 1000); refresh.unref();
const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const assets = new Map([
  ['/assets/viewer.js', [resolve(project, 'dist/viewer.js'), 'text/javascript; charset=utf-8']],
  ['/assets/profile.js', [resolve(project, 'wordpress/peptide-atlas-connector/assets/profile.js'), 'text/javascript; charset=utf-8']],
  ['/assets/explorer.js', [resolve(project, 'wordpress/peptide-atlas-connector/assets/explorer.js'), 'text/javascript; charset=utf-8']],
  ['/assets/explorer.css', [resolve(project, 'wordpress/peptide-atlas-connector/assets/explorer.css'), 'text/css; charset=utf-8']],
  ['/assets/brand.css', [resolve(here, 'public/brand.css'), 'text/css; charset=utf-8']]
]);
const headers = {
  'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; frame-ancestors 'self'; base-uri 'none'"
};
function send(res, code, type, body, cacheControl = 'no-store') {
  res.writeHead(code, { ...headers, 'Content-Type': type, 'Cache-Control': cacheControl }); res.end(body);
}
function page(title, content) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)} — Forma Research</title><link rel="stylesheet" href="/assets/explorer.css"><link rel="stylesheet" href="/assets/brand.css"><script src="/assets/profile.js" defer></script></head><body><header class="brand-nav"><a class="brand-logo" href="/"><span class="brand-symbol">f.</span> FORMA <small>RESEARCH</small></a><a class="brand-nav-link" href="/">Explore the library ↗</a></header>${content}<footer class="brand-footer"><span>FORMA RESEARCH</span><span>Peptide Atlas connected</span></footer></body></html>`;
}
const server = http.createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.setHeader('Allow', 'GET, HEAD'); return send(res, 405, 'application/json', JSON.stringify({ error: 'method_not_allowed' })); }
  let pathname; try { pathname = new URL(req.url, 'http://localhost').pathname; } catch { return send(res, 400, 'text/plain', 'Invalid request'); }
  try {
    if (assets.has(pathname)) {
      const [file, type] = assets.get(pathname); return send(res, 200, type, await readFile(file), 'public, max-age=300');
    }
    if (pathname === '/') return send(res, 200, 'text/html; charset=utf-8', await readFile(resolve(here, 'public/index.html')));
    if (pathname === '/health') return send(res, 200, 'application/json', JSON.stringify({ status: 'ok', currentSnapshot: Boolean(cache.current()) }));
    if (pathname === '/catalog') {
      const snapshot = await cache.get();
      // NormalizeSnapshot uses an explicit allowlist: credentials and upstream private metadata cannot reach this response.
      return send(res, 200, 'application/json; charset=utf-8', JSON.stringify({
        items: snapshot.items.map(item => ({ ...item, profileUrl: '/peptides/' + encodeURIComponent(item.slug) })),
        categories: snapshot.categories, version: snapshot.version, generatedAt: snapshot.generatedAt
      }));
    }
    const profile = pathname.match(/^\/peptides\/([a-z0-9-]+)\/?$/);
    if (profile) {
      const snapshot = await cache.get();
      const entry = snapshot.items.find(item => item.slug === profile[1]);
      if(!entry){const alias=snapshot.items.find(p=>p.referenceNames?.some(n=>n.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')===profile[1]));if(alias){res.setHeader('Location','/peptides/'+encodeURIComponent(alias.slug));return send(res,301,'text/plain','Profile moved');}}
      if (!entry) return send(res, 404, 'text/html; charset=utf-8', page('Entry unavailable', '<main class="pa-explorer pa-unavailable"><h1>Entry unavailable</h1><p>This entry is not published for this website.</p></main>'));
      const content=profileArticle(entry,snapshot.items);
      return send(res, 200, 'text/html; charset=utf-8', page(entry.name, content));
    }
    return send(res, 404, 'text/html; charset=utf-8', page('Page unavailable', '<main class="pa-explorer pa-unavailable"><h1>Page unavailable</h1><p><a href="/">Return to the library</a></p></main>'));
  } catch {
    if (pathname.startsWith('/assets/')) return send(res, 404, 'text/plain; charset=utf-8', 'Asset unavailable. Build the project before starting this example.');
    if (pathname === '/catalog') return send(res, 503, 'application/json; charset=utf-8', JSON.stringify({ error: 'library_unavailable', message: 'No current knowledge snapshot is available.' }));
    return send(res, 503, 'text/html; charset=utf-8', page('Library temporarily unavailable', '<main class="pa-explorer pa-unavailable"><h1>Library temporarily unavailable</h1><p>Please check back shortly.</p></main>'));
  }
});
server.listen(port, host, () => console.log(`Forma Research example listening on http://${host}:${port}`));
function shutdown() { clearInterval(refresh); server.close(() => process.exit(0)); }
process.on('SIGTERM', shutdown); process.on('SIGINT', shutdown);
