import { Renderer } from '../../core/Renderer';
import { ImageData, Size, Point, EventHandlers } from '../../types';
import { ImageComparisonManager, ComparisonOptions } from './ImageComparisonManager';
import { ZoomPanHandler, ZoomPanOptions } from '../zoom-pan/ZoomPanHandler';

export class ComparisonViewer {
  private canvas: Renderer;
  private comparisonManager: ImageComparisonManager;
  private zoomPanHandler: ZoomPanHandler | null = null;
  private eventHandlers: EventHandlers;

  constructor(
    container: HTMLElement,
    size: Size,
    eventHandlers: EventHandlers = {},
    comparisonOptions?: ComparisonOptions,
    zoomPanOptions?: ZoomPanOptions
  ) {
    this.canvas = new Renderer(container, size);
    this.eventHandlers = eventHandlers;

    // Initialize comparison manager
    this.comparisonManager = new ImageComparisonManager(
      this.canvas,
      {
        ...comparisonOptions,
        eventHandlers
      }
    );

    // Initialize zoom/pan handler if options are provided
    if (zoomPanOptions) {
      this.zoomPanHandler = new ZoomPanHandler(
        this.canvas,
        zoomPanOptions,
        eventHandlers
      );
    }
  }

  /**
   * Load before and after images
   */
  async loadImages(beforeUrl: string, afterUrl: string): Promise<void> {
    await this.comparisonManager.loadImages(beforeUrl, afterUrl);
    this.render();
  }

  /**
   * Load before image only
   */
  async loadBeforeImage(url: string): Promise<void> {
    await this.comparisonManager.loadBeforeImage(url);
    this.render();
  }

  /**
   * Load after image only
   */
  async loadAfterImage(url: string): Promise<void> {
    await this.comparisonManager.loadAfterImage(url);
    this.render();
  }

  /**
   * Render the comparison
   */
  render(): void {
    this.comparisonManager.render();
  }

  /**
   * Resize the viewer
   */
  resize(size: Size): void {
    this.canvas.resize(size);
    this.comparisonManager.resize(size);
    this.render();
  }

  /**
   * Get current slider position
   */
  getSliderPosition(): number {
    return this.comparisonManager.getSliderPosition();
  }

  /**
   * Set slider position (0-100)
   */
  setSliderPosition(position: number): void {
    this.comparisonManager.setSliderPosition(position);
  }

  /**
   * Show more of the before image (move slider left)
   */
  showMoreBefore(): void {
    this.comparisonManager.showMoreBefore();
  }

  /**
   * Show more of the after image (move slider right)
   */
  showMoreAfter(): void {
    this.comparisonManager.showMoreAfter();
  }

  /**
   * Reset slider to center position
   */
  resetSlider(): void {
    this.comparisonManager.resetSlider();
  }

  /**
   * Get comparison manager
   */
  getComparisonManager(): ImageComparisonManager {
    return this.comparisonManager;
  }

  /**
   * Get zoom/pan handler
   */
  getZoomPanHandler(): ZoomPanHandler | null {
    return this.zoomPanHandler;
  }

  /**
   * Get canvas instance
   */
  getCanvas(): Renderer {
    return this.canvas;
  }

  /**
   * Check if both images are loaded
   */
  isReady(): boolean {
    return this.comparisonManager.isReady();
  }

  /**
   * Get before image data
   */
  getBeforeImage(): ImageData | null {
    return this.comparisonManager.getBeforeImage();
  }

  /**
   * Get after image data
   */
  getAfterImage(): ImageData | null {
    return this.comparisonManager.getAfterImage();
  }

  /**
   * Get comparison state
   */
  getState() {
    return this.comparisonManager.getState();
  }

  /**
   * Update comparison options
   */
  updateComparisonOptions(options: Partial<ComparisonOptions>): void {
    this.comparisonManager.updateOptions(options);
  }

  /**
   * Set event handlers
   */
  setEventHandlers(handlers: EventHandlers): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
    this.comparisonManager.setEventHandlers(handlers);
    
    // Also update zoom/pan handler event handlers
    if (this.zoomPanHandler) {
      this.zoomPanHandler.setEventHandlers(handlers);
    }
  }

  /**
   * Zoom to fit both images in view
   */
  fitToView(): void {
    if (this.zoomPanHandler && this.isReady()) {
      const beforeImage = this.getBeforeImage();
      const afterImage = this.getAfterImage();
      
      if (beforeImage && afterImage) {
        // Use the larger image to determine fit
        const beforeBounds = {
          x: beforeImage.position.x,
          y: beforeImage.position.y,
          width: beforeImage.displaySize.width,
          height: beforeImage.displaySize.height
        };
        
        const afterBounds = {
          x: afterImage.position.x,
          y: afterImage.position.y,
          width: afterImage.displaySize.width,
          height: afterImage.displaySize.height
        };

        // Use the larger bounds for fitting
        const useBefore = (beforeBounds.width * beforeBounds.height) > (afterBounds.width * afterBounds.height);
        const bounds = useBefore ? beforeBounds : afterBounds;
        
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
   * Zoom in
   */
  zoomIn(factor: number = 1.2): void {
    if (this.zoomPanHandler) {
      this.zoomPanHandler.zoomIn(factor);
    }
  }

  /**
   * Zoom out
   */
  zoomOut(factor: number = 1.2): void {
    if (this.zoomPanHandler) {
      this.zoomPanHandler.zoomOut(factor);
    }
  }

  /**
   * Zoom to specific level
   */
  zoomTo(scale: number): void {
    if (this.zoomPanHandler) {
      this.zoomPanHandler.zoomTo(scale);
    }
  }

  /**
   * Destroy the viewer
   */
  destroy(): void {
    this.comparisonManager.destroy();
    if (this.zoomPanHandler) {
      this.zoomPanHandler.destroy();
    }
  }
}
