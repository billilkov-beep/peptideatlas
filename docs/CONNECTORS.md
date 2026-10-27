# Connecting websites to Peptide Atlas

The central application is the only editable knowledge source. These connectors receive published, scoped snapshots; they do not create another editorial database. Stable peptide UUIDs remain intact in the delivery copies and in future Milligram exports.

## WordPress installation

1. In the central application's **Connections** screen, create a `wordpress` node using the target website's domain. Select the categories it may read.
2. Copy the newly issued connection key. The full key is shown once. If lost, rotate it in the central application.
3. Install the generated `peptide-atlas-connector.zip` through WordPress's plugin uploader and activate it.
4. Open **Settings → Peptide Atlas**, set the central application's HTTPS URL and the node key, and click **Save and synchronize**.
5. Select the website's accent colour, background, font, and heading. Add `[peptide_atlas]` to a page.

The plugin serves local, server-rendered profiles at `/atlas-peptides/<slug>/`. With plain permalinks it automatically uses `?atlas_peptide=<slug>`. Activating the plugin registers and flushes its rewrite rule. If a site's permalink rules have changed subsequently, save **Settings → Permalinks** once.

Full local articles include the takeaway, fact table, structured sections, numbered citations, Guide/Sources tabs, related profiles, and honest source-review attribution. Name aliases resolve to the canonical local URL. Published pages also expose canonical and medical-reference structured metadata. All scientific text remains centrally maintained.

The code targets WordPress 6.4+ and PHP 8+. The connector passed 31 integration checks in an actual, disposable WordPress 6.8.11 installation running PHP 8.3.33 through the official WordPress Playground runtime. Compatibility with the actual theme, plugins, and hosting still needs a pilot-site check.

### Shared model, local styling

All sites load the same bundled `viewer.js`. The model, materials, and body-to-category mapping belong to that shared component. The connector's outer interface uses these variables, which a site's stylesheet may override:

```css
.pa-explorer {
  --pa-accent: #147d72;
  --pa-bg: #f5f8f6;
  --pa-text: #1c3437;
  --pa-muted: #687a7b;
  --pa-font: inherit;
}
```

Settings use local overrides. Central node categories control which records may be received. The same peptide UUID can appear in different site presentations without creating a separate centrally edited record.

### Credentials and synchronization

- The key is held in a non-autoloaded WordPress option, on the WordPress server. Administrators can replace it but the settings page does not echo the stored key into HTML.
- The server calls `GET /api/v1/node/snapshot` with `Authorization: Bearer <key>` using WordPress's safe HTTP client. Redirects are disabled so a redirect cannot send credentials elsewhere.
- Synchronization runs every 15 minutes through WP-Cron. WP-Cron is traffic-dependent. For dependable refresh on a low-traffic website, configure a real system scheduler to execute WordPress cron at least every five minutes.
- The durable, read-only snapshot is held in a non-autoloaded option and bound to a fingerprint of the central URL and node key. A late response from a disconnected or changed connection cannot be served. Successful synchronization replaces it in full, so withdrawn or out-of-scope entries disappear.
- A network failure preserves the last valid snapshot only until its expiry. Maximum age is 24 hours, or the shorter age supplied by the central application. A restart does not extend that expiry.
- A synchronization response of HTTP 401 or 403 deletes the local snapshot immediately. Disabling a central node is observed on the next successful synchronization; it does not retroactively remove content a visitor already downloaded.
- The plugin sets `DONOTCACHEPAGE` and no-cache response headers on its pages. **Exclude explorer pages and `/atlas-peptides/*` from full-page/CDN caches**, because server caches that bypass WordPress can otherwise keep old content after a withdrawal.
- **Synchronize now** and **Disconnect and clear local content** require an administrator capability and a WordPress nonce.
- Deactivation unschedules refreshes. Deleting the plugin removes local credentials, settings, and cached content; it does not delete central records.

### Local development only

Production connections require HTTPS. A literal localhost/loopback HTTP URL is permitted only when both constants below are explicitly set in a development WordPress installation:

```php
define('WP_DEBUG', true);
define('PEPTIDE_ATLAS_ALLOW_LOCAL', true);
```

This does not permit arbitrary private IP addresses. Docker hostnames and LAN IPs should use a properly configured HTTPS development hostname instead of weakening the production URL policy.

## Non-WordPress website example

`examples/brand-site` is a real Node.js server displaying the library as **Forma Research**, using a warm serif design distinct from the main application. It uses the same human viewer bundle. Its API key stays on the server.

1. Build the project (`npm run build`) so `dist/viewer.js` is available.
2. Create a `javascript` node in the central dashboard.
3. Provide the following environment variables to the example's Node process through your shell or hosting secret configuration:

| Variable | Purpose |
| --- | --- |
| `ATLAS_URL` | Central application's HTTPS base URL |
| `ATLAS_NODE_KEY` | The node key, server-side only |
| `BRAND_PORT` | Optional, default `3100` |
| `BRAND_HOST` | Optional, default `127.0.0.1`; use `0.0.0.0` behind an appropriate production reverse proxy |
| `ATLAS_CACHE_FILE` | Optional durable snapshot path; default `data/brand-site/snapshot.json` |
| `ATLAS_ALLOW_LOCAL` | Explicitly set to `true` only for HTTP loopback development |

4. Start it from the project root:

```sh
node examples/brand-site/server.mjs
```

The browser requests the example's same-origin `/catalog` endpoint. The Node server supplies a sanitized published snapshot without credentials. The example also serves complete HTML profile pages at `/peptides/<slug>`, independent of JavaScript rendering.

The example refreshes every five minutes and persists a credential-bound cache atomically. It refuses to reuse a previous node's cache after credentials or the central URL change. Expiry and revocation handling follow the same principles as WordPress. The cache stores public knowledge, not an independently editable knowledge base.

The reusable server adapter is `examples/brand-site/lib/snapshot-cache.mjs`. Other frameworks can use the same pattern or call the versioned content API directly from their own server. Never paste a node key into a browser widget.

## Required pilot-site checks

Before enabling a production website:

1. Connect with a node key and verify that only its allowed published entries appear.
2. Open a local profile URL directly and check the full article and reference links.
3. Edit a draft centrally; confirm public content stays unchanged until publication.
4. Publish, synchronize, and verify the new revision appears.
5. Withdraw a record, synchronize, and verify the profile disappears from the list and returns 404.
6. Disable or rotate the node key, synchronize, and verify rejected access clears the delivery copy.
7. Test a temporary central outage with an unexpired cache, then test expiry.
8. Verify page/CDN cache exclusions and scheduled refreshes in the hosting configuration.
9. Compare two site themes: surrounding CSS should differ while the body model remains consistent.
10. Test phone layouts and keyboard navigation, including region preview, zoom, reset, and reduced-motion preferences.

## Reproducible connector verification

The eight Node adapter tests exercise schema validation, publication and category filtering, secret removal, rich article preservation, citation renumbering, URL policy, credential-bound persistence, bounded expiry, revocation, and atomic snapshot replacement:

```sh
node --import tsx tests/connector.test.ts
```

The optional `tests/connector-wordpress-qa.mjs` test boots real WordPress with PHP/WASM using the official [WordPress Playground CLI API](https://developer.wordpress.org/playground/handbook/guides/programmatic-playground-cli/). It installs the connector into a disposable installation and does not use an existing WordPress site. Keep its runtime dependency separate from the application:

```sh
npm install --prefix /tmp/atlas-wp-qa @wp-playground/cli@3.1.61 --no-audit --no-fund
ATLAS_PLAYGROUND_MODULE=/tmp/atlas-wp-qa/node_modules/@wp-playground/cli/index.js \
  node --experimental-wasm-jspi tests/connector-wordpress-qa.mjs
```

Run `npm run build` first to supply the shared viewer bundle. Playground 3.1.61 requires Node 24.18 or newer. In an environment that supplies network proxy variables, add Node's `--use-env-proxy` flag. The first run downloads the official WordPress and PHP runtime assets. Set `ATLAS_QA_WP_VERSION` to select a different WordPress release and `ATLAS_WP_QA_REPORT` to write its JSON result to a chosen path.

The verified run used WordPress **6.8.11** and PHP **8.3.33** and passed **31 checks**. These exercised activation, cron registration, authenticated synchronization through the WordPress HTTP API, credential handling, publication and category scope, escaped shortcode output, masked settings, a genuine administrator settings action with a valid nonce, rejection of unauthenticated and invalid-nonce actions, full local profile HTTP responses, shared viewer asset delivery, temporary outages, expiry, withdrawals, and revocation.

The central HTTP service in this test is a controlled WordPress HTTP fixture. It makes withdrawal, outage, malformed-response, and authorization cases repeatable. The test verifies server behavior and HTML output; it does not replace browser testing, a live central-to-WordPress connection, or the pilot site's theme, scheduler, and CDN checks.
