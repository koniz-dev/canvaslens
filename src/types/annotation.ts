import type { Point } from './geometry';

/**
 * Styling properties for annotations
 * @interface AnnotationStyle
 */
export interface AnnotationStyle {
  /** Stroke color (hex, rgb, or named color) */
  strokeColor: string;
  /** Fill color (optional) */
  fillColor?: string;
  /** Stroke width in pixels */
  strokeWidth: number;
  /** Line style for strokes */
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  /** Font size for text annotations */
  fontSize?: number;
  /** Font family for text annotations */
  fontFamily?: string;
  /** Shadow color (hex, rgb, or rgba) - for depth effect */
  shadowColor?: string;
  /** Shadow blur radius in pixels */
  shadowBlur?: number;
  /** Shadow horizontal offset in pixels */
  shadowOffsetX?: number;
  /** Shadow vertical offset in pixels */
  shadowOffsetY?: number;
}

/**
 * Represents an annotation on the canvas
 * @interface Annotation
 */
export interface Annotation {
  /** Unique identifier for the annotation */
  id: string;
  /** Type of annotation */
  type: 'rect' | 'arrow' | 'text' | 'circle' | 'line';
  /** Array of points defining the annotation */
  points: Point[];
  /** Styling properties for the annotation */
  style: AnnotationStyle;
  /** Additional data associated with the annotation */
  data?: Record<string, unknown>;
}

/**
 * Represents an available tool
 * @interface Tool
 */
export interface Tool {
  /** Display name of the tool */
  name: string;
  /** Type of annotation this tool creates */
  type: Annotation['type'];
  /** Optional icon for the tool */
  icon?: string;
}
