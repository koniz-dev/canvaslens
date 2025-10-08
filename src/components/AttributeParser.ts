/**
 * Utility class for parsing CanvasLens Web Component attributes
 */
import { CanvasLensOptions } from '../types';
import { AnnotationToolsConfig } from '../modules';

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
   */
  static parseSize(size: string | null, defaultSize: number): number {
    if (!size) return defaultSize;
    if (size.endsWith('px')) return parseInt(size);
    if (size.endsWith('%')) {
      const percentage = parseInt(size);
      // Use the provided defaultSize which should be the actual container size
      return (defaultSize * percentage) / 100;
    }
    return parseInt(size) || defaultSize;
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
