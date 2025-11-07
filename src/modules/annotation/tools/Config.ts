import type { ToolConfig } from '../../../types';
import { warn } from '../../../utils/core/logger';
import { SecureJsonParser } from '../../../utils/security/secure-json-parser';

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
   * Uses secure JSON parser with validation
   */
  static parseFromAttribute(element: HTMLElement): ToolConfig | undefined {
    const toolsAttr = element.getAttribute('tools');

    if (!toolsAttr) {
      return undefined; // Let Engine use its default
    }

    // Use secure JSON parser with validation
    const parsed = SecureJsonParser.parseToolConfig(toolsAttr);
    
    if (!parsed) {
      warn('Invalid or unsafe tools configuration');
      return undefined;
    }

    return parsed;
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
