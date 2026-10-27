# Shared anatomical viewer

Version: 1.2.0. The viewer uses an original, high-resolution adult human illustration created for Peptide Atlas. It is a navigation illustration, not a diagnostic anatomy reference. The same image and interactions are bundled into the Node application and every connector; no remote image service or WebGL support is required.

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
