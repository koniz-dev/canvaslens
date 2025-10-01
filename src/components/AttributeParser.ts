/**
 * Utility class for parsing CanvasLens Web Component attributes
 */
import { CanvasLensOptions, ToolConfig } from '../types';
import { warn } from '../utils/core/logger';

export class AttributeParser {
  /**
   * Parse all attributes into CanvasLensOptions
   */
  static parseAttributes(element: HTMLElement, container: HTMLElement): CanvasLensOptions {
    const width = this.parseSize(element.getAttribute('width'), 800);
    const height = this.parseSize(element.getAttribute('height'), 600);

    // Parse tools configuration
    const toolsConfig = this.parseToolsConfig(element);

    return {
      container,
      width,
      height,
      backgroundColor: element.getAttribute('background-color') || '#f0f0f0',
      tools: toolsConfig,
      maxZoom: parseFloat(element.getAttribute('max-zoom') || '10'),
      minZoom: parseFloat(element.getAttribute('min-zoom') || '0.1')
    };
  }

  /**
   * Parse tools configuration from attribute
   */
  static parseToolsConfig(element: HTMLElement): ToolConfig {
    const toolsAttr = element.getAttribute('tools');
    
    if (toolsAttr) {
      try {
        return JSON.parse(toolsAttr);
      } catch (e) {
        warn('Invalid tools configuration:', toolsAttr);
      }
    }

    // Default configuration - all tools enabled
    return {
      zoom: true,
      pan: true,
      annotation: {
        rect: true,
        arrow: true,
        text: true,
        circle: true,
        line: true
      },
      comparison: true
    };
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
