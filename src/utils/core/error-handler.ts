import type { CanvasLensError } from '../../types';
import { ErrorType } from '../../types';
import { error, warn } from './logger';

export class ErrorHandler {
  private static errorCallbacks: Array<(error: CanvasLensError) => void> = [];

  /**
   * Create a typed error
   */
  static createError(
    type: ErrorType,
    message: string,
    context?: Record<string, unknown>,
    recoverable: boolean = false
  ): CanvasLensError {
    const err = new Error(message) as CanvasLensError;
    err.type = type;
    err.context = context || {};
    err.recoverable = recoverable;
    return err;
  }

  /**
   * Handle an error with proper logging and recovery
   */
  static handleError(
    err: Error | CanvasLensError,
    context?: Record<string, unknown>,
    fallback?: () => unknown
  ): void {
    let canvasLensError: CanvasLensError;

    if (this.isCanvasLensError(err)) {
      canvasLensError = err;
    } else {
      canvasLensError = this.createError(
        ErrorType.UNKNOWN,
        err.message,
        { ...context, originalError: err }
      );
    }

    // Log the error
    this.logError(canvasLensError);

    // Notify error callbacks
    this.notifyErrorCallbacks(canvasLensError);

    // Attempt recovery if possible
    if (canvasLensError.recoverable && fallback) {
      try {
        fallback();
        warn('Error recovery successful:', canvasLensError.message);
      } catch (recoveryError) {
        error('Error recovery failed:', recoveryError instanceof Error ? recoveryError : new Error(String(recoveryError)));
      }
    }
  }

  /**
   * Handle initialization errors
   */
  static handleInitializationError(
    err: Error,
    context?: Record<string, unknown>
  ): void {
    const userMessage = this.getUserFriendlyMessage(ErrorType.INITIALIZATION, err.message);
    const canvasLensError = this.createError(
      ErrorType.INITIALIZATION,
      userMessage,
      context,
      false
    );
    this.handleError(canvasLensError);
  }

  /**
   * Handle image loading errors
   */
  static handleImageLoadError(
    err: Error,
    src?: string,
    context?: Record<string, unknown>
  ): void {
    const userMessage = this.getUserFriendlyMessage(ErrorType.IMAGE_LOAD, err.message, src);
    const canvasLensError = this.createError(
      ErrorType.IMAGE_LOAD,
      userMessage,
      { src, ...context },
      true
    );
    this.handleError(canvasLensError, context, () => {
      // Fallback: show error placeholder
      this.showErrorPlaceholder('Failed to load image');
    });
  }

  /**
   * Handle rendering errors
   */
  static handleRenderingError(
    err: Error,
    context?: Record<string, unknown>
  ): void {
    const canvasLensError = this.createError(
      ErrorType.RENDERING,
      `Rendering error: ${err.message}`,
      context,
      true
    );
    this.handleError(canvasLensError, context, () => {
      // Fallback: clear canvas and retry
      this.clearCanvasAndRetry();
    });
  }

  /**
   * Handle annotation errors
   */
  static handleAnnotationError(
    err: Error,
    annotationId?: string,
    context?: Record<string, unknown>
  ): void {
    const canvasLensError = this.createError(
      ErrorType.ANNOTATION,
      `Annotation error: ${err.message}`,
      { annotationId, ...context },
      true
    );
    this.handleError(canvasLensError, context);
  }

  /**
   * Handle tool activation errors
   */
  static handleToolActivationError(
    err: Error,
    toolType?: string,
    context?: Record<string, unknown>
  ): void {
    const canvasLensError = this.createError(
      ErrorType.TOOL_ACTIVATION,
      `Tool activation error: ${err.message}`,
      { toolType, ...context },
      true
    );
    this.handleError(canvasLensError, context);
  }

  /**
   * Handle overlay errors
   */
  static handleOverlayError(
    err: Error,
    operation?: string,
    context?: Record<string, unknown>
  ): void {
    const canvasLensError = this.createError(
      ErrorType.OVERLAY,
      `Overlay error: ${err.message}`,
      { operation, ...context },
      true
    );
    this.handleError(canvasLensError, context, () => {
      // Fallback: close overlay
      this.closeOverlayFallback();
    });
  }

  /**
   * Handle attribute parsing errors
   */
  static handleAttributeParsingError(
    err: Error,
    attribute?: string,
    value?: string,
    context?: Record<string, unknown>
  ): void {
    const canvasLensError = this.createError(
      ErrorType.ATTRIBUTE_PARSING,
      `Attribute parsing error: ${err.message}`,
      { attribute, value, ...context },
      true
    );
    this.handleError(canvasLensError, context);
  }

  /**
   * Register error callback
   */
  static onError(callback: (error: CanvasLensError) => void): () => void {
    this.errorCallbacks.push(callback);
    return () => {
      const index = this.errorCallbacks.indexOf(callback);
      if (index > -1) {
        this.errorCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Check if error is a CanvasLens error
   */
  private static isCanvasLensError(error: unknown): error is CanvasLensError {
    return error !== null &&
      typeof error === 'object' &&
      'type' in error &&
      typeof (error as Record<string, unknown>).type === 'string' &&
      Object.values(ErrorType).includes((error as Record<string, unknown>).type as ErrorType);
  }

  /**
   * Log error with appropriate level
   */
  private static logError(canvasLensError: CanvasLensError): void {
    const logMessage = `[${canvasLensError.type}] ${canvasLensError.message}`;

    if (canvasLensError.recoverable) {
      warn(logMessage, canvasLensError.context);
    } else {
      error(logMessage, canvasLensError.context);
    }
  }

  /**
   * Notify all error callbacks
   */
  private static notifyErrorCallbacks(canvasLensError: CanvasLensError): void {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(canvasLensError);
      } catch (callbackError) {
        error('Error callback failed:', callbackError);
      }
    });
  }

  /**
   * Get user-friendly error message
   */
  private static getUserFriendlyMessage(
    errorType: ErrorType,
    _technicalMessage: string,
    context?: string
  ): string {
    switch (errorType) {
      case ErrorType.INITIALIZATION:
        return 'CanvasLens failed to initialize. Please refresh the page and try again.';

      case ErrorType.IMAGE_LOAD:
        if (context) {
          return `Unable to load image from "${context}". Please check the URL or try a different image.`;
        }
        return 'Failed to load image. Please check the image source and try again.';

      case ErrorType.RENDERING:
        return 'Canvas rendering error. The image may be too large or corrupted.';

      case ErrorType.ANNOTATION:
        return 'Annotation error. Please try again or refresh the page.';

      case ErrorType.TOOL_ACTIVATION:
        return 'Tool activation failed. Please try selecting the tool again.';

      case ErrorType.OVERLAY:
        return 'Overlay mode error. Please close and reopen the overlay.';

      case ErrorType.ATTRIBUTE_PARSING:
        return 'Configuration error. Please check your settings and try again.';

      default:
        return 'An unexpected error occurred. Please refresh the page and try again.';
    }
  }

  /**
   * Show error placeholder
   */
  private static showErrorPlaceholder(message: string): void {
    // This would be implemented to show a visual error placeholder
    warn('Showing error placeholder:', message);
  }

  /**
   * Clear canvas and retry rendering
   */
  private static clearCanvasAndRetry(): void {
    // This would be implemented to clear the canvas and retry rendering
    warn('Clearing canvas and retrying render');
  }

  /**
   * Close overlay fallback
   */
  private static closeOverlayFallback(): void {
    // This would be implemented to close overlay in case of error
    warn('Closing overlay due to error');
  }
}

/**
 * Error boundary decorator for methods
 */
export function withErrorHandling(
  _errorType: ErrorType,
  context?: Record<string, unknown>,
  fallback?: () => void
) {
  return function (_target: unknown, _propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = function (...args: unknown[]) {
      try {
        return method.apply(this, args);
      } catch (error) {
        ErrorHandler.handleError(error as Error, context, fallback);
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Safe async wrapper
 */
export async function safeAsync<T>(
  asyncFn: () => Promise<T>,
  _errorType: ErrorType,
  context?: Record<string, unknown>,
  fallback?: () => T
): Promise<T | undefined> {
  try {
    return await asyncFn();
  } catch (error) {
    ErrorHandler.handleError(error as Error, context, fallback);
    return fallback ? fallback() : undefined;
  }
}
