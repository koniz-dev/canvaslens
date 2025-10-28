import { Size, Point, ViewState } from '@/types';
import { AnnotationManager, ImageViewer } from '@/types';

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private viewState: ViewState;
  public annotationManager: AnnotationManager | null = null;
  public imageViewer: ImageViewer | null = null;
  private resizeTimeout: number | null = null;
  private renderRequestId: number | null = null;
  private dirtyRegions: Array<{ x: number; y: number; width: number; height: number }> = [];
  private lastViewState: ViewState | null = null;

  constructor(container: HTMLElement, size: Size) {
    this.canvas = document.createElement('canvas');
    this.canvas.style.display = 'block';
    this.canvas.style.userSelect = 'none';
    this.canvas.style.touchAction = 'none';
    
    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get 2D context from canvas');
    }
    this.ctx = context;

    this.viewState = {
      scale: 1,
      offsetX: 0,
      offsetY: 0
    };

    this.resize(size);
    container.appendChild(this.canvas);
  }

  /**
   * Resize canvas to new dimensions with debouncing
   */
  resize(size: Size): void {
    // Clear existing timeout
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    
    // Debounce resize operations
    this.resizeTimeout = window.setTimeout(() => {
      this.performResize(size);
    }, 16); // ~60fps
  }

  /**
   * Perform actual resize operation
   */
  private performResize(size: Size): void {
    this.canvas.width = size.width;
    this.canvas.height = size.height;
    
    // Set CSS size to match device pixel ratio for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    this.canvas.style.width = `${size.width}px`;
    this.canvas.style.height = `${size.height}px`;
    this.canvas.width = size.width * dpr;
    this.canvas.height = size.height * dpr;
    this.ctx.scale(dpr, dpr);
    
    // Trigger re-render after resize
    this.requestRender();
  }

  /**
   * Clear the entire canvas
   */
  clear(): void {
    const size = this.getSize();
    this.ctx.clearRect(0, 0, size.width, size.height);
  }

  /**
   * Clear with background color
   */
  clearWithBackground(color: string): void {
    const size = this.getSize();
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, size.width, size.height);
  }

  /**
   * Apply view transformations (zoom and pan)
   */
  applyViewTransform(): void {
    this.ctx.save();
    this.ctx.translate(this.viewState.offsetX, this.viewState.offsetY);
    this.ctx.scale(this.viewState.scale, this.viewState.scale);
  }

  /**
   * Restore view transformations
   */
  restoreViewTransform(): void {
    this.ctx.restore();
  }

  /**
   * Get canvas element
   */
  getElement(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Get canvas context
   */
  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  /**
   * Get current view state
   */
  getViewState(): ViewState {
    return { ...this.viewState };
  }

  /**
   * Set view state
   */
  setViewState(viewState: Partial<ViewState>): void {
    const oldViewState = { ...this.viewState };
    this.viewState = { ...this.viewState, ...viewState };
    
    // Track dirty regions for view state changes
    this.trackViewStateChange(oldViewState, this.viewState);
    this.requestRender();
  }

  /**
   * Track dirty regions when view state changes
   */
  private trackViewStateChange(oldState: ViewState, newState: ViewState): void {
    // If view state changed significantly, mark entire canvas as dirty
    const scaleChanged = Math.abs(oldState.scale - newState.scale) > 0.01;
    const offsetChanged = Math.abs(oldState.offsetX - newState.offsetX) > 1 || 
                         Math.abs(oldState.offsetY - newState.offsetY) > 1;
    
    if (scaleChanged || offsetChanged) {
      this.markEntireCanvasDirty();
    }
  }

  /**
   * Mark entire canvas as dirty
   */
  markEntireCanvasDirty(): void {
    const size = this.getSize();
    this.dirtyRegions = [{
      x: 0,
      y: 0,
      width: size.width,
      height: size.height
    }];
  }

  /**
   * Mark specific region as dirty
   */
  markDirtyRegion(x: number, y: number, width: number, height: number): void {
    this.dirtyRegions.push({ x, y, width, height });
  }

  /**
   * Clear dirty regions
   */
  clearDirtyRegions(): void {
    this.dirtyRegions = [];
  }

  /**
   * Get current dirty regions
   */
  getDirtyRegions(): Array<{ x: number; y: number; width: number; height: number }> {
    return [...this.dirtyRegions];
  }

  /**
   * Request a render frame using requestAnimationFrame
   */
  requestRender(): void {
    if (this.renderRequestId) {
      cancelAnimationFrame(this.renderRequestId);
    }
    
    this.renderRequestId = requestAnimationFrame(() => {
      if (this.imageViewer) {
        this.imageViewer.render();
      }
      this.renderRequestId = null;
    });
  }

  /**
   * Get canvas size (CSS size, not device pixel size)
   */
  getSize(): Size {
    const dpr = window.devicePixelRatio || 1;
    return {
      width: this.canvas.width / dpr,
      height: this.canvas.height / dpr
    };
  }

  /**
   * Get mouse position relative to canvas
   */
  getMousePosition(event: MouseEvent): Point {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  /**
   * Add event listener to canvas
   */
  addEventListener(type: string, listener: EventListener, options?: boolean | AddEventListenerOptions): void {
    // For wheel events, use passive option to improve scroll performance
    if (type === 'wheel' && !options) {
      this.canvas.addEventListener(type, listener, { passive: true } as any);
    } else {
      this.canvas.addEventListener(type, listener, options);
    }
  }

  /**
   * Remove event listener from canvas
   */
  removeEventListener(type: string, listener: EventListener, options?: boolean | EventListenerOptions): void {
    // For wheel events, use passive option to match addEventListener
    if (type === 'wheel' && !options) {
      this.canvas.removeEventListener(type, listener, { passive: true } as any);
    } else {
      this.canvas.removeEventListener(type, listener, options);
    }
  }

  /**
   * Clean up resources and cancel pending operations
   */
  destroy(): void {
    // Cancel pending resize operations
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = null;
    }
    
    // Cancel pending render requests
    if (this.renderRequestId) {
      cancelAnimationFrame(this.renderRequestId);
      this.renderRequestId = null;
    }
    
    // Clear references
    this.annotationManager = null;
    this.imageViewer = null;
  }
}
