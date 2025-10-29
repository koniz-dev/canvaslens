import type { ToolConfig } from '../../../types';
import { warn } from '../../../utils/core/logger';

/**
 * Tool configuration management utilities
 */
export class AnnotationToolsConfig {
  /**
   * Default minimal configuration (no tools enabled)
   */
  static readonly DEFAULT_CONFIG: ToolConfig = {
    zoom: false,
    pan: false,
    annotation: {
      rect: false,
      arrow: false,
      text: false,
      circle: false,
      line: false
    },
    comparison: false
  };

  /**
   * Parse tools configuration from HTML attribute
   */
  static parseFromAttribute(element: HTMLElement): ToolConfig | undefined {
    const toolsAttr = element.getAttribute('tools');

    if (!toolsAttr) {
      return undefined; // Let Engine use its default
    }

    try {
      const parsed = JSON.parse(toolsAttr);

      // Validate the parsed configuration
      if (typeof parsed !== 'object' || parsed === null) {
        warn('Tools configuration must be an object:', toolsAttr);
        return undefined;
      }

      return parsed;
    } catch (e) {
      warn('Invalid JSON in tools configuration:', toolsAttr, e);
      return undefined;
    }
  }

  /**
   * Merge user configuration with defaults
   */
  static mergeWithDefaults(userConfig?: ToolConfig): ToolConfig {
    if (!userConfig) {
      return { ...this.DEFAULT_CONFIG };
    }

    return {
      zoom: !!userConfig.zoom,
      pan: !!userConfig.pan,
      annotation: userConfig.annotation ? {
        rect: !!userConfig.annotation.rect,
        arrow: !!userConfig.annotation.arrow,
        text: !!userConfig.annotation.text,
        circle: !!userConfig.annotation.circle,
        line: !!userConfig.annotation.line
      } : {
        rect: false,
        arrow: false,
        text: false,
        circle: false,
        line: false
      },
      comparison: !!userConfig.comparison
    };
  }

  /**
   * Check if zoom or pan is enabled
   */
  static hasZoomOrPan(config: ToolConfig): boolean {
    return !!(config.zoom || config.pan);
  }

  /**
   * Check if annotation tools are enabled
   */
  static hasAnnotations(config: ToolConfig): boolean {
    return !!(config.annotation && (
      config.annotation.rect ||
      config.annotation.arrow ||
      config.annotation.text ||
      config.annotation.circle ||
      config.annotation.line
    ));
  }

  /**
   * Check if comparison is enabled
   */
  static hasComparison(config: ToolConfig): boolean {
    return !!config.comparison;
  }
}
