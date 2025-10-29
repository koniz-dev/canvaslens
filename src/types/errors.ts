/**
 * Error types for CanvasLens
 */
export enum ErrorType {
  INITIALIZATION = 'INITIALIZATION',
  IMAGE_LOAD = 'IMAGE_LOAD',
  RENDERING = 'RENDERING',
  ANNOTATION = 'ANNOTATION',
  TOOL_ACTIVATION = 'TOOL_ACTIVATION',
  OVERLAY = 'OVERLAY',
  ATTRIBUTE_PARSING = 'ATTRIBUTE_PARSING',
  UNKNOWN = 'UNKNOWN'
}

/**
 * Extended error interface for CanvasLens
 * @interface CanvasLensError
 */
export interface CanvasLensError extends Error {
  type: ErrorType;
  context?: Record<string, unknown>;
  recoverable?: boolean;
}
