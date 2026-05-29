/**
 * CanvasLens Web Component — image viewing & annotation built on HTML5 Canvas.
 *
 * @example
 * ```html
 * <canvas-lens
 *   src="https://example.com/image.jpg"
 *   width="800px"
 *   height="600px"
 *   tools='{"zoom": true, "pan": true, "annotation": {"rect": true}}'>
 * </canvas-lens>
 * ```
 */
import { OverlayManager } from './components/OverlayManager';
import { App } from './core/App';
import { AttributeBinder } from './input/AttributeBinder';
import type { Annotation, CustomImageData, Point, ToolConfig } from './types';
import { ErrorType } from './types';
import { ErrorHandler } from './utils/core/error-handler';
import { error, warn } from './utils/core/logger';

const OBSERVED_ATTRIBUTES = [
  'src',
  'width',
  'height',
  'background-color',
  'tools',
  'max-zoom',
  'min-zoom',
  'image-type',
  'file-name'
] as const;

export class CanvasLens extends HTMLElement {
  private app: App | null = null;
  private overlayManager: OverlayManager;
  private hasUnsavedChanges = false;

  static get observedAttributes(): readonly string[] {
    return OBSERVED_ATTRIBUTES;
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.overlayManager = new OverlayManager(this);
  }

  connectedCallback(): void {
    if (this.app) return;
    this.initialiseApp();
    this.loadInitialImage();
  }

  private initialiseApp(): void {
    try {
      const container = this.createContainer();
      const options = AttributeBinder.read(this, container);
      // App dispatches DOM CustomEvents on `element` directly (used to be
      // EventManager's job; removed in Phase 6).
      this.app = new App({ ...options, container, element: this });
      this.ensureCanvasSize();
    } catch (err) {
      ErrorHandler.handleError(err as Error, { element: this, operation: 'connectedCallback' });
      throw err;
    }
  }

  disconnectedCallback(): void {
    this.app?.destroy();
    this.app = null;
    this.overlayManager.destroy();
    this.hasUnsavedChanges = false;
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue || !this.app) return;
    try {
      switch (name) {
        case 'src':
          if (newValue) {
            void this.app.loadImage(
              newValue,
              this.getAttribute('image-type') ?? undefined,
              this.getAttribute('file-name') ?? undefined
            );
            this.hasUnsavedChanges = false;
          }
          break;
        case 'width':
        case 'height': {
          const { width, height } = AttributeBinder.dimensions(this);
          this.app.resize(width, height);
          break;
        }
        case 'tools':
          if (newValue !== null) this.app.updateToolConfigFromAttribute(newValue);
          break;
        case 'background-color':
          // `transparent` / `none` / empty leave the canvas pixel-cleared so
          // the page background shows through.
          this.app.setBackgroundColor(newValue ?? '');
          break;
        case 'max-zoom':
        case 'min-zoom':
          this.reinitialize();
          break;
      }
    } catch (err) {
      error(`Failed to handle attribute change for "${name}":`, err);
    }
  }

  // ─── Public API (Web Component instance methods) ───────────────────────────

  async loadImage(src: string, type?: string, fileName?: string): Promise<void> {
    return this.requireApp().loadImage(src, type, fileName);
  }

  loadImageFromFile(file: File): void {
    this.requireApp().loadImageFromFile(file);
  }

  resize(width: number, height: number): void {
    this.app?.resize(width, height);
  }

  /** Update the canvas background. `'transparent'` / `'none'` / `''` /
   *  `null` leave it pixel-cleared so the page background shows through. */
  setBackgroundColor(color: string | null | undefined): void {
    this.app?.setBackgroundColor(color);
  }

  zoomIn(factor?: number): void {
    this.app?.zoomIn(factor);
  }
  zoomOut(factor?: number): void {
    this.app?.zoomOut(factor);
  }
  zoomTo(scale: number): void {
    this.app?.zoomTo(scale);
  }
  fitToView(): void {
    this.app?.fitToView();
  }
  resetView(): void {
    this.app?.resetView();
  }

  activateTool(toolType: string): boolean {
    return this.app?.activateTool(toolType) ?? false;
  }
  deactivateTool(): boolean {
    return this.app?.deactivateTool() ?? false;
  }
  updateTools(toolConfig: ToolConfig): void {
    this.app?.updateTools(toolConfig);
  }
  getActiveTool(): string | null {
    return this.app?.getActiveTool() ?? null;
  }

  addAnnotation(annotation: Annotation): void {
    if (!this.app) return;
    this.app.addAnnotation(annotation);
    this.hasUnsavedChanges = true;
  }
  removeAnnotation(id: string): void {
    if (!this.app) return;
    this.app.removeAnnotation(id);
    this.hasUnsavedChanges = true;
  }
  clearAnnotations(): void {
    if (!this.app) return;
    this.app.clearAnnotations();
    this.hasUnsavedChanges = true;
  }
  getAnnotations(): Annotation[] {
    return this.app?.getAnnotations() ?? [];
  }
  /** Serialize the current annotation list to a JSON string. */
  exportAnnotations(): string {
    return this.app?.exportAnnotations() ?? '[]';
  }
  /**
   * Replace the current annotation list with the ones parsed from `json`.
   * Invalid annotations are skipped (logged via the error handler).
   * Pretty-printed JSON is fine; the input goes through SecureJsonParser
   * so prototype-pollution / function payloads are rejected.
   */
  importAnnotations(json: string): void {
    if (!this.app) return;
    this.app.importAnnotations(json);
    this.hasUnsavedChanges = true;
  }
  getSelectedAnnotation(): Annotation | null {
    return this.app?.getSelectedAnnotation() ?? null;
  }
  updateAnnotationStyle(id: string, partial: Record<string, unknown>): boolean {
    if (!this.app) return false;
    const ok = this.app.updateAnnotationStyle(id, partial);
    if (ok) this.hasUnsavedChanges = true;
    return ok;
  }
  updateSelectedAnnotationStyle(partial: Record<string, unknown>): boolean {
    if (!this.app) return false;
    const ok = this.app.updateSelectedAnnotationStyle(partial);
    if (ok) this.hasUnsavedChanges = true;
    return ok;
  }

  toggleComparisonMode(): void {
    this.app?.toggleComparisonMode();
  }
  setComparisonMode(enabled: boolean): void {
    this.app?.setComparisonMode(enabled);
  }
  isComparisonMode(): boolean {
    return this.app?.isComparisonMode() ?? false;
  }

  /**
   * Open the full-screen overlay editor.
   * @param options.background Background applied to the overlay frame AND
   *   the overlay canvas. Defaults to `'white'`; pass `'transparent'` to
   *   remove the white card entirely so the dark backdrop shows directly
   *   around the image.
   */
  openOverlay(options: { background?: string | null } = {}): void {
    if (!this.app) return;
    this.overlayManager.openOverlay({
      sourceApp: this.app,
      ...(options && 'background' in options ? { background: options.background } : {})
    });
  }
  closeOverlay(): void {
    this.overlayManager.closeOverlay();
  }
  isOverlayOpen(): boolean {
    return this.overlayManager.isOverlayOpen();
  }

  isImageLoaded(): boolean {
    return this.app?.isImageLoaded() ?? false;
  }
  getImageData(): CustomImageData | null {
    return this.app?.getImageData() ?? null;
  }
  getZoomLevel(): number {
    return this.app?.getZoomLevel() ?? 1;
  }
  getPanOffset(): Point {
    return this.app?.getPanOffset() ?? { x: 0, y: 0 };
  }
  hasChanges(): boolean {
    return this.hasUnsavedChanges;
  }

  /** Access the underlying App for advanced use (e.g. store/bus subscriptions). */
  getApp(): App | null {
    return this.app;
  }

  // ─── Internals ─────────────────────────────────────────────────────────────

  private requireApp(): App {
    if (!this.app) {
      throw ErrorHandler.createError(ErrorType.INITIALIZATION, 'CanvasLens is not connected');
    }
    return this.app;
  }

  private createContainer(): HTMLElement {
    const shadow = this.shadowRoot;
    if (!shadow) {
      throw ErrorHandler.createError(ErrorType.INITIALIZATION, 'Shadow root not available');
    }
    while (shadow.firstChild) shadow.removeChild(shadow.firstChild);

    const container = document.createElement('div');
    container.style.cssText = 'width:100%;height:100%;position:relative;overflow:hidden;';
    shadow.appendChild(container);
    return container;
  }

  private ensureCanvasSize(): void {
    requestAnimationFrame(() => {
      if (!this.app || this.app.isDestroyed()) return;
      const { width, height } = AttributeBinder.dimensions(this);
      if (width > 0 && height > 0) this.app.resize(width, height);
    });
  }

  private loadInitialImage(): void {
    const src = this.getAttribute('src');
    if (src && this.app) {
      void this.app
        .loadImage(
          src,
          this.getAttribute('image-type') ?? undefined,
          this.getAttribute('file-name') ?? undefined
        )
        .catch(() => {
          warn('Initial image load failed');
        });
    }
  }

  private reinitialize(): void {
    if (!this.app) return;
    const currentImageData = this.app.getImageData();
    // Tear down and re-create the App without re-running `loadInitialImage`
    // — we restore the in-memory image element below instead. This avoids
    // double-loading the same image (initial src + element).
    this.app.destroy();
    this.app = null;
    this.overlayManager.destroy();
    this.hasUnsavedChanges = false;
    this.initialiseApp();
    if (currentImageData && this.app) {
      const app = this.app as App;
      app.loadImageElement(
        currentImageData.element,
        currentImageData.type,
        currentImageData.fileName
      );
    } else {
      this.loadInitialImage();
    }
  }
}

if (!customElements.get('canvas-lens')) {
  customElements.define('canvas-lens', CanvasLens);
}
