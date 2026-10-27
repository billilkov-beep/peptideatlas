import { ANATOMICAL_IMAGE } from './asset';
import { CATEGORY_META, validCategory, VIEWER_VERSION, type CategoryId } from './categories';
import { ANATOMY_REGIONS, AnatomySelection, fitAnatomy, focusTransform } from './focus';

export { CATEGORY_META, VIEWER_VERSION } from './categories';
export type { CategoryId } from './categories';

export interface HumanViewerOptions {
  selectedCategory?: string | null;
  onSelect?: (category: string | null) => void;
  /** Hover/focus previews are temporary; null restores the committed selection. */
  onHover?: (category: string | null) => void;
  /** Hosts that already provide a heading may hide the built-in category heading. */
  showHeading?: boolean;
  interactive?: boolean;
}

export interface HumanViewerHandle {
  setCategory(category: string | null): void;
  destroy(): void;
}

const mounted = new WeakMap<HTMLElement, HumanViewerHandle>();

const styles = `
:host{display:block;position:relative;width:100%;height:100%;min-height:440px;contain:content}
*{box-sizing:border-box}
.viewer{position:relative;width:100%;height:100%;min-height:440px;overflow:hidden;background:#f5f7f3;color:#183e37;font:400 13px/1.4 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;isolation:isolate}
.viewer:before{content:"";position:absolute;inset:10% 0 6%;background:radial-gradient(ellipse at 50% 48%,#e6ece777 0%,#eff3ef22 45%,transparent 73%);pointer-events:none}
.heading{position:absolute;top:8px;left:10px;right:10px;z-index:4;text-align:center;pointer-events:none}
.heading-overline{font-size:8px;font-weight:650;letter-spacing:2px;color:#778b80;text-transform:uppercase;margin:0 0 7px}
.heading h2{font:400 25px/1.16 Georgia,"Times New Roman",serif;letter-spacing:-.5px;margin:0 auto;color:#23483e;max-width:80%;text-wrap:balance}
.figure-stage{position:absolute;inset:10px 3px 38px;overflow:hidden;touch-action:pan-y}
.with-heading .figure-stage{top:77px}
.plane{position:absolute;transform-origin:0 0;transition:transform 660ms cubic-bezier(.22,.72,.18,1);will-change:transform;mix-blend-mode:multiply}
.body-image{display:block;position:absolute;inset:0;width:100%;height:100%;object-fit:contain;user-select:none;-webkit-user-drag:none;pointer-events:none}
.points{position:absolute;inset:0;pointer-events:none}
.hotspot{appearance:none;-webkit-appearance:none;position:absolute;display:grid;place-items:center;min-width:26px;min-height:26px;padding:0;margin:0;transform:translate(-50%,-50%);border:0;background:transparent;color:#184b3c;cursor:pointer;pointer-events:auto;outline:none;font:inherit;border-radius:45%}
.pin{display:block;position:relative;width:13px;height:13px;flex:none;border:1.5px solid #f7faf7;border-radius:50%;background:#355f4cb8;box-shadow:0 0 0 1px #27513b80,0 1px 5px #173b3a28;transform:scale(var(--inverse-zoom,1));transition:background 180ms,box-shadow 180ms}
.pin:after{content:"";position:absolute;inset:-6px;border:1px solid #fafdf5b0;border-radius:50%;opacity:0;transition:opacity 180ms}
.hotspot:hover .pin,.hotspot:focus-visible .pin,.hotspot.is-active .pin{background:#235a42;box-shadow:0 0 0 1px #274f3a,0 0 0 7px #91af8a3b}
.hotspot.is-active .pin:after,.hotspot:focus-visible .pin:after{opacity:1}
.hotspot:focus-visible{outline:1px solid #376f55;outline-offset:2px}
.hotspot[aria-pressed="true"] .pin{background:#285c41}
.hotspot[disabled]{pointer-events:none}
.focus-glow{position:absolute;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(ellipse,#72ac8628 0%,#91b49c18 45%,transparent 72%);border:1px solid #517d601c;opacity:0;pointer-events:none;transition:opacity 220ms}
.has-focus .focus-glow{opacity:1}
.reset{appearance:none;position:absolute;z-index:6;right:10px;top:7px;display:flex;align-items:center;justify-content:center;gap:5px;padding:7px 9px;background:#ffffffd9;border:1px solid #d6dfd6;color:#526e5b;border-radius:7px;font:500 10px/1 system-ui,sans-serif;cursor:pointer;box-shadow:0 1px 4px #29483c08}
.with-heading .reset{top:76px}
.reset:hover{background:#fff;color:#244f38;border-color:#9bb5a3}
.reset:focus-visible{outline:2px solid #315f46;outline-offset:3px}
.reset svg{height:12px;width:12px}
.reset[hidden]{display:none}
.hint{position:absolute;left:15px;right:15px;bottom:8px;display:flex;align-items:center;justify-content:center;gap:7px;color:#6d8175;font-size:10px;line-height:1.5;letter-spacing:.04px;text-align:center;pointer-events:none}
.hint svg{width:13px;height:13px;flex:none;opacity:.75}
.loading{position:absolute;inset:42% 15% auto;text-align:center;font-size:12px;color:#6b8172;pointer-events:none}
.image-ready .loading{display:none}
.image-error .loading{font-size:13px;line-height:1.65}
.image-error .plane{opacity:.25}
.image-error .points{pointer-events:auto}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.viewer.is-static .pin{display:none}
@media(max-width:520px){.heading h2{font-size:22px}.hint{font-size:9px}.reset{right:7px;padding:7px}.heading-overline{font-size:8px}}
@media(prefers-reduced-motion:reduce){.plane,.pin,.pin:after,.focus-glow{transition:none}.plane{will-change:auto}}
`;

/** One original anatomical illustration and identical interactions on every host. */
export function mountHumanViewer(element: HTMLElement, options: HumanViewerOptions = {}): HumanViewerHandle {
  mounted.get(element)?.destroy();
  const interactive = options.interactive !== false;
  const showHeading = options.showHeading !== false;
  const shadow = element.shadowRoot ?? element.attachShadow({ mode: 'open' });
  const selection = new AnatomySelection(options.selectedCategory);
  const releases: Array<() => void> = [];
  let destroyed = false;
  let lastPreview: CategoryId | null = null;
  let blurTimer: ReturnType<typeof setTimeout> | undefined;
  let zoomLockedUntil = 0;
  let previousActive: CategoryId | null = null;
  let lastPointer = { x: -1, y: -1 };

  shadow.innerHTML = `<style>${styles}</style><section class="viewer ${showHeading ? 'with-heading' : ''} ${interactive ? '' : 'is-static'}" aria-label="Interactive anatomical body explorer" data-viewer-version="${VIEWER_VERSION}">
    ${showHeading ? '<header class="heading"><p class="heading-overline">The human atlas</p><h2>Explore the body</h2></header>' : ''}
    <div class="figure-stage"><div class="plane"><img class="body-image" alt="Detailed anatomical illustration of an adult human body" draggable="false"><div class="focus-glow"></div><div class="points" role="group" aria-label="Body systems"></div></div><p class="loading" role="status">Loading anatomy…</p></div>
    <button type="button" class="reset" aria-label="Reset to full body and show all systems" title="Reset to full body" ${interactive ? '' : 'hidden'}><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M3 8a7 7 0 1 1 1.5 6M3 3v5h5"/></svg>Full body</button>
    <div class="hint"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="m6 3 8 8-4 .7L8 16Z"/></svg><span>${interactive ? 'Hover to zoom · Click an area to explore' : 'Anatomical body explorer'}</span></div>
    <p class="sr-only" aria-live="polite" aria-atomic="true"></p>
  </section>`;
  const viewer = shadow.querySelector<HTMLElement>('.viewer')!;
  const stage = shadow.querySelector<HTMLElement>('.figure-stage')!;
  const plane = shadow.querySelector<HTMLElement>('.plane')!;
  const image = shadow.querySelector<HTMLImageElement>('.body-image')!;
  const points = shadow.querySelector<HTMLElement>('.points')!;
  const glow = shadow.querySelector<HTMLElement>('.focus-glow')!;
  const heading = shadow.querySelector<HTMLElement>('.heading h2');
  const status = shadow.querySelector<HTMLElement>('.sr-only')!;
  const resetButton = shadow.querySelector<HTMLButtonElement>('.reset')!;
  const buttons = new Map<CategoryId, HTMLButtonElement>();

  function listen<T extends Event>(target: EventTarget, name: string, handler: (event: T) => void) {
    target.addEventListener(name, handler as EventListener);
    releases.push(() => target.removeEventListener(name, handler as EventListener));
  }

  function publishPreview() {
    if (selection.preview !== lastPreview) {
      lastPreview = selection.preview;
      options.onHover?.(lastPreview);
    }
  }

  function render() {
    if (destroyed) return;
    const active = selection.active;
    if (active !== previousActive) {
      previousActive = active;
      // Transformed targets must not select another region as the camera moves
      // underneath a stationary pointer.
      zoomLockedUntil = performance.now() + 680;
    }
    const meta = CATEGORY_META.find(category => category.id === active);
    if (heading) heading.textContent = meta?.label ?? 'Explore the body';
    viewer.classList.toggle('has-focus', active !== null);
    viewer.dataset.activeCategory = active ?? '';
    viewer.dataset.selectedCategory = selection.selected ?? '';
    viewer.dataset.previewCategory = selection.preview ?? '';
    for (const [id, button] of buttons) {
      button.setAttribute('aria-pressed', String(selection.selected === id));
      button.classList.toggle('is-active', active === id);
    }
    if (active) {
      const region = ANATOMY_REGIONS[active];
      glow.style.left = `${region.x * 100}%`;
      glow.style.top = `${region.y * 100}%`;
      glow.style.width = `${region.width * 100}%`;
      glow.style.height = `${region.height * 100}%`;
    }
    const frameWidth = stage.clientWidth;
    const frameHeight = stage.clientHeight;
    const box = fitAnatomy(frameWidth, frameHeight, image.naturalWidth || 1024, image.naturalHeight || 1536);
    plane.style.left = `${box.left}px`;
    plane.style.top = `${box.top}px`;
    plane.style.width = `${box.width}px`;
    plane.style.height = `${box.height}px`;
    const transform = focusTransform(active, box, frameWidth, frameHeight);
    viewer.dataset.zoom = String(transform.scale);
    plane.style.transform = `translate(${transform.x}px,${transform.y}px) scale(${transform.scale})`;
    plane.style.setProperty('--inverse-zoom', String(1 / transform.scale));
    status.textContent = meta ? `${meta.label}. ${selection.preview ? 'Previewing. Press Enter or click to select.' : 'Selected.'}` : 'Full body. Hover or focus an area to zoom, then click or press Enter to select a system.';
  }

  function previewCategory(category: CategoryId) {
    if (!interactive || destroyed || selection.hovered === category) return;
    selection.hover(category);
    publishPreview();
    render();
  }

  function clearPointerPreview() {
    if (destroyed) return;
    selection.hover(null);
    publishPreview();
    render();
  }

  function reset() {
    if (!interactive || destroyed) return;
    selection.reset();
    publishPreview();
    render();
    options.onSelect?.(null);
  }

  for (const category of CATEGORY_META) {
    const region = ANATOMY_REGIONS[category.id];
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'hotspot';
    button.dataset.category = category.id;
    button.setAttribute('aria-label', `Explore ${category.label.toLowerCase()}`);
    button.setAttribute('aria-pressed', String(selection.selected === category.id));
    button.style.left = `${region.x * 100}%`;
    button.style.top = `${region.y * 100}%`;
    button.style.width = `${region.width * 100}%`;
    button.style.height = `${region.height * 100}%`;
    button.disabled = !interactive;
    const pin = document.createElement('span');
    pin.className = 'pin';
    pin.setAttribute('aria-hidden', 'true');
    button.append(pin);
    points.append(button);
    buttons.set(category.id, button);

    listen<PointerEvent>(button, 'pointerenter', event => {
      if (event.pointerType !== 'touch' && performance.now() >= zoomLockedUntil) previewCategory(category.id);
    });
    listen<PointerEvent>(button, 'pointermove', event => {
      if (event.pointerType === 'touch' || performance.now() < zoomLockedUntil) return;
      if (Math.hypot(event.clientX - lastPointer.x, event.clientY - lastPointer.y) < 2) return;
      lastPointer = { x: event.clientX, y: event.clientY };
      previewCategory(category.id);
    });
    listen<FocusEvent>(button, 'focus', () => {
      if (!interactive || destroyed) return;
      if (blurTimer) clearTimeout(blurTimer);
      selection.focus(category.id);
      publishPreview();
      render();
    });
    listen<FocusEvent>(button, 'blur', () => {
      if (blurTimer) clearTimeout(blurTimer);
      blurTimer = setTimeout(() => {
        if (destroyed || points.contains(shadow.activeElement)) return;
        selection.focus(null);
        publishPreview();
        render();
      }, 0);
    });
    listen<MouseEvent>(button, 'click', () => {
      if (!interactive || destroyed) return;
      selection.commit(category.id);
      publishPreview();
      render();
      options.onSelect?.(category.id);
    });
    listen<KeyboardEvent>(button, 'keydown', event => {
      const index = CATEGORY_META.findIndex(item => item.id === category.id);
      let next: number | undefined;
      if (['ArrowDown', 'ArrowRight'].includes(event.key)) next = (index + 1) % CATEGORY_META.length;
      if (['ArrowUp', 'ArrowLeft'].includes(event.key)) next = (index - 1 + CATEGORY_META.length) % CATEGORY_META.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = CATEGORY_META.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        selection.hover(null);
        buttons.get(CATEGORY_META[next].id)?.focus();
      }
    });
  }

  listen<PointerEvent>(stage, 'pointerleave', clearPointerPreview);
  listen<PointerEvent>(stage, 'pointercancel', clearPointerPreview);
  // A hover can move the original hit target away from the pointer. Clicking
  // the figure still commits the visible preview instead of becoming a dead click.
  listen<MouseEvent>(stage, 'click', event => {
    if (!interactive || destroyed || !selection.preview || (event.target as HTMLElement).closest('.hotspot')) return;
    const category = selection.preview;
    selection.commit(category);
    publishPreview();
    render();
    options.onSelect?.(category);
  });
  listen<KeyboardEvent>(viewer, 'keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); resetButton.focus(); reset(); }
  });
  listen<MouseEvent>(resetButton, 'click', reset);
  listen<Event>(image, 'load', () => { viewer.classList.add('image-ready'); viewer.classList.remove('image-error'); render(); });
  listen<Event>(image, 'error', () => {
    viewer.classList.add('image-error');
    viewer.classList.remove('image-ready');
    shadow.querySelector<HTMLElement>('.loading')!.textContent = 'The anatomy image could not load. The body-system controls remain available.';
  });
  image.src = ANATOMICAL_IMAGE;
  if (image.complete && image.naturalWidth) viewer.classList.add('image-ready');
  const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(render);
  observer?.observe(stage);
  if (!observer) listen<Event>(window, 'resize', render);
  render();

  const handle: HumanViewerHandle = {
    setCategory(category) { if (!destroyed) { selection.setSelected(validCategory(category)); render(); } },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (blurTimer) clearTimeout(blurTimer);
      observer?.disconnect();
      for (const release of releases) release();
      if (viewer.parentNode === shadow) shadow.replaceChildren();
      if (mounted.get(element) === handle) mounted.delete(element);
    },
  };
  mounted.set(element, handle);
  return handle;
}
