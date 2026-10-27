# Moving the library into Milligram later

Peptide Atlas is independent today. Its data model and versioned API are designed so a future Milligram integration can retain one authoritative knowledge source. Milligram's existing schema and code have not been inspected or modified in this build.

## Identity and ownership

Each peptide, revision, and website connection has a stable UUID. Keep these identifiers during migration. A website's theme, filters, and local delivery copies must not become a separately edited scientific library.

The complete release covers 152 audited entries using 147 canonical profiles. Five exact alias/context pairs share records: Bremelanotide/PT-141, Trofinetide/its predecessor programs, Afamelanotide/Melanotan I, GHK-Cu/Copper tripeptide-1, and Tesamorelin/its off-label context. `referenceNames` preserves that mapping. Distinct compounds and formulations are not merged merely because their names are similar; TB-500 and full-length thymosin beta-4 remain separate.

New installations derive stable canonical IDs from slugs. Upgrading untouched earlier Atlas imports retains their existing IDs instead. Before importing an existing installation into a fresh target, set `LOAD_CATALOG=false` so the source installation's identities remain authoritative. Do not create an independently edited duplicate library in Milligram.

The schema-version-1 export contains:

| Export field | Contents |
| --- | --- |
| `schemaVersion` | `1` |
| `application` | `peptide-atlas` |
| `exportedAt` | ISO timestamp |
| `records` | Stable IDs, current draft, published snapshot or null, state, revision number, and full entry revision history |
| `nodes` | Stable connection IDs, domains, types, scope, theme, and synchronization metadata |
| `starterContent` | Whether the library carries the starter-content flag |

References, numbered section citations, fact tables, review provenance, audited names, related slugs, and catalogue-release attribution are part of each content snapshot. Historical revisions retain their historical source lists. The export does not include staff users, password hashes, sessions, connection keys or key hashes, or the global activity/audit table. Use a full database backup for complete operational recovery.

## Export and import

Administrators can download and import a bundle from **Export & migration** in the workspace.

The CLI uses the same format after the application has been built:

```sh
npm run export -- /private/transfer/atlas-export.json
npm run import -- /private/transfer/atlas-export.json
```

The export command refuses to overwrite an existing destination file. For local PGlite, stop the running application before a CLI command opens the same data directory. For PostgreSQL, exports use a consistent database transaction and can be taken while the application is running.

The workspace accepts a JSON file up to 9 MiB, leaving room for its request wrapper within the server's 10 MiB body limit. Use the CLI for a bundle too large for the browser/API. The format currently permits up to 10,000 records, 10,000 node configurations, and 10,000 revisions per record, subject to available memory and field validation. This is a whole-bundle import, not a streaming ingestion service.

### Merge behaviour

- New IDs and slugs are inserted without changing their identity.
- Identical existing records and histories are left unchanged.
- Different data for an existing ID or slug causes a conflict.
- Conflicting existing revision history or website configuration also causes a conflict.
- The transaction is rolled back if any part fails. A preceding record in the same bundle is not left partially imported.
- The importer does not overwrite newer local changes or deduplicate different IDs merely because names are similar. Reconciliation must happen before merging conflicting libraries.

Imported website connections start **disabled** and have **no credentials**. An administrator generates a new key, configures it on the receiving website, and then enables the connection. This prevents a portable content file from silently transferring access to the old system.

## Planned Milligram cutover

1. **Inspect Milligram.** Identify its existing peptide entities, identifiers, source records, authentication, and API routes. Decide which existing data should survive and how the Atlas fields map to it.
2. **Choose one authority.** Decide whether Milligram will host the current knowledge service as a module or implement the same API against its own extended schema. Do not keep two independently editable masters.
3. **Implement and test the mapping.** Preserve UUIDs, aliases, category relationships, references, current drafts, published snapshots, and revision order. Resolve collisions explicitly.
4. **Perform a trial transfer.** Import into an isolated environment and compare record counts, IDs, publication state, source links, and representative histories. Exercise a connected WordPress site and the generic Node example.
5. **Freeze edits for the final transfer.** Take a full database backup and a final portable export. Keep a clear cutover timestamp and prevent both systems from accepting divergent edits.
6. **Switch website connections.** Configure the new API address, generate replacement node keys where needed, enable the migrated connections, and synchronize. Each successful synchronization replaces the local delivery snapshot.
7. **Verify before retiring the old service.** Check publication, withdrawal, scoped content, local profile pages, and expiry behaviour. Keep the old service read-only for the agreed rollback period, then retire it.

If the same public API origin is retained through a gateway or proxy, website configuration changes may be smaller. That routing arrangement is a future deployment choice, not an existing automatic Milligram integration.

## What migration readiness means here

The stable IDs, portable data, shared viewer, and API contract are implemented and tested. The schema-version-1 format can move the library between Atlas instances today. A future Milligram importer or adapter remains dependent on Milligram's actual data structure; it must be implemented and verified when that project is available.
