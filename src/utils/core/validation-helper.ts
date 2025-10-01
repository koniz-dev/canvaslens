import { Annotation, Point, ToolConfig } from '../../types';

export class ValidationHelper {
  static isValidAnnotation(annotation: any): annotation is Annotation {
    return annotation &&
           typeof annotation.id === 'string' &&
           typeof annotation.type === 'string' &&
           Array.isArray(annotation.points) &&
           annotation.points.length > 0 &&
           annotation.style &&
           typeof annotation.style.strokeColor === 'string' &&
           typeof annotation.style.strokeWidth === 'number';
  }

  static isValidPoint(point: any): point is Point {
    return point &&
           typeof point.x === 'number' &&
           typeof point.y === 'number' &&
           !isNaN(point.x) &&
           !isNaN(point.y);
  }

  static isValidToolConfig(config: any): config is ToolConfig {
    return config &&
           typeof config === 'object' &&
           (config.zoom === undefined || typeof config.zoom === 'boolean') &&
           (config.pan === undefined || typeof config.pan === 'boolean') &&
           (config.comparison === undefined || typeof config.comparison === 'boolean');
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
