# Shared anatomical viewer

Version: 1.2.1. The viewer uses an original, high-resolution adult human illustration created for Peptide Atlas. It is a navigation illustration, not a diagnostic anatomy reference. The same image and interactions are bundled into the Node application and every connector; no remote image service or WebGL support is required.

```ts
import {mountHumanViewer} from './packages/viewer';

const viewer=mountHumanViewer(document.querySelector('#human')!,{
  selectedCategory:null,
  onHover(category){ /* Temporarily preview a system in the heading/list. */ },
  onSelect(category){ /* Commit the host site's category filter. */ },
  showHeading:true, // Default; false if the host provides its own heading above the figure.
});

viewer.setCategory('brain');
// On route/component unmount:
viewer.destroy();
```

Give the host an explicit height, normally 560–660 px; the minimum height is 440 px. The artwork retains its proportions in narrow and wide frames. Its styles, image, markers, and animation are protected by a Shadow DOM boundary. Site-specific branding belongs in the surrounding interface.

## Interaction

- Hover a body region to smoothly zoom and pan to it. A category heading appears above the image, and `onHover` lets the host show the corresponding profiles.
- Hover targets cover the anatomical area around each marker. Hover remains latched while the pointer stays inside the figure viewport; it does not reset when the zoom moves a target away from the pointer.
- Moving outside the figure clears the transient hover and restores the committed selection. Clicking the visible figure commits the preview even if zoom has moved its original marker.
- Click or tap a marker to select its system. Touch input commits directly without relying on hover.
- Native buttons support Tab, Enter, and Space. Arrow keys cycle between systems; Home and End focus the first or last system. Keyboard focus previews the category just like hover.
- **Full body** or Escape clears the selection and returns to the complete figure.
- Reduced-motion preferences remove camera and interface transitions.
- `setCategory` applies an external committed selection without emitting callbacks.
- `destroy` disconnects resize observers, clears pending focus handling, and removes all event listeners. Re-mounting the same host automatically disposes its previous viewer.

## Asset and category consistency

`asset.ts` embeds the original image as a PNG data URI so the distributed viewer is self-contained. `assets/anatomical-human.png` is its source artwork. `focus.ts` maps the eight stable category IDs to normalized regions and camera focus settings. The figure is not rotatable; the interface describes its actual zoom and selection controls.

Keep this package and `VIEWER_VERSION` coordinated across connectors. A future Milligram integration can import it unchanged while continuing to use the same central knowledge records.

The former procedural model and SVG source files remain as historical source assets only. The current runtime does not import or display them.

## Optional viewer theme

The host can set CSS custom properties that cross the Shadow DOM boundary. They change the surface, typography and controls while retaining the exact same image, body-region mapping, zoom behavior and keyboard/touch controls. All properties have the previous viewer styles as fallbacks, so existing WordPress and Node themes keep their appearance unless the host opts in.

```css
.my-human-viewer {
  --atlas-viewer-font: Inter, ui-sans-serif, system-ui, sans-serif;
  --atlas-viewer-heading-font: Georgia, "Times New Roman", serif;
  --atlas-viewer-surface: #f4efe4;
  --atlas-viewer-text: #302b23;
  --atlas-viewer-muted: #675d48;
  --atlas-viewer-accent: #82622b;
  --atlas-viewer-pin: #94723dcc;
  --atlas-viewer-pin-active: #82622b;
  --atlas-viewer-border: #b49a6b;
  --atlas-viewer-halo: #caa85b40;
  --atlas-viewer-shadow: #302b231a;
  --atlas-viewer-control-bg: #fffaf0ed;
  --atlas-viewer-control-hover: #fffdf7;
}
```

Optional gradient hooks are `--atlas-viewer-glow` and `--atlas-viewer-focus-fill`; `--atlas-viewer-focus-line` sets the focus-area border. The central application supplies these values from `web/src/brand-theme.css`.

Keep `--atlas-viewer-surface` light: the original image uses `mix-blend-mode: multiply` to blend its light background into the canvas. A dark canvas would obscure the anatomy. The surrounding application can use a dark theme, as the central application does.

This release updates the CSS string in the source and checked-in WordPress viewer bundle identically. The normal production build regenerates that bundle from the source.
