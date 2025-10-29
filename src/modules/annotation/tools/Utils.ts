import { Renderer } from '../../../core/Renderer';
import type { Point, Annotation, Rectangle } from '../../../types';

export class AnnotationToolsUtils {
  private canvas: Renderer;

  constructor(canvas: Renderer) {
    this.canvas = canvas;
  }

  /**
   * Convert screen coordinates to world coordinates
   */
  screenToWorld(screenPoint: Point): Point {
    const viewState = this.canvas.getViewState();
    return {
      x: (screenPoint.x - viewState.offsetX) / viewState.scale,
      y: (screenPoint.y - viewState.offsetY) / viewState.scale
    };
  }

  /**
   * Get image bounds from the canvas (through annotation manager)
   */
  getImageBounds(): Rectangle | null {
    // Get image bounds from canvas annotation manager
    if (this.canvas.annotationManager) {
      return this.canvas.annotationManager.getImageBounds();
    }
    return null;
  }

  /**
   * Check if a point is within image bounds
   */
  isPointInImageBounds(point: Point): boolean {
    const bounds = this.getImageBounds();
    if (!bounds) {
      return true; // If no image bounds, allow drawing anywhere
    }

    return point.x >= bounds.x &&
      point.x <= bounds.x + bounds.width &&
      point.y >= bounds.y &&
      point.y <= bounds.y + bounds.height;
  }

  /**
   * Check if annotation meets minimum size requirements
   */
  meetsMinimumSize(annotation: Annotation, activeToolType: string | null): boolean {
    if (!activeToolType) return true;

    // Minimum size thresholds for annotations (in pixels)
    const MIN_SIZE_THRESHOLDS = {
      rect: 10,    // Minimum 10px width or height
      circle: 10,  // Minimum 10px radius
      line: 8,     // Minimum 8px length
      arrow: 8,    // Minimum 8px length
      text: 0      // Text doesn't have size constraint
    };

    const minSize = MIN_SIZE_THRESHOLDS[activeToolType as keyof typeof MIN_SIZE_THRESHOLDS];
    if (minSize === undefined || minSize === 0) return true; // No size constraint

    switch (annotation.type) {
      case 'rect': {
        if (annotation.points.length < 2) return false;
        const start = annotation.points[0]!;
        const end = annotation.points[1]!;
        const width = Math.abs(end.x - start.x);
        const height = Math.abs(end.y - start.y);
        return width >= minSize || height >= minSize;
      }

      case 'circle': {
        if (annotation.points.length < 2) return false;
        const center = annotation.points[0]!;
        const edge = annotation.points[1]!;
        const radius = Math.sqrt(
          Math.pow(edge.x - center.x, 2) + Math.pow(edge.y - center.y, 2)
        );
        return radius >= minSize;
      }

      case 'line':
      case 'arrow': {
        if (annotation.points.length < 2) return false;
        const lineStart = annotation.points[0]!;
        const lineEnd = annotation.points[annotation.points.length - 1]!;
        const length = Math.sqrt(
          Math.pow(lineEnd.x - lineStart.x, 2) + Math.pow(lineEnd.y - lineStart.y, 2)
        );
        return length >= minSize;
      }

      case 'text':
        return true; // Text doesn't have size constraint

      default:
        return true;
    }
  }

  /**
   * Clamp a point to image bounds
   */
  clampPointToImageBounds(point: Point): Point {
    const bounds = this.getImageBounds();
    if (!bounds) {
      return point; // If no image bounds, return original point
    }

    return {
      x: Math.max(bounds.x, Math.min(bounds.x + bounds.width, point.x)),
      y: Math.max(bounds.y, Math.min(bounds.y + bounds.height, point.y))
    };
  }
}
