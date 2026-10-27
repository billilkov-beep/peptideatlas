# Peptide Atlas

A standalone Node.js knowledge platform with an interactive human explorer, an editorial workspace, and website connectors. It is built to run independently now and move into Milligram later without creating a second authoritative knowledge base.

## What is included

- A populated catalogue of **147 canonical profiles covering all 152 entries** audited on the reference guide, across eight body systems. Five alternate-name/context pairs share one maintained article.
- Full original articles with molecular identity, key takeaways, at-a-glance facts, mechanisms, evidence, uses, safety, regulatory context, relevant FAQs, section citations, and related profiles.
- Name and alias suggestions, body-system navigation, evidence and regulatory filters, Guide/Sources tabs, crawlable article URLs, canonical links, structured data, and a sitemap.
- One original shared anatomical viewer: a refined adult human illustration with region hover, smooth zoom, keyboard and touch controls, and a category heading. It works without WebGL. The surrounding website design can differ; the body component stays shared.
- A staff dashboard for structured article editing, sources, recorded review, publishing, withdrawals, revision history, restoration, and an entry-by-entry coverage audit.
- Administrator and editor accounts, session authentication, CSRF checks, and login rate limiting.
- Registered website connections, individual read-only keys, category scopes, synchronization status, rotation, and disabling.
- An installable WordPress plugin with a shortcode and local HTML profile pages.
- A working non-WordPress Node example with a different brand design and the same viewer.
- Stable UUIDs and a versioned JSON export/import format for future migration.
- A PostgreSQL adapter for deployment and an embedded PGlite database for a self-contained local run.

The public library is at `/`. The staff workspace is at `/admin`. Published profiles have ordinary HTML URLs at `/peptides/<slug>`. No coding is needed to maintain entries or connections through the workspace.

## Start locally

Use **Node.js 24 LTS** for the tested runtime. The application package declares Node 22.13 or later; the optional WordPress Playground verification requires Node 24.18 or later.

Run these commands from the project directory:

```sh
npm ci
cp .env.example .env
npm run build
npm run setup
npm start
```

`npm run setup` asks for the first administrator's email, name, and a password of at least twelve characters. There is no built-in administrator password. Open **http://localhost:3000** to view the explorer and **http://localhost:3000/admin** to sign in.

Without `DATABASE_URL`, local data is stored persistently in `./data/atlas`. Keep that directory between runs. The Node server serves the built frontend and API together.

The complete catalogue is installed and published automatically on first start. The default configuration is:

```dotenv
LOAD_CATALOG=true
```

Articles are labelled **AI-assisted source review**, checked against linked primary sources as of 27 October 2026. That label is distinct from editorial or clinician review. The catalogue includes approved medicines, investigational compounds, cosmetic ingredients, research peptides, and several non-peptide/group entries present in the reference; each article explains its actual identity and evidence limits. Text and visual assets are original.

Catalogue updates add missing records and upgrade untouched earlier imports while retaining their IDs. They preserve manually edited and withdrawn records. Set `LOAD_CATALOG=false` only when deliberately creating an empty custom collection or preparing an import destination. This setting does not erase existing records. The **Collection coverage** screen reports any current gaps, including unpublished entries.

### Work on the application

```sh
npm run typecheck
npm test
npm run build
npm run dev
```

`dev` watches the server source. Re-run `build` after browser-interface or shared-viewer changes; it is not a Vite development server. The build creates the browser app, compiled Node server and command-line utilities, the shared viewer bundle, and the WordPress ZIP.

Every production build first runs `npm run catalog:check`. The gate requires all 152 reference entries, 147 canonical profiles, substantive article fields, source provenance, valid citation numbering, and valid related-profile links. `npm run catalog:assemble` rebuilds the release from the three authored profile collections in `content/` and applies the same checks.

## Publish knowledge

1. Sign in and open **Knowledge library**.
2. Create an entry with a name, stable URL slug, summary, and body-system categories.
3. Maintain the description, mechanism, key facts, article sections, and source references. Select the sources supporting each section.
4. Record a source check or editorial review with its attribution and date, then save the draft.
5. An administrator publishes the saved, checked entry.

Saving an edit to a published entry does not change its public snapshot. Publication is a separate action. Restoring a historical revision restores the draft; it also requires a subsequent publish action before visitors see it. Withdrawn entries disappear from the central published API and from connected sites after synchronization.

Editors can prepare drafts. Administrators can also publish, manage staff, issue website keys, and transfer the library. **People** supports creating accounts and resetting passwords; a reset signs that account out of existing sessions.

## Connect WordPress

1. Create a **WordPress** connection in **Connections** and copy its one-time key.
2. Download the connector from the workspace, or use `dist/web/downloads/peptide-atlas-connector.zip` after building.
3. Upload and activate it in WordPress.
4. Open **Settings → Peptide Atlas**, enter the central application's HTTPS address and the connection key, and synchronize.
5. Add `[peptide_atlas]` to a page. Choose that site's colours, fonts, and heading in the plugin settings.

The same plugin can be installed on the other WordPress sites, each with its own central connection and key. The plugin is PHP plus JavaScript; the central application remains Node.js. Delivery copies are read-only and expire rather than becoming separately maintained knowledge bases.

See [the connector guide](docs/CONNECTORS.md) for synchronization, local profile routes, page-cache exclusions, and the non-WordPress example. The in-application guide is at `/integration-guide.html`.

## Deployment and migration

- [Deployment guide](docs/DEPLOYMENT.md): configuration, PostgreSQL, Docker Compose, reverse proxy, backups, and updates.
- [Migration guide](docs/MIGRATION.md): exports, conflict handling, stable IDs, and the future Milligram cutover.
- [API reference](docs/API.md): public content, staff authentication, editing, and node snapshots.
- [Complete coverage report](docs/CATALOG-COVERAGE.md): every reference entry mapped to a maintained profile.
- [Reference audit](docs/REFERENCE-AUDIT.md): the observed site features and original-content coverage.
- [Viewer package notes](packages/viewer/README.md): shared component behaviour and embedding.

No existing Milligram application or database has been modified. Milligram's schema must be inspected and mapped when that integration begins. The current export is a documented transfer format, not a claim that Milligram already implements an importer.

## Verification

The repository contains **30 automated Node checks**: seven backend integration tests, seven catalogue and migration tests, four security regression tests, eight connector tests, and four viewer tests. The WordPress connector separately passed **31 checks** in a disposable WordPress 6.8.11 / PHP 8.3.33 installation using the official WordPress Playground runtime. That run used a controlled central-service fixture to exercise failures consistently.

The backend checks use PGlite. They cover authentication, roles, encoded-route authorization, CSRF, draft isolation, publishing, revisions, node scoping, rotation, revocation, HTML escaping, and transactional migration. The complete TypeScript check and application build have also been exercised.

Docker execution, an external PostgreSQL server, and installation into the intended production WordPress sites have **not** been verified in this environment. The Playground checks do not replace the target site's theme, cron, cache, and live central-service verification. Consult the connector guide for the reproducible checks and pilot-site steps.

See [the verification record](docs/VERIFICATION.md) for the completed browser and runtime checks and their boundaries.

## Project layout

| Directory | Purpose |
| --- | --- |
| `server/` | Node application, database, authentication, publishing, and portable data |
| `content/` | Complete original catalogue, authored source collections, and 152-entry reference audit |
| `web/` | React public explorer and staff workspace |
| `packages/viewer/` | Shared human component and viewer tests |
| `wordpress/peptide-atlas-connector/` | Installable WordPress integration |
| `examples/brand-site/` | Non-WordPress integration with a distinct design |
| `scripts/` | Build, setup, export, import, and archive utilities |
| `tests/` | Backend, security, and connector verification |
| `docs/` | Operating and integration documentation |

The current viewer uses an embedded original illustration and CSS transforms. Third-party dependency licenses are included in build outputs; the retained legacy Three.js source and dependency retain their license. Application source is supplied in full. No AI API key is required for the browsing, editing, or synchronization features.
