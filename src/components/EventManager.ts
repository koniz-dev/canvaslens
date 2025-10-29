import type { Point, Annotation, CustomImageData } from '../types';

export class EventManager {
  private element: HTMLElement;
  private eventHandlers: Map<string, Set<(event: CustomEvent) => void>> = new Map();
  private resizeHandler: () => void;
  private boundHandlers: Map<string, (e: Event) => void> = new Map();
  private isSetup = false;

  constructor(element: HTMLElement) {
    this.element = element;
    this.resizeHandler = () => {
      this.dispatchEvent('resize');
    };
  }

  /**
   * Set up event listeners for the Web Component
   */
  setupEventListeners(): void {
    // Guard: Prevent duplicate listeners if already set up
    if (this.isSetup) {
      return;
    }
    // Create bound handlers for custom events
    const imageLoadHandler = (e: Event) => {
      this.dispatchEvent('imageload', (e as CustomEvent).detail);
    };
    const imageLoadErrorHandler = (e: Event) => {
      this.dispatchEvent('imageloaderror', (e as CustomEvent).detail);
    };
    const zoomChangeHandler = (e: Event) => {
      this.dispatchEvent('zoomchange', (e as CustomEvent).detail);
    };
    const panChangeHandler = (e: Event) => {
      this.dispatchEvent('panchange', (e as CustomEvent).detail);
    };
    const annotationAddHandler = (e: Event) => {
      this.dispatchEvent('annotationadd', (e as CustomEvent).detail);
    };
    const annotationRemoveHandler = (e: Event) => {
      this.dispatchEvent('annotationremove', (e as CustomEvent).detail);
    };
    const toolChangeHandler = (e: Event) => {
      this.dispatchEvent('toolchange', (e as CustomEvent).detail);
    };
    const comparisonChangeHandler = (e: Event) => {
      this.dispatchEvent('comparisonchange', (e as CustomEvent).detail);
    };

    // Store handlers for cleanup
    this.boundHandlers.set('imageLoad', imageLoadHandler);
    this.boundHandlers.set('imageLoadError', imageLoadErrorHandler);
    this.boundHandlers.set('zoomChange', zoomChangeHandler);
    this.boundHandlers.set('panChange', panChangeHandler);
    this.boundHandlers.set('annotationAdd', annotationAddHandler);
    this.boundHandlers.set('annotationRemove', annotationRemoveHandler);
    this.boundHandlers.set('toolChange', toolChangeHandler);
    this.boundHandlers.set('comparisonChange', comparisonChangeHandler);

    // Listen for custom events and forward them with lowercase names for external listeners
    this.addEventListener('imageLoad', imageLoadHandler);
    this.addEventListener('imageLoadError', imageLoadErrorHandler);
    this.addEventListener('zoomChange', zoomChangeHandler);
    this.addEventListener('panChange', panChangeHandler);
    this.addEventListener('annotationAdd', annotationAddHandler);
    this.addEventListener('annotationRemove', annotationRemoveHandler);
    this.addEventListener('toolChange', toolChangeHandler);
    this.addEventListener('comparisonChange', comparisonChangeHandler);

    // Listen for window resize to recalculate canvas size
    window.addEventListener('resize', this.resizeHandler);

    // Mark as set up to prevent duplicates
    this.isSetup = true;
  }

  /**
   * Create event handlers for the CanvasLens engine
   */
  createEventHandlers() {
    return {
      onImageLoad: (imageData: CustomImageData) => {
        this.dispatchEvent('imageLoad', imageData);
      },
      onImageLoadError: (error: Error) => {
        this.dispatchEvent('imageLoadError', error);
      },
      onZoomChange: (zoom: number) => {
        this.dispatchEvent('zoomChange', zoom);
      },
      onPanChange: (pan: Point) => {
        this.dispatchEvent('panChange', pan);
      },
      onAnnotationAdd: (annotation: Annotation) => {
        this.dispatchEvent('annotationAdd', annotation);
      },
      onAnnotationRemove: (annotation: string) => {
        this.dispatchEvent('annotationRemove', annotation);
      },
      onToolChange: (tool: string | null) => {
        this.dispatchEvent('toolChange', tool);
      },
      onComparisonChange: (comparison: number) => {
        this.dispatchEvent('comparisonChange', comparison);
      }
    };
  }

  /**
   * Add event listener to the element
   */
  private addEventListener(event: string, handler: (e: Event) => void): void {
    this.element.addEventListener(event, handler);
  }

  /**
   * Dispatch custom event
   */
  private dispatchEvent(eventName: string, detail?: unknown): void {
    this.element.dispatchEvent(new CustomEvent(eventName, { detail }));
  }

  /**
   * Clean up event listeners
   */
  destroy(): void {
    // Remove window resize listener
    window.removeEventListener('resize', this.resizeHandler);
    
    // Remove all custom event listeners
    this.boundHandlers.forEach((handler, eventName) => {
      this.element.removeEventListener(eventName, handler);
    });
    this.boundHandlers.clear();
    
    // Clear all event handlers
    this.eventHandlers.clear();
    
    // Reset setup flag to allow re-initialization
    this.isSetup = false;
  }
}
