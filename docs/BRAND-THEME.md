# AllThingsPeptide visual theme

Release: **1.2.1**. Reference checked on **27 October 2026**.

## Reference

The visual reference is [AllThingsPeptide](https://allthingspeptide.com/). Its landing response redirects to the admin entry and uses the stylesheet in the owner's [peptide-engine repository](https://github.com/billilkov-beep/peptide-engine/blob/main/peptide-engine-node/public/style.css), blob `91c3db2fbfc5fc97ecce282a33873c8d66f919db`. The matching page references `/assets/style.css`.

The theme uses these reference values:

| Purpose | Value |
| --- | --- |
| Page | `#07101c` |
| Navigation | `#081321` |
| Panel | `#101f30` |
| Raised panel | `#192b3f` |
| Field | `#0a1726` |
| Text | `#efece6` |
| Heading | `#fbf5e8` |
| Muted text | `#b6c3d0` |
| Gold | `#e6c77c` |
| Line | `#394451` |
| Field border | `#516172` |
| Focus | `#f5d88b` |
| Primary button | Gold gradient from `#f0d993` to `#cba45b`, dark `#101b27` text |

Headings use Georgia with serif fallbacks. The body stack is `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`. Like the reference, this is a font stack; it does not download Inter from an external font service. Inter is used if available on the device, otherwise the browser selects the system fallback.

## Central application

- `web/public/typeface.css` defines the reusable font stacks.
- `web/public/brand-tokens.css` contains the shared palette and gradients.
- `web/src/brand-theme.css` applies the palette after the existing responsive stylesheet. It covers the public explorer and grid, login, workspace, editors, tables, dialogs, and notifications.
- Standalone profile pages import the same tokens in `web/public/article.css`.
- The integration guide loads the same token file. Profile and guide print rules retain dark text on white paper.
- The browser theme colour and existing atom favicon use the navy and gold palette.

The body illustration uses a light ivory canvas (`#f4efe4`) inside the dark panel. Its multiply blend requires a light surface to keep the anatomy visible. The central app opts into the shared viewer's optional `--atlas-viewer-*` hooks for brown/gold controls and the same type stacks. The image, focus geometry, hover zoom, selection, keyboard navigation, touch behavior and reduced-motion rules are unchanged.

The viewer package and checked-in WordPress viewer bundle contain identical CSS changes. Version 1.2.1 also updates the plugin asset cache key. Existing WordPress and Node connector palettes remain their own settings; the optional viewer properties retain the prior defaults when a host does not set them. See [viewer notes](../packages/viewer/README.md).

## Regulatory status remains distinct

Public cards and filters keep separate hues for FDA-approved products (green), clinical trials (amber), not FDA approved (red), cosmetic context (purple), and unreviewed context (slate). Dark surface shades improve their contrast against the new application background. Labels, status mappings, jurisdiction notes and source records are unchanged.

No knowledge records, database schema, connection settings or access-control logic are changed by this theme. Future Milligram integration can reuse the token and viewer files while continuing to use the existing central knowledge base.

## Verification boundaries

The source checks for this patch cover CSS bracket/string balance, defined theme variables, import order, identical viewer CSS in source and distribution, JavaScript syntax of the checked-in viewer bundle, and comparisons showing that the viewer runtime and dependency lock are unchanged apart from the stated CSS and version updates. The bundle syntax check does not execute the bundle.

Selected text contrast checks (WCAG relative-luminance calculation):

| Pair | Ratio |
| --- | --- |
| Body on panel | 14.13:1 |
| Muted on panel | 9.29:1 |
| Gold on nav | 11.40:1 |
| Primary button (dark stop) | 7.45:1 |
| Human caption | 5.66:1 |
| FDA status badge | 7.16:1 |
| Clinical-trial status badge | 7.77:1 |
| Not-approved status badge | 6.26:1 |

Verification completed for 1.2.1:

- TypeScript check, production build and all **30 existing Node tests** passed.
- The catalogue gate retained **147 profiles, 152 reference entries and 422 citations**.
- The build regenerated the WordPress viewer bundle; it is byte-identical to `dist/shared/viewer.js` and contains the source CSS verbatim.
- The actual Node application was inspected in the browser: populated explorer, 3.35× brain-region zoom with 11 matching profiles, standalone profile, and signed-out workspace screen.
- The private viewing preview was rebuilt from the same application source. The explorer, library and profile were inspected in 390 × 844 frames (375 px content width after the scrollbar); each document's scroll width equalled its content width.
- Body and heading font stacks and the navy/ivory surfaces were checked against the rendered browser styles.

Authenticated workspace screens were reviewed in source; an authenticated browser session was not used for this patch. The prior WordPress Playground run remains the existing connector verification record and was not repeated for this visual update. Phone-width browser frames verify responsive layout, not a physical phone or touch-device test.

The private preview continues to be a read-only snapshot. It does not replace deployment of the complete Node backend or create another editable knowledge base.
