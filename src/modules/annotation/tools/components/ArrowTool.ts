import { Point, Annotation } from '../../../../types';
import { BaseTool } from './BaseTool';

export class ArrowTool extends BaseTool {
  /**
   * Start drawing arrow
   */
  startDrawing(point: Point): Annotation | null {
    this.isDrawing = true;
    this.startPoint = { ...point };
    this.currentPoints = [this.startPoint];
    return null; // Arrow tool doesn't create annotation immediately
  }

  /**
   * Continue drawing arrow (update end point)
   */
  continueDrawing(point: Point): void {
    if (!this.isDrawing || !this.startPoint) return;

    // Update current points with start and current mouse position
    this.currentPoints = [this.startPoint, { ...point }];
  }

  /**
   * Finish drawing arrow
   */
  finishDrawing(point: Point): Annotation | null {
    if (!this.isDrawing || !this.startPoint) return null;

    const endPoint = { ...point };
    const startPoint = { ...this.startPoint }; // Store startPoint before canceling
    
    // Reset state
    this.cancelDrawing();

    // Only create annotation if it has meaningful length
    const length = Math.sqrt(
      Math.pow(endPoint.x - startPoint.x, 2) + 
      Math.pow(endPoint.y - startPoint.y, 2)
    );
    
    if (length < 10) {
      return null; // Too short to be meaningful
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
    return 'arrow';
  }
}
