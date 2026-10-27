# Reference coverage audit

Reference: https://superpower.com/guides/peptides  
Observed: 27 October 2026

## Scope verified

The reference guide lists **152 entries**, each with a reachable article URL. All 152 linked pages returned successfully during the audit. The inventory records factual names, URLs, categories, and observed classifications; it does not reproduce the site's article prose, illustrations, models, or code.

| Reference category | Entries | Peptide Atlas category |
| --- | ---: | --- |
| Brain & sleep | 13 | brain |
| Skin & aging | 28 | skin |
| Digestive & weight | 35 | digestive |
| Immune & defense | 9 | immune |
| Hormones & metabolism | 19 | hormones |
| Bones & muscles | 21 | musculoskeletal |
| Heart & blood | 14 | cardiovascular |
| Sexual & reproductive | 13 | reproductive |
| **Total** | **152** | |

The catalogue's observed labels comprise 73 FDA-approved entries, 26 in clinical trials, 37 not FDA-approved, and 16 cosmetic/topical. These are reference-site observations, not Peptide Atlas regulatory findings. In particular, Enlicitide, Elamipretide, and Rusfertide have trial labels in the catalogue but FDA-approved evidence labels in their individual articles. Independent primary-source checking must resolve each case.

## Content and navigation capabilities

| Observed capability | Coverage requirement |
| --- | --- |
| Body-system navigation and counts | All eight categories must navigate the complete catalogue. |
| Interactive human visual and body hotspots | Shared original viewer, consistent across website connections. |
| Search with suggested peptide/system results | Name/alias search, accessible controls, and direct access to profiles. |
| Regulatory colour legend | Explain product-specific classifications without treating every preparation as approved. |
| Stable article routes | Each covered subject must have a persistent, crawlable profile URL. |
| Article identity | Name, aliases, molecular class, category, and evidence/status metadata. |
| Introductory summary and takeaway | Substantive original explanation suitable for a general reader. |
| At-a-glance facts | Structured facts rather than an empty template. |
| Full guide sections | Compound identity, mechanism, evidence, studied/approved uses, safety, regulation, and history/context where supported. |
| FAQs | Applicable research entries include specific questions and referenced answers; 28 reference articles expose FAQ sections. |
| Citation view and inline references | Citations remain tied to the relevant claims and accessible from the profile. |
| Reviewer and dates | Honest review provenance, publication/modification dates; AI source checking must not be presented as human medical review. |
| Related subjects and category recommendations | Links preserve relationships and make the catalogue navigable. |
| Structured data | Article/medical reference metadata and breadcrumbs should describe actual visible content. |
| Responsive and keyboard support | Search, navigation, article tabs, and viewer controls remain usable without pointer-only interactions. |

The reference uses a visual book-shelf presentation and animated transitions into article views. Those are presentation choices; equivalent access to the complete content should use original implementation and visual assets. Its public scripts also support persisted body-model preference via query parameters. This audit does not assert that every inferred interaction was visually exercised; the root browser audit checks the user-visible behaviour separately.

## Identity and normalization

The following reference pairs describe the same named molecule in different naming, product, or historical contexts and should share one canonical knowledge record after source checking:

- Bremelanotide / PT-141.
- Trofinetide / Trofinetide (predecessor programs).
- Afamelanotide / Melanotan I.
- GHK-Cu / Copper tripeptide-1.
- Tesamorelin / Tesamorelin (off-label).

Retain all reference names as searchable aliases or explicit contexts. Five confirmed mergers would represent 152 reference entries with **147 canonical profiles**. A coverage map must account for every original entry rather than judging completeness from the raw profile count.

Do not merge the TB-500 fragment record with full-length thymosin beta-4. Likewise, AOD-9604 and fragment 176–191 require explicit identity distinctions. The reference also includes class/group entries (insulin analogues, echinocandins, grouped antibiotics), a peptide mixture (Cerebrolysin), large proteins, and non-peptide compounds such as 5-Amino-1MQ and ibutamoren. Molecular classification must make these distinctions visible.

## Audit artifacts

- `content/reference-inventory.json`: all 152 reference entries with exact URLs and observed category/status labels.
- `content/reference-article-audit.json`: all 152 article metadata records, observed headings and aliases, and 719 outbound citation links. The links are research leads, not a statement that each source is authoritative or has been independently verified.

Only primary sources independently consulted for original profiles should be promoted into the maintained knowledge base. Existing source dates and regulatory claims must not be treated as current merely because they appear on the reference website.


## Implemented release

Application 1.2.0 / catalogue 2026-10-27.2 implements the audited catalogue and article coverage: 152/152 names, 147 full canonical profiles, every body-system category, all 28 applicable reference FAQ requirements, source tabs and section citation links, metadata and crawlable URLs, related profiles, and the same shared human component across integrations. Original article prose totals 60,680 words, with 635 cited sections and 422 reference entries across 381 distinct source URLs.

The entry-by-entry result is in [CATALOG-COVERAGE.md](CATALOG-COVERAGE.md), and the current database is auditable through **Collection coverage** in the workspace. `npm run catalog:check` is a mandatory production-build gate. Existing editorial changes and withdrawals are preserved during upgrades, so the live coverage screen also identifies intentional differences from the bundled release.
