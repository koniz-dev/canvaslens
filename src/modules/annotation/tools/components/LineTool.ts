import { Point, Annotation } from '@/types';
import { BaseTool } from './BaseTool';

export class LineTool extends BaseTool {
  private currentAnnotation: Annotation | null = null;

  /**
   * Start drawing line
   */
  startDrawing(point: Point): Annotation | null {
    this.isDrawing = true;
    this.startPoint = { ...point };
    this.currentPoints = [this.startPoint];
    
    // Create annotation immediately when starting to draw
    this.currentAnnotation = this.createAnnotation([this.startPoint, this.startPoint]);
    return this.currentAnnotation;
  }

  /**
   * Continue drawing line (update end point)
   */
  continueDrawing(point: Point): void {
    if (!this.isDrawing || !this.startPoint || !this.currentAnnotation) return;

    // Update current points with start and current mouse position
    this.currentPoints = [this.startPoint, { ...point }];
    
    // Update the existing annotation
    this.currentAnnotation.points = [this.startPoint, { ...point }];
  }

  /**
   * Finish drawing line
   */
  finishDrawing(point: Point): Annotation | null {
    if (!this.isDrawing || !this.startPoint || !this.currentAnnotation) return null;

    const endPoint = { ...point };
    const startPoint = { ...this.startPoint };
    
    // Calculate line length
    const length = Math.sqrt(
      Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2)
    );
    
    // Only keep annotation if it has meaningful length
    if (length < 5) {
      this.cancelDrawing();
      return null; // Too short to be meaningful
    }

    // Finalize the annotation
    this.currentAnnotation.points = [startPoint, endPoint];
    const finalAnnotation = this.currentAnnotation;
    
    // Reset state
    this.cancelDrawing();
    
    return finalAnnotation;
  }

  /**
   * Get current preview points for rendering
   */
  getPreviewPoints(): Point[] {
    return this.currentPoints;
  }

  /**
   * Cancel current drawing
   */
  cancelDrawing(): void {
    this.isDrawing = false;
    this.currentPoints = [];
    this.startPoint = null;
    this.currentAnnotation = null;
  }

  /**
   * Get tool type
   */
  getType(): Annotation['type'] {
    return 'line';
  }
}
