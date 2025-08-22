import { Point, Annotation } from '../../../types';
import { BaseTool } from './BaseTool';

export class RectangleTool extends BaseTool {
  /**
   * Start drawing rectangle
   */
  startDrawing(point: Point): void {
    this.isDrawing = true;
    this.startPoint = { ...point };
    this.currentPoints = [this.startPoint];
  }

  /**
   * Continue drawing rectangle (update end point)
   */
  continueDrawing(point: Point): void {
    if (!this.isDrawing || !this.startPoint) return;

    // Update current points with start and current mouse position
    this.currentPoints = [this.startPoint, { ...point }];
  }

  /**
   * Finish drawing rectangle
   */
  finishDrawing(point: Point): Annotation | null {
    if (!this.isDrawing || !this.startPoint) return null;

    const endPoint = { ...point };
    const startPoint = { ...this.startPoint }; // Store startPoint before canceling
    
    // Reset state
    this.cancelDrawing();

    // Only create annotation if it has meaningful size
    const width = Math.abs(endPoint.x - startPoint.x);
    const height = Math.abs(endPoint.y - startPoint.y);
    
    if (width < 5 || height < 5) {
      return null; // Too small to be meaningful
    }

    const annotation = this.createAnnotation([startPoint, endPoint]);
    return annotation;
  }

  /**
   * Get current preview points for rendering
   */
  getPreviewPoints(): Point[] {
    return this.currentPoints;
  }

  /**
   * Get tool type
   */
  getType(): Annotation['type'] {
    return 'rect';
  }
}
