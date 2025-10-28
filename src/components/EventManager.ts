/**
 * Manages event handling for CanvasLens Web Component
 */
import { ImageData, Annotation, Point } from '@/types';

export class EventManager {
  private element: HTMLElement;

  constructor(element: HTMLElement) {
    this.element = element;
  }

  /**
   * Set up event listeners for the Web Component
   */
  setupEventListeners(): void {
    // Listen for custom events and forward them with lowercase names for external listeners
    this.addEventListener('imageLoad', (e: Event) => {
      this.dispatchEvent('imageload', (e as CustomEvent).detail);
    });

    this.addEventListener('imageLoadError', (e: Event) => {
      this.dispatchEvent('imageloaderror', (e as CustomEvent).detail);
    });

    this.addEventListener('zoomChange', (e: Event) => {
      this.dispatchEvent('zoomchange', (e as CustomEvent).detail);
    });

    this.addEventListener('panChange', (e: Event) => {
      this.dispatchEvent('panchange', (e as CustomEvent).detail);
    });

    this.addEventListener('annotationAdd', (e: Event) => {
      this.dispatchEvent('annotationadd', (e as CustomEvent).detail);
    });

    this.addEventListener('annotationRemove', (e: Event) => {
      this.dispatchEvent('annotationremove', (e as CustomEvent).detail);
    });

    this.addEventListener('toolChange', (e: Event) => {
      this.dispatchEvent('toolchange', (e as CustomEvent).detail);
    });

    this.addEventListener('comparisonChange', (e: Event) => {
      this.dispatchEvent('comparisonchange', (e as CustomEvent).detail);
    });

    // Listen for window resize to recalculate canvas size
    window.addEventListener('resize', () => {
      this.dispatchEvent('resize');
    });
  }

  /**
   * Create event handlers for the CanvasLens engine
   */
  createEventHandlers() {
    return {
      onImageLoad: (imageData: ImageData) => {
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
    window.removeEventListener('resize', () => {
      this.dispatchEvent('resize');
    });
  }
}
