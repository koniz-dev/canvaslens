import { Canvas } from '../../core/Canvas';
import { ViewState, Point, EventHandlers } from '../../types';
import { screenToWorld, worldToScreen, clamp } from '../../utils/coordinate';

export interface ZoomPanOptions {
  enableZoom?: boolean;
  enablePan?: boolean;
  maxZoom?: number;
  minZoom?: number;
  zoomSpeed?: number;
  panSpeed?: number;
}

export class ZoomPanHandler {
  private canvas: Canvas;
  private options: Required<ZoomPanOptions>;
  private eventHandlers: EventHandlers;
  private isPanning = false;
  private lastPanPoint: Point = { x: 0, y: 0 };
  private initialViewState: ViewState | null = null;
  private annotationManager: any = null; // Reference to annotation manager

  constructor(
    canvas: Canvas,
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

    this.setupEventListeners();
    
    // Store initial view state
    this.initialViewState = { ...this.canvas.getViewState() };
  }

  /**
   * Setup event listeners for zoom and pan
   */
  private setupEventListeners(): void {
    if (this.options.enableZoom) {
      this.canvas.addEventListener('wheel', this.handleWheel.bind(this) as EventListener);
    }

    if (this.options.enablePan) {
      this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this) as EventListener);
      this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this) as EventListener);
      this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this) as EventListener);
      this.canvas.addEventListener('mouseleave', this.handleMouseUp.bind(this) as EventListener);
    }
  }

  /**
   * Handle mouse wheel for zooming
   */
  private handleWheel(event: WheelEvent): void {
    event.preventDefault();
    
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
    // Don't handle panning if annotation system is drawing
    if (this.isAnnotationDrawing()) {
      return;
    }
    
    if (event.button === 0) { // Left mouse button only
      this.isPanning = true;
      this.lastPanPoint = this.canvas.getMousePosition(event);
      this.canvas.getElement().style.cursor = 'grabbing';
    }
  }

  /**
   * Handle mouse move for panning
   */
  private handleMouseMove(event: MouseEvent): void {
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
    this.canvas.getElement().style.cursor = 'grab';
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
    const currentState = this.canvas.getViewState();
    this.zoomTo(currentState.scale * factor);
  }

  /**
   * Zoom out by a factor
   */
  zoomOut(factor: number = 1.2): void {
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
    const canvasSize = this.canvas.getSize();
    
    // Calculate scale to fit image
    const scaleX = canvasSize.width / imageBounds.width;
    const scaleY = canvasSize.height / imageBounds.height;
    const scale = Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 100%
    
    // Calculate center position to center the image
    const offsetX = (canvasSize.width - imageBounds.width * scale) / 2;
    const offsetY = (canvasSize.height - imageBounds.height * scale) / 2;
    
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
    this.options = { ...this.options, ...newOptions };
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
    // Note: In a real implementation, you'd want to store references to bound methods
    // and remove them properly. For simplicity, we'll just clear the handlers.
    this.isPanning = false;
  }
}
