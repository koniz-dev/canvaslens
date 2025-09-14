import { Renderer } from '../../core/Renderer';
import { ImageData, Size, Point, EventHandlers } from '../../types';
import { loadImage, getImageData, getImageDataOverlay } from '../../utils/image';
import { error } from '../../utils/logger';
import { ZoomPanHandler, ZoomPanOptions } from '../zoom-pan/ZoomPanHandler';
import { AnnotationManager, AnnotationManagerOptions } from '../annotation/AnnotationManager';

export class ImageViewer {
  private canvas: Renderer;
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
    this.canvas = new Renderer(container, size);
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
      
      // Reset zoom/pan to initial state to show image properly fitted
      if (this.zoomPanHandler) {
        // Reset to initial state (scale=1, offset=0,0) since getImageData already calculated proper fit
        this.zoomPanHandler.reset();
        // Update initial view state after reset
        this.zoomPanHandler.updateInitialViewState(this.canvas.getViewState());
        this.zoomPanHandler.updateCursorState();
      }
      
      if (this.eventHandlers.onImageLoad) {
        this.eventHandlers.onImageLoad(this.imageData);
      }
    } catch (err) {
      error('Failed to load image:', err);
      if (this.eventHandlers.onImageLoadError) {
        this.eventHandlers.onImageLoadError(err as Error);
      }
      throw err;
    }
  }

    /**
   * Load and display image from HTMLImageElement
   */
  loadImageElement(image: HTMLImageElement, type?: string, fileName?: string): void {
    try {
      if (!image || !image.complete || image.naturalWidth === 0) {
        throw new Error('Invalid image element provided');
      }

      const canvasSize = this.canvas.getSize();
      
      this.imageData = getImageData(image, canvasSize, type, fileName);
      
      this.render();
      
      // Reset zoom/pan to initial state if zoom/pan is enabled
      if (this.zoomPanHandler && this.imageData) {
        // Reset to initial state (scale=1, offset=0,0) since getImageData already calculated proper fit
        this.zoomPanHandler.reset();
        // Update initial view state after reset
        this.zoomPanHandler.updateInitialViewState(this.canvas.getViewState());
        this.zoomPanHandler.updateCursorState();
      }
      
      if (this.eventHandlers.onImageLoad) {
        this.eventHandlers.onImageLoad(this.imageData);
      }
    } catch (err) {
      error('Failed to load image element:', err);
      if (this.eventHandlers.onImageLoadError) {
        this.eventHandlers.onImageLoadError(err as Error);
      }
      throw err;
    }
  }

  /**
   * Load and display image from HTMLImageElement for overlay mode (allows scaling up)
   */
  loadImageElementOverlay(image: HTMLImageElement, type?: string, fileName?: string): void {
    try {
      if (!image || !image.complete || image.naturalWidth === 0) {
        throw new Error('Invalid image element provided');
      }

      const canvasSize = this.canvas.getSize();
      
      // For overlay mode, use window dimensions as fallback
      const overlaySize = {
        width: window.innerWidth * 0.9,
        height: (window.innerHeight * 0.9) - 60
      };
      
      this.imageData = getImageDataOverlay(image, overlaySize, type, fileName);
      
      this.render();
      
      // For overlay mode, don't reset zoom/pan - keep the calculated position
      // The image position is already calculated by getImageDataOverlay
      if (this.zoomPanHandler && this.imageData) {
        // Just update cursor state without resetting position
        this.zoomPanHandler.updateCursorState();
      }
      
      if (this.eventHandlers.onImageLoad) {
        this.eventHandlers.onImageLoad(this.imageData);
      }
    } catch (err) {
      error('Failed to load image element for overlay:', err);
      if (this.eventHandlers.onImageLoadError) {
        this.eventHandlers.onImageLoadError(err as Error);
      }
      throw err;
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


    // Clear canvas without background (transparent)
    this.canvas.clear();

    // Apply view transformations
    this.canvas.applyViewTransform();

    // Draw image
    try {
      ctx.drawImage(
        this.imageData.element,
        this.imageData.position.x,
        this.imageData.position.y,
        this.imageData.displaySize.width,
        this.imageData.displaySize.height
      );
    } catch (err) {
      error('Error drawing image:', err);
    }

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
      
      // Reset zoom/pan to initial state after resize since getImageData already calculated proper fit
      if (this.zoomPanHandler) {
        this.zoomPanHandler.reset();
        // Update initial view state after reset
        this.zoomPanHandler.updateInitialViewState(this.canvas.getViewState());
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
  getCanvas(): Renderer {
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
   * Zoom to fit image in view for overlay mode (allows scaling up)
   */
  fitToViewOverlay(): void {
    if (this.zoomPanHandler && this.imageData) {
      const bounds = this.getImageBounds();
      if (bounds) {
        this.zoomPanHandler.fitToViewOverlay(bounds);
      }
    }
  }

  /**
   * Reset zoom and pan
   */
  resetView(): void {
    if (this.zoomPanHandler) {
      this.zoomPanHandler.reset();
      this.zoomPanHandler.updateCursorState();
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
