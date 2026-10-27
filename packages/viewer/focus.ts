import { validCategory, type CategoryId } from './categories';

/** Coordinates are normalized to the original, uncropped anatomy artwork. */
export const ANATOMY_REGIONS: Record<CategoryId, {
  x: number; y: number; width: number; height: number; zoom: number;
}> = {
  brain: { x: .50, y: .073, width: .16, height: .105, zoom: 3.35 },
  skin: { x: .31, y: .257, width: .13, height: .15, zoom: 2.15 },
  digestive: { x: .50, y: .371, width: .21, height: .13, zoom: 2.65 },
  immune: { x: .435, y: .235, width: .115, height: .075, zoom: 2.85 },
  hormones: { x: .50, y: .163, width: .13, height: .075, zoom: 3.15 },
  musculoskeletal: { x: .40, y: .674, width: .14, height: .17, zoom: 2.2 },
  cardiovascular: { x: .552, y: .267, width: .12, height: .08, zoom: 3.0 },
  reproductive: { x: .50, y: .488, width: .17, height: .10, zoom: 2.65 },
};

export interface ImageFrame { left: number; top: number; width: number; height: number; }
export interface FocusTransform { x: number; y: number; scale: number; }

/** Match object-fit:contain without changing the artwork's proportions. */
export function fitAnatomy(frameWidth: number, frameHeight: number, imageWidth: number, imageHeight: number): ImageFrame {
  if (![frameWidth, frameHeight, imageWidth, imageHeight].every(value => Number.isFinite(value) && value > 0)) {
    return { left: 0, top: 0, width: 0, height: 0 };
  }
  const ratio = Math.min(frameWidth / imageWidth, frameHeight / imageHeight);
  const width = imageWidth * ratio;
  const height = imageHeight * ratio;
  return { left: (frameWidth - width) / 2, top: (frameHeight - height) / 2, width, height };
}

/** Place the selected anatomy in the upper-middle of the visible frame. */
export function focusTransform(category: CategoryId | null, box: ImageFrame, frameWidth: number, frameHeight: number): FocusTransform {
  if (!category || box.width <= 0 || box.height <= 0) return { x: 0, y: 0, scale: 1 };
  const region = ANATOMY_REGIONS[category];
  return {
    x: frameWidth * .5 - box.left - region.x * box.width * region.zoom,
    y: frameHeight * .43 - box.top - region.y * box.height * region.zoom,
    scale: region.zoom,
  };
}

/** Transient exploration never overwrites the category committed by a click. */
export class AnatomySelection {
  selected: CategoryId | null;
  hovered: CategoryId | null = null;
  focused: CategoryId | null = null;
  constructor(category?: string | null) { this.selected = validCategory(category); }
  get preview(): CategoryId | null { return this.hovered ?? this.focused; }
  get active(): CategoryId | null { return this.preview ?? this.selected; }
  setSelected(category?: string | null) { this.selected = validCategory(category); }
  hover(category?: string | null) { this.hovered = validCategory(category); }
  focus(category?: string | null) { this.focused = validCategory(category); }
  commit(category: CategoryId) { this.selected = category; this.hovered = null; this.focused = null; }
  reset() { this.selected = null; this.hovered = null; this.focused = null; }
}
