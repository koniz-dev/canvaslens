import type { Point, Size } from './geometry';

/**
 * Represents loaded image data and metadata
 * @interface CustomImageData
 */
export interface CustomImageData {
  /** The HTML image element */
  element: HTMLImageElement;
  /** Natural (original) image dimensions */
  naturalSize: Size;
  /** Current display dimensions */
  displaySize: Size;
  /** Current position of the image */
  position: Point;
  /** MIME type of the image (optional) */
  type?: string;
  /** Original file name (optional) */
  fileName?: string;
}
