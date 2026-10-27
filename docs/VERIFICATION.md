# Build verification — 27 October 2026

Release: application 1.2.0; catalogue 2026-10-27.2.

## Catalogue and article coverage

- All **152 reference entries** map exactly to **147 canonical profiles**. Five alternate-name/context pairs share one maintained article.
- The complete release contains **60,680 narrative words**, **635 cited sections**, and **422 source references** representing **381 distinct source URLs**. At-a-glance facts and source titles are additional.
- The catalogue gate verifies exact names, all eight reference categories, substantive fields, source provenance, valid section IDs and citation indices, related-profile targets, and original FAQ coverage for all **28 reference entries** with FAQ headings.
- All **147 published article URLs** returned HTTP 200 from the compiled Node application. Their structured data parsed correctly and contained the expected citation count.
- A fresh compiled runtime installed all 147 profiles and reported **152/152 published reference entries**. Its portable export contains all 147 records, their complete article fields, and revision history; it excludes authentication and website-key secrets.

## Application and connector checks

- Node.js **24.22.1**: TypeScript checking passed; the complete production build succeeded.
- `npm test`: **30 passed, 0 failed, 0 skipped**. Seven backend integration checks, seven catalogue/migration checks, four security regressions, eight Node connector checks, and four shared-viewer checks.
- Catalogue upgrade tests retain legacy and canonical IDs, preserve editorial work and withdrawals, survive published slug renames, and keep storage/export slugs consistent. Full-catalogue export/import preserves article sections, citations, relationships, and stable identities.
- API checks cover authentication, roles, CSRF, encoded-route authorization, published/draft isolation, recorded source checks, revisions, node scopes, key rotation/revocation, safe HTML, and transactional import conflicts. Stable public-ID links resolve the current published slug independently of a draft rename.
- The compiled runtime also served the public explorer, library, workspace shell, integration guide, article assets, generated browser bundles, and WordPress ZIP. The coverage API rejected unauthenticated access.
- Official WordPress Playground: **31 checks passed** on WordPress **6.8.11** / PHP **8.3.33**. These include plugin activation, scheduled refresh, scoped content, full local articles, rich-field preservation, citation renumbering, canonical alias redirects, structured data, safe output, genuine administrator/nonce actions, key masking, expiry, withdrawals, revocation, and shared viewer/article assets.
- Additional status checks verify explicit FDA/trial classification, qualifications, and the absence of inferred FDA approval for legacy records. The31 WordPress checks also exercise these fields and their card labels.
- WordPress race regressions verify that disconnecting or changing credentials while a request is in flight cannot restore old-node content. Cached snapshots are bound to their connection URL and key.
- Browser inspection verified the new anatomical artwork, pointer-triggered zoom, the category heading above the body, transient category previews, click selection, keyboard navigation, Escape/full-body reset, and the13-entry clinical-trial filter with matching amber cards. A brain hover produced zoom3.35, preview category brain,11 matching cards, and no committed selection; clicking committed the category. Keyboard navigation previewed skin while retaining the selected brain category, and Escape reset all state to zoom1. The same147-profile/152-entry collection remains available. The viewer now works without WebGL. Earlier article/navigation checks remain applicable to the unchanged article rendering.
- A focused implementation review identified and corrected renamed-record upgrade collisions, inconsistent export slugs, mutable-draft public links, and in-flight WordPress synchronization races.
- The prior dependency audit after the static-file dependency update reported **0 known advisories** across production and development dependencies. This release does not change dependency versions. This is a point-in-time audit, not a future guarantee.

## Verification boundaries

Database integration checks used PGlite. Docker and a separate PostgreSQL server were not available for execution. Authenticated workspace actions were verified through API tests and code review rather than a signed-in browser session. WordPress HTTP responses were controlled fixtures, so live central-to-WordPress connectivity, target themes, cron, CDN caches, HTTPS, backups and production load remain deployment checks.

A private, read-only viewing snapshot is published through Sites. The authoritative Node application has not been deployed to the user’s production server, and no Milligram database or actual WordPress site was changed. The application is a complete standalone Node project; future Milligram integration still requires mapping its actual schema. The content is original AI-assisted source synthesis, with explicit provenance and dates. It does not claim clinician review. The shared human is an original navigation component and is not a clinical anatomical model or a copied third-party asset.
