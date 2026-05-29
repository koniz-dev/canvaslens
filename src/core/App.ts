import { DEFAULT_CONFIG } from '../constants';
import { AnnotationManager } from '../modules/annotation';
import { AnnotationToolsConfig } from '../modules/annotation/tools';
import { createDefaultToolRegistry } from '../modules/annotation/tools/built-in-plugins';
import type { ToolPlugin } from '../modules/annotation/tools/ToolPlugin';
import { ToolRegistry } from '../modules/annotation/tools/ToolRegistry';
import { ComparisonManager } from '../modules/comparison';
import { ZoomPanHandler } from '../modules/zoom-pan';
import type {
  Annotation,
  CanvasLensOptions,
  CustomImageData,
  EventHandlers,
  Point,
  Rectangle,
  Size,
  ToolConfig
} from '../types';
import { ErrorType } from '../types';
import { ErrorHandler } from '../utils/core/error-handler';
import { error } from '../utils/core/logger';
import { getCustomImageDataOverlay, getImageData, loadImage } from '../utils/image/utils';
import { SecureJsonParser } from '../utils/security/secure-json-parser';
import type { AppEvents } from './AppEvents';
import { EventBus } from './EventBus';
import type { ModuleContext } from './ModuleContext';
import { Renderer } from './Renderer';
import { RenderScheduler } from './RenderScheduler';
import { appReducer, createInitialState } from './state';
import type { AppAction, AppState } from './state';
import { Store } from './Store';

export interface AppOptions extends CanvasLensOptions {
  container: HTMLElement;
  eventHandlers?: EventHandlers;
  /**
   * Extra ToolPlugins to register on top of the five built-ins. Use this to
   * add custom annotation tools without modifying the library:
   *
   * ```ts
   * new App({ container, plugins: [myStarTool] });
   * ```
   */
  plugins?: ToolPlugin[];
  /**
   * When set, App dispatches DOM CustomEvents on this element (mirroring
   * the bus). Used by the Web Component to surface events to library users
   * via standard DOM listeners; safe to omit otherwise.
   */
  element?: HTMLElement;
}

/**
 * App is the single orchestrator that owns the store, event bus, canvas and
 * the cooperating sub-modules (zoom/pan, annotation, comparison). It replaces
 * the former CanvasLensCore + Engine + ImageViewer chain of proxies.
 */
export class App {
  readonly store: Store<AppState, AppAction>;
  readonly bus: EventBus<AppEvents>;

  private readonly canvas: Renderer;
  private readonly scheduler: RenderScheduler;
  private options: CanvasLensOptions;
  /** Empty string / 'transparent' / 'none' = leave canvas pixel-cleared. */
  private backgroundColor: string;
  private eventHandlers: EventHandlers;

  /** Plugin registry shared with the AnnotationManager when it exists. */
  readonly toolRegistry: ToolRegistry;

  /** Host element for DOM CustomEvent dispatch (Web Component path). */
  private readonly element: HTMLElement | undefined;

  /** Stable handler so add/remove on viewStateChange match. */
  private readonly boundOnViewStateChange: () => void;

  private zoomPan: ZoomPanHandler | null = null;
  private annotation: AnnotationManager | null = null;
  private comparison: ComparisonManager | null = null;

  private customImageData: CustomImageData | null = null;
  private originalCustomImageData: CustomImageData | null = null;
  private previousImage: HTMLImageElement | null = null;

  private destroyed = false;

  constructor(options: AppOptions) {
    this.options = {
      width: DEFAULT_CONFIG.WIDTH,
      height: DEFAULT_CONFIG.HEIGHT,
      backgroundColor: DEFAULT_CONFIG.BACKGROUND_COLOR,
      tools: AnnotationToolsConfig.DEFAULT_CONFIG,
      maxZoom: DEFAULT_CONFIG.MAX_ZOOM,
      minZoom: DEFAULT_CONFIG.MIN_ZOOM,
      ...options
    };

    this.backgroundColor = this.options.backgroundColor ?? DEFAULT_CONFIG.BACKGROUND_COLOR;
    this.element = options.element;
    this.eventHandlers = this.composeEventHandlers(options.eventHandlers);

    const width = this.options.width ?? DEFAULT_CONFIG.WIDTH;
    const height = this.options.height ?? DEFAULT_CONFIG.HEIGHT;

    this.store = new Store(
      createInitialState({
        view: {
          scale: 1,
          offset: { x: 0, y: 0 },
          bounds: { width, height },
          minZoom: this.options.minZoom ?? DEFAULT_CONFIG.MIN_ZOOM,
          maxZoom: this.options.maxZoom ?? DEFAULT_CONFIG.MAX_ZOOM
        },
        tool: { active: null, config: this.options.tools ?? {}, drawing: false }
      }),
      appReducer
    );
    this.bus = new EventBus();

    this.toolRegistry = createDefaultToolRegistry();
    if (options.plugins) {
      for (const plugin of options.plugins) this.toolRegistry.register(plugin);
    }

    this.canvas = new Renderer(options.container, { width, height });
    this.canvas.imageViewer = this;

    this.boundOnViewStateChange = () => this.render();
    this.scheduler = new RenderScheduler(() => this.renderInternal());

    this.initializeModules();
    this.render();
  }

  /**
   * Wrap the caller-supplied event handlers so each one ALSO dispatches a
   * DOM CustomEvent on `this.element`. This replaces the dedicated
   * EventManager that used to live in src/components.
   *
   * Event names follow the v1 lowercase scheme (`imageLoad`, `zoomChange`,
   * …) to keep Web Component listeners working.
   */
  private composeEventHandlers(handlers?: EventHandlers): EventHandlers {
    const passthrough = handlers ?? {};
    const dispatch = (name: string, detail: unknown): void => {
      this.element?.dispatchEvent(new CustomEvent(name, { detail }));
    };
    return {
      onImageLoad: (data) => {
        passthrough.onImageLoad?.(data);
        dispatch('imageLoad', data);
      },
      onImageLoadError: (err) => {
        passthrough.onImageLoadError?.(err);
        dispatch('imageLoadError', err);
      },
      onZoomChange: (scale) => {
        passthrough.onZoomChange?.(scale);
        dispatch('zoomChange', scale);
      },
      onPanChange: (offset) => {
        passthrough.onPanChange?.(offset);
        dispatch('panChange', offset);
      },
      onAnnotationAdd: (annotation) => {
        passthrough.onAnnotationAdd?.(annotation);
        dispatch('annotationAdd', annotation);
      },
      onAnnotationRemove: (id) => {
        passthrough.onAnnotationRemove?.(id);
        dispatch('annotationRemove', id);
      },
      onToolChange: (tool) => {
        passthrough.onToolChange?.(tool);
        dispatch('toolChange', tool);
      },
      onComparisonChange: (position) => {
        passthrough.onComparisonChange?.(position);
        dispatch('comparisonChange', position);
      },
      onComparisonModeChange: (enabled) => {
        passthrough.onComparisonModeChange?.(enabled);
        dispatch('comparisonModeChange', enabled);
      }
    };
  }

  /** ModuleContext that the App provides to cooperating modules. */
  private createContext(): ModuleContext {
    return {
      bus: this.bus,
      store: this.store,
      getImageBounds: () => this.getImageBounds(),
      isImageLoaded: () => this.isImageLoaded(),
      isComparisonMode: () => this.isComparisonMode(),
      isAnnotationToolActive: () => this.annotation?.isToolActive() ?? false,
      isAnnotationDrawing: () => this.annotation?.isDrawing() ?? false,
      hasSelectedAnnotation: () => this.annotation?.hasSelectedAnnotation() ?? false,
      deselectAnnotation: () => this.annotation?.selectAnnotation(null),
      deactivateAnnotationTool: () => this.annotation?.deactivateTool(),
      requestRender: () => this.render()
    };
  }

  private initializeModules(): void {
    const tools = this.options.tools ?? AnnotationToolsConfig.DEFAULT_CONFIG;
    const ctx = this.createContext();

    if (AnnotationToolsConfig.hasZoomOrPan(tools)) {
      this.zoomPan = new ZoomPanHandler(
        this.canvas,
        {
          enableZoom: !!tools.zoom,
          enablePan: !!tools.pan,
          maxZoom: this.options.maxZoom ?? DEFAULT_CONFIG.MAX_ZOOM,
          minZoom: this.options.minZoom ?? DEFAULT_CONFIG.MIN_ZOOM,
          ctx
        },
        this.eventHandlers
      );
    }

    // viewStateChange fires from zoom/pan AND annotation drag/remove AND
    // tool drawing. Always listen so annotations re-render even when zoom
    // and pan are disabled.
    this.canvas.getElement().addEventListener('viewStateChange', this.boundOnViewStateChange);

    if (AnnotationToolsConfig.hasAnnotations(tools)) {
      this.annotation = new AnnotationManager(this.canvas, {
        enabled: true,
        eventHandlers: this.eventHandlers,
        ctx,
        registry: this.toolRegistry,
        ...(tools.annotation?.style && { defaultStyle: tools.annotation.style })
      });
      this.canvas.annotationManager = this.annotation;
    }

    if (AnnotationToolsConfig.hasComparison(tools)) {
      this.comparison = new ComparisonManager(this.canvas, {
        comparisonMode: false,
        eventHandlers: this.eventHandlers,
        ctx
      });
    }
  }

  // ─── Image loading ────────────────────────────────────────────────────────

  async loadImage(url: string, type?: string, fileName?: string): Promise<void> {
    this.assertAlive();
    this.store.dispatch({ type: 'image/load-start' });
    try {
      this.disposePreviousImage();
      this.originalCustomImageData = null;

      const image = await loadImage(url);
      const canvasSize = this.canvas.getSize();
      this.customImageData = getImageData(image, canvasSize, type, fileName);

      this.originalCustomImageData = {
        element: this.customImageData.element,
        position: { ...this.customImageData.position },
        displaySize: { ...this.customImageData.displaySize },
        naturalSize: { ...this.customImageData.naturalSize },
        type: this.customImageData.type ?? '',
        fileName: this.customImageData.fileName ?? ''
      };

      this.previousImage = this.customImageData.element;

      this.render();

      if (this.zoomPan) {
        this.zoomPan.reset();
        this.zoomPan.updateInitialViewState(this.canvas.getViewState());
        this.zoomPan.updateCursorState();
      }

      this.store.dispatch({ type: 'image/load-success', payload: this.customImageData });
      this.bus.emit('image:loaded', this.customImageData);
      this.eventHandlers.onImageLoad?.(this.customImageData);
    } catch (err) {
      error('Failed to load image:', err);
      this.store.dispatch({ type: 'image/load-error', payload: (err as Error).message });
      this.bus.emit('image:load-error', err as Error);
      this.eventHandlers.onImageLoadError?.(err as Error);
      throw err;
    }
  }

  loadImageFromFile(file: File): void {
    this.assertAlive();
    if (!file || !file.type.startsWith('image/')) {
      throw ErrorHandler.createError(ErrorType.IMAGE_LOAD, 'Invalid file: not an image', {
        fileType: file?.type,
        fileName: file?.name
      });
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (this.destroyed) return;
      if (!e.target?.result) {
        ErrorHandler.handleImageLoadError(new Error('Failed to read file'), file.name);
        return;
      }
      const img = new Image();
      img.onload = () => {
        if (this.destroyed) return;
        this.loadImageElement(img, file.type, file.name);
      };
      img.onerror = () => {
        ErrorHandler.handleImageLoadError(new Error('Failed to load image from file'), file.name);
      };
      img.src = e.target.result as string;
    };
    reader.onerror = () => {
      ErrorHandler.handleImageLoadError(new Error('Failed to read file'), file.name);
    };
    reader.readAsDataURL(file);
  }

  loadImageElement(image: HTMLImageElement, type?: string, fileName?: string): void {
    this.assertAlive();
    if (!image || !image.complete || image.naturalWidth === 0) {
      throw ErrorHandler.createError(ErrorType.IMAGE_LOAD, 'Invalid image element provided');
    }

    const canvasSize = this.canvas.getSize();
    this.customImageData = getImageData(image, canvasSize, type, fileName);

    this.render();

    if (this.zoomPan && this.customImageData) {
      this.zoomPan.reset();
      this.zoomPan.updateInitialViewState(this.canvas.getViewState());
      this.zoomPan.updateCursorState();
    }

    this.store.dispatch({ type: 'image/load-success', payload: this.customImageData });
    this.bus.emit('image:loaded', this.customImageData);
    this.eventHandlers.onImageLoad?.(this.customImageData);
  }

  loadImageElementOverlay(image: HTMLImageElement, type?: string, fileName?: string): void {
    this.assertAlive();
    if (!image || !image.complete || image.naturalWidth === 0) {
      throw ErrorHandler.createError(ErrorType.IMAGE_LOAD, 'Invalid image element provided');
    }

    const overlaySize: Size = {
      width: window.innerWidth * 0.9,
      height: window.innerHeight * 0.9 - 60
    };

    this.customImageData = getCustomImageDataOverlay(image, overlaySize, type, fileName);
    this.render();

    if (this.zoomPan && this.customImageData) {
      this.zoomPan.updateCursorState();
    }

    this.store.dispatch({ type: 'image/load-success', payload: this.customImageData });
    this.bus.emit('image:loaded', this.customImageData);
    this.eventHandlers.onImageLoad?.(this.customImageData);
  }

  // ─── View / zoom / pan ────────────────────────────────────────────────────

  /**
   * Update the canvas background colour. Pass `'transparent'`, `'none'`,
   * `null`, or an empty string to leave the canvas pixel-cleared so the
   * page background shows through.
   */
  setBackgroundColor(color: string | null | undefined): void {
    if (this.destroyed) return;
    this.backgroundColor = color ?? '';
    this.render();
  }

  resize(width: number, height: number): void {
    if (this.destroyed) return;
    this.canvas.resize({ width, height });

    if (this.customImageData) {
      this.customImageData = getImageData(
        this.customImageData.element,
        { width, height },
        this.customImageData.type,
        this.customImageData.fileName
      );
      if (this.zoomPan) {
        this.zoomPan.reset();
        this.zoomPan.updateInitialViewState(this.canvas.getViewState());
      }
    }

    this.store.dispatch({ type: 'view/set', payload: { bounds: { width, height } } });
    this.bus.emit('view:resized', { width, height });
    this.render();
  }

  zoomIn(factor: number = 1.2): void {
    this.zoomPan?.zoomIn(factor);
  }

  zoomOut(factor: number = 1.2): void {
    this.zoomPan?.zoomOut(factor);
  }

  zoomTo(scale: number): void {
    this.zoomPan?.zoomTo(scale);
  }

  setZoom(zoom: number): void {
    this.zoomTo(zoom);
  }

  fitToView(): void {
    if (!this.zoomPan) return;
    const bounds = this.getImageBounds();
    if (bounds) this.zoomPan.fitToView(bounds);
  }

  fitToViewOverlay(): void {
    if (!this.zoomPan) return;
    const bounds = this.getImageBounds();
    if (bounds) this.zoomPan.fitToViewOverlay(bounds);
  }

  resetView(): void {
    this.zoomPan?.reset();
    this.zoomPan?.updateCursorState();
  }

  // ─── Tools ────────────────────────────────────────────────────────────────

  activateTool(toolType: string): boolean {
    return this.annotation?.activateTool(toolType) ?? false;
  }

  deactivateTool(): boolean {
    if (!this.annotation) return false;
    this.annotation.deactivateTool();
    return true;
  }

  getActiveTool(): string | null {
    return this.annotation?.getActiveToolType() ?? null;
  }

  isAnnotationToolActive(): boolean {
    return this.annotation?.isToolActive() ?? false;
  }

  getActiveAnnotationToolType(): string | null {
    return this.annotation?.getActiveToolType() ?? null;
  }

  activateAnnotationTool(toolType: string): boolean {
    return this.annotation?.activateTool(toolType) ?? false;
  }

  deactivateAnnotationTool(): void {
    this.annotation?.deactivateTool();
  }

  updateToolConfig(toolConfig: ToolConfig): void {
    if (this.destroyed) return;
    this.options.tools = { ...this.options.tools, ...toolConfig };

    if (this.zoomPan && AnnotationToolsConfig.hasZoomOrPan(this.options.tools)) {
      this.zoomPan.updateOptions({
        enableZoom: !!this.options.tools.zoom,
        enablePan: !!this.options.tools.pan,
        maxZoom: this.options.maxZoom ?? DEFAULT_CONFIG.MAX_ZOOM,
        minZoom: this.options.minZoom ?? DEFAULT_CONFIG.MIN_ZOOM
      });
    }

    if (this.annotation && toolConfig.annotation) {
      this.annotation.updateToolConfig(toolConfig.annotation);
    }

    this.store.dispatch({ type: 'tool/update-config', payload: toolConfig });
  }

  /** Alias retained for the public Web Component API. */
  updateTools(toolConfig: ToolConfig): void {
    this.updateToolConfig(toolConfig);
  }

  updateToolConfigFromAttribute(value: string): void {
    const parsed = SecureJsonParser.parseToolConfig(value);
    if (!parsed) return;
    this.updateToolConfig(parsed);
  }

  // ─── Annotations ──────────────────────────────────────────────────────────

  addAnnotation(annotation: Annotation): void {
    this.annotation?.addAnnotation(annotation);
  }

  removeAnnotation(id: string): void {
    this.annotation?.removeAnnotation(id);
  }

  updateAnnotation(id: string, annotation: Annotation): void {
    if (!this.annotation) return;
    this.annotation.removeAnnotation(id);
    this.annotation.addAnnotation(annotation);
  }

  /** Partial style update for one annotation; keeps it selected. */
  updateAnnotationStyle(id: string, partial: Record<string, unknown>): boolean {
    return this.annotation?.updateAnnotationStyle(id, partial) ?? false;
  }

  /** Partial style update for the currently-selected annotation. */
  updateSelectedAnnotationStyle(partial: Record<string, unknown>): boolean {
    return this.annotation?.updateSelectedStyle(partial) ?? false;
  }

  /** Currently-selected annotation, or null. */
  getSelectedAnnotation(): Annotation | null {
    return this.annotation?.getSelectedAnnotation() ?? null;
  }

  clearAnnotations(): void {
    this.annotation?.clearAll();
  }

  getAnnotations(): Annotation[] {
    return this.annotation?.getAllAnnotations() ?? [];
  }

  exportAnnotations(): string {
    return JSON.stringify(this.getAnnotations());
  }

  importAnnotations(annotationsJson: string): void {
    const parsed = SecureJsonParser.parseAnnotations(annotationsJson);
    if (!parsed) {
      ErrorHandler.handleError(
        ErrorHandler.createError(
          ErrorType.ANNOTATION,
          'Failed to parse annotations: invalid or unsafe JSON',
          { annotationsJson: annotationsJson.substring(0, 100) }
        )
      );
      return;
    }
    this.clearAnnotations();
    parsed.forEach((a) => {
      if (a && typeof a === 'object') {
        this.addAnnotation(a as Annotation);
      }
    });
  }

  hasChanges(): boolean {
    return this.annotation?.hasChanges() ?? false;
  }

  resetChanges(): void {
    this.annotation?.resetChanges();
  }

  // ─── Comparison ───────────────────────────────────────────────────────────

  toggleComparisonMode(): void {
    if (!this.comparison) return;
    this.comparison.toggleComparisonMode();
    this.render();
  }

  setComparisonMode(enabled: boolean): void {
    if (!this.comparison) return;
    this.comparison.setComparisonMode(enabled);
    this.render();
  }

  isComparisonMode(): boolean {
    return this.comparison?.isComparisonMode() ?? false;
  }

  getComparisonManager(): ComparisonManager | null {
    return this.comparison;
  }

  // ─── State queries ────────────────────────────────────────────────────────

  isImageLoaded(): boolean {
    return this.customImageData !== null;
  }

  getImageData(): CustomImageData | null {
    return this.customImageData;
  }

  getZoomLevel(): number {
    return this.zoomPan?.getZoomLevel() ?? 1;
  }

  getPanOffset(): Point {
    return this.zoomPan?.getPanOffset() ?? { x: 0, y: 0 };
  }

  getImageBounds(): Rectangle | null {
    if (!this.customImageData) return null;
    return {
      x: this.customImageData.position.x,
      y: this.customImageData.position.y,
      width: this.customImageData.displaySize.width,
      height: this.customImageData.displaySize.height
    };
  }

  getCanvasSize(): Size {
    return this.canvas.getSize();
  }

  getOptions(): CanvasLensOptions {
    return { ...this.options };
  }

  // ─── Sub-module access (kept for module cross-references; will be removed in Phase 3) ─

  getCanvas(): Renderer {
    return this.canvas;
  }

  getZoomPanHandler(): ZoomPanHandler | null {
    return this.zoomPan;
  }

  getAnnotationManager(): AnnotationManager | null {
    return this.annotation;
  }

  // ─── Event handlers ───────────────────────────────────────────────────────

  setEventHandlers(handlers: EventHandlers): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
    this.zoomPan?.setEventHandlers(this.eventHandlers);
    this.annotation?.setEventHandlers(this.eventHandlers);
    this.comparison?.setEventHandlers(this.eventHandlers);
  }

  updateOptions(options: Partial<CanvasLensOptions>): void {
    this.options = { ...this.options, ...options };
    if (options.width || options.height) {
      this.canvas.resize({
        width: this.options.width ?? DEFAULT_CONFIG.WIDTH,
        height: this.options.height ?? DEFAULT_CONFIG.HEIGHT
      });
    }
    if ('eventHandlers' in options && options.eventHandlers) {
      this.setEventHandlers(options.eventHandlers);
    }
  }

  // ─── Rendering ────────────────────────────────────────────────────────────

  /** Public render — synchronous; the legacy modules call this through the
   * `imageViewer` reference on the canvas. */
  render(): void {
    if (this.destroyed) return;
    this.renderInternal();
  }

  /** Request a render on the next animation frame. */
  requestRender(reason?: string): void {
    this.scheduler.request(reason);
  }

  private renderInternal(): void {
    if (!this.customImageData) {
      this.canvas.clearWithBackground(this.backgroundColor);
      return;
    }

    if (this.comparison?.isComparisonMode()) {
      this.renderComparison();
      return;
    }

    const ctx = this.canvas.getContext();

    this.canvas.clearWithBackground(this.backgroundColor);
    this.canvas.applyViewTransform();

    try {
      ctx.drawImage(
        this.customImageData.element,
        this.customImageData.position.x,
        this.customImageData.position.y,
        this.customImageData.displaySize.width,
        this.customImageData.displaySize.height
      );
    } catch (err) {
      error('Error drawing image:', err);
    }

    this.annotation?.render();
    this.canvas.restoreViewTransform();
  }

  private renderComparison(): void {
    if (!this.comparison || !this.customImageData || !this.originalCustomImageData) return;

    const ctx = this.canvas.getContext();
    const canvasSize = this.canvas.getSize();

    this.canvas.clearWithBackground(this.backgroundColor);
    this.canvas.applyViewTransform();

    const state = this.comparison.getState();
    const imageBounds = this.getImageBounds();
    const sliderX = imageBounds
      ? imageBounds.x + (imageBounds.width * state.sliderPosition) / 100
      : (canvasSize.width * state.sliderPosition) / 100;

    ctx.drawImage(
      this.originalCustomImageData.element,
      this.originalCustomImageData.position.x,
      this.originalCustomImageData.position.y,
      this.originalCustomImageData.displaySize.width,
      this.originalCustomImageData.displaySize.height
    );

    ctx.save();
    ctx.beginPath();
    if (imageBounds) {
      ctx.rect(imageBounds.x, imageBounds.y, sliderX - imageBounds.x, imageBounds.height);
    } else {
      ctx.rect(0, 0, sliderX, canvasSize.height);
    }
    ctx.clip();

    ctx.drawImage(
      this.customImageData.element,
      this.customImageData.position.x,
      this.customImageData.position.y,
      this.customImageData.displaySize.width,
      this.customImageData.displaySize.height
    );

    this.annotation?.render();
    ctx.restore();

    const isNearSlider = this.comparison.isCursorNearSliderArea();
    this.drawComparisonSlider(ctx, sliderX, isNearSlider);

    this.canvas.restoreViewTransform();
  }

  private drawComparisonSlider(
    ctx: CanvasRenderingContext2D,
    x: number,
    isNearSlider: boolean
  ): void {
    const sliderWidth = 4;
    const sliderColor = '#ffffff';
    const tolerance = 35;

    const imageBounds = this.getImageBounds();
    if (!imageBounds) return;

    if (isNearSlider) {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(x - tolerance, imageBounds.y, tolerance * 2, imageBounds.height);
      ctx.restore();
    }

    ctx.save();
    ctx.strokeStyle = sliderColor;
    ctx.lineWidth = sliderWidth;
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.moveTo(x, imageBounds.y);
    ctx.lineTo(x, imageBounds.y + imageBounds.height);
    ctx.stroke();

    const handleSize = 20;
    const handleY = imageBounds.y + imageBounds.height / 2;

    ctx.fillStyle = sliderColor;
    ctx.beginPath();
    ctx.arc(x, handleY, handleSize / 2, 0, 2 * Math.PI);
    ctx.fill();

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }

  private disposePreviousImage(): void {
    if (this.previousImage && this.previousImage !== this.customImageData?.element) {
      this.previousImage.src = '';
      this.previousImage = null;
    }
  }

  private assertAlive(): void {
    if (this.destroyed) {
      throw ErrorHandler.createError(ErrorType.INITIALIZATION, 'App has been destroyed');
    }
  }

  isDestroyed(): boolean {
    return this.destroyed;
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;

    this.canvas.getElement().removeEventListener('viewStateChange', this.boundOnViewStateChange);

    this.scheduler.destroy();
    this.bus.emit('destroy', undefined);
    this.bus.clear();

    this.zoomPan?.destroy();
    this.annotation?.destroy();
    this.comparison?.destroy();
    this.canvas.destroy();
    this.store.clear();

    this.zoomPan = null;
    this.annotation = null;
    this.comparison = null;
    this.customImageData = null;
    this.originalCustomImageData = null;
    this.previousImage = null;
  }
}
