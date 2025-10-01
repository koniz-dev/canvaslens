import { ToolConfig } from '../../types';

/**
 * Predefined tool configurations for common use cases
 */
export const ToolConfigs = {
  /**
   * All tools enabled (default)
   */
  all: {
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
  } as ToolConfig,

  /**
   * Zoom and pan only - for viewing images
   */
  viewer: {
    zoom: true,
    pan: true,
    annotation: {
      rect: false,
      arrow: false,
      text: false,
      circle: false,
      line: false
    },
    comparison: false
  } as ToolConfig,

  /**
   * Annotation tools only - for editing
   */
  editor: {
    zoom: false,
    pan: false,
    annotation: {
      rect: true,
      arrow: true,
      text: true,
      circle: true,
      line: true
    },
    comparison: false
  } as ToolConfig,

  /**
   * Basic annotation tools
   */
  basic: {
    zoom: true,
    pan: true,
    annotation: {
      rect: true,
      arrow: true,
      text: true,
      circle: false,
      line: false
    },
    comparison: false
  } as ToolConfig,

  /**
   * Advanced annotation tools
   */
  advanced: {
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
  } as ToolConfig,

  /**
   * Minimal configuration
   */
  minimal: {
    zoom: true,
    pan: false,
    annotation: {
      rect: false,
      arrow: false,
      text: false,
      circle: false,
      line: false
    },
    comparison: false
  } as ToolConfig
};

/**
 * Create a custom tool configuration
 */
export function createToolConfig(config: Partial<ToolConfig>): ToolConfig {
  return {
    zoom: true,
    pan: true,
    annotation: {
      rect: true,
      arrow: true,
      text: true,
      circle: true,
      line: true,
      ...config.annotation
    },
    comparison: true,
    ...config
  };
}

/**
 * Validate tool configuration
 */
export function validateToolConfig(config: any): config is ToolConfig {
  if (typeof config !== 'object' || config === null) {
    return false;
  }

  // Check top-level properties
  if (config.zoom !== undefined && typeof config.zoom !== 'boolean') {
    return false;
  }
  if (config.pan !== undefined && typeof config.pan !== 'boolean') {
    return false;
  }
  if (config.comparison !== undefined && typeof config.comparison !== 'boolean') {
    return false;
  }

  // Check annotation object
  if (config.annotation !== undefined) {
    if (typeof config.annotation !== 'object' || config.annotation === null) {
      return false;
    }

    const annotationProps = ['rect', 'arrow', 'text', 'circle', 'line'];
    for (const prop of annotationProps) {
      if (config.annotation[prop] !== undefined && typeof config.annotation[prop] !== 'boolean') {
        return false;
      }
    }
  }

  return true;
}

/**
 * Convert tool configuration to JSON string for HTML attribute
 */
export function toToolConfigString(config: ToolConfig): string {
  return JSON.stringify(config);
}

/**
 * Parse tool configuration from JSON string
 */
export function fromToolConfigString(configString: string): ToolConfig | null {
  try {
    const config = JSON.parse(configString);
    if (validateToolConfig(config)) {
      return config;
    }
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Get enabled annotation tools
 */
export function getEnabledAnnotationTools(config: ToolConfig): string[] {
  const enabled: string[] = [];
  
  if (config.annotation) {
    if (config.annotation.rect) enabled.push('rect');
    if (config.annotation.arrow) enabled.push('arrow');
    if (config.annotation.text) enabled.push('text');
    if (config.annotation.circle) enabled.push('circle');
    if (config.annotation.line) enabled.push('line');
  }
  
  return enabled;
}

/**
 * Check if a specific tool is enabled
 */
export function isToolEnabled(config: ToolConfig, toolType: string): boolean {
  switch (toolType) {
    case 'zoom':
      return config.zoom ?? false;
    case 'pan':
      return config.pan ?? false;
    case 'comparison':
      return config.comparison ?? false;
    case 'rect':
    case 'arrow':
    case 'text':
    case 'circle':
    case 'line':
      return config.annotation?.[toolType as keyof typeof config.annotation] ?? false;
    default:
      return false;
  }
}

// Expose to global scope for better IntelliSense
if (typeof window !== 'undefined') {
  (window as any).CanvasLensToolConfig = {
    ...ToolConfigs,
    create: createToolConfig,
    validate: validateToolConfig,
    toString: toToolConfigString,
    fromString: fromToolConfigString,
    getEnabledTools: getEnabledAnnotationTools,
    isEnabled: isToolEnabled
  };
}
