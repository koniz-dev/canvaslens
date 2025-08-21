import { Annotation, Point, AnnotationStyle } from '../../types';

export class AnnotationRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
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
   * Render multiple annotations
   */
  renderAll(annotations: Annotation[]): void {
    annotations.forEach(annotation => this.render(annotation));
  }

  /**
   * Apply annotation style to context
   */
  private applyStyle(style: AnnotationStyle): void {
    this.ctx.strokeStyle = style.strokeColor;
    this.ctx.lineWidth = style.strokeWidth;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    if (style.fillColor) {
      this.ctx.fillStyle = style.fillColor;
    }

    if (style.fontSize && style.fontFamily) {
      this.ctx.font = `${style.fontSize}px ${style.fontFamily}`;
    }
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
    const headLength = 15;
    const headAngle = Math.PI / 6;

    // Draw line
    this.ctx.beginPath();
    this.ctx.moveTo(start.x, start.y);
    this.ctx.lineTo(end.x, end.y);
    this.ctx.stroke();

    // Calculate arrow head
    const angle = Math.atan2(end.y - start.y, end.x - start.x);

    // Draw arrow head
    this.ctx.beginPath();
    this.ctx.moveTo(end.x, end.y);
    this.ctx.lineTo(
      end.x - headLength * Math.cos(angle - headAngle),
      end.y - headLength * Math.sin(angle - headAngle)
    );
    this.ctx.moveTo(end.x, end.y);
    this.ctx.lineTo(
      end.x - headLength * Math.cos(angle + headAngle),
      end.y - headLength * Math.sin(angle + headAngle)
    );
    this.ctx.stroke();
  }

  /**
   * Render line annotation
   */
  private renderLine(annotation: Annotation): void {
    if (annotation.points.length < 2) return;

    this.ctx.beginPath();
    const firstPoint = annotation.points[0]!;
    this.ctx.moveTo(firstPoint.x, firstPoint.y);

    for (let i = 1; i < annotation.points.length; i++) {
      const point = annotation.points[i]!;
      this.ctx.lineTo(point.x, point.y);
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

    // Set text alignment
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';

    // Draw text background if fillColor is specified
    if (annotation.style.fillColor) {
      const metrics = this.ctx.measureText(text);
      const textHeight = annotation.style.fontSize || 16;
      const padding = 4;

      this.ctx.fillRect(
        position.x - padding,
        position.y - padding,
        metrics.width + padding * 2,
        textHeight + padding * 2
      );
    }

    // Draw text
    this.ctx.fillStyle = annotation.style.strokeColor;
    this.ctx.fillText(text, position.x, position.y);
  }

  /**
   * Render preview annotation (while drawing)
   */
  renderPreview(type: Annotation['type'], points: Point[], style: AnnotationStyle, data?: any): void {
    const previewAnnotation: Annotation = {
      id: 'preview',
      type,
      points,
      style: {
        ...style,
        strokeColor: style.strokeColor + '80', // Add transparency
      },
      data
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

    return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
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

    return distance <= radius;
  }

  /**
   * Check if a point is near a line annotation
   */
  isPointNearLine(point: Point, annotation: Annotation, threshold: number = 5): boolean {
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
      case 'text':
        // Simple bounding box check for text
        if (annotation.points.length < 1 || !annotation.data?.text) return false;
        const textPos = annotation.points[0]!;
        const fontSize = annotation.style.fontSize || 16;
        const textWidth = (annotation.data.text as string).length * fontSize * 0.6; // Rough estimation
        return point.x >= textPos.x && point.x <= textPos.x + textWidth &&
               point.y >= textPos.y && point.y <= textPos.y + fontSize;
      default:
        return false;
    }
  }
}