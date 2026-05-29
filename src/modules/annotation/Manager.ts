import type { ModuleContext } from '../../core/ModuleContext';
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
import { ContextMenu } from '../../ui/ContextMenu';
import { error } from '../../utils/core/logger';
import { MemoryManager } from '../../utils/core/memory-manager';
import { ValidationHelper } from '../../utils/core/validation-helper';
import { SecureJsonParser } from '../../utils/security/secure-json-parser';
import { AnnotationRenderer } from './Renderer';
import { AnnotationToolsManager } from './tools/Manager';
import type { ToolRegistry } from './tools/ToolRegistry';

export class AnnotationManager {
  private canvas: Renderer;
  private ctx: ModuleContext | undefined;
  private renderer: AnnotationRenderer;
  private toolManager: AnnotationToolsManager;
  private annotations: Map<string, Annotation> = new Map();
  private selectedAnnotation: Annotation | null = null;
  private eventHandlers: EventHandlers;
  private enabled = true;
  private isDragging = false;
  private dragOffset: Point | null = null;
  /** Index of the resize handle currently being dragged, or null when not resizing. */
  private resizingHandle: number | null = null;
  /** Last world coordinate from mousemove — used for hover cursor decisions. */
  private lastWorldPoint: Point | null = null;
  private hasUnsavedChanges = false;

  // Stable bound references so addEventListener / removeEventListener pair correctly.
  private readonly boundContextMenu: (event: Event) => void;
  private readonly boundMouseDown: (event: Event) => void;
  private readonly boundMouseUp: (event: Event) => void;
  private readonly throttledMouseMove: ((event: MouseEvent) => void) & { cleanup?: () => void };
  private readonly cleanupCallback: () => void;

  constructor(canvas: Renderer, options: AnnotationManagerOptions = {}) {
    this.canvas = canvas;
    this.ctx = options.ctx;
    this.eventHandlers = options.eventHandlers || {};
    this.enabled = options.enabled !== false;

    this.renderer = new AnnotationRenderer(canvas);

    const defaultStyle: AnnotationStyle = {
      strokeColor: '#ff0000',
      strokeWidth: 2,
      lineStyle: 'solid',
      fontSize: 20,
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

    const toolManagerOptions: ToolManagerOptions<AnnotationManager, ToolRegistry> = {
      defaultStyle,
      availableTools,
      annotationManager: this,
      ...(options.registry ? { registry: options.registry } : {})
    };

    this.toolManager = new AnnotationToolsManager(canvas, this.renderer, toolManagerOptions);

    this.toolManager.setOnAnnotationCreate((annotation) => {
      this.addAnnotation(annotation);
    });

    this.boundContextMenu = this.handleContextMenu.bind(this) as (event: Event) => void;
    this.boundMouseDown = this.handleMouseDown.bind(this) as (event: Event) => void;
    this.boundMouseUp = this.handleMouseUp.bind(this) as (event: Event) => void;
    this.throttledMouseMove = MemoryManager.throttle(
      this.handleMouseMove.bind(this),
      16
    ) as ((event: MouseEvent) => void) & { cleanup?: () => void };
    this.cleanupCallback = this.cleanup.bind(this);
    MemoryManager.registerCleanup(this.cleanupCallback);

    this.setupEventListeners();
  }

  /**
   * Setup event listeners for annotation management.
   * Uses stable bound references so removal in destroy() actually matches.
   */
  private setupEventListeners(): void {
    this.canvas.addEventListener('contextmenu', this.boundContextMenu);
    this.canvas.addEventListener('mousedown', this.boundMouseDown, true);
    this.canvas.addEventListener('mousemove', this.throttledMouseMove as EventListener);
    this.canvas.addEventListener('mouseup', this.boundMouseUp);
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
   * Handle mouse down for selection / drag / resize.
   *
   * Priority:
   *   1. If a selected annotation has a resize handle under the cursor →
   *      start resizing.
   *   2. Otherwise if any annotation is under the cursor → select +
   *      start dragging.
   *   3. Otherwise → clear selection.
   */
  private handleMouseDown(event: MouseEvent): void {
    if (!this.canHandleMouseDown(event)) return;

    const worldPoint = this.getWorldPointFromEvent(event);

    if (this.selectedAnnotation) {
      const handleIdx = this.getHandleAt(this.selectedAnnotation, worldPoint);
      if (handleIdx !== null) {
        event.preventDefault();
        event.stopPropagation();
        this.resizingHandle = handleIdx;
        return;
      }
    }

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
    this.lastWorldPoint = worldPoint;

    if (this.resizingHandle !== null && this.selectedAnnotation) {
      this.handleResize(worldPoint, event);
      return;
    }

    if (this.isDragging && this.selectedAnnotation && this.dragOffset) {
      this.handleDragging(worldPoint, event);
      return;
    }

    this.handleHoverDetection(worldPoint);
  }

  /**
   * Update the resized annotation by replacing the dragged handle's point.
   * Handles are always at indices in `getHandlePoints()`, which mirror
   * `annotation.points` for rect/circle/line/arrow.
   */
  private handleResize(worldPoint: Point, event: MouseEvent): void {
    if (!this.selectedAnnotation || this.resizingHandle === null) return;
    const idx = this.resizingHandle;
    const handlePoints = this.getHandlePoints(this.selectedAnnotation);
    if (idx < 0 || idx >= handlePoints.length) return;

    // For circle the edge handle must additionally respect the radius —
    // clamping it just to the image rectangle still allows the circle to
    // overflow. Use shape-aware clamping for circles.
    const clamped =
      this.selectedAnnotation.type === 'circle'
        ? this.clampCircleEdgeToImageBounds(
            this.selectedAnnotation.points[0]!,
            worldPoint
          )
        : this.clampPointToImageBounds(worldPoint);

    if (this.selectedAnnotation.type === 'rect') {
      // For rect, points = [topLeft, bottomRight]. Corner handles map to
      // indices 0–3 in handlePoints (TL, TR, BR, BL). Adjust the matching
      // corner of the rect.
      const p0 = this.selectedAnnotation.points[0]!;
      const p1 = this.selectedAnnotation.points[1]!;
      const tlx = Math.min(p0.x, p1.x);
      const tly = Math.min(p0.y, p1.y);
      const brx = Math.max(p0.x, p1.x);
      const bry = Math.max(p0.y, p1.y);
      let next: [Point, Point];
      switch (idx) {
        case 0: // top-left
          next = [clamped, { x: brx, y: bry }];
          break;
        case 1: // top-right
          next = [{ x: tlx, y: clamped.y }, { x: clamped.x, y: bry }];
          break;
        case 2: // bottom-right
          next = [{ x: tlx, y: tly }, clamped];
          break;
        case 3: // bottom-left
          next = [{ x: clamped.x, y: tly }, { x: brx, y: clamped.y }];
          break;
        default:
          next = [p0, p1];
      }
      this.selectedAnnotation.points = next;
    } else {
      // Map handle index → point index per annotation type.
      const next = [...this.selectedAnnotation.points];
      let pointIdx: number;
      if (this.selectedAnnotation.type === 'circle') {
        pointIdx = 1; // the only handle is the edge
      } else if (this.selectedAnnotation.type === 'line' || this.selectedAnnotation.type === 'arrow') {
        pointIdx = idx === 0 ? 0 : next.length - 1;
      } else {
        pointIdx = idx;
      }
      next[pointIdx] = clamped;
      this.selectedAnnotation.points = next;
    }

    this.triggerViewStateChange();
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * World-coordinate positions of resize handles for the given annotation.
   * Returns empty when the annotation type doesn't support resize (text).
   */
  getHandlePoints(annotation: Annotation): Point[] {
    if (annotation.type === 'rect' && annotation.points.length >= 2) {
      const p0 = annotation.points[0]!;
      const p1 = annotation.points[1]!;
      const minX = Math.min(p0.x, p1.x);
      const maxX = Math.max(p0.x, p1.x);
      const minY = Math.min(p0.y, p1.y);
      const maxY = Math.max(p0.y, p1.y);
      return [
        { x: minX, y: minY },
        { x: maxX, y: minY },
        { x: maxX, y: maxY },
        { x: minX, y: maxY }
      ];
    }
    if (annotation.type === 'circle' && annotation.points.length >= 2) {
      // One handle on the edge.
      return [annotation.points[1]!];
    }
    if ((annotation.type === 'line' || annotation.type === 'arrow') && annotation.points.length >= 2) {
      return [annotation.points[0]!, annotation.points[annotation.points.length - 1]!];
    }
    return [];
  }

  /**
   * Index of the resize handle near `worldPoint`, or null if the point
   * isn't on any handle. Tolerance is scaled by the current zoom so the
   * hit area is roughly 8 screen pixels at any zoom level.
   */
  private getHandleAt(annotation: Annotation, worldPoint: Point): number | null {
    const handles = this.getHandlePoints(annotation);
    if (handles.length === 0) return null;
    const viewState = this.canvas.getViewState();
    const tolerance = 8 / Math.max(viewState.scale, 0.01);
    for (let i = 0; i < handles.length; i++) {
      const h = handles[i]!;
      if (Math.abs(worldPoint.x - h.x) <= tolerance && Math.abs(worldPoint.y - h.y) <= tolerance) {
        return i;
      }
    }
    return null;
  }

  private clampPointToImageBounds(point: Point): Point {
    const imageBounds = this.getImageBounds();
    if (!imageBounds) return point;
    return {
      x: Math.max(imageBounds.x, Math.min(imageBounds.x + imageBounds.width, point.x)),
      y: Math.max(imageBounds.y, Math.min(imageBounds.y + imageBounds.height, point.y))
    };
  }

  /**
   * Shrink the proposed edge so that the whole circle stays inside the
   * image when the centre is held fixed. Used during resize.
   */
  private clampCircleEdgeToImageBounds(center: Point, edge: Point): Point {
    const imageBounds = this.getImageBounds();
    if (!imageBounds) return edge;
    const cx = Math.max(imageBounds.x, Math.min(imageBounds.x + imageBounds.width, center.x));
    const cy = Math.max(imageBounds.y, Math.min(imageBounds.y + imageBounds.height, center.y));
    const maxRadius = Math.min(
      cx - imageBounds.x,
      imageBounds.x + imageBounds.width - cx,
      cy - imageBounds.y,
      imageBounds.y + imageBounds.height - cy
    );
    const dx = edge.x - cx;
    const dy = edge.y - cy;
    const requested = Math.sqrt(dx * dx + dy * dy);
    if (requested <= maxRadius || requested === 0) return edge;
    const scale = maxRadius / requested;
    return { x: cx + dx * scale, y: cy + dy * scale };
  }

  private handleDragging(worldPoint: Point, event: MouseEvent): void {
    if (!this.selectedAnnotation) return;

    const newCenter = this.calculateNewCenter(worldPoint);
    const clampedCenter = this.clampCenterToImageBounds(this.selectedAnnotation, newCenter);
    this.moveAnnotation(this.selectedAnnotation, clampedCenter);
    this.triggerViewStateChange();

    event.preventDefault();
    event.stopPropagation();
  }

  private calculateNewCenter(worldPoint: Point): Point {
    if (!this.dragOffset) {
      return worldPoint;
    }
    return {
      x: worldPoint.x - this.dragOffset.x,
      y: worldPoint.y - this.dragOffset.y
    };
  }

  /**
   * Clamp the proposed center so the dragged annotation's bounding box stays
   * inside the loaded image. Falls through when no image bounds are known.
   */
  private clampCenterToImageBounds(annotation: Annotation, newCenter: Point): Point {
    const imageBounds = this.getImageBounds();
    if (!imageBounds) return newCenter;

    const currentBounds = this.getAnnotationBounds(annotation);
    if (!currentBounds || currentBounds.width === 0 || currentBounds.height === 0) {
      // Single-point annotations (e.g. text): just clamp the point.
      return {
        x: Math.max(imageBounds.x, Math.min(imageBounds.x + imageBounds.width, newCenter.x)),
        y: Math.max(imageBounds.y, Math.min(imageBounds.y + imageBounds.height, newCenter.y))
      };
    }

    const halfW = currentBounds.width / 2;
    const halfH = currentBounds.height / 2;
    return {
      x: Math.max(imageBounds.x + halfW, Math.min(imageBounds.x + imageBounds.width - halfW, newCenter.x)),
      y: Math.max(imageBounds.y + halfH, Math.min(imageBounds.y + imageBounds.height - halfH, newCenter.y))
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
    // Don't update cursor if annotation tool is active
    if (this.toolManager.isToolActive()) {
      return;
    }

    let cursor = 'default';
    if (this.selectedAnnotation) {
      // Higher priority: resize handle hover.
      const worldPoint = this.lastWorldPoint;
      if (worldPoint) {
        const idx = this.getHandleAt(this.selectedAnnotation, worldPoint);
        if (idx !== null) {
          cursor = this.cursorForHandle(this.selectedAnnotation, idx);
          this.canvas.getElement().style.cursor = cursor;
          return;
        }
      }
    }
    if (hoveredAnnotation) cursor = 'move';
    this.canvas.getElement().style.cursor = cursor;
  }

  /** Return a CSS cursor name appropriate for the given handle. */
  private cursorForHandle(annotation: Annotation, idx: number): string {
    if (annotation.type === 'rect') {
      // Handles 0/2 are diagonals (TL/BR → nwse), 1/3 are antidiagonals (TR/BL → nesw).
      return idx === 0 || idx === 2 ? 'nwse-resize' : 'nesw-resize';
    }
    if (annotation.type === 'circle') return 'ew-resize';
    return 'crosshair';
  }

  /**
   * Handle mouse up to stop dragging or resizing
   */
  private handleMouseUp(event: MouseEvent): void {
    if (this.resizingHandle !== null) {
      this.resizingHandle = null;
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (this.isDragging) {
      this.isDragging = false;
      this.dragOffset = null;
      event.preventDefault();
      event.stopPropagation();
    }
  }

  // Delete/Backspace/Escape shortcuts are owned by
  // `AnnotationToolsEventHandler.handleKeyDown` — it has the full context
  // (active tool, drawing state) needed to route the key. Don't duplicate
  // the handler here.

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

    // Trigger view state change to re-render canvas and clear annotations visually
    this.triggerViewStateChange();
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
   * Render selection highlight + resize handles on top.
   */
  private renderSelectionHighlight(annotation: Annotation): void {
    const ctx = this.canvas.getContext();

    this.setupSelectionContext(ctx);
    this.renderSelectionByType(annotation, ctx);
    ctx.restore();

    this.renderResizeHandles(annotation);
  }

  /**
   * Draw small filled squares at each resize handle's world position.
   * Handles are rendered in screen-pixel-equivalent size so they stay
   * visible at any zoom level.
   */
  private renderResizeHandles(annotation: Annotation): void {
    const handles = this.getHandlePoints(annotation);
    if (handles.length === 0) return;
    const ctx = this.canvas.getContext();
    const viewState = this.canvas.getViewState();
    const size = 8 / Math.max(viewState.scale, 0.01); // ~8 screen px
    const half = size / 2;

    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#00aa00';
    ctx.lineWidth = 1 / Math.max(viewState.scale, 0.01);
    for (const h of handles) {
      ctx.fillRect(h.x - half, h.y - half, size, size);
      ctx.strokeRect(h.x - half, h.y - half, size, size);
    }
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
   * Get annotation bounding box — shape-aware.
   *
   * For most shapes the bbox of the points is correct (rect, line, arrow,
   * text). For circles the points are (centre, edge); the actual shape
   * extends ±radius around the centre and would otherwise be reported with
   * the wrong width/height.
   */
  private getAnnotationBounds(annotation: Annotation): Rectangle | null {
    if (annotation.points.length === 0) return null;

    if (annotation.type === 'circle' && annotation.points.length >= 2) {
      const center = annotation.points[0]!;
      const edge = annotation.points[1]!;
      const radius = Math.sqrt(
        Math.pow(edge.x - center.x, 2) + Math.pow(edge.y - center.y, 2)
      );
      return {
        x: center.x - radius,
        y: center.y - radius,
        width: radius * 2,
        height: radius * 2
      };
    }

    const firstPoint = annotation.points[0];
    if (!firstPoint) return null;

    let minX = firstPoint.x;
    let maxX = firstPoint.x;
    let minY = firstPoint.y;
    let maxY = firstPoint.y;

    annotation.points.forEach((point) => {
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
   * Activate a tool. If comparison mode is active it gets turned off first
   * — comparison uses a canvas-wide slider that conflicts with drawing, so
   * activating a tool implicitly means "leave comparison mode".
   */
  activateTool(toolType: string): boolean {
    if (this.ctx?.isComparisonMode()) {
      // Route through the App so the comparison slice + ComparisonManager
      // state stay in sync.
      this.bus?.emit('comparison:exit-request', undefined);
    }
    const ok = this.toolManager.activateTool(toolType);
    if (ok) this.eventHandlers.onToolChange?.(toolType);
    return ok;
  }

  private get bus(): { emit: (e: 'comparison:exit-request', v: undefined) => void } | undefined {
    return this.ctx?.bus as
      | { emit: (e: 'comparison:exit-request', v: undefined) => void }
      | undefined;
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
    const wasActive = this.toolManager.isToolActive();
    this.toolManager.deactivateTool();
    if (wasActive) this.eventHandlers.onToolChange?.(null);
  }


  /**
   * Update the default style used for *new* annotations.
   */
  updateStyle(style: Partial<AnnotationStyle>): void {
    this.toolManager.updateToolStyle(style);
  }

  /**
   * Update the style of an existing annotation in place. Triggers a render
   * so the change is visible immediately and fires the standard
   * annotationAdd/remove notifications via the manager events.
   */
  updateAnnotationStyle(id: string, partial: Partial<AnnotationStyle>): boolean {
    const annotation = this.annotations.get(id);
    if (!annotation) return false;
    annotation.style = { ...annotation.style, ...partial };
    this.hasUnsavedChanges = true;
    this.triggerViewStateChange();
    return true;
  }

  /**
   * Update the currently-selected annotation's style. Returns true if a
   * selection existed and was updated.
   */
  updateSelectedStyle(partial: Partial<AnnotationStyle>): boolean {
    if (!this.selectedAnnotation) return false;
    return this.updateAnnotationStyle(this.selectedAnnotation.id, partial);
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
   * Uses secure JSON parser with validation
   */
  importAnnotations(jsonData: string): boolean {
    // Use secure JSON parser with validation
    const annotationsArray = SecureJsonParser.parseAnnotations(jsonData);

    if (!annotationsArray) {
      error('Failed to import annotations: invalid or unsafe JSON');
      return false;
    }

    this.clearAll();

    // Validate each annotation before adding
    annotationsArray.forEach(annotation => {
      if (this.isValidAnnotation(annotation)) {
        this.addAnnotation(annotation);
      }
    });

    return true;
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
   * Get image bounds from the App when a ModuleContext is available, falling
   * back to the legacy `canvas.imageViewer` reference for stand-alone tests.
   */
  getImageBounds(): Rectangle | null {
    if (this.ctx) return this.ctx.getImageBounds();
    if (this.canvas.imageViewer) return this.canvas.imageViewer.getImageBounds();
    return null;
  }

  /**
   * Show the per-annotation context menu (currently just a Delete option).
   * DOM construction is delegated to `ui/ContextMenu` so this class is no
   * longer mixing rendering with annotation state.
   */
  private showContextMenu(event: MouseEvent, annotation: Annotation): void {
    ContextMenu.show({
      x: event.clientX,
      y: event.clientY,
      items: [
        {
          label: 'Delete',
          onClick: () => this.removeAnnotation(annotation.id)
        }
      ]
    });
  }

  /**
   * Whether any annotation tool is registered on this manager. Plugin
   * tools count just as well as the five built-ins.
   */
  private hasEnabledAnnotationTools(): boolean {
    if (!this.toolManager) return false;
    const cfg = this.toolManager.getToolConfig();
    for (const enabled of Object.values(cfg)) {
      if (enabled) return true;
    }
    return false;
  }

  /**
   * Check if comparison mode is active. Prefer the ModuleContext (single source
   * of truth from the App); fall back to the legacy `canvas.imageViewer` so
   * stand-alone manager tests keep working until Phase 6 cleans up.
   */
  private isComparisonModeActive(): boolean {
    if (this.ctx) return this.ctx.isComparisonMode();
    if (this.canvas.imageViewer && typeof this.canvas.imageViewer.isComparisonMode === 'function') {
      return this.canvas.imageViewer.isComparisonMode();
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

    this.canvas.removeEventListener('contextmenu', this.boundContextMenu);
    this.canvas.removeEventListener('mousedown', this.boundMouseDown, true);
    this.canvas.removeEventListener('mousemove', this.throttledMouseMove as EventListener);
    this.canvas.removeEventListener('mouseup', this.boundMouseUp);

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
