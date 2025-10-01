import { Renderer } from '../../core/Renderer';
import { ImageData, Point, Size, EventHandlers } from '../../types';
import { loadImage, getImageData, calculateFitDimensions } from '../../utils/image/image';
import { error } from '../../utils/core/logger';

export interface ComparisonOptions {
  sliderPosition?: number; // 0-100 percentage
  sliderWidth?: number;
  sliderColor?: string;
  enableSynchronizedZoom?: boolean;
  enableSynchronizedPan?: boolean;
  eventHandlers?: EventHandlers;
  comparisonMode?: boolean; // Enable comparison mode (before/after with annotations)
}

export interface ComparisonState {
  beforeImage: ImageData | null;
  afterImage: ImageData | null;
  sliderPosition: number;
  isDragging: boolean;
  comparisonMode: boolean;
}

export class ComparisonManager {
  private canvas: Renderer;
  private options: Required<ComparisonOptions>;
  private state: ComparisonState;
  private eventHandlers: EventHandlers;
  private boundHandlers: {
    handleMouseDown: (event: MouseEvent) => void;
    handleMouseMove: (event: MouseEvent) => void;
    handleMouseUp: (event: MouseEvent) => void;
  };

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
      comparisonMode: false,
      ...options
    };

    this.state = {
      beforeImage: null,
      afterImage: null,
      sliderPosition: this.options.sliderPosition,
      isDragging: false,
      comparisonMode: this.options.comparisonMode
    };

    // Bind event handlers to maintain proper context
    this.boundHandlers = {
      handleMouseDown: this.handleMouseDown.bind(this),
      handleMouseMove: this.handleMouseMove.bind(this),
      handleMouseUp: this.handleMouseUp.bind(this)
    };

    this.setupEventListeners();
  }

  /**
   * Setup event listeners for slider interaction
   */
  private setupEventListeners(): void {
    const canvasElement = this.canvas.getElement();
    
    // Use capture phase to handle events before zoom/pan
    canvasElement.addEventListener('mousedown', this.boundHandlers.handleMouseDown as EventListener, true);
    canvasElement.addEventListener('mousemove', this.boundHandlers.handleMouseMove as EventListener, true);
    canvasElement.addEventListener('mouseup', this.boundHandlers.handleMouseUp as EventListener, true);
    canvasElement.addEventListener('mouseleave', this.boundHandlers.handleMouseUp as EventListener, true);
  }

  /**
   * Handle mouse down for slider dragging
   */
  private handleMouseDown(event: MouseEvent): void {
    // Only handle comparison mode
    if (!this.state.comparisonMode) return;

    const mousePos = this.canvas.getMousePosition(event);
    const canvasSize = this.canvas.getSize();
    
    // Get image bounds to position slider correctly
    const imageBounds = this.getImageBounds();
    if (!imageBounds) return;
    
    // Calculate slider position relative to image bounds
    const sliderX = imageBounds.x + (imageBounds.width * this.state.sliderPosition) / 100;
    const tolerance = 30; // Increased tolerance for easier interaction
    
    // Check if click is near the slider and within image bounds
    if (Math.abs(mousePos.x - sliderX) <= tolerance && 
        mousePos.y >= imageBounds.y && 
        mousePos.y <= imageBounds.y + imageBounds.height) {
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
    if (!this.state.comparisonMode) return;

    const mousePos = this.canvas.getMousePosition(event);
    const canvasSize = this.canvas.getSize();
    
    // Get image bounds to position slider correctly
    const imageBounds = this.getImageBounds();
    if (!imageBounds) return;
    
    // Check if mouse is near slider for cursor change
    const sliderX = imageBounds.x + (imageBounds.width * this.state.sliderPosition) / 100;
    const tolerance = 30;
    const isNearSlider = Math.abs(mousePos.x - sliderX) <= tolerance && 
                        mousePos.y >= imageBounds.y && 
                        mousePos.y <= imageBounds.y + imageBounds.height;
    
    // Update cursor based on proximity to slider
    if (isNearSlider && !this.state.isDragging) {
      this.canvas.getElement().style.cursor = 'ew-resize';
    } else if (!this.state.isDragging) {
      this.canvas.getElement().style.cursor = 'default';
    }
    
    // Handle dragging
    if (this.state.isDragging) {
      // Get image bounds to limit slider movement
      const imageBounds = this.getImageBounds();
      if (imageBounds) {
        // Calculate slider position relative to image bounds
        const relativeX = mousePos.x - imageBounds.x;
        const imageWidth = imageBounds.width;
        
        // Clamp slider position to image bounds
        const clampedX = Math.max(0, Math.min(imageWidth, relativeX));
        const newPosition = (clampedX / imageWidth) * 100;
        
        this.setSliderPosition(newPosition);
      } else {
        // Fallback to canvas bounds if image bounds not available
        const newPosition = Math.max(0, Math.min(100, (mousePos.x / canvasSize.width) * 100));
        this.setSliderPosition(newPosition);
      }
      
      event.preventDefault();
      event.stopPropagation(); // Prevent zoom/pan from handling this event
    }
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
   * Restore cursor state when exiting comparison mode
   */
  private restoreCursorState(): void {
    // Let the annotation manager or zoom/pan handler manage cursor
    this.canvas.getElement().style.cursor = '';
  }

  /**
   * Get image bounds for limiting slider movement
   */
  private getImageBounds(): { x: number; y: number; width: number; height: number } | null {
    if (this.canvas.imageViewer) {
      return (this.canvas.imageViewer as any).getImageBounds();
    }
    return null;
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
    
    // Trigger re-render through the image viewer
    if (this.state.comparisonMode && this.canvas.imageViewer) {
      this.canvas.imageViewer.render();
    }
    
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
   * Toggle comparison mode
   */
  toggleComparisonMode(): void {
    this.state.comparisonMode = !this.state.comparisonMode;
    this.options.comparisonMode = this.state.comparisonMode;
    
    // Clear any selected annotations when entering comparison mode
    if (this.state.comparisonMode && this.canvas.annotationManager) {
      (this.canvas.annotationManager as any).selectAnnotation(null);
    }
    
    // Handle cursor state
    if (this.state.comparisonMode) {
      this.canvas.getElement().style.cursor = 'default';
    } else {
      this.restoreCursorState();
    }
    
    // Trigger event if handler exists
    if (this.eventHandlers.onComparisonModeChange) {
      this.eventHandlers.onComparisonModeChange(this.state.comparisonMode);
    }
  }

  /**
   * Set comparison mode
   */
  setComparisonMode(enabled: boolean): void {
    this.state.comparisonMode = enabled;
    this.options.comparisonMode = enabled;
    
    // Clear any selected annotations when entering comparison mode
    if (enabled && this.canvas.annotationManager) {
      (this.canvas.annotationManager as any).selectAnnotation(null);
    }
    
    // Handle cursor state
    if (enabled) {
      this.canvas.getElement().style.cursor = 'default';
    } else {
      this.restoreCursorState();
    }
    
    // Trigger event if handler exists
    if (this.eventHandlers.onComparisonModeChange) {
      this.eventHandlers.onComparisonModeChange(enabled);
    }
  }

  /**
   * Get comparison mode status
   */
  isComparisonMode(): boolean {
    return this.state.comparisonMode;
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

    // Clear canvas without background (transparent)
    this.canvas.clear();

    // Apply view transformations
    this.canvas.applyViewTransform();

    const sliderX = (canvasSize.width * this.state.sliderPosition) / 100;

    if (this.state.comparisonMode) {
      // Comparison mode: Left = current image with annotations, Right = original image
      // Draw original image (right side)
      this.drawImage(ctx, this.state.beforeImage!);

      // Create clipping region for current image with annotations (left side)
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, sliderX, canvasSize.height);
      ctx.clip();

      // Draw current image with annotations (only in clipped region)
      this.drawImage(ctx, this.state.afterImage!);
      
      ctx.restore();
    } else {
      // Normal mode: Left = before image, Right = after image
      // Draw before image (full canvas)
      this.drawImage(ctx, this.state.beforeImage!);

      // Create clipping region for after image
      ctx.save();
      ctx.beginPath();
      ctx.rect(sliderX, 0, canvasSize.width - sliderX, canvasSize.height);
      ctx.clip();

      // Draw after image (only in clipped region)
      this.drawImage(ctx, this.state.afterImage!);
      
      ctx.restore();
    }

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
    // Remove event listeners with same options as when added
    this.canvas.getElement().removeEventListener('mousedown', this.boundHandlers.handleMouseDown as EventListener, true);
    this.canvas.getElement().removeEventListener('mousemove', this.boundHandlers.handleMouseMove as EventListener, true);
    this.canvas.getElement().removeEventListener('mouseup', this.boundHandlers.handleMouseUp as EventListener, true);
    this.canvas.getElement().removeEventListener('mouseleave', this.boundHandlers.handleMouseUp as EventListener, true);

    // Clear state
    this.state = {
      beforeImage: null,
      afterImage: null,
      sliderPosition: 50,
      isDragging: false,
      comparisonMode: false
    };
  }
}
