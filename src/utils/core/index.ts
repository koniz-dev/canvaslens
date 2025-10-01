// Core utilities exports
export { ErrorHandler, ErrorType, withErrorHandling, safeAsync } from './error-handler';
export { log, warn, error, info } from './logger';
export { MemoryManager } from './memory-manager';
export { ValidationHelper } from './validation-helper';

// Re-export types
export type { CanvasLensError } from './error-handler';
