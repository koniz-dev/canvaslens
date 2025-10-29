import { Renderer } from '../../core/Renderer';
import type {
  AnnotationStyle,
  Tool,
  EventHandlers,
  Annotation,
  Point,
  AnnotationManagerOptions,
  Rectangle,
  ToolManagerOptions
} from '../../types';
import { error } from '../../utils/core/logger';
import { MemoryManager } from '../../utils/core/memory-manager';
import { ValidationHelper } from '../../utils/core/validation-helper';
import { AnnotationRenderer } from './Renderer';
import { AnnotationToolsManager } from './tools/Manager';

export class AnnotationManager {
  private canvas: Renderer;
  private renderer: AnnotationRenderer;
  private toolManager: AnnotationToolsManager;
  private annotations: Map<string, Annotation> = new Map();
  private selectedAnnotation: Annotation | null = null;
  private eventHandlers: EventHandlers;
  private enabled = true;
  private isDragging = false;
  private dragOffset: Point | null = null;
  private hasUnsavedChanges = false;
  private throttledMouseMove: ((event: MouseEvent) => void) & { cleanup?: () => void };
  private cleanupCallback: () => void;

  constructor(canvas: Renderer, options: AnnotationManagerOptions = {}) {
    this.canvas = canvas;
    this.eventHandlers = options.eventHandlers || {};
    this.enabled = options.enabled !== false;

    this.renderer = new AnnotationRenderer(canvas);

    const defaultStyle: AnnotationStyle = {
      strokeColor: '#ff0000',
      strokeWidth: 2,
      lineStyle: 'solid',
      fontSize: 16,
      fontFamily: 'Arial, sans-serif',
      ...options.defaultStyle
    };

    const availableTools: Tool[] = options.availableTools || [
      { name: 'Rectangle', type: 'rect', icon: '⬜' },
      { name: 'Arrow', type: 'arrow', icon: '↗' },
      { name: 'Text', type: 'text', icon: 'T' },
      { name: 'Circle', type: 'circle', icon: '⭕' },
      { name: 'Line', type: 'line', icon: '📏' }
    ];

    const toolManagerOptions: ToolManagerOptions = {
      defaultStyle,
      availableTools,
      annotationManager: this
    };

    this.toolManager = new AnnotationToolsManager(canvas, this.renderer, toolManagerOptions);

    this.toolManager.setOnAnnotationCreate((annotation) => {
      this.addAnnotation(annotation);
    });


    this.throttledMouseMove = MemoryManager.throttle(this.handleMouseMove.bind(this), 16) as ((event: MouseEvent) => void) & { cleanup?: () => void };
    this.cleanupCallback = this.cleanup.bind(this);
    MemoryManager.registerCleanup(this.cleanupCallback);

    this.setupEventListeners();
  }

  /**
   * Setup event listeners for annotation management
   */
  private setupEventListeners(): void {
    this.canvas.addEventListener('contextmenu', this.handleContextMenu.bind(this) as EventListener);

    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this) as EventListener, true);
    this.canvas.addEventListener('mousemove', this.throttledMouseMove as unknown as EventListener);
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this) as EventListener);

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

    const annotation = this.getAnnotationAt(worldPoint);
    if (annotation) {
      this.selectAnnotation(annotation);
      this.showContextMenu(event, annotation);
    }
  }

  /**
   * Handle mouse down for selection and dragging
   */
  private handleMouseDown(event: MouseEvent): void {
    if (!this.canHandleMouseDown(event)) return;

    const worldPoint = this.getWorldPointFromEvent(event);
    const annotation = this.getAnnotationAt(worldPoint);

    if (annotation) {
      this.handleAnnotationClick(annotation, worldPoint, event);
    } else {
      this.handleEmptySpaceClick();
    }
  }

  private canHandleMouseDown(event: MouseEvent): boolean {
    if (!this.enabled || event.button !== 0) {
      return false;
    }

    return !this.toolManager.isDrawing() &&
      this.hasEnabledAnnotationTools() &&
      !this.isComparisonModeActive();
  }

  private getWorldPointFromEvent(event: MouseEvent): Point {
    const point = this.canvas.getMousePosition(event);
    return this.screenToWorld(point);
  }

  private handleAnnotationClick(annotation: Annotation, worldPoint: Point, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.selectAnnotation(annotation);

    if (this.selectedAnnotation === annotation) {
      this.startDragging(annotation, worldPoint);
    }
  }

  private startDragging(annotation: Annotation, worldPoint: Point): void {
    this.isDragging = true;

    const annotationCenter = this.getAnnotationCenter(annotation);
    this.dragOffset = {
      x: worldPoint.x - annotationCenter.x,
      y: worldPoint.y - annotationCenter.y
    };
  }

  private handleEmptySpaceClick(): void {
    this.selectAnnotation(null);
  }

  /**
   * Handle mouse move for dragging and hover detection
   */
  private handleMouseMove(...args: unknown[]): void {
    const event = args[0] as MouseEvent;
    if (!this.enabled) return;

    const worldPoint = this.getWorldPointFromEvent(event);

    if (this.isDragging && this.selectedAnnotation && this.dragOffset) {
      this.handleDragging(worldPoint, event);
      return;
    }

    this.handleHoverDetection(worldPoint);
  }

  private handleDragging(worldPoint: Point, event: MouseEvent): void {
    const newCenter = this.calculateNewCenter(worldPoint);
    this.moveAnnotation(this.selectedAnnotation!, newCenter);
    this.triggerViewStateChange();

    event.preventDefault();
    event.stopPropagation();
  }

  private calculateNewCenter(worldPoint: Point): Point {
    return {
      x: worldPoint.x - this.dragOffset!.x,
      y: worldPoint.y - this.dragOffset!.y
    };
  }

  private triggerViewStateChange(): void {
    this.canvas.getElement().dispatchEvent(new CustomEvent('viewStateChange'));
  }

  private handleHoverDetection(worldPoint: Point): void {
    if (this.isDragging || this.toolManager.isDrawing()) return;

    const hoveredAnnotation = this.getAnnotationAt(worldPoint);
    this.updateCursorStyle(hoveredAnnotation);
  }

  private updateCursorStyle(hoveredAnnotation: Annotation | null): void {
    const cursor = hoveredAnnotation ? 'move' : 'default';
    this.canvas.getElement().style.cursor = cursor;
  }

  /**
   * Handle mouse up to stop dragging
   */
  private handleMouseUp(event: MouseEvent): void {
    if (this.isDragging) {
      this.isDragging = false;
      this.dragOffset = null;

      event.preventDefault();
      event.stopPropagation();
    }
  }

  /**
   * Handle keyboard shortcuts
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.enabled) return;

    if (event.key === 'Delete' || event.key === 'Backspace') {
      if (this.selectedAnnotation) {
        this.removeAnnotation(this.selectedAnnotation.id);
        event.preventDefault();
      }
    }

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

  }

  /**
   * Add annotation
   */
  addAnnotation(annotation: Annotation): void {
    if (!ValidationHelper.isValidAnnotation(annotation)) {
      error('Invalid annotation data:', annotation);
      return;
    }

    this.annotations.set(annotation.id, annotation);
    this.hasUnsavedChanges = true;

    this.triggerViewStateChange();

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
    this.hasUnsavedChanges = true;

    if (this.selectedAnnotation?.id === id) {
      this.selectedAnnotation = null;
    }

    this.canvas.getElement().dispatchEvent(new CustomEvent('viewStateChange'));

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
   * Get center point of annotation
   */
  private getAnnotationCenter(annotation: Annotation): Point {
    if (annotation.points.length === 0) return { x: 0, y: 0 };

    if (annotation.type === 'rect' && annotation.points.length >= 2) {
      const point1 = annotation.points[0];
      const point2 = annotation.points[1];
      if (!point1 || !point2) return { x: 0, y: 0 };

      const minX = Math.min(point1.x, point2.x);
      const maxX = Math.max(point1.x, point2.x);
      const minY = Math.min(point1.y, point2.y);
      const maxY = Math.max(point1.y, point2.y);

      return {
        x: (minX + maxX) / 2,
        y: (minY + maxY) / 2
      };
    }

    const firstPoint = annotation.points[0];
    return firstPoint || { x: 0, y: 0 };
  }

  /**
   * Move annotation to new center position
   */
  private moveAnnotation(annotation: Annotation, newCenter: Point): void {
    const currentCenter = this.getAnnotationCenter(annotation);
    const offset = {
      x: newCenter.x - currentCenter.x,
      y: newCenter.y - currentCenter.y
    };

    annotation.points = annotation.points.map(point => ({
      x: point.x + offset.x,
      y: point.y + offset.y
    }));
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

    const event = new CustomEvent('annotationselect', {
      detail: annotation
    });
    this.canvas.getElement().dispatchEvent(event);
  }

  /**
   * Get selected annotation
   */
  getSelectedAnnotation(): Annotation | null {
    return this.selectedAnnotation;
  }

  /**
   * Check if any annotation is selected
   */
  hasSelectedAnnotation(): boolean {
    return this.selectedAnnotation !== null;
  }

  /**
   * Clear all annotations
   */
  clearAll(): void {
    const annotationIds = Array.from(this.annotations.keys());
    this.annotations.clear();
    this.selectedAnnotation = null;
    this.hasUnsavedChanges = true;

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


    this.renderer.renderAll(annotations);

    if (this.selectedAnnotation) {
      this.renderSelectionHighlight(this.selectedAnnotation);
    }

    this.toolManager.renderPreview();
  }

  /**
   * Render selection highlight
   */
  private renderSelectionHighlight(annotation: Annotation): void {
    const ctx = this.canvas.getContext();

    this.setupSelectionContext(ctx);
    this.renderSelectionByType(annotation, ctx);
    ctx.restore();
  }

  private setupSelectionContext(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
  }

  private renderSelectionByType(annotation: Annotation, ctx: CanvasRenderingContext2D): void {
    switch (annotation.type) {
      case 'rect':
        this.renderRectangleSelection(annotation);
        break;
      case 'circle':
        this.renderCircleSelection(annotation);
        break;
      case 'line':
      case 'arrow':
        this.renderLineSelection(annotation);
        break;
      case 'text':
        this.renderTextSelection(annotation);
        break;
      default:
        this.renderDefaultSelection(annotation, ctx);
    }
  }

  private renderDefaultSelection(annotation: Annotation, ctx: CanvasRenderingContext2D): void {
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
  }

  /**
   * Render rectangle selection highlight
   */
  private renderRectangleSelection(annotation: Annotation): void {
    if (annotation.type !== 'rect' || annotation.points.length < 2) return;

    const ctx = this.canvas.getContext();
    const start = annotation.points[0]!;
    const end = annotation.points[1]!;
    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);

    const padding = 5;
    ctx.strokeRect(
      minX - padding,
      minY - padding,
      (maxX - minX) + padding * 2,
      (maxY - minY) + padding * 2
    );
  }

  /**
   * Render circle selection highlight
   */
  private renderCircleSelection(annotation: Annotation): void {
    if (annotation.type !== 'circle' || annotation.points.length < 2) return;

    const ctx = this.canvas.getContext();
    const center = annotation.points[0]!;
    const edge = annotation.points[1]!;
    const radius = Math.sqrt(
      Math.pow(edge.x - center.x, 2) + Math.pow(edge.y - center.y, 2)
    );

    const padding = 5;
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius + padding, 0, 2 * Math.PI);
    ctx.stroke();
  }

  /**
   * Render line/arrow selection highlight
   */
  private renderLineSelection(annotation: Annotation): void {
    if ((annotation.type !== 'line' && annotation.type !== 'arrow') || annotation.points.length < 2) return;

    const ctx = this.canvas.getContext();
    const padding = 10;

    for (let i = 0; i < annotation.points.length - 1; i++) {
      const start = annotation.points[i]!;
      const end = annotation.points[i + 1]!;

      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const length = Math.sqrt(dx * dx + dy * dy);

      if (length > 0) {
        const offsetX = (-dy / length) * padding;
        const offsetY = (dx / length) * padding;

        ctx.beginPath();
        ctx.moveTo(start.x + offsetX, start.y + offsetY);
        ctx.lineTo(end.x + offsetX, end.y + offsetY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(start.x - offsetX, start.y - offsetY);
        ctx.lineTo(end.x - offsetX, end.y - offsetY);
        ctx.stroke();
      }
    }
  }

  /**
   * Render text selection highlight
   */
  private renderTextSelection(annotation: Annotation): void {
    if (annotation.type !== 'text' || annotation.points.length < 1 || !annotation.data?.text) return;

    const ctx = this.canvas.getContext();
    const textPos = annotation.points[0]!;
    const text = annotation.data.text as string;
    const fontSize = annotation.style.fontSize || 16;
    const fontFamily = annotation.style.fontFamily || 'Arial, sans-serif';

    ctx.font = `${fontSize}px ${fontFamily}`;

    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width;

    const textHeight = fontSize * 0.8;

    const padding = 5;
    ctx.strokeRect(
      textPos.x - padding,
      textPos.y - textHeight - padding,
      textWidth + padding * 2,
      textHeight + padding * 2
    );
  }

  /**
   * Get annotation bounding box
   */
  private getAnnotationBounds(annotation: Annotation): Rectangle | null {
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
  getToolManager(): AnnotationToolsManager {
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
   * Check if a tool is enabled
   */
  isToolEnabled(_toolType: string): boolean {
    return this.enabled;
  }

  /**
   * Deactivate current tool
   */
  deactivateTool(): void {
    this.toolManager.deactivateTool();
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

      this.clearAll();

      annotations.forEach(annotation => {
        if (this.isValidAnnotation(annotation)) {
          this.addAnnotation(annotation);
        }
      });

      return true;
    } catch (err) {
      error('Failed to import annotations:', err);
      return false;
    }
  }

  /**
   * Validate annotation object
   */
  private isValidAnnotation(annotation: unknown): annotation is Annotation {
    return (
      annotation !== null &&
      typeof annotation === 'object' &&
      'id' in annotation &&
      'type' in annotation &&
      'points' in annotation &&
      'style' in annotation &&
      typeof (annotation as Record<string, unknown>).id === 'string' &&
      typeof (annotation as Record<string, unknown>).type === 'string' &&
      Array.isArray((annotation as Record<string, unknown>).points) &&
      (annotation as Record<string, unknown>).style !== null &&
      typeof ((annotation as Record<string, unknown>).style as Record<string, unknown>).strokeColor === 'string'
    );
  }

  /**
   * Get annotation count
   */
  getAnnotationCount(): number {
    return this.annotations.size;
  }

  /**
   * Get image bounds from the parent viewer (if available)
   */
  getImageBounds(): Rectangle | null {
    if (this.canvas.imageViewer) {
      return this.canvas.imageViewer.getImageBounds();
    }
    return null;
  }

  /**
   * Show context menu for annotation
   */
  private showContextMenu(event: MouseEvent, annotation: Annotation): void {
    const contextMenu = document.createElement('div');
    contextMenu.className = 'annotation-context-menu';
    contextMenu.style.cssText = `
      position: fixed;
      top: ${event.clientY}px;
      left: ${event.clientX}px;
      background: white;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      z-index: 1000;
      padding: 4px 0;
      min-width: 120px;
    `;

    const deleteOption = document.createElement('div');
    deleteOption.textContent = 'Delete';
    deleteOption.style.cssText = `
      padding: 8px 16px;
      cursor: pointer;
      font-size: 14px;
    `;
    deleteOption.addEventListener('click', () => {
      this.removeAnnotation(annotation.id);
      document.body.removeChild(contextMenu);
    });
    deleteOption.addEventListener('mouseenter', () => {
      deleteOption.style.backgroundColor = '#f0f0f0';
    });
    deleteOption.addEventListener('mouseleave', () => {
      deleteOption.style.backgroundColor = 'transparent';
    });

    contextMenu.appendChild(deleteOption);

    document.body.appendChild(contextMenu);

    const removeMenu = (e: Event) => {
      if (!contextMenu.contains(e.target as Node)) {
        document.body.removeChild(contextMenu);
        document.removeEventListener('click', removeMenu);
      }
    };
    // Use requestAnimationFrame for better performance and cleanup
    requestAnimationFrame(() => {
      document.addEventListener('click', removeMenu);
    });
  }

  /**
   * Check if any annotation tools are enabled
   */
  private hasEnabledAnnotationTools(): boolean {
    if (!this.toolManager) return false;

    const toolConfig = this.toolManager.getToolConfig();
    return toolConfig.rect || toolConfig.arrow || toolConfig.text ||
      toolConfig.circle || toolConfig.line;
  }

  /**
   * Check if comparison mode is active
   */
  private isComparisonModeActive(): boolean {
    if (this.canvas.imageViewer && 'isComparisonMode' in this.canvas.imageViewer && typeof (this.canvas.imageViewer as unknown as Record<string, unknown>).isComparisonMode === 'function') {
      return ((this.canvas.imageViewer as unknown as Record<string, unknown>).isComparisonMode as () => boolean)();
    }
    return false;
  }

  /**
   * Update tool configuration
   */
  updateToolConfig(annotationConfig: Record<string, unknown>): void {
    if (this.toolManager) {
      this.toolManager.updateToolConfig(annotationConfig);
    }
  }

  /**
   * Destroy annotation manager
   */
  destroy(): void {
    this.toolManager.destroy();

    this.canvas.removeEventListener('contextmenu', this.handleContextMenu.bind(this) as EventListener);
    this.canvas.removeEventListener('mousedown', this.handleMouseDown.bind(this) as EventListener, true);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove.bind(this) as EventListener);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp.bind(this) as EventListener);
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));

    this.clearAll();
    this.isDragging = false;
    this.dragOffset = null;
  }

  /**
   * Cleanup resources and unregister from memory manager
   */
  private cleanup(): void {
    MemoryManager.unregisterCleanup(this.cleanupCallback);

    // Cleanup throttled function
    if (this.throttledMouseMove && 'cleanup' in this.throttledMouseMove && this.throttledMouseMove.cleanup) {
      this.throttledMouseMove.cleanup();
    }

    this.annotations.clear();
    this.selectedAnnotation = null;
    this.isDragging = false;
    this.dragOffset = null;
  }

  /**
   * Check if there are any changes to annotations
   */
  hasChanges(): boolean {
    return this.hasUnsavedChanges;
  }

  /**
   * Reset the changes flag
   */
  resetChanges(): void {
    this.hasUnsavedChanges = false;
  }
}
