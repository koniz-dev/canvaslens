// Main entry point for CanvasLens library

// Export core classes
export { Canvas } from './core/Canvas';

// Export modules
export { ImageViewer } from './modules/image-viewer/ImageViewer';
export { ZoomPanHandler } from './modules/zoom-pan/ZoomPanHandler';
export type { ZoomPanOptions } from './modules/zoom-pan/ZoomPanHandler';
export { AnnotationManager } from './modules/annotation/AnnotationManager';
export type { AnnotationManagerOptions } from './modules/annotation/AnnotationManager';
export { AnnotationRenderer } from './modules/annotation/AnnotationRenderer';
export { ToolManager } from './modules/annotation/ToolManager';
export type { ToolManagerOptions } from './modules/annotation/ToolManager';
export * from './modules/annotation/tools/index';
export { ImageComparisonManager } from './modules/comparison/ImageComparisonManager';
export type { ComparisonOptions, ComparisonState } from './modules/comparison/ImageComparisonManager';
export { ComparisonViewer } from './modules/comparison/ComparisonViewer';
export { PhotoEditorManager, PhotoEditorUI } from './modules/photo-editor';
export type { PhotoEditorOptions, PhotoEditorState, PhotoEditorTool } from './modules/photo-editor';

// Export types
export type {
  Point,
  Size,
  Rectangle,
  ViewState,
  ImageData,
  CanvasLensOptions,
  Annotation,
  AnnotationStyle,
  Tool,
  EventHandlers
} from './types';

// Export utilities
export {
  screenToWorld,
  worldToScreen,
  distance,
  centerPoint,
  clamp
} from './utils/coordinate';

export {
  calculateFitDimensions,
  loadImage,
  getImageData,
  isPointInRect
} from './utils/image';

export {
  log,
  warn,
  error,
  info
} from './utils/logger';

// Main CanvasLens class
import { CanvasLensOptions, EventHandlers, Size } from './types';
import { ImageViewer } from './modules/image-viewer/ImageViewer';
import { ZoomPanOptions } from './modules/zoom-pan/ZoomPanHandler';
import { AnnotationManagerOptions } from './modules/annotation/AnnotationManager';
import { PhotoEditorManager, PhotoEditorUI } from './modules/photo-editor';
import { PhotoEditorOptions } from './modules/photo-editor/types';
import { warn } from './utils/logger';

export class CanvasLens {
  private container: HTMLElement;
  private options: CanvasLensOptions;
  private imageViewer: ImageViewer;
  private eventHandlers: EventHandlers;
  private photoEditorManager: PhotoEditorManager | null = null;
  private photoEditorUI: PhotoEditorUI | null = null;

  constructor(options: CanvasLensOptions) {
    this.container = options.container;
    this.options = {
      width: 800,
      height: 600,
      backgroundColor: '#f0f0f0',
      enableZoom: true,
      enablePan: true,
      enableAnnotations: false,
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

    const zoomPanOptions: ZoomPanOptions = {
      enableZoom: this.options.enableZoom ?? true,
      enablePan: this.options.enablePan ?? true,
      maxZoom: this.options.maxZoom ?? 10,
      minZoom: this.options.minZoom ?? 0.1
    };

    const annotationOptions: AnnotationManagerOptions | undefined = this.options.enableAnnotations ? {
      enabled: true
    } : undefined;

    this.imageViewer = new ImageViewer(
      this.container,
      size,
      this.eventHandlers,
      zoomPanOptions,
      annotationOptions
    );

    // Initialize photo editor if enabled
    if (this.options.enablePhotoEditor) {
      this.initializePhotoEditor();
    }
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

  /**
   * Initialize photo editor
   */
  private initializePhotoEditor(): void {
    const photoEditorOptions: PhotoEditorOptions = {
      enabled: true,
      tools: ['light', 'color', 'retouching', 'effects', 'info'],
      defaultTool: 'light',
      theme: 'dark',
      position: 'right',
      width: 300,
      height: 600
    };

    this.photoEditorManager = new PhotoEditorManager(photoEditorOptions);
    this.photoEditorUI = new PhotoEditorUI(this.photoEditorManager, this.container);

    // PhotoEditorUI already set its callbacks in constructor
    // We only need to set up image update callback
    this.photoEditorManager.setCallbacks(
      undefined, // Let PhotoEditorUI handle state changes
      (imageData) => this.onPhotoEditorImageUpdate(imageData)
    );

    // Add click handler to open photo editor
    this.container.addEventListener('click', (e) => {
      if (this.isImageLoaded() && !this.isAnnotationToolActive()) {
        this.openPhotoEditor();
      }
    });
  }

  /**
   * Open photo editor
   */
  openPhotoEditor(): void {
    if (!this.photoEditorManager || !this.photoEditorUI) {
      warn('Photo editor is not enabled');
      return;
    }

    console.log('Opening photo editor...');

    // First, open the photo editor to create overlay and image container
    this.photoEditorManager.open();

    // Then get current image data and load it
    const imageData = this.imageViewer.getImageData();
    if (imageData) {
      console.log('Image data found:', imageData.naturalSize.width, 'x', imageData.naturalSize.height);
      
      // Convert image to ImageData for processing
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = imageData.naturalSize.width;
      canvas.height = imageData.naturalSize.height;
      ctx.drawImage(imageData.element, 0, 0);
      
      const processedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      console.log('Processed image data:', processedImageData.width, 'x', processedImageData.height);
      
      this.photoEditorManager.setOriginalImage(processedImageData);
      
      // Load the same ImageData into overlay container
      this.photoEditorUI.loadImageDataToContainer(processedImageData);
    } else {
      console.warn('No image data found!');
    }
    
    if (this.eventHandlers.onPhotoEditorOpen) {
      this.eventHandlers.onPhotoEditorOpen();
    }
  }

  /**
   * Close photo editor
   */
  closePhotoEditor(): void {
    if (this.photoEditorManager) {
      this.photoEditorManager.close();
    }
  }

  /**
   * Get photo editor manager
   */
  getPhotoEditorManager(): PhotoEditorManager | null {
    return this.photoEditorManager;
  }

  /**
   * Handle photo editor state change
   */
  private onPhotoEditorStateChange(state: any): void {
    if (!state.isOpen && this.eventHandlers.onPhotoEditorClose) {
      this.eventHandlers.onPhotoEditorClose();
    }
  }

  /**
   * Handle photo editor image update
   */
  private onPhotoEditorImageUpdate(imageData: ImageData): void {
    // Apply the modified image data to the canvas
    if (this.imageViewer) {
      // Create a temporary canvas to convert ImageData back to image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = imageData.width;
      canvas.height = imageData.height;
      ctx.putImageData(imageData, 0, 0);

      // Convert canvas to image and update the viewer
      const img = new Image();
      img.onload = () => {
        this.imageViewer.loadImageElement(img);
      };
      img.src = canvas.toDataURL();
    }

    if (this.eventHandlers.onPhotoEditorImageUpdate) {
      this.eventHandlers.onPhotoEditorImageUpdate(imageData as any);
    }
  }
}
