# Anatomical explorer update — 1.2.0

The shared human viewer now uses an original, detailed monochrome adult anatomical illustration. The same embedded asset and component are delivered in the central Node application, WordPress plugin, and other website connectors. The illustration is navigational artwork, not a diagnostic anatomy image.

Hovering or keyboard-focusing a region previews its category and smoothly zooms to that region. Clicking or tapping commits the selection. A reset control returns to the full body. Reduced-motion preferences are respected. This viewer uses image transforms rather than a rotatable WebGL mesh, so the same visual is available on devices without WebGL.

The public explorer places the current category above the figure. Its peptide list uses explicit central `displayStatus` values: green for FDA approved, amber for in clinical trials, rose for not FDA approved, and purple for cosmetic/topical. Text and symbols accompany the colours. The existing broad `regulatoryStatus` remains available for other jurisdictions and backward compatibility. See `REGULATORY-DISPLAY-AUDIT.md` for the classification criteria, exceptions, and sources.

## Original illustration

- Source asset: `packages/viewer/assets/anatomical-human.png`.
- Shared embedded module: `packages/viewer/asset.ts`.
- Generated with the built-in image generation tool on 27 October 2026.
- The reference website's body asset was inspected for visual direction and is not included in the product.

Final generation brief: create a single premium monochrome 3D anatomical reference mannequin, with realistic adult proportions and a mature face, front-facing full-length stance, arms gently away from the sides, separate fingers and feet, matte ivory resin surface, and a smooth completely opaque one-piece clinical suit. Use a white background, soft contour lighting, portrait1024×1536 composition, and no text, labels, interface graphics, mechanical joints, or cartoon proportions.

The generated PNG remains intact; its bytes are embedded to avoid an external image dependency in connected websites. Update the canonical source asset and regenerate the embedded module when changing the illustration, then rebuild every connector through the normal application build.
