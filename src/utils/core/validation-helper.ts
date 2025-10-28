import { Annotation, Point, ToolConfig } from '../../types';

export class ValidationHelper {
  static isValidAnnotation(annotation: unknown): annotation is Annotation {
    return Boolean(
      annotation !== null &&
      typeof annotation === 'object' &&
      'id' in annotation &&
      'type' in annotation &&
      'points' in annotation &&
      'style' in annotation &&
      typeof (annotation as Record<string, unknown>).id === 'string' &&
      typeof (annotation as Record<string, unknown>).type === 'string' &&
      Array.isArray((annotation as Record<string, unknown>).points) &&
      ((annotation as Record<string, unknown>).points as unknown[]).length > 0 &&
      (annotation as Record<string, unknown>).style &&
      typeof ((annotation as Record<string, unknown>).style as Record<string, unknown>).strokeColor === 'string' &&
      typeof ((annotation as Record<string, unknown>).style as Record<string, unknown>).strokeWidth === 'number'
    );
  }

  static isValidPoint(point: unknown): point is Point {
    return point !== null &&
           typeof point === 'object' &&
           'x' in point &&
           'y' in point &&
           typeof (point as Record<string, unknown>).x === 'number' &&
           typeof (point as Record<string, unknown>).y === 'number' &&
           !isNaN((point as Record<string, unknown>).x as number) &&
           !isNaN((point as Record<string, unknown>).y as number);
  }

  static isValidToolConfig(config: unknown): config is ToolConfig {
    return config !== null &&
           typeof config === 'object' &&
           ((config as Record<string, unknown>).zoom === undefined || typeof (config as Record<string, unknown>).zoom === 'boolean') &&
           ((config as Record<string, unknown>).pan === undefined || typeof (config as Record<string, unknown>).pan === 'boolean') &&
           ((config as Record<string, unknown>).comparison === undefined || typeof (config as Record<string, unknown>).comparison === 'boolean');
  }

  static isValidImageFile(file: File): boolean {
    return file &&
           file instanceof File &&
           file.type.startsWith('image/') &&
           file.size > 0;
  }

  static isValidImageUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static hasMinimumLength(points: Point[], minLength: number = 5): boolean {
    if (points.length < 2) return false;
    
    const first = points[0]!;
    const last = points[points.length - 1]!;
    
    const distance = Math.sqrt(
      Math.pow(last.x - first.x, 2) + Math.pow(last.y - first.y, 2)
    );
    
    return distance >= minLength;
  }

  static isWithinBounds(point: Point, bounds: { x: number; y: number; width: number; height: number }): boolean {
    return point.x >= bounds.x &&
           point.x <= bounds.x + bounds.width &&
           point.y >= bounds.y &&
           point.y <= bounds.y + bounds.height;
  }
}
