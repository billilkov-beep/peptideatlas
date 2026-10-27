# Peptide Atlas API v1

The Node server hosts public read APIs, a credentialed website snapshot API, and staff APIs. Success responses are direct JSON objects; they do not use a `data` wrapper. Errors use `{ "error": "code", "message": "description" }` with the corresponding HTTP status.

The authoritative implementation is in `server/app.ts`, `server/types.ts`, and `server/portable.ts`. `CONTRACT.md` records the initial cross-component contract. This document describes the implemented endpoints.

## Authentication

### Staff sessions

`POST /api/auth/login` accepts:

```json
{ "email": "owner@example.test", "password": "YOUR_PRIVATE_PASSWORD" }
```

The password above is a placeholder. The first real account is created with `npm run setup`; there is no default account.

A successful login sets the `atlas_session` HttpOnly cookie and returns:

```json
{
  "user": { "id": "USER_UUID", "email": "owner@example.test", "name": "Owner", "role": "admin" },
  "csrfToken": "SESSION_CSRF_TOKEN"
}
```

Use the cookie on staff requests and `x-csrf-token: SESSION_CSRF_TOKEN` on every non-GET staff mutation, including logout. Browser-origin requests must match `PUBLIC_URL`. Sessions expire after eight hours. HTTPS configurations mark the cookie Secure; SameSite is Lax.

The application validates authentication using the matched route, including encoded route forms. Staff responses use `Cache-Control: no-store`.

Login has a 4 KiB body limit, a ten-attempt budget per IP/email pair, and a sixty-attempt IP-wide budget in a fifteen-minute window. Rejected attempts return HTTP 429 and `Retry-After`. State is bounded and process-local; deployment edge controls are separate.

| Method | Endpoint | Result |
| --- | --- | --- |
| GET | `/api/auth/status` | `{requiresSetup: boolean}` |
| POST | `/api/auth/login` | User and CSRF token; session cookie |
| GET | `/api/auth/me` | Current user and CSRF token, or 401 |
| POST | `/api/auth/logout` | Invalidates the current session; `{ok:true}` |

### Website connection credentials

Website connectors use their own read-only bearer key on `/api/v1/node/snapshot`. This is not a staff session and cannot edit or publish content. Keys are issued once on creation or rotation and retained as hashes centrally. Keep the actual key on the connecting website's server.

## Public content

| Method | Endpoint | Result |
| --- | --- | --- |
| GET | `/api/health` | `{status:"ok",version:"1.1.0",database:"pglite" or "postgresql"}` |
| GET | `/api/v1/catalog` | `{items,total,categories,version,generatedAt,starterContent,catalogRelease,referenceCoverage}` |
| GET | `/api/v1/peptides/:slug` | A published peptide snapshot, or 404 |
| GET | `/peptides/:slug` | Complete HTML article with source links, or 404 |
| GET | `/p/:id` | Uncached redirect to the currently published article URL for a stable UUID |
| GET | `/sitemap.xml` | Public library and currently published profiles |
| GET | `/robots.txt` | Public crawling instructions excluding staff routes |

Catalog filters are optional `q`, `category`, `evidence`, `status`, and `displayStatus` query parameters. `status` retains the original country-neutral regulatory classification. `displayStatus` filters the explicit, reviewed FDA/trial badge (`fda_approved`, `clinical_trial`, `not_fda_approved`, or `cosmetic`). Text search checks names, aliases, audited reference names, and summaries. Drafts and withdrawn entries are absent. `referenceCoverage` reports `{covered,total}` across the published collection, independent of the current search filter. The public catalog is an openly readable published library; a node's scope controls that connection's delivery, not secrecy of entries also published on the public central site.

An audited alternate-name slug resolves to the same object through the API and redirects with HTTP 301 to the canonical HTML article. The canonical UUID remains the identity used by connectors and migration.

### Peptide fields

| Field | Type / meaning |
| --- | --- |
| `id` | Server-assigned stable UUID |
| `slug` | Lowercase letters/numbers and hyphens; maximum 120 characters |
| `name`, `aliases` | Canonical display name and alternative names |
| `categories` | One or more category IDs below |
| `summary` | Required plain text, maximum 1,000 characters |
| `description` | Plain text, maximum 60,000 characters |
| `mechanism` | Plain text, maximum 12,000 characters |
| `molecularClass`, `keyTakeaway` | Optional identity classification and concise article takeaway |
| `atAGlance` | Up to 20 `{label,value}` fact rows |
| `sections` | Up to 30 `{id,title,body,citations}` sections; citations are 1-based source indices |
| `referenceNames` | Audited reference entries represented by this canonical record |
| `relatedSlugs` | Up to 12 related canonical profile slugs |
| `catalogRelease` | Originating catalogue release when applicable |
| `evidenceLevel` | `established`, `clinical`, `preclinical`, or `limited` |
| `regulatoryStatus` | `approved_medicine`, `clinical_trials`, `research_only`, `cosmetic`, or `unspecified` |
| `displayStatus` | Optional explicit FDA/trial display classification: `fda_approved`, `clinical_trial`, `not_fda_approved`, or `cosmetic` |
| `displayStatusNote` | Optional plain-text scope/rationale, maximum 600 characters; required in the bundled catalogue |
| `jurisdiction` | Context for status information |
| `references` | `{title,url,kind?,accessedAt?}`; safe HTTP/HTTPS URLs without credentials |
| `reviewStatus` | `unreviewed`, `source_checked`, or `reviewed` |
| `reviewer`, `reviewedAt` | Honest source-check or editorial attribution and date `YYYY-MM-DD`, or null date |
| `publicationState` | `draft`, `published`, or `withdrawn` |
| `revision`, `updatedAt` | Server-owned revision and ISO timestamp |

Category IDs are `brain`, `skin`, `digestive`, `immune`, `hormones`, `musculoskeletal`, `cardiovascular`, and `reproductive`. Their display labels are returned by the catalog.

Classification fields are editorial metadata. A status value is not a substitute for the product, use, jurisdiction, source, and review context recorded in the article.

The original `regulatoryStatus: clinical_trials` means investigational/human research and does not assert an ongoing trial. The new `displayStatus` is a separately reviewed badge. FDA approval is scoped to specific products and labeled indications, with discontinued marketing distinguished in `displayStatusNote`. Foreign approval does not produce an FDA-approved badge. `clinical_trial` is used for verified active clinical programs, including active studies that are not recruiting; it is not a guarantee of enrollment or efficacy. Missing display classification on a legacy record must appear neutral and require review, rather than guessing FDA status. See `docs/REGULATORY-DISPLAY-AUDIT.md` for decisions and dated sources.

`source_checked` is displayed as **AI-assisted source review**, not human clinical review. Source kinds are `regulatory`, `trial`, `primary_research`, `manufacturer`, and `ingredient_registry`. A trial source can be a registry record or a trial publication. Rich fields are optional for backwards-compatible import of version-1 records; the bundled catalogue requires them. Section IDs must be unique and must not collide with reserved article-navigation anchors. Invalid citation indices are rejected.

## Staff content APIs

Both editors and administrators can read and prepare drafts. Administrators alone can publish or withdraw.

| Method | Endpoint | Body / result |
| --- | --- | --- |
| GET | `/api/admin/overview` | Counts, recent activity, and node summary |
| GET | `/api/admin/peptides` | `{items,total}` containing current drafts and publication state |
| GET | `/api/admin/catalog-coverage` | Release, check date, represented/published counts, and all 152 reference-to-profile mappings |
| GET | `/api/admin/peptides/:id` | Current editable record |
| POST | `/api/admin/peptides` | Content fields; returns new record, HTTP 201 |
| PUT | `/api/admin/peptides/:id` | Content fields plus `expectedRevision` |
| POST | `/api/admin/peptides/:id/publish` | `{expectedRevision}`; administrator only |
| POST | `/api/admin/peptides/:id/withdraw` | `{expectedRevision}`; administrator only |
| GET | `/api/admin/peptides/:id/revisions` | `{items:[{id,revision,action,createdAt,content}]}` |
| POST | `/api/admin/peptides/:id/restore` | `{revisionId,expectedRevision}`; restores a draft |

An `expectedRevision` mismatch returns 409 rather than overwriting someone else's work. Every accepted create, edit, publish, withdrawal, and restoration creates a history entry. Publishing requires source-checked or reviewed status, attribution, review date, at least one reference, and a nonempty description.

Published entries retain a separate public snapshot while later edits are saved. The editable record may therefore say `publicationState: "published"` while its newest draft differs from the public snapshot. Restoring a revision also leaves the current public snapshot intact until publication.

## Website connection APIs

These management endpoints require an administrator session.

| Method | Endpoint | Body / result |
| --- | --- | --- |
| GET | `/api/admin/nodes` | `{items,total}`; no keys or key hashes |
| POST | `/api/admin/nodes` | Node settings; `{node,apiKey}`, HTTP 201 |
| PATCH | `/api/admin/nodes/:id` | Settings and/or `{enabled:boolean}` |
| POST | `/api/admin/nodes/:id/rotate-key` | `{node,apiKey}`; immediately invalidates the old key |

Node settings are `name`, `domain`, `type` (`wordpress`, `javascript`, `api`), `categories`, and `theme` (`accent`, `background`, `font`). An empty category array means all published entries. Domain is normalized to a base origin without a path. Colours are six-digit hexadecimal values. The domain is registration metadata, not proof of the requesting server's origin; the bearer credential authorizes access.

Example server-to-server request, with placeholder values:

```http
GET /api/v1/node/snapshot HTTP/1.1
Host: atlas.your-domain.example
Authorization: Bearer YOUR_PRIVATE_NODE_KEY
```

The response contains:

```json
{
  "schemaVersion": 1,
  "version": "CONTENT_VERSION",
  "node": { "id": "NODE_UUID", "name": "Example website", "domain": "https://site.example", "theme": {"accent":"#267b71","background":"#f5f7f5","font":"Inter, sans-serif"}, "categories": ["skin"] },
  "items": [],
  "generatedAt": "2026-10-27T12:00:00.000Z",
  "viewerVersion": "1.0.0",
  "maxAgeSeconds": 86400
}
```

`items` contains only published entries matching the connection's scope. Successful reads update the central connection's last synchronization time. The response sends an ETag; a matching `If-None-Match` receives 304. Invalid or disabled keys receive 401. Delivery copies must be bounded by the snapshot's age and refreshed completely so withdrawals disappear. Authentication failures should clear the local delivery copy. See [connector behaviour](CONNECTORS.md).

## Staff management and transfer

All endpoints below require an administrator session.

| Method | Endpoint | Body / result |
| --- | --- | --- |
| GET | `/api/admin/users` | Staff identities and roles; no password hashes |
| POST | `/api/admin/users` | `{email,name,role,password}`; role `admin` or `editor`, password 12–256 characters |
| POST | `/api/admin/users/:id/password` | `{password}`; invalidates every session for that account |
| GET | `/api/admin/audit` | Latest 500 activity records as `{items,total}`; `total` is the returned count |
| GET | `/api/admin/export` | Schema-version-1 portable JSON |
| POST | `/api/admin/import` | `{bundle: <export>, mode:"merge"}`; import counts |

Imports are transactional and reject conflicts; they are not destructive overwrite operations. The general request body limit is 10 MiB. Use the compiled CLI for larger whole-bundle transfers. See [migration details](MIGRATION.md) for exclusions and reissuing imported website credentials.
