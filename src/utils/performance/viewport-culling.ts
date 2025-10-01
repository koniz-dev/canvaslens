/**
 * Viewport culling utilities for performance optimization
 */
import { Point, Size, Rectangle } from '../../types';

export interface ViewportInfo {
  /** Current viewport position */
  position: Point;
  /** Current viewport size */
  size: Size;
  /** Current zoom level */
  zoom: number;
  /** Viewport bounds */
  bounds: Rectangle;
}

export interface CullableObject {
  /** Object bounds */
  bounds: Rectangle;
  /** Object ID for identification */
  id: string;
  /** Whether object is visible */
  visible?: boolean;
}

export class ViewportCulling {
  /**
   * Check if an object is visible in the viewport
   */
  static isVisible(object: CullableObject, viewport: ViewportInfo): boolean {
    return this.rectanglesIntersect(object.bounds, viewport.bounds);
  }

  /**
   * Cull objects that are outside the viewport
   */
  static cullObjects<T extends CullableObject>(
    objects: T[],
    viewport: ViewportInfo
  ): T[] {
    return objects.filter(object => this.isVisible(object, viewport));
  }

  /**
   * Cull objects with margin for smooth scrolling
   */
  static cullObjectsWithMargin<T extends CullableObject>(
    objects: T[],
    viewport: ViewportInfo,
    margin: number = 100
  ): T[] {
    const expandedViewport = this.expandViewport(viewport, margin);
    return objects.filter(object => this.isVisible(object, expandedViewport));
  }

  /**
   * Get objects that are partially visible
   */
  static getPartiallyVisibleObjects<T extends CullableObject>(
    objects: T[],
    viewport: ViewportInfo
  ): T[] {
    return objects.filter(object => 
      this.rectanglesIntersect(object.bounds, viewport.bounds)
    );
  }

  /**
   * Get objects that are fully visible
   */
  static getFullyVisibleObjects<T extends CullableObject>(
    objects: T[],
    viewport: ViewportInfo
  ): T[] {
    return objects.filter(object => 
      this.rectangleContains(viewport.bounds, object.bounds)
    );
  }

  /**
   * Calculate viewport bounds from position, size, and zoom
   */
  static calculateViewportBounds(
    position: Point,
    size: Size,
    zoom: number
  ): Rectangle {
    return {
      x: position.x,
      y: position.y,
      width: size.width / zoom,
      height: size.height / zoom
    };
  }

  /**
   * Expand viewport by margin
   */
  static expandViewport(viewport: ViewportInfo, margin: number): ViewportInfo {
    return {
      ...viewport,
      bounds: {
        x: viewport.bounds.x - margin,
        y: viewport.bounds.y - margin,
        width: viewport.bounds.width + (margin * 2),
        height: viewport.bounds.height + (margin * 2)
      }
    };
  }

  /**
   * Check if two rectangles intersect
   */
  static rectanglesIntersect(rect1: Rectangle, rect2: Rectangle): boolean {
    return !(
      rect1.x + rect1.width < rect2.x ||
      rect2.x + rect2.width < rect1.x ||
      rect1.y + rect1.height < rect2.y ||
      rect2.y + rect2.height < rect1.y
    );
  }

  /**
   * Check if one rectangle contains another
   */
  static rectangleContains(container: Rectangle, contained: Rectangle): boolean {
    return (
      contained.x >= container.x &&
      contained.y >= container.y &&
      contained.x + contained.width <= container.x + container.width &&
      contained.y + contained.height <= container.y + container.height
    );
  }

  /**
   * Calculate distance from point to rectangle
   */
  static distanceToRectangle(point: Point, rect: Rectangle): number {
    const dx = Math.max(0, Math.max(rect.x - point.x, point.x - (rect.x + rect.width)));
    const dy = Math.max(0, Math.max(rect.y - point.y, point.y - (rect.y + rect.height)));
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Get objects sorted by distance from viewport center
   */
  static getObjectsByDistance<T extends CullableObject>(
    objects: T[],
    viewport: ViewportInfo
  ): T[] {
    const centerX = viewport.bounds.x + viewport.bounds.width / 2;
    const centerY = viewport.bounds.y + viewport.bounds.height / 2;
    const center: Point = { x: centerX, y: centerY };

    return objects
      .map(object => ({
        object,
        distance: this.distanceToRectangle(center, object.bounds)
      }))
      .sort((a, b) => a.distance - b.distance)
      .map(item => item.object);
  }

  /**
   * Create spatial index for efficient culling
   */
  static createSpatialIndex<T extends CullableObject>(
    objects: T[],
    cellSize: number = 100
  ): Map<string, T[]> {
    const index = new Map<string, T[]>();

    objects.forEach(object => {
      const cells = this.getCellsForRectangle(object.bounds, cellSize);
      cells.forEach(cellKey => {
        if (!index.has(cellKey)) {
          index.set(cellKey, []);
        }
        index.get(cellKey)!.push(object);
      });
    });

    return index;
  }

  /**
   * Cull objects using spatial index
   */
  static cullObjectsWithIndex<T extends CullableObject>(
    spatialIndex: Map<string, T[]>,
    viewport: ViewportInfo,
    cellSize: number = 100
  ): T[] {
    const visibleObjects = new Set<T>();
    const cells = this.getCellsForRectangle(viewport.bounds, cellSize);

    cells.forEach(cellKey => {
      const cellObjects = spatialIndex.get(cellKey);
      if (cellObjects) {
        cellObjects.forEach(object => {
          if (this.isVisible(object, viewport)) {
            visibleObjects.add(object);
          }
        });
      }
    });

    return Array.from(visibleObjects);
  }

  /**
   * Get cell keys for a rectangle
   */
  private static getCellsForRectangle(rect: Rectangle, cellSize: number): string[] {
    const cells: string[] = [];
    const startX = Math.floor(rect.x / cellSize);
    const startY = Math.floor(rect.y / cellSize);
    const endX = Math.floor((rect.x + rect.width) / cellSize);
    const endY = Math.floor((rect.y + rect.height) / cellSize);

    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        cells.push(`${x},${y}`);
      }
    }

    return cells;
  }

  /**
   * Update object visibility flags
   */
  static updateVisibility<T extends CullableObject>(
    objects: T[],
    viewport: ViewportInfo
  ): T[] {
    return objects.map(object => ({
      ...object,
      visible: this.isVisible(object, viewport)
    }));
  }

  /**
   * Get performance metrics for culling
   */
  static getCullingMetrics<T extends CullableObject>(
    objects: T[],
    viewport: ViewportInfo
  ): {
    totalObjects: number;
    visibleObjects: number;
    cullingRatio: number;
    performanceGain: number;
  } {
    const visibleObjects = this.cullObjects(objects, viewport);
    const totalObjects = objects.length;
    const visibleCount = visibleObjects.length;
    const cullingRatio = totalObjects > 0 ? (totalObjects - visibleCount) / totalObjects : 0;
    const performanceGain = totalObjects > 0 ? (totalObjects - visibleCount) / totalObjects * 100 : 0;

    return {
      totalObjects,
      visibleObjects: visibleCount,
      cullingRatio,
      performanceGain
    };
  }
}
