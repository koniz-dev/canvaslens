import type { AnnotationStyle, Point, Annotation } from './index';

/**
 * Options for configuring individual tools
 * @interface ToolOptions
 */
export interface ToolOptions {
  style?: AnnotationStyle;
  enabled?: boolean;
  cursor?: string;
  icon?: string;
  shortcut?: string;
  onStart?: (point: Point) => void;
  onMove?: (point: Point) => void;
  onEnd?: (annotation: Annotation) => void;
  onCancel?: () => void;
}
