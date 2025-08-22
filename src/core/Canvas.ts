import { Size, Point, ViewState } from '../types';

export class Canvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private viewState: ViewState;
  public annotationManager: any = null; // Reference to annotation manager

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
   * Resize canvas to new dimensions
   */
  resize(size: Size): void {
    this.canvas.width = size.width;
    this.canvas.height = size.height;
    
    // Set CSS size to match device pixel ratio for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    this.canvas.style.width = `${size.width}px`;
    this.canvas.style.height = `${size.height}px`;
    this.canvas.width = size.width * dpr;
    this.canvas.height = size.height * dpr;
    this.ctx.scale(dpr, dpr);
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
    this.viewState = { ...this.viewState, ...viewState };
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
  addEventListener(type: string, listener: EventListener): void {
    this.canvas.addEventListener(type, listener);
  }

  /**
   * Remove event listener from canvas
   */
  removeEventListener(type: string, listener: EventListener): void {
    this.canvas.removeEventListener(type, listener);
  }
}
