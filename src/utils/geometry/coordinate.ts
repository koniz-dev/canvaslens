import { Point, ViewState } from '../../types';

/**
 * Convert screen coordinates to world coordinates
 */
export function screenToWorld(screenPoint: Point, viewState: ViewState): Point {
  return {
    x: (screenPoint.x - viewState.offsetX) / viewState.scale,
    y: (screenPoint.y - viewState.offsetY) / viewState.scale
  };
}

/**
 * Convert world coordinates to screen coordinates
 */
export function worldToScreen(worldPoint: Point, viewState: ViewState): Point {
  return {
    x: worldPoint.x * viewState.scale + viewState.offsetX,
    y: worldPoint.y * viewState.scale + viewState.offsetY
  };
}

/**
 * Calculate distance between two points
 */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate the center point between two points
 */
export function centerPoint(p1: Point, p2: Point): Point {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2
  };
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
