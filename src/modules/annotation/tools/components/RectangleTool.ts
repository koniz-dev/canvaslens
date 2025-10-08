import { Point, Annotation } from '../../../../types';
import { BaseTool } from './BaseTool';

export class RectangleTool extends BaseTool {
  private currentAnnotation: Annotation | null = null;

  /**
   * Start drawing rectangle
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
   * Continue drawing rectangle (update end point)
   */
  continueDrawing(point: Point): void {
    if (!this.isDrawing || !this.startPoint || !this.currentAnnotation) return;

    // Update current points with start and current mouse position
    this.currentPoints = [this.startPoint, { ...point }];
    
    // Update the existing annotation
    this.currentAnnotation.points = [this.startPoint, { ...point }];
  }

  /**
   * Finish drawing rectangle
   */
  finishDrawing(point: Point): Annotation | null {
    if (!this.isDrawing || !this.startPoint || !this.currentAnnotation) return null;

    const endPoint = { ...point };
    const startPoint = { ...this.startPoint };
    
    // Only keep annotation if it has meaningful size
    const width = Math.abs(endPoint.x - startPoint.x);
    const height = Math.abs(endPoint.y - startPoint.y);
    
    if (width < 5 || height < 5) {
      this.cancelDrawing();
      return null; // Too small to be meaningful
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
    return 'rect';
  }
}
