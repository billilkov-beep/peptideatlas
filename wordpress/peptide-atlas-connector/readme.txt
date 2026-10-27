=== Peptide Atlas Connector ===
Contributors: peptide-atlas
Tags: knowledge-base, research, API, viewer
Requires at least: 6.4
Tested up to: 6.8
Requires PHP: 8.0
Stable tag: 1.2.1
License: GPLv2 or later

Connect to one central Peptide Atlas knowledge base and display the same human explorer in your own website's design.

== Installation ==
1. Upload the plugin ZIP through Plugins > Add New > Upload Plugin and activate it.
2. Create a WordPress node in the central application and copy its one-time connection key.
3. Open Settings > Peptide Atlas. Set the HTTPS application URL and connection key.
4. Choose this website's colours, font, and heading. Save and synchronize.
5. Add [peptide_atlas] to a page.

The published entries are available at /atlas-peptides/ENTRY-SLUG/. Plain permalinks use a query URL automatically.

== Complete articles ==
The central catalogue contains 147 canonical profiles covering all 152 audited reference entries. The connector displays full guides with key takeaways, fact tables, evidence and safety sections, FAQs where applicable, section citations, source tabs, and related profiles. Alternate reference names resolve to the canonical local article. Source-check attribution is separate from human editorial review.

== Data and connections ==
Only published, node-scoped entries are read. The connection key is retained server-side and is never localized into JavaScript.
The plugin requests /api/v1/node/snapshot every 15 minutes through WordPress cron. WP-Cron requires site traffic; use a real scheduled cron on low-traffic sites.
The last valid snapshot is kept in a non-autoloaded WordPress option and bound to the current connection URL and key. Late responses cannot restore a disconnected node or cross a credential change. It expires no later than 24 hours, or sooner if the central snapshot requests it. HTTP 401/403 clears cached content immediately when a synchronization receives that response.
Explorer and profile pages must be excluded from external full-page/CDN caches. The plugin sends no-cache headers and sets DONOTCACHEPAGE, but cannot control every host caching layer.
The optional local development mode requires both WP_DEBUG and PEPTIDE_ATLAS_ALLOW_LOCAL set to true. It allows HTTP only for literal loopback hosts.

== Privacy ==
The connector sends its node connection key and connector version to the configured central application. It does not send visitors' personal information. Public visitors receive published reference content and public viewer code only.
An administrator can disconnect and clear local content from Settings > Peptide Atlas. Deleting the plugin removes its local settings and snapshot. Central content is untouched.

== Styling ==
The outer interface supports --pa-accent, --pa-bg, --pa-font, --pa-text, and --pa-muted CSS variables. The human viewer keeps its shared appearance.

== Verification ==
Passed 31 integration checks in disposable WordPress 6.8.11 with PHP 8.3.33 using the official WordPress Playground runtime and controlled central HTTP fixtures. These include activation, synchronization, scoped content, safe output, administrator actions, local profile URLs, expiry, and revoked access. Validate your actual WordPress theme, central connection, and hosting caches before deployment across production sites. See docs/CONNECTORS.md in the source project for the reproducible test command, pilot checklist, and build instructions.
