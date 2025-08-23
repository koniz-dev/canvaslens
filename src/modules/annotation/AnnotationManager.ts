import { Canvas } from '../../core/Canvas';
import { Annotation, AnnotationStyle, Tool, Point, EventHandlers } from '../../types';
import { AnnotationRenderer } from './AnnotationRenderer';
import { ToolManager, ToolManagerOptions } from './ToolManager';

export interface AnnotationManagerOptions {
  enabled?: boolean;
  defaultStyle?: AnnotationStyle;
  availableTools?: Tool[];
  eventHandlers?: EventHandlers;
}

export class AnnotationManager {
  private canvas: Canvas;
  private renderer: AnnotationRenderer;
  private toolManager: ToolManager;
  private annotations: Map<string, Annotation> = new Map();
  private selectedAnnotation: Annotation | null = null;
  private eventHandlers: EventHandlers;
  private enabled = true;

  constructor(canvas: Canvas, options: AnnotationManagerOptions = {}) {
    this.canvas = canvas;
    this.eventHandlers = options.eventHandlers || {};
    this.enabled = options.enabled !== false;

    // Initialize renderer
    this.renderer = new AnnotationRenderer(canvas.getContext());

    // Default style
    const defaultStyle: AnnotationStyle = {
      strokeColor: '#ff0000',
      strokeWidth: 2,
      fontSize: 16,
      fontFamily: 'Arial, sans-serif',
      ...options.defaultStyle
    };

    // Default available tools
    const availableTools: Tool[] = options.availableTools || [
      { name: 'Rectangle', type: 'rect', icon: '⬜' },
      { name: 'Arrow', type: 'arrow', icon: '↗' },
      { name: 'Text', type: 'text', icon: 'T' }
    ];

    // Initialize tool manager
    const toolManagerOptions: ToolManagerOptions = {
      defaultStyle,
      availableTools
    };

    this.toolManager = new ToolManager(canvas, this.renderer, toolManagerOptions);
    
    // Set up annotation creation callback
    this.toolManager.setOnAnnotationCreate((annotation) => {
      this.addAnnotation(annotation);
    });

    // Set up tool change callback for UI updates
    this.toolManager.setOnToolChange((toolType) => {
      if (this.eventHandlers.onToolChange) {
        this.eventHandlers.onToolChange(toolType);
      }
    });

    this.setupEventListeners();
  }

  /**
   * Setup event listeners for annotation management
   */
  private setupEventListeners(): void {
    // Right-click for context menu or selection
    this.canvas.addEventListener('contextmenu', this.handleContextMenu.bind(this) as EventListener);
    
    // Click for selection (when not drawing) - use a different approach to avoid conflicts
    this.canvas.addEventListener('click', this.handleClick.bind(this) as EventListener);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  /**
   * Handle context menu (right-click)
   */
  private handleContextMenu(event: MouseEvent): void {
    if (!this.enabled || this.toolManager.isDrawing()) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const point = this.canvas.getMousePosition(event);
    const worldPoint = this.screenToWorld(point);
    
    // Find annotation under cursor
    const annotation = this.getAnnotationAt(worldPoint);
    if (annotation) {
      this.selectAnnotation(annotation);
      // TODO: Show context menu for delete/edit
    }
  }

  /**
   * Handle click for selection
   */
  private handleClick(event: MouseEvent): void {
    if (!this.enabled || this.toolManager.isDrawing()) return;
    
    // Don't prevent default or stop propagation here to allow normal drawing
    const point = this.canvas.getMousePosition(event);
    const worldPoint = this.screenToWorld(point);
    
    // Find annotation under cursor
    const annotation = this.getAnnotationAt(worldPoint);
    this.selectAnnotation(annotation);
  }

  /**
   * Handle keyboard shortcuts
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.enabled) return;

    // Delete selected annotation
    if (event.key === 'Delete' || event.key === 'Backspace') {
      if (this.selectedAnnotation) {
        this.removeAnnotation(this.selectedAnnotation.id);
        event.preventDefault();
      }
    }

    // Clear selection
    if (event.key === 'Escape') {
      this.selectAnnotation(null);
    }
  }

  /**
   * Convert screen coordinates to world coordinates
   */
  private screenToWorld(screenPoint: Point): Point {
    const viewState = this.canvas.getViewState();
    return {
      x: (screenPoint.x - viewState.offsetX) / viewState.scale,
      y: (screenPoint.y - viewState.offsetY) / viewState.scale
    };
  }

  /**
   * Set event handlers
   */
  setEventHandlers(handlers: EventHandlers): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
    
    // Setup tool change callback if provided
    if (handlers.onToolChange) {
      this.toolManager.setOnToolChange(handlers.onToolChange);
    }
  }

  /**
   * Add annotation
   */
  addAnnotation(annotation: Annotation): void {
    this.annotations.set(annotation.id, annotation);
    
    if (this.eventHandlers.onAnnotationAdd) {
      this.eventHandlers.onAnnotationAdd(annotation);
    }
  }

  /**
   * Remove annotation
   */
  removeAnnotation(id: string): boolean {
    const annotation = this.annotations.get(id);
    if (!annotation) return false;

    this.annotations.delete(id);
    
    // Clear selection if removing selected annotation
    if (this.selectedAnnotation?.id === id) {
      this.selectedAnnotation = null;
    }

    if (this.eventHandlers.onAnnotationRemove) {
      this.eventHandlers.onAnnotationRemove(id);
    }

    return true;
  }

  /**
   * Get annotation by ID
   */
  getAnnotation(id: string): Annotation | undefined {
    return this.annotations.get(id);
  }

  /**
   * Get all annotations
   */
  getAllAnnotations(): Annotation[] {
    return Array.from(this.annotations.values());
  }

  /**
   * Get annotation at specific point
   */
  getAnnotationAt(point: Point): Annotation | null {
    // Check annotations in reverse order (last drawn first)
    const annotationArray = this.getAllAnnotations().reverse();
    
    for (const annotation of annotationArray) {
      if (this.renderer.hitTest(point, annotation)) {
        return annotation;
      }
    }
    
    return null;
  }

  /**
   * Select annotation
   */
  selectAnnotation(annotation: Annotation | null): void {
    this.selectedAnnotation = annotation;
    
    // TODO: Trigger selection event
  }

  /**
   * Get selected annotation
   */
  getSelectedAnnotation(): Annotation | null {
    return this.selectedAnnotation;
  }

  /**
   * Clear all annotations
   */
  clearAll(): void {
    const annotationIds = Array.from(this.annotations.keys());
    this.annotations.clear();
    this.selectedAnnotation = null;

    // Trigger remove events for all annotations
    if (this.eventHandlers.onAnnotationRemove) {
      annotationIds.forEach(id => {
        this.eventHandlers.onAnnotationRemove!(id);
      });
    }
  }

  /**
   * Render all annotations
   */
  render(): void {
    if (!this.enabled) return;

    const annotations = this.getAllAnnotations();
    
    // Render all annotations (no need to apply view transform since annotations are in world coordinates)
    this.renderer.renderAll(annotations);
    
    // Render selection highlight
    if (this.selectedAnnotation) {
      this.renderSelectionHighlight(this.selectedAnnotation);
    }
    
    // Render current drawing preview
    this.toolManager.renderPreview();
  }

  /**
   * Render selection highlight
   */
  private renderSelectionHighlight(annotation: Annotation): void {
    const ctx = this.canvas.getContext();
    
    ctx.save();
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    
    // Create a bounding box around the annotation
    const bounds = this.getAnnotationBounds(annotation);
    if (bounds) {
      const padding = 5;
      ctx.strokeRect(
        bounds.x - padding,
        bounds.y - padding,
        bounds.width + padding * 2,
        bounds.height + padding * 2
      );
    }
    
    ctx.restore();
  }

  /**
   * Get annotation bounding box
   */
  private getAnnotationBounds(annotation: Annotation): { x: number; y: number; width: number; height: number } | null {
    if (annotation.points.length === 0) return null;

    let minX = annotation.points[0]!.x;
    let maxX = annotation.points[0]!.x;
    let minY = annotation.points[0]!.y;
    let maxY = annotation.points[0]!.y;

    annotation.points.forEach(point => {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    });

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  /**
   * Get tool manager
   */
  getToolManager(): ToolManager {
    return this.toolManager;
  }

  /**
   * Enable/disable annotation system
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if annotation system is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Check if currently drawing annotation
   */
  isDrawing(): boolean {
    return this.toolManager.isToolManagerDrawing();
  }

  /**
   * Check if any tool is active
   */
  isToolActive(): boolean {
    return this.toolManager.isToolActive();
  }

  /**
   * Get active tool type
   */
  getActiveToolType(): string | null {
    return this.toolManager.getActiveToolType();
  }

  /**
   * Activate a tool
   */
  activateTool(toolType: string): boolean {
    return this.toolManager.activateTool(toolType);
  }

  /**
   * Deactivate current tool
   */
  deactivateTool(): void {
    this.toolManager.deactivateTool();
  }

  /**
   * Set callback for tool change events
   */
  setOnToolChange(callback: (toolType: string | null) => void): void {
    this.toolManager.setOnToolChange(callback);
  }

  /**
   * Update annotation style
   */
  updateStyle(style: Partial<AnnotationStyle>): void {
    this.toolManager.updateToolStyle(style);
  }

  /**
   * Export annotations as JSON
   */
  exportAnnotations(): string {
    const annotations = this.getAllAnnotations();
    return JSON.stringify(annotations, null, 2);
  }

  /**
   * Import annotations from JSON
   */
  importAnnotations(jsonData: string): boolean {
    try {
      const annotations: Annotation[] = JSON.parse(jsonData);
      
      // Validate annotations
      if (!Array.isArray(annotations)) {
        throw new Error('Invalid annotation data format');
      }

      // Clear existing annotations
      this.clearAll();

      // Add imported annotations
      annotations.forEach(annotation => {
        if (this.isValidAnnotation(annotation)) {
          this.addAnnotation(annotation);
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to import annotations:', error);
      return false;
    }
  }

  /**
   * Validate annotation object
   */
  private isValidAnnotation(annotation: any): annotation is Annotation {
    return (
      annotation &&
      typeof annotation.id === 'string' &&
      typeof annotation.type === 'string' &&
      Array.isArray(annotation.points) &&
      annotation.style &&
      typeof annotation.style.strokeColor === 'string'
    );
  }

  /**
   * Get annotation count
   */
  getAnnotationCount(): number {
    return this.annotations.size;
  }

  /**
   * Destroy annotation manager
   */
  destroy(): void {
    // Clean up tool manager
    this.toolManager.destroy();

    // Remove event listeners
    this.canvas.removeEventListener('contextmenu', this.handleContextMenu.bind(this) as EventListener);
    this.canvas.removeEventListener('click', this.handleClick.bind(this) as EventListener);
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));

    // Clear annotations
    this.clearAll();
  }
}
