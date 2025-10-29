/**
 * Configuration for available tools and features
 * @interface ToolConfig
 */
export interface ToolConfig {
  /** Enable zoom functionality */
  zoom?: boolean;
  /** Enable pan functionality */
  pan?: boolean;
  /** Annotation tools configuration */
  annotation?: {
    /** Enable rectangle annotation tool */
    rect?: boolean;
    /** Enable arrow annotation tool */
    arrow?: boolean;
    /** Enable text annotation tool */
    text?: boolean;
    /** Enable circle annotation tool */
    circle?: boolean;
    /** Enable line annotation tool */
    line?: boolean;
  };
  /** Enable image comparison functionality */
  comparison?: boolean;
}

/**
 * Configuration options for CanvasLens initialization
 * @interface CanvasLensOptions
 */
export interface CanvasLensOptions {
  /** Container element where CanvasLens will be rendered */
  container: HTMLElement;
  /** Initial width in pixels (default: 800) */
  width?: number;
  /** Initial height in pixels (default: 600) */
  height?: number;
  /** Background color (default: '#f0f0f0') */
  backgroundColor?: string;
  /** Tool configuration */
  tools?: ToolConfig;
  /** Maximum zoom level (default: 10) */
  maxZoom?: number;
  /** Minimum zoom level (default: 0.1) */
  minZoom?: number;
}
