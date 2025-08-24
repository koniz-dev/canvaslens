// Main entry point for CanvasLens library

// Export main CanvasLens Web Component only
export { CanvasLens } from './CanvasLens';

// Main CanvasLens class
import { CanvasLensOptions, EventHandlers, Size, ToolConfig } from './types';
import { ImageViewer } from './modules/image-viewer/ImageViewer';
import { ZoomPanOptions } from './modules/zoom-pan/ZoomPanHandler';
import { AnnotationManagerOptions } from './modules/annotation/AnnotationManager';
import { warn } from './utils/logger';

export class CoreCanvasLens {
  private container: HTMLElement;
  private options: CanvasLensOptions;
  private imageViewer: ImageViewer;
  private eventHandlers: EventHandlers;

  constructor(options: CanvasLensOptions) {
    this.container = options.container;
    this.options = {
      width: 800,
      height: 600,
      backgroundColor: '#f0f0f0',
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
      },
      maxZoom: 10,
      minZoom: 0.1,
      ...options
    };

    this.eventHandlers = {};

    // Initialize image viewer with zoom/pan options
    const size: Size = {
      width: this.options.width!,
      height: this.options.height!
    };

    const tools = this.options.tools || {};
    const zoomPanOptions: ZoomPanOptions = {
      enableZoom: tools.zoom ?? true,
      enablePan: tools.pan ?? true,
      maxZoom: this.options.maxZoom ?? 10,
      minZoom: this.options.minZoom ?? 0.1
    };

    const annotationOptions: AnnotationManagerOptions | undefined = tools.annotation ? {
      enabled: true
    } : undefined;

    this.imageViewer = new ImageViewer(
      this.container,
      size,
      this.eventHandlers,
      zoomPanOptions,
      annotationOptions
    );
  }

  /**
   * Load image from URL
   */
  async loadImage(url: string, type?: string, fileName?: string): Promise<void> {
    return this.imageViewer.loadImage(url, type, fileName);
  }

  /**
   * Load image from HTMLImageElement
   */
  loadImageElement(image: HTMLImageElement, type?: string, fileName?: string): void {
    this.imageViewer.loadImageElement(image, type, fileName);
  }

  /**
   * Set event handlers
   */
  setEventHandlers(handlers: EventHandlers): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
    // Update event handlers in ImageViewer as well
    this.imageViewer.setEventHandlers(this.eventHandlers);
  }

  /**
   * Resize the viewer
   */
  resize(width: number, height: number): void {
    this.imageViewer.resize({ width, height });
  }

  /**
   * Get image viewer instance
   */
  getImageViewer(): ImageViewer {
    return this.imageViewer;
  }

  /**
   * Get zoom/pan handler
   */
  getZoomPanHandler() {
    return this.imageViewer.getZoomPanHandler();
  }

  /**
   * Get annotation manager
   */
  getAnnotationManager() {
    return this.imageViewer.getAnnotationManager();
  }

  /**
   * Check if any annotation tool is active
   */
  isAnnotationToolActive(): boolean {
    const annotationManager = this.getAnnotationManager();
    return annotationManager ? annotationManager.isToolActive() : false;
  }

  /**
   * Get active annotation tool type
   */
  getActiveAnnotationToolType(): string | null {
    const annotationManager = this.getAnnotationManager();
    return annotationManager ? annotationManager.getActiveToolType() : null;
  }

  /**
   * Activate annotation tool
   */
  activateAnnotationTool(toolType: string): boolean {
    const annotationManager = this.getAnnotationManager();
    return annotationManager ? annotationManager.activateTool(toolType) : false;
  }

  /**
   * Deactivate annotation tool
   */
  deactivateAnnotationTool(): void {
    const annotationManager = this.getAnnotationManager();
    if (annotationManager) {
      annotationManager.deactivateTool();
    }
  }

  /**
   * Check if image is loaded
   */
  isImageLoaded(): boolean {
    return this.imageViewer.isImageLoaded();
  }

  /**
   * Get current options
   */
  getOptions(): CanvasLensOptions {
    return { ...this.options };
  }

  /**
   * Update options
   */
  updateOptions(newOptions: Partial<CanvasLensOptions>): void {
    this.options = { ...this.options, ...newOptions };
  }

  /**
   * Zoom to fit image in view
   */
  fitToView(): void {
    this.imageViewer.fitToView();
  }

  /**
   * Reset zoom and pan
   */
  resetView(): void {
    this.imageViewer.resetView();
  }

  /**
   * Get current zoom level
   */
  getZoomLevel(): number {
    return this.imageViewer.getZoomLevel();
  }

  /**
   * Get current pan offset
   */
  getPanOffset() {
    return this.imageViewer.getPanOffset();
  }

  /**
   * Zoom in
   */
  zoomIn(factor: number = 1.2): void {
    const handler = this.getZoomPanHandler();
    if (handler) {
      handler.zoomIn(factor);
    }
  }

  /**
   * Zoom out
   */
  zoomOut(factor: number = 1.2): void {
    const handler = this.getZoomPanHandler();
    if (handler) {
      handler.zoomOut(factor);
    }
  }

  /**
   * Zoom to specific level
   */
  zoomTo(scale: number): void {
    const handler = this.getZoomPanHandler();
    if (handler) {
      handler.zoomTo(scale);
    }
  }
}
