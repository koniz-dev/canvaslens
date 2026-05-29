import { App } from '../core/App';
import type { Annotation, CanvasLensOptions } from '../types';
import { OverlayShell } from '../ui/OverlayShell';
import { error, warn } from '../utils/core/logger';

export interface OverlayOpenOptions {
  /** App from the host CanvasLens — used to copy image, options, and
   *  annotations into the overlay editor. */
  sourceApp: App;
  /** Mirror annotation changes from the overlay back to the source App
   *  whenever annotationAdd/Remove fires in the overlay. Default: true. */
  syncAnnotations?: boolean;
  /**
   * Background colour applied to BOTH the overlay's inner frame card and
   * the overlay's canvas. Defaults to `'white'` (the classic editor card).
   * Pass `'transparent'` / `'none'` / `''` / `null` to remove the white
   * card AND make the canvas transparent — the dark backdrop then shows
   * directly around the image with no white margins.
   */
  background?: string | null;
  /** @deprecated Use `background` instead. */
  frameBackground?: string | null;
}

/**
 * Owns the full-screen overlay editor instance: shows the modal shell,
 * spins up a second App seeded with the host's image + annotations, and
 * tears everything down (syncing edits back) on close.
 *
 * Phase 5 narrowed this to orchestration; the DOM scaffolding lives in
 * `ui/OverlayShell.ts`.
 */
export class OverlayManager {
  private element: HTMLElement;
  private shell: OverlayShell | null = null;
  private overlayApp: App | null = null;
  private overlayOpen = false;
  private sourceApp: App | null = null;
  private syncAnnotations = true;
  /** Manual fallback config when openOverlay is called without a sourceApp. */
  private originalOptions: CanvasLensOptions | null = null;

  constructor(element: HTMLElement) {
    this.element = element;
  }

  /** Override what options the overlay App should use when no sourceApp is
   *  passed. Kept for legacy / standalone use. */
  setOriginalOptions(options: CanvasLensOptions): void {
    this.originalOptions = options;
  }

  /**
   * Open the overlay. Preferred form: pass `{ sourceApp }` so the overlay
   * inherits the host's tools, image, and annotations. The legacy form
   * (no arguments) opens a hardcoded fallback layout — useful for one-off
   * demos but no image will be present.
   */
  openOverlay(options?: OverlayOpenOptions): void {
    if (this.overlayOpen) {
      warn('Overlay is already open');
      return;
    }

    try {
      this.sourceApp = options?.sourceApp ?? null;
      this.syncAnnotations = options?.syncAnnotations ?? true;

      const background =
        options && 'background' in options
          ? options.background
          : options && 'frameBackground' in options
            ? options.frameBackground
            : 'white';

      this.shell = new OverlayShell({
        onClose: () => this.closeOverlay(),
        frameBackground: background
      });

      const seed = this.buildSeedOptions();
      // Reflow first so canvasFrame.clientWidth / clientHeight settle.
      const frameW = this.shell.canvasFrame.clientWidth;
      const frameH = this.shell.canvasFrame.clientHeight;

      this.overlayApp = new App({
        ...seed,
        container: this.shell.canvasFrame,
        width: frameW > 0 ? frameW : 1200,
        height: frameH > 0 ? frameH : 800,
        // The canvas itself also follows the chosen background so a
        // 'transparent' overlay shows the dark backdrop around the image
        // (otherwise the canvas's own default fill would paint a margin).
        backgroundColor: background ?? 'transparent'
      });

      // Seed the overlay with the source's loaded image (if any).
      const sourceImage = this.sourceApp?.getImageData();
      if (sourceImage?.element) {
        this.overlayApp.loadImageElement(
          sourceImage.element,
          sourceImage.type,
          sourceImage.fileName
        );
      }

      // Copy existing annotations across so the overlay can edit them in
      // context. We deep-clone so edits don't mutate the source until close.
      if (this.sourceApp) {
        for (const a of this.sourceApp.getAnnotations()) {
          this.overlayApp.addAnnotation(cloneAnnotation(a));
        }
      }

      this.shell.show();
      this.overlayOpen = true;
    } catch (err) {
      error('Failed to open overlay:', err);
      this.closeOverlay();
    }
  }

  closeOverlay(): void {
    if (!this.overlayOpen && !this.shell) return;
    try {
      // Sync edits back to the source App before tearing down.
      if (this.syncAnnotations && this.sourceApp && this.overlayApp) {
        const edited = this.overlayApp.getAnnotations().map(cloneAnnotation);
        this.sourceApp.clearAnnotations();
        for (const a of edited) this.sourceApp.addAnnotation(a);
      }

      this.shell?.hide();
      this.overlayApp?.destroy();
      this.overlayApp = null;
      this.shell?.destroy();
      this.shell = null;
      this.sourceApp = null;
      this.overlayOpen = false;
    } catch (err) {
      error('Failed to close overlay:', err);
    }
  }

  isOverlayOpen(): boolean {
    return this.overlayOpen;
  }

  /** Access the overlay App (when open) — useful for syncing annotations. */
  getOverlayApp(): App | null {
    return this.overlayApp;
  }

  /** @deprecated alias for getOverlayApp; kept for older callers. */
  getOverlayCanvasLens(): App | null {
    return this.overlayApp;
  }

  private buildSeedOptions(): CanvasLensOptions {
    if (this.sourceApp) {
      const opts = this.sourceApp.getOptions();
      const seed: CanvasLensOptions = { container: this.element };
      if (opts.width !== undefined) seed.width = opts.width;
      if (opts.height !== undefined) seed.height = opts.height;
      if (opts.backgroundColor !== undefined) seed.backgroundColor = opts.backgroundColor;
      if (opts.tools !== undefined) seed.tools = opts.tools;
      if (opts.maxZoom !== undefined) seed.maxZoom = opts.maxZoom;
      if (opts.minZoom !== undefined) seed.minZoom = opts.minZoom;
      return seed;
    }
    if (this.originalOptions) return this.originalOptions;
    return {
      container: this.element,
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
      tools: {
        zoom: true,
        pan: true,
        annotation: {
          rect: true,
          arrow: true,
          text: true,
          circle: true,
          line: true
        },
        comparison: true
      }
    };
  }

  destroy(): void {
    this.closeOverlay();
  }
}

function cloneAnnotation(a: Annotation): Annotation {
  return {
    ...a,
    points: a.points.map((p) => ({ ...p })),
    style: { ...a.style },
    ...(a.data ? { data: { ...a.data } } : {})
  };
}
