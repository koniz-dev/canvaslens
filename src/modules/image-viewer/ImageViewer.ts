import { Canvas } from '../../core/Canvas';
import { ImageData, Size, Point, EventHandlers } from '../../types';
import { loadImage, getImageData } from '../../utils/image';
import { error } from '../../utils/logger';
import { ZoomPanHandler, ZoomPanOptions } from '../zoom-pan/ZoomPanHandler';
import { AnnotationManager, AnnotationManagerOptions } from '../annotation/AnnotationManager';

export class ImageViewer {
  private canvas: Canvas;
  private imageData: ImageData | null = null;
  private eventHandlers: EventHandlers;
  private zoomPanHandler: ZoomPanHandler | null = null;
  private annotationManager: AnnotationManager | null = null;

  constructor(
    container: HTMLElement,
    size: Size,
    eventHandlers: EventHandlers = {},
    zoomPanOptions?: ZoomPanOptions,
    annotationOptions?: AnnotationManagerOptions
  ) {
    this.canvas = new Canvas(container, size);
    this.eventHandlers = eventHandlers;
    
    // Set reference to this viewer in canvas for annotation manager access
    this.canvas.imageViewer = this;
    
    // Initialize zoom/pan handler if options are provided
    if (zoomPanOptions) {
      this.zoomPanHandler = new ZoomPanHandler(
        this.canvas,
        zoomPanOptions,
        eventHandlers
      );
      
      // Listen for view state changes to trigger re-render
      this.canvas.getElement().addEventListener('viewStateChange', () => {
        this.render();
      });
    }

    // Initialize annotation manager if options are provided
    if (annotationOptions) {
      this.annotationManager = new AnnotationManager(
        this.canvas,
        {
          ...annotationOptions,
          eventHandlers
        }
      );
      
      // Set reference to annotation manager in canvas for ZoomPanHandler
      this.canvas.annotationManager = this.annotationManager;
    }
  }

  /**
   * Load and display image from URL
   */
  async loadImage(url: string, type?: string, fileName?: string): Promise<void> {
    try {
      const image = await loadImage(url);
      const canvasSize = this.canvas.getSize();
      this.imageData = getImageData(image, canvasSize, type, fileName);
      
      this.render();
      
      // Fit image to view if zoom/pan is enabled
      if (this.zoomPanHandler && this.imageData) {
        const bounds = this.getImageBounds();
        if (bounds) {
          this.zoomPanHandler.fitToView(bounds);
          // Update initial view state after fitting
          this.zoomPanHandler.updateInitialViewState(this.canvas.getViewState());
        }
      }
      
      if (this.eventHandlers.onImageLoad) {
        this.eventHandlers.onImageLoad(this.imageData);
      }
    } catch (err) {
      error('Failed to load image:', err);
      throw err;
    }
  }

    /**
   * Load and display image from HTMLImageElement
   */
  loadImageElement(image: HTMLImageElement, type?: string, fileName?: string): void {
    const canvasSize = this.canvas.getSize();
    this.imageData = getImageData(image, canvasSize, type, fileName);
    
    this.render();
    
    // Fit image to view if zoom/pan is enabled
    if (this.zoomPanHandler && this.imageData) {
      const bounds = this.getImageBounds();
        if (bounds) {
          this.zoomPanHandler.fitToView(bounds);
          // Update initial view state after fitting
          this.zoomPanHandler.updateInitialViewState(this.canvas.getViewState());
        }
      }
    
    if (this.eventHandlers.onImageLoad) {
      this.eventHandlers.onImageLoad(this.imageData);
    }
  }

  /**
   * Render the image on canvas
   */
  render(): void {
    if (!this.imageData) {
      return;
    }

    const ctx = this.canvas.getContext();
    const canvasSize = this.canvas.getSize();

    // Clear canvas with background
    this.canvas.clearWithBackground('#f0f0f0');

    // Apply view transformations
    this.canvas.applyViewTransform();

    // Draw image
    ctx.drawImage(
      this.imageData.element,
      this.imageData.position.x,
      this.imageData.position.y,
      this.imageData.displaySize.width,
      this.imageData.displaySize.height
    );

    // Draw annotations if annotation manager is available
    // Annotations are now drawn with view transformations applied
    // so they will move and scale with the image
    if (this.annotationManager) {
      this.annotationManager.render();
    }

    // Restore transformations after drawing everything
    this.canvas.restoreViewTransform();
  }

  /**
   * Resize the viewer
   */
  resize(size: Size): void {
    this.canvas.resize(size);
    
    // Recalculate image dimensions if image is loaded
    if (this.imageData) {
      this.imageData = getImageData(this.imageData.element, size, this.imageData.type, this.imageData.fileName);
      
      // Refit image to view after resize
      if (this.zoomPanHandler) {
        const bounds = this.getImageBounds();
        if (bounds) {
          this.zoomPanHandler.fitToView(bounds);
        }
      }
    }
    
    this.render();
  }

  /**
   * Get current image data
   */
  getImageData(): ImageData | null {
    return this.imageData;
  }

  /**
   * Get canvas instance
   */
  getCanvas(): Canvas {
    return this.canvas;
  }

  /**
   * Get zoom/pan handler
   */
  getZoomPanHandler(): ZoomPanHandler | null {
    return this.zoomPanHandler;
  }

  /**
   * Get annotation manager
   */
  getAnnotationManager(): AnnotationManager | null {
    return this.annotationManager;
  }

  /**
   * Check if image is loaded
   */
  isImageLoaded(): boolean {
    return this.imageData !== null;
  }

  /**
   * Get image bounds in world coordinates
   */
  getImageBounds(): { x: number; y: number; width: number; height: number } | null {
    if (!this.imageData) {
      return null;
    }

    return {
      x: this.imageData.position.x,
      y: this.imageData.position.y,
      width: this.imageData.displaySize.width,
      height: this.imageData.displaySize.height
    };
  }

  /**
   * Zoom to fit image in view
   */
  fitToView(): void {
    if (this.zoomPanHandler && this.imageData) {
      const bounds = this.getImageBounds();
      if (bounds) {
        this.zoomPanHandler.fitToView(bounds);
      }
    }
  }

  /**
   * Reset zoom and pan
   */
  resetView(): void {
    if (this.zoomPanHandler) {
      this.zoomPanHandler.reset();
    }
  }

  /**
   * Get current zoom level
   */
  getZoomLevel(): number {
    if (this.zoomPanHandler) {
      return this.zoomPanHandler.getZoomLevel();
    }
    return 1;
  }

  /**
   * Get current pan offset
   */
  getPanOffset(): Point {
    if (this.zoomPanHandler) {
      return this.zoomPanHandler.getPanOffset();
    }
    return { x: 0, y: 0 };
  }

  /**
   * Update event handlers
   */
  setEventHandlers(handlers: EventHandlers): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
    
    // Update event handlers in ZoomPanHandler if it exists
    if (this.zoomPanHandler) {
      this.zoomPanHandler.setEventHandlers(this.eventHandlers);
    }
    
    // Update event handlers in AnnotationManager if it exists
    if (this.annotationManager) {
      this.annotationManager.setEventHandlers(this.eventHandlers);
    }
  }
}
