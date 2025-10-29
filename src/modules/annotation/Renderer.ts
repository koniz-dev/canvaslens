import { Renderer } from '../../core/Renderer';
import type { Annotation, AnnotationStyle, Point, Rectangle } from '../../types';
import { performanceMonitor } from '../../utils/performance/performance';

export class AnnotationRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: Renderer;

  constructor(canvas: Renderer) {
    this.canvas = canvas;
    this.ctx = canvas.getContext();
  }

  /**
   * Render a single annotation
   */
  render(annotation: Annotation): void {
    this.applyStyle(annotation.style);

    switch (annotation.type) {
      case 'rect':
        this.renderRectangle(annotation);
        break;
      case 'circle':
        this.renderCircle(annotation);
        break;
      case 'arrow':
        this.renderArrow(annotation);
        break;
      case 'line':
        this.renderLine(annotation);
        break;
      case 'text':
        this.renderText(annotation);
        break;
    }
  }

  /**
   * Render multiple annotations with viewport culling
   */
  renderAll(annotations: Annotation[]): void {
    const startTime = performanceMonitor.startRender();

    const viewport = this.getViewportBounds();
    const visibleAnnotations = annotations.filter(annotation =>
      this.isAnnotationInViewport(annotation, viewport)
    );

    visibleAnnotations.forEach(annotation => this.render(annotation));

    // Record performance metrics
    performanceMonitor.endRender(
      startTime,
      annotations.length,
      visibleAnnotations.length
    );
  }

  /**
   * Get current viewport bounds in world coordinates
   */
  private getViewportBounds(): Rectangle {
    const viewState = this.canvas.getViewState();
    const canvasSize = this.canvas.getSize();

    // Convert screen coordinates to world coordinates
    const worldX = -viewState.offsetX / viewState.scale;
    const worldY = -viewState.offsetY / viewState.scale;
    const worldWidth = canvasSize.width / viewState.scale;
    const worldHeight = canvasSize.height / viewState.scale;

    return {
      x: worldX,
      y: worldY,
      width: worldWidth,
      height: worldHeight
    };
  }

  /**
   * Check if annotation is visible in viewport
   */
  private isAnnotationInViewport(annotation: Annotation, viewport: Rectangle): boolean {
    const bounds = this.getAnnotationBounds(annotation);

    // Check if annotation bounds intersect with viewport
    return !(
      bounds.x > viewport.x + viewport.width ||
      bounds.x + bounds.width < viewport.x ||
      bounds.y > viewport.y + viewport.height ||
      bounds.y + bounds.height < viewport.y
    );
  }

  /**
   * Get annotation bounds for culling
   */
  private getAnnotationBounds(annotation: Annotation): Rectangle {
    if (annotation.points.length < 2) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    const start = annotation.points[0]!;
    const end = annotation.points[annotation.points.length - 1]!;

    switch (annotation.type) {
      case 'rect':
        return {
          x: Math.min(start.x, end.x),
          y: Math.min(start.y, end.y),
          width: Math.abs(end.x - start.x),
          height: Math.abs(end.y - start.y)
        };
      case 'circle': {
        const radius = Math.sqrt(
          Math.pow(end.x - start.x, 2) +
          Math.pow(end.y - start.y, 2)
        );
        return {
          x: start.x - radius,
          y: start.y - radius,
          width: radius * 2,
          height: radius * 2
        };
      }
      case 'arrow':
      case 'line':
        return {
          x: Math.min(start.x, end.x),
          y: Math.min(start.y, end.y),
          width: Math.abs(end.x - start.x),
          height: Math.abs(end.y - start.y)
        };
      case 'text': {
        // Estimate text bounds (approximate)
        const textWidth = ((annotation.data as Record<string, unknown>)?.text as string)?.length || 0;
        return {
          x: start.x,
          y: start.y - (annotation.style?.fontSize || 16),
          width: textWidth * 8, // Rough estimate
          height: annotation.style?.fontSize || 16
        };
      }
      default:
        return { x: 0, y: 0, width: 0, height: 0 };
    }
  }

  /**
   * Apply annotation style to context
   */
  private applyStyle(style: AnnotationStyle): void {
    this.ctx.strokeStyle = style.strokeColor;

    // Scale line width based on current view scale
    const viewState = this.getViewState();
    this.ctx.lineWidth = style.strokeWidth / (viewState?.scale || 1);
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    // Apply line style
    if (style.lineStyle) {
      switch (style.lineStyle) {
        case 'dashed':
          this.ctx.setLineDash([5, 5]);
          break;
        case 'dotted':
          this.ctx.setLineDash([2, 2]);
          break;
        case 'solid':
        default:
          this.ctx.setLineDash([]);
          break;
      }
    } else {
      this.ctx.setLineDash([]); // Default to solid
    }

    if (style.fillColor) {
      this.ctx.fillStyle = style.fillColor;
    }

    if (style.fontSize && style.fontFamily) {
      // Scale font size based on current view scale
      const scaledFontSize = style.fontSize / (viewState?.scale || 1);
      this.ctx.font = `${scaledFontSize}px ${style.fontFamily}`;
    }
  }

  /**
   * Get current view state
   */
  private getViewState(): { scale: number; offsetX: number; offsetY: number } {
    return this.canvas.getViewState();
  }


  /**
   * Render rectangle annotation
   */
  private renderRectangle(annotation: Annotation): void {
    if (annotation.points.length < 2) return;

    const start = annotation.points[0]!;
    const end = annotation.points[1]!;
    const width = end.x - start.x;
    const height = end.y - start.y;

    // Fill if fillColor is specified
    if (annotation.style.fillColor) {
      this.ctx.fillRect(start.x, start.y, width, height);
    }

    // Stroke
    this.ctx.strokeRect(start.x, start.y, width, height);
  }

  /**
   * Render circle annotation
   */
  private renderCircle(annotation: Annotation): void {
    if (annotation.points.length < 2) return;

    const center = annotation.points[0]!;
    const edge = annotation.points[1]!;
    const radius = Math.sqrt(
      Math.pow(edge.x - center.x, 2) + Math.pow(edge.y - center.y, 2)
    );

    this.ctx.beginPath();
    this.ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);

    // Fill if fillColor is specified
    if (annotation.style.fillColor) {
      this.ctx.fill();
    }

    this.ctx.stroke();
  }

  /**
   * Render arrow annotation
   */
  private renderArrow(annotation: Annotation): void {
    if (annotation.points.length < 2) return;

    const start = annotation.points[0]!;
    const end = annotation.points[1]!;

    // Draw line
    this.ctx.beginPath();
    this.ctx.moveTo(start.x, start.y);
    this.ctx.lineTo(end.x, end.y);
    this.ctx.stroke();

    // Draw arrowhead
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const arrowLength = 15;
    const arrowAngle = Math.PI / 6; // 30 degrees

    this.ctx.beginPath();
    this.ctx.moveTo(end.x, end.y);
    this.ctx.lineTo(
      end.x - arrowLength * Math.cos(angle - arrowAngle),
      end.y - arrowLength * Math.sin(angle - arrowAngle)
    );
    this.ctx.moveTo(end.x, end.y);
    this.ctx.lineTo(
      end.x - arrowLength * Math.cos(angle + arrowAngle),
      end.y - arrowLength * Math.sin(angle + arrowAngle)
    );
    this.ctx.stroke();
  }

  /**
   * Render line annotation
   */
  private renderLine(annotation: Annotation): void {
    if (annotation.points.length < 2) return;

    this.ctx.beginPath();
    this.ctx.moveTo(annotation.points[0]!.x, annotation.points[0]!.y);

    for (let i = 1; i < annotation.points.length; i++) {
      this.ctx.lineTo(annotation.points[i]!.x, annotation.points[i]!.y);
    }

    this.ctx.stroke();
  }

  /**
   * Render text annotation
   */
  private renderText(annotation: Annotation): void {
    if (annotation.points.length < 1 || !annotation.data?.text) return;

    const position = annotation.points[0]!;
    const text = annotation.data.text as string;
    const fontSize = annotation.style.fontSize || 16;
    const fontFamily = annotation.style.fontFamily || 'Arial, sans-serif';

    // Set font properties
    this.ctx.font = `${fontSize}px ${fontFamily}`;
    this.ctx.fillStyle = annotation.style.strokeColor;

    // Draw text
    this.ctx.fillText(text, position.x, position.y);
  }

  /**
   * Render preview annotation (while drawing)
   */
  renderPreview(type: Annotation['type'], points: Point[], style: AnnotationStyle, data?: Record<string, unknown>): void {
    const previewAnnotation: Annotation = {
      id: 'preview',
      type,
      points,
      style: {
        ...style,
        // Use same color as final annotation but with transparency
        strokeColor: style.strokeColor + '80', // Add transparency
        strokeWidth: style.strokeWidth,
      },
      data: data || {}
    };

    this.render(previewAnnotation);
  }

  /**
   * Check if a point is inside a rectangle annotation
   */
  isPointInRectangle(point: Point, annotation: Annotation): boolean {
    if (annotation.type !== 'rect' || annotation.points.length < 2) return false;

    const start = annotation.points[0]!;
    const end = annotation.points[1]!;
    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);

    // Add tolerance for easier selection
    const tolerance = 5;
    return point.x >= (minX - tolerance) && point.x <= (maxX + tolerance) &&
      point.y >= (minY - tolerance) && point.y <= (maxY + tolerance);
  }

  /**
   * Check if a point is inside a circle annotation
   */
  isPointInCircle(point: Point, annotation: Annotation): boolean {
    if (annotation.type !== 'circle' || annotation.points.length < 2) return false;

    const center = annotation.points[0]!;
    const edge = annotation.points[1]!;
    const radius = Math.sqrt(
      Math.pow(edge.x - center.x, 2) + Math.pow(edge.y - center.y, 2)
    );
    const distance = Math.sqrt(
      Math.pow(point.x - center.x, 2) + Math.pow(point.y - center.y, 2)
    );

    // Add tolerance for easier selection
    const tolerance = 5;
    return distance <= (radius + tolerance);
  }

  /**
   * Check if a point is near a line annotation
   */
  isPointNearLine(point: Point, annotation: Annotation, threshold: number = 15): boolean {
    if ((annotation.type !== 'line' && annotation.type !== 'arrow') || annotation.points.length < 2) {
      return false;
    }

    for (let i = 0; i < annotation.points.length - 1; i++) {
      const start = annotation.points[i]!;
      const end = annotation.points[i + 1]!;

      const distance = this.distancePointToLine(point, start, end);
      if (distance <= threshold) return true;
    }

    return false;
  }

  /**
   * Calculate distance from point to line segment
   */
  private distancePointToLine(point: Point, lineStart: Point, lineEnd: Point): number {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;

    if (lenSq === 0) return Math.sqrt(A * A + B * B);

    let param = dot / lenSq;
    param = Math.max(0, Math.min(1, param));

    const xx = lineStart.x + param * C;
    const yy = lineStart.y + param * D;

    const dx = point.x - xx;
    const dy = point.y - yy;

    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Check if a point hits any annotation
   */
  hitTest(point: Point, annotation: Annotation): boolean {
    switch (annotation.type) {
      case 'rect':
        return this.isPointInRectangle(point, annotation);
      case 'circle':
        return this.isPointInCircle(point, annotation);
      case 'line':
      case 'arrow':
        return this.isPointNearLine(point, annotation);
      case 'text': {
        // Accurate bounding box check for text
        if (annotation.points.length < 1 || !annotation.data?.text) return false;
        const textPos = annotation.points[0]!;
        const text = annotation.data.text as string;
        const fontSize = annotation.style.fontSize || 16;
        const fontFamily = annotation.style.fontFamily || 'Arial, sans-serif';

        // Set font to match text rendering
        this.ctx.font = `${fontSize}px ${fontFamily}`;
        const textMetrics = this.ctx.measureText(text);
        const textWidth = textMetrics.width;
        const textHeight = fontSize * 0.8; // Match selection calculation

        // Add tolerance for easier selection
        const tolerance = 5;
        return point.x >= (textPos.x - tolerance) && point.x <= (textPos.x + textWidth + tolerance) &&
          point.y >= (textPos.y - textHeight - tolerance) && point.y <= (textPos.y + tolerance);
      }
      default:
        return false;
    }
  }
}