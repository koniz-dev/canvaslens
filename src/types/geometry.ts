/**
 * Represents a 2D point with x and y coordinates
 * @interface Point
 */
export interface Point {
  /** X coordinate */
  x: number;
  /** Y coordinate */
  y: number;
}

/**
 * Represents dimensions with width and height
 * @interface Size
 */
export interface Size {
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
}

/**
 * Represents a rectangle with position and size
 * @interface Rectangle
 */
export interface Rectangle extends Point, Size {}

/**
 * Represents the current view state including zoom and pan
 * @interface ViewState
 */
export interface ViewState {
  /** Zoom scale factor (1.0 = 100%) */
  scale: number;
  /** Horizontal pan offset in pixels */
  offsetX: number;
  /** Vertical pan offset in pixels */
  offsetY: number;
}
