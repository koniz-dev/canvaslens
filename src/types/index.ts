// Geometry types
export type { Point, Size, Rectangle, ViewState } from './geometry';

// Image types
export type { CustomImageData } from './image';

// Annotation types
export type { Annotation, AnnotationStyle, Tool } from './annotation';

// Configuration types
export type { ToolConfig, CanvasLensOptions } from './config';

// Event types
export type { EventHandlers } from './events';

// Module types
export type {
  AnnotationManagerOptions,
  ControllerOptions,
  EventHandlerOptions,
  ToolManagerOptions,
  ComparisonOptions,
  ComparisonState,
  ZoomPanOptions
} from './modules';

// Tool types
export type { ToolOptions } from './tools';

// Utility types
export type {
  ImageLoadOptions,
  LazyLoadOptions,
  RenderRegion,
  RenderOptions,
  ViewportInfo,
  CullableObject,
  PerformanceMetrics
} from './utils';

// Error types
export { ErrorType } from './errors';
export type { CanvasLensError } from './errors';