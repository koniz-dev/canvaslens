import { Point, Annotation, AnnotationStyle } from '../../../types';
import { Renderer } from '../../../core/Renderer';
import { AnnotationRenderer } from '../AnnotationRenderer';

export interface ToolOptions {
  style: AnnotationStyle;
}

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
    return `annotation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create annotation object
   */
  protected createAnnotation(points: Point[], data?: any): Annotation {
    return {
      id: this.generateId(),
      type: this.getType(),
      points: [...points],
      style: { ...this.options.style },
      data
    };
  }
}
