// Main CanvasLens Web Component
export { CanvasLens } from './CanvasLens';

// Core types for TypeScript support
export type {
  Annotation,
  AnnotationStyle,
  CanvasLensOptions,
  CustomImageData,
  EventHandlers,
  Point,
  Size,
  Tool,
  ToolConfig,
  ViewState,
} from './types';

// Core engine and rendering
export { Engine, Renderer } from './core';

// Components
export {
  AttributeParser,
  CanvasLensCore,
  EventManager,
  OverlayManager,
} from './components';

// Utilities - Error handling
export {
  ErrorHandler,
  safeAsync,
  withErrorHandling,
} from './utils/core/error-handler';

// Utilities - Logging
export {
  error,
  info,
  log,
  warn,
} from './utils/core/logger';

// Utilities - Memory management
export { MemoryManager } from './utils/core/memory-manager';

// Utilities - Validation
export { ValidationHelper } from './utils/core/validation-helper';

// Utilities - Performance
export {
  PerformanceMonitor,
  performanceMonitor,
} from './utils/performance/performance';

export { RenderOptimizer } from './utils/performance/render-optimizer';
export { ViewportCulling } from './utils/performance/viewport-culling';

// Utilities - Image handling
export { ImageLoader } from './utils/image/loader';
export {
  calculateFitDimensions,
  calculateFitDimensionsOverlay,
  getCustomImageDataOverlay,
  getImageData,
  isPointInRect,
  loadImage,
} from './utils/image/utils';

// Utilities - Geometry
export {
  centerPoint,
  clamp,
  distance,
  screenToWorld,
  worldToScreen,
} from './utils/geometry/coordinate';

// Constants
export {
  ANNOTATION_STYLES,
  DEFAULT_CONFIG,
  EVENTS,
  KEYBOARD_SHORTCUTS,
  TOOL_TYPES,
} from './constants';

