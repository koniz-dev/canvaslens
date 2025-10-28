
/**
 * Represents a 2D point with x and y coordinates
 * @interface Point
 */
export interface Point {
  /** X coordinate */
  x: number;
  /** Y coordinate */
  y: number;
}

/**
 * Represents dimensions with width and height
 * @interface Size
 */
export interface Size {
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
}

/**
 * Represents a rectangle with position and size
 * @interface Rectangle
 */
export interface Rectangle extends Point, Size {}

/**
 * Represents the current view state including zoom and pan
 * @interface ViewState
 */
export interface ViewState {
  /** Zoom scale factor (1.0 = 100%) */
  scale: number;
  /** Horizontal pan offset in pixels */
  offsetX: number;
  /** Vertical pan offset in pixels */
  offsetY: number;
}

/**
 * Represents loaded image data and metadata
 * @interface CanvasImageData
 */
export interface CanvasImageData {
  /** The HTML image element */
  element: HTMLImageElement;
  /** Natural (original) image dimensions */
  naturalSize: Size;
  /** Current display dimensions */
  displaySize: Size;
  /** Current position of the image */
  position: Point;
  /** MIME type of the image (optional) */
  type?: string;
  /** Original file name (optional) */
  fileName?: string;
}

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

/**
 * Represents an annotation on the canvas
 * @interface Annotation
 */
export interface Annotation {
  /** Unique identifier for the annotation */
  id: string;
  /** Type of annotation */
  type: 'rect' | 'arrow' | 'text' | 'circle' | 'line';
  /** Array of points defining the annotation */
  points: Point[];
  /** Styling properties for the annotation */
  style: AnnotationStyle;
  /** Additional data associated with the annotation */
  data?: Record<string, unknown>;
}

/**
 * Styling properties for annotations
 * @interface AnnotationStyle
 */
export interface AnnotationStyle {
  /** Stroke color (hex, rgb, or named color) */
  strokeColor: string;
  /** Fill color (optional) */
  fillColor?: string;
  /** Stroke width in pixels */
  strokeWidth: number;
  /** Line style for strokes */
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  /** Font size for text annotations */
  fontSize?: number;
  /** Font family for text annotations */
  fontFamily?: string;
}

/**
 * Represents an available tool
 * @interface Tool
 */
export interface Tool {
  /** Display name of the tool */
  name: string;
  /** Type of annotation this tool creates */
  type: Annotation['type'];
  /** Optional icon for the tool */
  icon?: string;
}

/**
 * Event handler callbacks for CanvasLens
 * @interface EventHandlers
 */
export interface EventHandlers {
  /** Called when an image is successfully loaded */
  onImageLoad?: (imageData: CanvasImageData) => void;
  /** Called when image loading fails */
  onImageLoadError?: (error: Error) => void;
  /** Called when zoom level changes */
  onZoomChange?: (scale: number) => void;
  /** Called when pan offset changes */
  onPanChange?: (offset: Point) => void;
  /** Called when an annotation is added */
  onAnnotationAdd?: (annotation: Annotation) => void;
  /** Called when an annotation is removed */
  onAnnotationRemove?: (annotationId: string) => void;
  /** Called when the active tool changes */
  onToolChange?: (toolType: string | null) => void;
  /** Called when comparison slider position changes */
  onComparisonChange?: (position: number) => void;
  /** Called when comparison mode is enabled/disabled */
  onComparisonModeChange?: (enabled: boolean) => void;
}

export type { AnnotationManager, ImageViewer } from './interfaces';
export type { CanvasImageData as ImageData };
