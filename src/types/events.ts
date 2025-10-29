import type { Annotation } from './annotation';
import type { Point } from './geometry';
import type { CustomImageData } from './image';

/**
 * Event handler callbacks for CanvasLens
 * @interface EventHandlers
 */
export interface EventHandlers {
  /** Called when an image is successfully loaded */
  onImageLoad?: (CustomImageData: CustomImageData) => void;
  /** Called when image loading fails */
  onImageLoadError?: (error: Error) => void;
  /** Called when zoom level changes */
  onZoomChange?: (scale: number) => void;
  /** Called when pan offset changes */
  onPanChange?: (offset: Point) => void;
  /** Called when an annotation is added */
  onAnnotationAdd?: (annotation: Annotation) => void;
  /** Called when an annotation is removed */
  onAnnotationRemove?: (annotationId: string) => void;
  /** Called when the active tool changes */
  onToolChange?: (toolType: string | null) => void;
  /** Called when comparison slider position changes */
  onComparisonChange?: (position: number) => void;
  /** Called when comparison mode is enabled/disabled */
  onComparisonModeChange?: (enabled: boolean) => void;
}
