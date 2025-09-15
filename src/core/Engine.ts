// Core CanvasLens class - separated to avoid circular imports

import { CanvasLensOptions, EventHandlers, Size, ToolConfig } from '../types';
import { ImageViewer } from '../modules/image-viewer/ImageViewer';
import { ZoomPanOptions } from '../modules/zoom-pan/ZoomPanHandler';
import { AnnotationManagerOptions } from '../modules/annotation/AnnotationManager';
import { warn } from '../utils/logger';

export class Engine {
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

    // Configure zoom/pan options
    const zoomPanOptions: ZoomPanOptions = {
      enableZoom: tools.zoom ?? true,
      enablePan: tools.pan ?? true,
      maxZoom: this.options.maxZoom ?? 10,
      minZoom: this.options.minZoom ?? 0.1
    };

    // Configure annotation options
    const annotationOptions: AnnotationManagerOptions | undefined = tools.annotation ? {
      enabled: true
    } : undefined;

    // Initialize image viewer
    this.imageViewer = new ImageViewer(
      this.container,
      size,
      this.eventHandlers,
      zoomPanOptions,
      annotationOptions
    );

    // Set up event forwarding
    this.setupEventForwarding();
  }

  private setupEventForwarding() {
    // Event forwarding is handled through the eventHandlers object
    // The ImageViewer will call the handlers directly
  }

  // Public API methods
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

  addAnnotation(annotation: any): void {
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

  updateAnnotation(id: string, annotation: any): void {
    const manager = this.imageViewer.getAnnotationManager();
    if (manager) {
      // Remove old annotation and add new one
      manager.removeAnnotation(id);
      manager.addAnnotation(annotation);
    }
  }

  getAnnotations(): any[] {
    const manager = this.imageViewer.getAnnotationManager();
    return manager ? manager.getAllAnnotations() : [];
  }

  clearAnnotations(): void {
    const manager = this.imageViewer.getAnnotationManager();
    if (manager) {
      manager.clearAll();
    }
  }

  setComparisonImage(src: string): Promise<void> {
    // Comparison functionality would need to be implemented in ImageViewer
    return Promise.resolve();
  }

  setComparisonPosition(position: number): void {
    // Comparison functionality would need to be implemented in ImageViewer
  }

  getComparisonPosition(): number {
    // Comparison functionality would need to be implemented in ImageViewer
    return 0;
  }

  toggleComparison(): void {
    // Comparison functionality would need to be implemented in ImageViewer
  }

  setComparisonEnabled(enabled: boolean): void {
    // Comparison functionality would need to be implemented in ImageViewer
  }

  getComparisonEnabled(): boolean {
    // Comparison functionality would need to be implemented in ImageViewer
    return false;
  }

  getImageData(): any {
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
    // Clean up resources
    const zoomHandler = this.imageViewer.getZoomPanHandler();
    if (zoomHandler) {
      zoomHandler.destroy();
    }
    const annotationManager = this.imageViewer.getAnnotationManager();
    if (annotationManager) {
      annotationManager.destroy();
    }
  }

  // Event handling - simplified for current API
  on(event: string, handler: Function): void {
    // Event handling is managed through the eventHandlers object
    // This method is kept for compatibility but events are handled differently
    // Map event names to EventHandlers properties
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
      (this.eventHandlers as any)[handlerKey] = handler;
    }
  }

  off(event: string, handler: Function): void {
    // Similar mapping for off method
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
    if (handlerKey && (this.eventHandlers as any)[handlerKey] === handler) {
      (this.eventHandlers as any)[handlerKey] = undefined;
    }
  }

  // Configuration methods
  updateOptions(options: Partial<CanvasLensOptions>): void {
    this.options = { ...this.options, ...options };
    
    // Update image viewer with new options
    if (options.width || options.height) {
      this.imageViewer.resize({ 
        width: this.options.width!, 
        height: this.options.height! 
      });
    }

    // Update event handlers if provided
    if ((options as any).eventHandlers) {
      this.setEventHandlers((options as any).eventHandlers);
    }
  }

  getOptions(): CanvasLensOptions {
    return { ...this.options };
  }

  setEventHandlers(handlers: EventHandlers): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
    this.imageViewer.setEventHandlers(this.eventHandlers);
  }

  // Utility methods
  exportAnnotations(): string {
    return JSON.stringify(this.getAnnotations());
  }

  importAnnotations(annotationsJson: string): void {
    try {
      const annotations = JSON.parse(annotationsJson);
      this.clearAnnotations();
      annotations.forEach((annotation: any) => {
        this.addAnnotation(annotation);
      });
    } catch (error) {
      warn('Failed to import annotations:', error);
    }
  }

  exportImage(format: 'png' | 'jpeg' = 'png', quality: number = 0.9): string {
    // Export functionality would need to be implemented in ImageViewer
    return '';
  }

  downloadImage(filename: string = 'canvaslens-export.png'): void {
    // Download functionality would need to be implemented in ImageViewer
  }

  // Additional utility methods
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
    // Update options
    this.options.tools = { ...this.options.tools, ...toolConfig };
    
    // Update zoom/pan handler configuration
    const zoomPanHandler = this.getZoomPanHandler();
    if (zoomPanHandler) {
      zoomPanHandler.updateOptions({
        enableZoom: toolConfig.zoom ?? this.options.tools.zoom ?? true,
        enablePan: toolConfig.pan ?? this.options.tools.pan ?? true,
        maxZoom: this.options.maxZoom ?? 10,
        minZoom: this.options.minZoom ?? 0.1
      });
    }
    
    // Update annotation manager configuration
    const annotationManager = this.getAnnotationManager();
    if (annotationManager && toolConfig.annotation) {
      annotationManager.updateToolConfig(toolConfig.annotation);
    }
    
    // Update comparison configuration if needed
    if (toolConfig.comparison !== undefined) {
      // Comparison functionality would be updated here when implemented
    }
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
}
