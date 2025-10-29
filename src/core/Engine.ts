import { DEFAULT_CONFIG } from '../constants';
import { AnnotationToolsConfig, ImageViewer } from '../modules';
import type {
  Annotation,
  AnnotationManagerOptions,
  CanvasLensOptions,
  ComparisonOptions,
  CustomImageData,
  EventHandlers,
  Size,
  ToolConfig,
  ZoomPanOptions
} from '../types';
import { warn } from '../utils/core/logger';

export class Engine {
  private container: HTMLElement;
  private imageViewer: ImageViewer;
  private options: CanvasLensOptions;
  private eventHandlers: EventHandlers;

  constructor(options: CanvasLensOptions) {
    this.container = options.container;
    this.options = {
      width: DEFAULT_CONFIG.WIDTH,
      height: DEFAULT_CONFIG.HEIGHT,
      backgroundColor: DEFAULT_CONFIG.BACKGROUND_COLOR,
      tools: AnnotationToolsConfig.DEFAULT_CONFIG,
      maxZoom: DEFAULT_CONFIG.MAX_ZOOM,
      minZoom: DEFAULT_CONFIG.MIN_ZOOM,
      ...options
    };

    this.eventHandlers = {};

    const size: Size = {
      width: this.options.width!,
      height: this.options.height!
    };

    const tools = this.options.tools || AnnotationToolsConfig.DEFAULT_CONFIG;

    const zoomPanOptions: ZoomPanOptions | undefined =
      AnnotationToolsConfig.hasZoomOrPan(tools) ? {
        enableZoom: !!tools.zoom,
        enablePan: !!tools.pan,
        maxZoom: this.options.maxZoom ?? 10,
        minZoom: this.options.minZoom ?? 0.1
      } : undefined;

    const annotationOptions: AnnotationManagerOptions | undefined =
      AnnotationToolsConfig.hasAnnotations(tools) ? {
        enabled: true
      } : undefined;

    const comparisonOptions: ComparisonOptions | undefined =
      AnnotationToolsConfig.hasComparison(tools) ? {
        comparisonMode: false
      } : undefined;

    this.imageViewer = new ImageViewer(
      this.container,
      size,
      this.eventHandlers,
      zoomPanOptions,
      annotationOptions,
      comparisonOptions,
      this.options.backgroundColor
    );

    this.setupEventForwarding();
  }

  private setupEventForwarding() {
  }

  loadImage(src: string, imageType?: string, fileName?: string): Promise<void> {
    return this.imageViewer.loadImage(src, imageType, fileName);
  }

  loadImageElement(image: HTMLImageElement, imageType?: string, fileName?: string): void {
    this.imageViewer.loadImageElement(image, imageType, fileName);
  }

  loadImageElementOverlay(image: HTMLImageElement, imageType?: string, fileName?: string): void {
    this.imageViewer.loadImageElementOverlay(image, imageType, fileName);
  }

  setZoom(zoom: number): void {
    const handler = this.imageViewer.getZoomPanHandler();
    if (handler) {
      handler.zoomTo(zoom);
    }
  }

  getZoom(): number {
    return this.imageViewer.getZoomLevel();
  }

  getZoomLevel(): number {
    return this.getZoom();
  }

  zoomIn(factor: number = 1.2): void {
    const handler = this.imageViewer.getZoomPanHandler();
    if (handler) {
      handler.zoomIn(factor);
    }
  }

  zoomOut(factor: number = 1.2): void {
    const handler = this.imageViewer.getZoomPanHandler();
    if (handler) {
      handler.zoomOut(factor);
    }
  }

  zoomTo(scale: number): void {
    this.setZoom(scale);
  }

  resetZoom(): void {
    const handler = this.imageViewer.getZoomPanHandler();
    if (handler) {
      handler.reset();
    }
  }

  fitToView(): void {
    this.imageViewer.fitToView();
  }

  fitToViewOverlay(): void {
    this.imageViewer.fitToViewOverlay();
  }

  setPan(x: number, y: number): void {
    const handler = this.imageViewer.getZoomPanHandler();
    if (handler) {
      handler.zoomTo(handler.getZoomLevel(), { x, y });
    }
  }

  getPan(): { x: number; y: number } {
    return this.imageViewer.getPanOffset();
  }

  getPanOffset(): { x: number; y: number } {
    return this.getPan();
  }

  resetPan(): void {
    const handler = this.imageViewer.getZoomPanHandler();
    if (handler) {
      handler.reset();
    }
  }

  resetView(): void {
    this.imageViewer.resetView();
  }

  addAnnotation(annotation: Annotation): void {
    const manager = this.imageViewer.getAnnotationManager();
    if (manager) {
      manager.addAnnotation(annotation);
    }
  }

  removeAnnotation(id: string): void {
    const manager = this.imageViewer.getAnnotationManager();
    if (manager) {
      manager.removeAnnotation(id);
    }
  }

  updateAnnotation(id: string, annotation: Annotation): void {
    const manager = this.imageViewer.getAnnotationManager();
    if (manager) {
      manager.removeAnnotation(id);
      manager.addAnnotation(annotation);
    }
  }

  getAnnotations(): Annotation[] {
    const manager = this.imageViewer.getAnnotationManager();
    return manager ? manager.getAllAnnotations() : [];
  }

  clearAnnotations(): void {
    const manager = this.imageViewer.getAnnotationManager();
    if (manager) {
      manager.clearAll();
    }
  }



  getImageData(): CustomImageData | null {
    return this.imageViewer.getImageData();
  }

  getCanvasSize(): Size {
    const canvas = this.imageViewer.getCanvas();
    return canvas.getSize();
  }

  resize(width: number, height: number): void {
    this.imageViewer.resize({ width, height });
  }

  destroy(): void {
    const zoomHandler = this.imageViewer.getZoomPanHandler();
    if (zoomHandler) {
      zoomHandler.destroy();
    }
    const annotationManager = this.imageViewer.getAnnotationManager();
    if (annotationManager) {
      annotationManager.destroy();
    }
  }

  on(event: string, handler: Function): void {
    const eventMap: { [key: string]: keyof EventHandlers } = {
      'imageLoaded': 'onImageLoad',
      'imageLoadError': 'onImageLoadError',
      'zoomChanged': 'onZoomChange',
      'panChanged': 'onPanChange',
      'annotationAdded': 'onAnnotationAdd',
      'annotationRemoved': 'onAnnotationRemove',
      'toolChanged': 'onToolChange',
      'comparisonChanged': 'onComparisonChange'
    };

    const handlerKey = eventMap[event];
    if (handlerKey) {
      (this.eventHandlers as Record<string, unknown>)[handlerKey] = handler;
    }
  }

  off(event: string, handler: Function): void {
    const eventMap: { [key: string]: keyof EventHandlers } = {
      'imageLoaded': 'onImageLoad',
      'imageLoadError': 'onImageLoadError',
      'zoomChanged': 'onZoomChange',
      'panChanged': 'onPanChange',
      'annotationAdded': 'onAnnotationAdd',
      'annotationRemoved': 'onAnnotationRemove',
      'toolChanged': 'onToolChange',
      'comparisonChanged': 'onComparisonChange'
    };

    const handlerKey = eventMap[event];
    if (handlerKey && (this.eventHandlers as Record<string, unknown>)[handlerKey] === handler) {
      (this.eventHandlers as Record<string, unknown>)[handlerKey] = undefined;
    }
  }

  updateOptions(options: Partial<CanvasLensOptions>): void {
    this.options = { ...this.options, ...options };
    if (options.width || options.height) {
      this.imageViewer.resize({
        width: this.options.width!,
        height: this.options.height!
      });
    }

    if ('eventHandlers' in options && options.eventHandlers) {
      this.setEventHandlers(options.eventHandlers as EventHandlers);
    }
  }

  getOptions(): CanvasLensOptions {
    return { ...this.options };
  }

  setEventHandlers(handlers: EventHandlers): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
    this.imageViewer.setEventHandlers(this.eventHandlers);
  }

  exportAnnotations(): string {
    return JSON.stringify(this.getAnnotations());
  }

  importAnnotations(annotationsJson: string): void {
    try {
      const annotations = JSON.parse(annotationsJson);
      this.clearAnnotations();
      annotations.forEach((annotation: Annotation) => {
        this.addAnnotation(annotation);
      });
    } catch (error) {
      warn('Failed to import annotations:', error);
    }
  }


  isImageLoaded(): boolean {
    return this.imageViewer.isImageLoaded();
  }

  getImageViewer(): ImageViewer {
    return this.imageViewer;
  }

  getZoomPanHandler() {
    return this.imageViewer.getZoomPanHandler();
  }

  getAnnotationManager() {
    return this.imageViewer.getAnnotationManager();
  }

  isAnnotationToolActive(): boolean {
    const annotationManager = this.getAnnotationManager();
    return annotationManager ? annotationManager.isToolActive() : false;
  }

  getActiveAnnotationToolType(): string | null {
    const annotationManager = this.getAnnotationManager();
    return annotationManager ? annotationManager.getActiveToolType() : null;
  }

  activateAnnotationTool(toolType: string): boolean {
    const annotationManager = this.getAnnotationManager();
    return annotationManager ? annotationManager.activateTool(toolType) : false;
  }

  deactivateAnnotationTool(): void {
    const annotationManager = this.getAnnotationManager();
    if (annotationManager) {
      annotationManager.deactivateTool();
    }
  }

  /**
   * Update tool configuration without reinitializing the entire engine
   */
  updateToolConfig(toolConfig: ToolConfig): void {
    this.options.tools = { ...this.options.tools, ...toolConfig };

    const zoomPanHandler = this.getZoomPanHandler();
    if (zoomPanHandler && AnnotationToolsConfig.hasZoomOrPan(this.options.tools)) {
      zoomPanHandler.updateOptions({
        enableZoom: !!this.options.tools.zoom,
        enablePan: !!this.options.tools.pan,
        maxZoom: this.options.maxZoom ?? 10,
        minZoom: this.options.minZoom ?? 0.1
      });
    }

    const annotationManager = this.getAnnotationManager();
    if (annotationManager && toolConfig.annotation) {
      annotationManager.updateToolConfig(toolConfig.annotation);
    }

    if (toolConfig.comparison !== undefined) {
      // Comparison tool config handling - to be implemented
    }
  }

  /**
   * Alias for updateToolConfig for compatibility with homepage.js
   */
  updateTools(toolConfig: ToolConfig): void {
    this.updateToolConfig(toolConfig);
  }

  /**
   * Check if there are any changes to the image (annotations)
   */
  hasChanges(): boolean {
    const annotationManager = this.getAnnotationManager();
    return annotationManager ? annotationManager.hasChanges() : false;
  }

  /**
   * Reset the changes flag
   */
  resetChanges(): void {
    const annotationManager = this.getAnnotationManager();
    if (annotationManager) {
      annotationManager.resetChanges();
    }
  }

  /**
   * Activate a specific tool
   */
  activateTool(toolType: string): boolean {
    const annotationManager = this.getAnnotationManager();
    if (annotationManager) {
      return annotationManager.activateTool(toolType);
    }
    return false;
  }

  /**
   * Deactivate current tool
   */
  deactivateTool(): boolean {
    const annotationManager = this.getAnnotationManager();
    if (annotationManager) {
      annotationManager.deactivateTool();
      return true;
    }
    return false;
  }

  /**
   * Get currently active tool
   */
  getActiveTool(): string | null {
    const annotationManager = this.getAnnotationManager();
    if (annotationManager) {
      return annotationManager.getActiveToolType();
    }
    return null;
  }

  /**
   * Toggle comparison mode
   */
  toggleComparisonMode(): void {
    this.imageViewer.toggleComparisonMode();
  }

  /**
   * Set comparison mode
   */
  setComparisonMode(enabled: boolean): void {
    this.imageViewer.setComparisonMode(enabled);
  }

  /**
   * Check if comparison mode is enabled
   */
  isComparisonMode(): boolean {
    return this.imageViewer.isComparisonMode();
  }

  /**
   * Get comparison manager
   */
  getComparisonManager() {
    return this.imageViewer.getComparisonManager();
  }
}
