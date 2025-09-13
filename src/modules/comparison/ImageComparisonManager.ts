import { Renderer } from '../../core/Renderer';
import { ImageData, Point, Size, EventHandlers } from '../../types';
import { loadImage, getImageData, calculateFitDimensions } from '../../utils/image';
import { error } from '../../utils/logger';

export interface ComparisonOptions {
  sliderPosition?: number; // 0-100 percentage
  sliderWidth?: number;
  sliderColor?: string;
  enableSynchronizedZoom?: boolean;
  enableSynchronizedPan?: boolean;
  eventHandlers?: EventHandlers;
}

export interface ComparisonState {
  beforeImage: ImageData | null;
  afterImage: ImageData | null;
  sliderPosition: number;
  isDragging: boolean;
}

export class ImageComparisonManager {
  private canvas: Renderer;
  private options: Required<ComparisonOptions>;
  private state: ComparisonState;
  private eventHandlers: EventHandlers;

  constructor(canvas: Renderer, options: ComparisonOptions = {}) {
    this.canvas = canvas;
    this.eventHandlers = options.eventHandlers || {};
    
    this.options = {
      sliderPosition: 50,
      sliderWidth: 4,
      sliderColor: '#ffffff',
      enableSynchronizedZoom: true,
      enableSynchronizedPan: true,
      eventHandlers: {},
      ...options
    };

    this.state = {
      beforeImage: null,
      afterImage: null,
      sliderPosition: this.options.sliderPosition,
      isDragging: false
    };

    this.setupEventListeners();
  }

  /**
   * Setup event listeners for slider interaction
   */
  private setupEventListeners(): void {
    const canvasElement = this.canvas.getElement();
    
    // Use capture phase to handle events before zoom/pan
    canvasElement.addEventListener('mousedown', this.handleMouseDown.bind(this) as EventListener, true);
    canvasElement.addEventListener('mousemove', this.handleMouseMove.bind(this) as EventListener, true);
    canvasElement.addEventListener('mouseup', this.handleMouseUp.bind(this) as EventListener, true);
    canvasElement.addEventListener('mouseleave', this.handleMouseUp.bind(this) as EventListener, true);
  }

  /**
   * Handle mouse down for slider dragging
   */
  private handleMouseDown(event: MouseEvent): void {
    if (!this.state.beforeImage || !this.state.afterImage) return;

    const mousePos = this.canvas.getMousePosition(event);
    const canvasSize = this.canvas.getSize();
    
    // Check if click is near the slider
    const sliderX = (canvasSize.width * this.state.sliderPosition) / 100;
    const tolerance = 30; // Increased tolerance for easier interaction
    
    if (Math.abs(mousePos.x - sliderX) <= tolerance) {
      this.state.isDragging = true;
      this.canvas.getElement().style.cursor = 'ew-resize';
      event.preventDefault();
      event.stopPropagation(); // Prevent zoom/pan from handling this event
    }
  }

  /**
   * Handle mouse move for slider dragging
   */
  private handleMouseMove(event: MouseEvent): void {
    if (!this.state.isDragging || !this.state.beforeImage || !this.state.afterImage) return;

    const mousePos = this.canvas.getMousePosition(event);
    const canvasSize = this.canvas.getSize();
    
    // Calculate new slider position
    const newPosition = Math.max(0, Math.min(100, (mousePos.x / canvasSize.width) * 100));
    this.setSliderPosition(newPosition);
    
    event.preventDefault();
    event.stopPropagation(); // Prevent zoom/pan from handling this event
  }

  /**
   * Handle mouse up to stop dragging
   */
  private handleMouseUp(event: MouseEvent): void {
    if (this.state.isDragging) {
      this.state.isDragging = false;
      this.canvas.getElement().style.cursor = 'default';
      event.preventDefault();
      event.stopPropagation(); // Prevent zoom/pan from handling this event
    }
  }

  /**
   * Load before image
   */
  async loadBeforeImage(url: string): Promise<void> {
    try {
      const image = await loadImage(url);
      const canvasSize = this.canvas.getSize();
      this.state.beforeImage = getImageData(image, canvasSize);
    } catch (err) {
      error('Failed to load before image:', err);
      throw err;
    }
  }

  /**
   * Load after image
   */
  async loadAfterImage(url: string): Promise<void> {
    try {
      const image = await loadImage(url);
      const canvasSize = this.canvas.getSize();
      this.state.afterImage = getImageData(image, canvasSize);
    } catch (err) {
      error('Failed to load after image:', err);
      throw err;
    }
  }

  /**
   * Load both images
   */
  async loadImages(beforeUrl: string, afterUrl: string): Promise<void> {
    await Promise.all([
      this.loadBeforeImage(beforeUrl),
      this.loadAfterImage(afterUrl)
    ]);
  }

  /**
   * Set slider position (0-100)
   */
  setSliderPosition(position: number): void {
    const clampedPosition = Math.max(0, Math.min(100, position));
    this.state.sliderPosition = clampedPosition;
    
    // Trigger event if handler exists
    if (this.eventHandlers.onComparisonChange) {
      this.eventHandlers.onComparisonChange(clampedPosition);
    }
  }

  /**
   * Get current slider position
   */
  getSliderPosition(): number {
    return this.state.sliderPosition;
  }

  /**
   * Show more of the before image (move slider left)
   */
  showMoreBefore(): void {
    const newPosition = Math.max(0, this.state.sliderPosition - 10);
    this.setSliderPosition(newPosition);
  }

  /**
   * Show more of the after image (move slider right)
   */
  showMoreAfter(): void {
    const newPosition = Math.min(100, this.state.sliderPosition + 10);
    this.setSliderPosition(newPosition);
  }

  /**
   * Reset slider to center position
   */
  resetSlider(): void {
    this.setSliderPosition(50);
  }

  /**
   * Get comparison state
   */
  getState(): ComparisonState {
    return { ...this.state };
  }

  /**
   * Check if both images are loaded
   */
  isReady(): boolean {
    return this.state.beforeImage !== null && this.state.afterImage !== null;
  }

  /**
   * Render the comparison
   */
  render(): void {
    if (!this.isReady()) return;

    const ctx = this.canvas.getContext();
    const canvasSize = this.canvas.getSize();

    // Clear canvas
    this.canvas.clearWithBackground('#f0f0f0');

    // Apply view transformations
    this.canvas.applyViewTransform();

    // Draw before image (full canvas)
    this.drawImage(ctx, this.state.beforeImage!);

    // Create clipping region for after image
    const sliderX = (canvasSize.width * this.state.sliderPosition) / 100;
    
    ctx.save();
    ctx.beginPath();
    ctx.rect(sliderX, 0, canvasSize.width - sliderX, canvasSize.height);
    ctx.clip();

    // Draw after image (only in clipped region)
    this.drawImage(ctx, this.state.afterImage!);
    
    ctx.restore();

    // Draw slider
    this.drawSlider(ctx, sliderX, canvasSize);

    // Restore transformations
    this.canvas.restoreViewTransform();
  }

  /**
   * Draw image with proper positioning
   */
  private drawImage(ctx: CanvasRenderingContext2D, imageData: ImageData): void {
    ctx.drawImage(
      imageData.element,
      imageData.position.x,
      imageData.position.y,
      imageData.displaySize.width,
      imageData.displaySize.height
    );
  }

  /**
   * Draw the comparison slider
   */
  private drawSlider(ctx: CanvasRenderingContext2D, x: number, canvasSize: Size): void {
    const sliderWidth = this.options.sliderWidth;
    const sliderColor = this.options.sliderColor;

    // Draw slider line
    ctx.save();
    ctx.strokeStyle = sliderColor;
    ctx.lineWidth = sliderWidth;
    ctx.setLineDash([]);
    
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasSize.height);
    ctx.stroke();

    // Draw slider handle
    const handleSize = 20;
    ctx.fillStyle = sliderColor;
    ctx.beginPath();
    ctx.arc(x, canvasSize.height / 2, handleSize / 2, 0, 2 * Math.PI);
    ctx.fill();

    // Draw handle border
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Resize comparison (recalculate image dimensions)
   */
  resize(size: Size): void {
    this.canvas.resize(size);
    
    // Recalculate image dimensions if images are loaded
    if (this.state.beforeImage) {
      this.state.beforeImage = getImageData(this.state.beforeImage.element, size);
    }
    
    if (this.state.afterImage) {
      this.state.afterImage = getImageData(this.state.afterImage.element, size);
    }
  }

  /**
   * Get before image data
   */
  getBeforeImage(): ImageData | null {
    return this.state.beforeImage;
  }

  /**
   * Get after image data
   */
  getAfterImage(): ImageData | null {
    return this.state.afterImage;
  }

  /**
   * Update comparison options
   */
  updateOptions(options: Partial<ComparisonOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * Set event handlers
   */
  setEventHandlers(handlers: EventHandlers): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  /**
   * Destroy comparison manager
   */
  destroy(): void {
    // Remove event listeners
    this.canvas.removeEventListener('mousedown', this.handleMouseDown.bind(this) as EventListener);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove.bind(this) as EventListener);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp.bind(this) as EventListener);
    this.canvas.removeEventListener('mouseleave', this.handleMouseUp.bind(this) as EventListener);

    // Clear state
    this.state = {
      beforeImage: null,
      afterImage: null,
      sliderPosition: 50,
      isDragging: false
    };
  }
}
