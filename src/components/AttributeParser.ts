import { AnnotationToolsConfig } from '../modules';
import type { CanvasLensOptions } from '../types';

export class AttributeParser {
  /**
   * Parse all attributes into CanvasLensOptions
   */
  static parseAttributes(element: HTMLElement, container: HTMLElement): CanvasLensOptions {
    const width = this.parseSize(element.getAttribute('width'), 800);
    const height = this.parseSize(element.getAttribute('height'), 600);

    // Parse tools configuration using centralized manager
    const toolsConfig = AnnotationToolsConfig.parseFromAttribute(element);

    const result: CanvasLensOptions = {
      container,
      width,
      height,
      backgroundColor: element.getAttribute('background-color') || '#f0f0f0',
      maxZoom: parseFloat(element.getAttribute('max-zoom') || '10'),
      minZoom: parseFloat(element.getAttribute('min-zoom') || '0.1')
    };

    if (toolsConfig) {
      result.tools = toolsConfig;
    }

    return result;
  }


  /**
   * Parse size attribute (supports px, %, or raw numbers)
   * Validates input to prevent NaN, negative, or unrealistic values
   */
  static parseSize(size: string | null, defaultSize: number): number {
    if (!size) return defaultSize;

    let value: number;
    const MAX_SIZE = 100000; // Prevent unrealistic values

    if (size.endsWith('px')) {
      value = parseInt(size, 10);
    } else if (size.endsWith('%')) {
      const percentage = parseInt(size, 10);
      // Validate percentage (0-100)
      if (isNaN(percentage) || percentage < 0 || percentage > 100) {
        return defaultSize;
      }
      value = (defaultSize * percentage) / 100;
    } else {
      value = parseInt(size, 10);
    }

    // Validate result: must be a number, non-negative, and within reasonable bounds
    if (isNaN(value) || value < 0 || value > MAX_SIZE) {
      return defaultSize;
    }

    return value;
  }

  /**
   * Get container dimensions with fallbacks
   */
  static getContainerDimensions(element: HTMLElement): { width: number; height: number } {
    const containerWidth = element.clientWidth || element.offsetWidth || 800;
    const containerHeight = element.clientHeight || element.offsetHeight || 600;

    const width = this.parseSize(element.getAttribute('width'), containerWidth);
    const height = this.parseSize(element.getAttribute('height'), containerHeight);

    return { width, height };
  }
}
