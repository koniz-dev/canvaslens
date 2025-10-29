import { Renderer } from '../../../../core/Renderer';
import type { Point, Annotation, ToolOptions } from '../../../../types';
import { AnnotationRenderer } from '../../Renderer';

export abstract class BaseTool {
  protected canvas: Renderer;
  protected renderer: AnnotationRenderer;
  protected options: ToolOptions;
  protected isDrawing = false;
  protected currentPoints: Point[] = [];
  protected startPoint: Point | null = null;

  constructor(canvas: Renderer, renderer: AnnotationRenderer, options: ToolOptions) {
    this.canvas = canvas;
    this.renderer = renderer;
    this.options = options;
  }

  /**
   * Start drawing
   */
  abstract startDrawing(point: Point): Annotation | null;

  /**
   * Continue drawing (mouse move)
   */
  abstract continueDrawing(point: Point): void;

  /**
   * Finish drawing
   */
  abstract finishDrawing(point: Point): Annotation | null;

  /**
   * Cancel current drawing
   */
  cancelDrawing(): void {
    this.isDrawing = false;
    this.currentPoints = [];
    this.startPoint = null;
  }

  /**
   * Check if currently drawing
   */
  isCurrentlyDrawing(): boolean {
    return this.isDrawing;
  }

  /**
   * Update tool options
   */
  updateOptions(options: Partial<ToolOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * Get tool type
   */
  abstract getType(): Annotation['type'];

  /**
   * Generate unique ID for annotation
   */
  protected generateId(): string {
    return `annotation_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Create annotation object
   * Style is already merged and comes from options.style (which is AnnotationManager.defaultStyle)
   */
  protected createAnnotation(points: Point[], data?: Record<string, unknown>): Annotation {
    return {
      id: this.generateId(),
      type: this.getType(),
      points: [...points],
      style: this.options.style || {
        strokeColor: '#000000',
        strokeWidth: 2
      },
      data: data || {}
    };
  }
}
