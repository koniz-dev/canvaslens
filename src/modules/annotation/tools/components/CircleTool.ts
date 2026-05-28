import type { Annotation, Point, Rectangle } from '../../../../types';
import { BaseTool } from './BaseTool';

export class CircleTool extends BaseTool {
  private currentAnnotation: Annotation | null = null;

  /**
   * Start drawing circle
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
   * Continue drawing circle (update radius).
   *
   * Clamping the EDGE point to the image bounds isn't enough — the radius
   * (centre → edge) can still extend past the image even when the edge
   * itself is inside. We additionally shrink the radius so the whole
   * circle stays inside.
   */
  continueDrawing(point: Point): void {
    if (!this.isDrawing || !this.startPoint || !this.currentAnnotation) return;

    const edge = this.clampEdgeToImage(this.startPoint, point);
    this.currentPoints = [this.startPoint, edge];
    this.currentAnnotation.points = [this.startPoint, edge];
  }

  /**
   * Finish drawing circle
   */
  finishDrawing(point: Point): Annotation | null {
    if (!this.isDrawing || !this.startPoint || !this.currentAnnotation) return null;

    const edgePoint = this.clampEdgeToImage(this.startPoint, point);
    const centerPoint = { ...this.startPoint };

    // Calculate radius
    const radius = Math.sqrt(
      Math.pow(edgePoint.x - centerPoint.x, 2) + Math.pow(edgePoint.y - centerPoint.y, 2)
    );

    // Only keep annotation if it has meaningful radius
    if (radius < 5) {
      this.cancelDrawing();
      return null; // Too small to be meaningful
    }

    // Finalize the annotation
    this.currentAnnotation.points = [centerPoint, edgePoint];
    const finalAnnotation = this.currentAnnotation;

    // Reset state
    this.cancelDrawing();

    return finalAnnotation;
  }

  /**
   * Constrain the edge of a circle so the whole circle stays inside the
   * loaded image's bounds. When no image bounds are known the point is
   * returned unchanged.
   */
  private clampEdgeToImage(center: Point, edge: Point): Point {
    const bounds = this.canvas.imageViewer?.getImageBounds?.() as Rectangle | null | undefined;
    if (!bounds) return { ...edge };

    const cx = Math.max(bounds.x, Math.min(bounds.x + bounds.width, center.x));
    const cy = Math.max(bounds.y, Math.min(bounds.y + bounds.height, center.y));
    const maxRadius = Math.min(
      cx - bounds.x,
      bounds.x + bounds.width - cx,
      cy - bounds.y,
      bounds.y + bounds.height - cy
    );
    const dx = edge.x - cx;
    const dy = edge.y - cy;
    const requested = Math.sqrt(dx * dx + dy * dy);
    if (requested <= maxRadius || requested === 0) return { ...edge };
    const scale = maxRadius / requested;
    return { x: cx + dx * scale, y: cy + dy * scale };
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
    return 'circle';
  }
}
