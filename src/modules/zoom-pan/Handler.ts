import { Renderer } from '../../core/Renderer';
import { ViewState, Point, EventHandlers } from '../../types';
import { screenToWorld, worldToScreen, clamp } from '../../utils/coordinate';
import { log } from '../../utils/logger';

export interface ZoomPanOptions {
  enableZoom?: boolean;
  enablePan?: boolean;
  maxZoom?: number;
  minZoom?: number;
  zoomSpeed?: number;
  panSpeed?: number;
}

export class ZoomPanHandler {
  private canvas: Renderer;
  private options: Required<ZoomPanOptions>;
  private eventHandlers: EventHandlers;
  private isPanning = false;
  private lastPanPoint: Point = { x: 0, y: 0 };
  private initialViewState: ViewState | null = null;
  private annotationManager: any = null; // Reference to annotation manager - will be properly typed when circular dependency is resolved
  private wheelTimeout: number | null = null;
  private lastWheelTime = 0;
  
  // Bound event handlers to maintain references for proper removal
  private boundHandleWheel: EventListener;
  private boundHandleMouseDown: EventListener;
  private boundHandleMouseMove: EventListener;
  private boundHandleMouseUp: EventListener;

  constructor(
    canvas: Renderer,
    options: ZoomPanOptions = {},
    eventHandlers: EventHandlers = {}
  ) {
    this.canvas = canvas;
    this.eventHandlers = eventHandlers;
    
    this.options = {
      enableZoom: true,
      enablePan: true,
      maxZoom: 10,
      minZoom: 0.1,
      zoomSpeed: 0.1,
      panSpeed: 1,
      ...options
    };

    // Bind event handlers to maintain references for proper removal
    this.boundHandleWheel = this.handleWheel.bind(this) as EventListener;
    this.boundHandleMouseDown = this.handleMouseDown.bind(this) as EventListener;
    this.boundHandleMouseMove = this.handleMouseMove.bind(this) as EventListener;
    this.boundHandleMouseUp = this.handleMouseUp.bind(this) as EventListener;

    this.setupEventListeners();
    
    // Store initial view state
    this.initialViewState = { ...this.canvas.getViewState() };
    
    // Set initial cursor based on image loaded state
    this.updateCursor();
  }

  /**
   * Setup event listeners for zoom and pan
   */
  private setupEventListeners(): void {
    this.updateEventListeners();
  }

  /**
   * Update event listeners based on current options
   */
  private updateEventListeners(): void {
    // Remove all existing event listeners first
    this.removeEventListeners();
    
    // Add event listeners based on current options
    if (this.options.enableZoom) {
      this.canvas.addEventListener('wheel', this.boundHandleWheel);
    }

    if (this.options.enablePan) {
      this.canvas.addEventListener('mousedown', this.boundHandleMouseDown);
      this.canvas.addEventListener('mousemove', this.boundHandleMouseMove);
      this.canvas.addEventListener('mouseup', this.boundHandleMouseUp);
      this.canvas.addEventListener('mouseleave', this.boundHandleMouseUp);
    }
  }

  /**
   * Remove all event listeners
   */
  private removeEventListeners(): void {
    this.canvas.removeEventListener('wheel', this.boundHandleWheel);
    this.canvas.removeEventListener('mousedown', this.boundHandleMouseDown);
    this.canvas.removeEventListener('mousemove', this.boundHandleMouseMove);
    this.canvas.removeEventListener('mouseup', this.boundHandleMouseUp);
    this.canvas.removeEventListener('mouseleave', this.boundHandleMouseUp);
  }

  /**
   * Check if image is loaded
   */
  private isImageLoaded(): boolean {
    const hasImageViewer = !!this.canvas.imageViewer;
    const isLoaded = this.canvas.imageViewer ? this.canvas.imageViewer.isImageLoaded() : false;
    return isLoaded;
  }

  /**
   * Update cursor based on current state
   */
  private updateCursor(): void {
    if (!this.isImageLoaded()) {
      // No image loaded - use default cursor
      this.canvas.getElement().style.cursor = 'default';
    } else if (this.isPanning && this.options.enablePan) {
      // Currently panning and pan is enabled - use grabbing cursor
      this.canvas.getElement().style.cursor = 'grabbing';
    } else if (this.options.enablePan) {
      // Image loaded and can pan - use grab cursor
      this.canvas.getElement().style.cursor = 'grab';
    } else {
      // Pan is disabled - use default cursor
      this.canvas.getElement().style.cursor = 'default';
    }
  }

  /**
   * Public method to update cursor (called when image is loaded/unloaded)
   */
  public updateCursorState(): void {
    this.updateCursor();
  }

  /**
   * Handle mouse wheel for zooming with throttling
   */
  private handleWheel(event: WheelEvent): void {
    // Don't handle zoom if no image is loaded
    if (!this.isImageLoaded()) {
      return;
    }
    
    // Don't handle zoom if zoom is disabled
    if (!this.options.enableZoom) {
      return;
    }
    
    event.preventDefault();
    
    // Throttle wheel events to improve performance
    const now = Date.now();
    if (now - this.lastWheelTime < 16) { // ~60fps
      return;
    }
    this.lastWheelTime = now;
    
    const currentViewState = this.canvas.getViewState();
    const mousePos = this.canvas.getMousePosition(event);
    
    // Calculate zoom factor
    const zoomFactor = event.deltaY > 0 ? 1 - this.options.zoomSpeed : 1 + this.options.zoomSpeed;
    const newScale = clamp(
      currentViewState.scale * zoomFactor,
      this.options.minZoom,
      this.options.maxZoom
    );

    // Calculate zoom center in world coordinates
    const worldPos = screenToWorld(mousePos, currentViewState);
    
    // Calculate new offset to zoom into mouse position
    const newOffsetX = mousePos.x - worldPos.x * newScale;
    const newOffsetY = mousePos.y - worldPos.y * newScale;

    this.updateViewState({
      scale: newScale,
      offsetX: newOffsetX,
      offsetY: newOffsetY
    });
  }

  /**
   * Check if annotation system is currently drawing
   */
  private isAnnotationDrawing(): boolean {
    const isDrawing = this.canvas.annotationManager ? this.canvas.annotationManager.isDrawing() : false;
    return isDrawing;
  }

  /**
   * Handle mouse down for panning
   */
  private handleMouseDown(event: MouseEvent): void {
    // Don't handle panning if no image is loaded
    if (!this.isImageLoaded()) {
      return;
    }
    
    // Don't handle panning if pan is disabled
    if (!this.options.enablePan) {
      return;
    }
    
    // Don't handle panning if annotation system is drawing
    if (this.isAnnotationDrawing()) {
      return;
    }
    
    // Don't handle panning if annotation tool is active
    if (this.canvas.annotationManager && this.canvas.annotationManager.isToolActive()) {
      return;
    }
    
    if (event.button === 0) { // Left mouse button only
      this.isPanning = true;
      this.lastPanPoint = this.canvas.getMousePosition(event);
      this.updateCursor();
    }
  }

  /**
   * Handle mouse move for panning
   */
  private handleMouseMove(event: MouseEvent): void {
    // Don't handle panning if pan is disabled
    if (!this.options.enablePan) {
      return;
    }
    
    // Don't handle panning if annotation system is drawing
    if (this.isAnnotationDrawing()) {
      return;
    }
    
    if (!this.isPanning) return;

    const currentPos = this.canvas.getMousePosition(event);
    const currentViewState = this.canvas.getViewState();
    
    const deltaX = (currentPos.x - this.lastPanPoint.x) * this.options.panSpeed;
    const deltaY = (currentPos.y - this.lastPanPoint.y) * this.options.panSpeed;

    this.updateViewState({
      offsetX: currentViewState.offsetX + deltaX,
      offsetY: currentViewState.offsetY + deltaY
    });

    this.lastPanPoint = currentPos;
  }

  /**
   * Handle mouse up for panning
   */
  private handleMouseUp(event: MouseEvent): void {
    this.isPanning = false;
    this.updateCursor();
  }

  /**
   * Update view state and trigger events
   */
  private updateViewState(newState: Partial<ViewState>): void {
    const oldState = this.canvas.getViewState();
    this.canvas.setViewState(newState);
    
    const currentState = this.canvas.getViewState();
    
    // Trigger events if values changed
    if (oldState.scale !== currentState.scale && this.eventHandlers.onZoomChange) {
      this.eventHandlers.onZoomChange(currentState.scale);
    }
    
    if ((oldState.offsetX !== currentState.offsetX || oldState.offsetY !== currentState.offsetY) && 
        this.eventHandlers.onPanChange) {
      this.eventHandlers.onPanChange({
        x: currentState.offsetX,
        y: currentState.offsetY
      });
    }

    // Trigger a custom event to notify that view state has changed
    // This will be used by ImageViewer to re-render
    const viewStateChangeEvent = new CustomEvent('viewStateChange', {
      detail: { viewState: currentState }
    });
    this.canvas.getElement().dispatchEvent(viewStateChangeEvent);
  }

  /**
   * Zoom to a specific scale
   */
  zoomTo(scale: number, center?: Point): void {
    // Don't zoom if no image is loaded
    if (!this.isImageLoaded()) {
      return;
    }
    
    const clampedScale = clamp(scale, this.options.minZoom, this.options.maxZoom);
    const currentState = this.canvas.getViewState();
    
    if (center) {
      // Zoom to specific center point
      const worldPos = screenToWorld(center, currentState);
      const newOffsetX = center.x - worldPos.x * clampedScale;
      const newOffsetY = center.y - worldPos.y * clampedScale;
      
      this.updateViewState({
        scale: clampedScale,
        offsetX: newOffsetX,
        offsetY: newOffsetY
      });
    } else {
      // Zoom to center of canvas
      const canvasSize = this.canvas.getSize();
      const centerPoint: Point = {
        x: canvasSize.width / 2,
        y: canvasSize.height / 2
      };
      
      // Calculate world position at current center
      const worldPos = screenToWorld(centerPoint, currentState);
      
      // Calculate new offset to maintain center
      const newOffsetX = centerPoint.x - worldPos.x * clampedScale;
      const newOffsetY = centerPoint.y - worldPos.y * clampedScale;
      
      this.updateViewState({
        scale: clampedScale,
        offsetX: newOffsetX,
        offsetY: newOffsetY
      });
    }
  }

  /**
   * Zoom in by a factor
   */
  zoomIn(factor: number = 1.2): void {
    // Don't zoom if no image is loaded
    if (!this.isImageLoaded()) {
      return;
    }
    
    const currentState = this.canvas.getViewState();
    this.zoomTo(currentState.scale * factor);
  }

  /**
   * Zoom out by a factor
   */
  zoomOut(factor: number = 1.2): void {
    // Don't zoom if no image is loaded
    if (!this.isImageLoaded()) {
      return;
    }
    
    const currentState = this.canvas.getViewState();
    this.zoomTo(currentState.scale / factor);
  }

  /**
   * Reset zoom and pan to initial state
   */
  reset(): void {
    if (this.initialViewState) {
      this.updateViewState(this.initialViewState);
    } else {
      this.updateViewState({
        scale: 1,
        offsetX: 0,
        offsetY: 0
      });
    }
  }

  /**
   * Fit image to view (if image bounds are available)
   */
  fitToView(imageBounds: { x: number; y: number; width: number; height: number }): void {
    // Don't fit to view if no image is loaded
    if (!this.isImageLoaded()) {
      return;
    }
    
    const canvasSize = this.canvas.getSize();
    
    // Calculate scale to fit image within canvas
    const scaleX = canvasSize.width / imageBounds.width;
    const scaleY = canvasSize.height / imageBounds.height;
    const scale = Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 100%
    
    // Calculate center position to center the image
    const scaledWidth = imageBounds.width * scale;
    const scaledHeight = imageBounds.height * scale;
    
    // Calculate offset to center the image, accounting for its current position
    const offsetX = (canvasSize.width - scaledWidth) / 2 - imageBounds.x * scale;
    const offsetY = (canvasSize.height - scaledHeight) / 2 - imageBounds.y * scale;
    
    this.updateViewState({
      scale,
      offsetX,
      offsetY
    });
  }

  /**
   * Fit image to view for overlay mode (allows scaling up)
   */
  fitToViewOverlay(imageBounds: { x: number; y: number; width: number; height: number }): void {
    // Don't fit to view if no image is loaded
    if (!this.isImageLoaded()) {
      return;
    }
    
    const canvasSize = this.canvas.getSize();
    
    // Calculate scale to fit image within canvas
    const scaleX = canvasSize.width / imageBounds.width;
    const scaleY = canvasSize.height / imageBounds.height;
    const scale = Math.min(scaleX, scaleY); // Allow scaling up for overlay
    
    // Calculate center position to center the image
    const scaledWidth = imageBounds.width * scale;
    const scaledHeight = imageBounds.height * scale;
    
    // Calculate offset to center the image, accounting for its current position
    const offsetX = (canvasSize.width - scaledWidth) / 2 - imageBounds.x * scale;
    const offsetY = (canvasSize.height - scaledHeight) / 2 - imageBounds.y * scale;
    
    this.updateViewState({
      scale,
      offsetX,
      offsetY
    });
  }

  /**
   * Get current zoom level
   */
  getZoomLevel(): number {
    return this.canvas.getViewState().scale;
  }

  /**
   * Get current pan offset
   */
  getPanOffset(): Point {
    const state = this.canvas.getViewState();
    return { x: state.offsetX, y: state.offsetY };
  }

  /**
   * Update options
   */
  updateOptions(newOptions: Partial<ZoomPanOptions>): void {
    const oldOptions = { ...this.options };
    this.options = { ...this.options, ...newOptions };
    
    // Update event listeners if zoom/pan settings changed
    if (oldOptions.enableZoom !== this.options.enableZoom || 
        oldOptions.enablePan !== this.options.enablePan) {
      this.updateEventListeners();
    }
    
    // Update cursor state
    this.updateCursor();
  }

  /**
   * Update event handlers
   */
  setEventHandlers(handlers: EventHandlers): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  /**
   * Update initial view state (called when image is loaded)
   */
  updateInitialViewState(viewState: ViewState): void {
    this.initialViewState = { ...viewState };
  }

  /**
   * Destroy the handler and remove event listeners
   */
  destroy(): void {
    // Remove all event listeners
    this.removeEventListeners();
    
    // Clear pending wheel timeout
    if (this.wheelTimeout) {
      clearTimeout(this.wheelTimeout);
      this.wheelTimeout = null;
    }
    
    // Reset state
    this.isPanning = false;
    this.lastPanPoint = { x: 0, y: 0 };
    this.initialViewState = null;
    this.annotationManager = null;
  }
}
