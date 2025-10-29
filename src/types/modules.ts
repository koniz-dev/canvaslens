import type { EventHandlers, AnnotationStyle, Tool, CustomImageData, Annotation, Point } from './index';

/**
 * Options for configuring the annotation manager
 * @interface AnnotationManagerOptions
 */
export interface AnnotationManagerOptions {
  enabled?: boolean;
  defaultStyle?: AnnotationStyle;
  availableTools?: Tool[];
  eventHandlers?: EventHandlers;
}

/**
 * Options for configuring the annotation tools controller
 * @interface ControllerOptions
 */
export interface ControllerOptions<
  TCanvas = unknown,
  TRenderer = unknown,
  TAnnotationManager = unknown
> {
  canvas: TCanvas; // Renderer type
  renderer: TRenderer; // AnnotationRenderer type
  defaultStyle: AnnotationStyle;
  availableTools: Tool[];
  annotationManager?: TAnnotationManager;
}

/**
 * Options for configuring the annotation tools event handler
 * @interface EventHandlerOptions
 */
export interface EventHandlerOptions<
  TCanvas = unknown,
  TRenderer = unknown,
  TTool = unknown,
  TAnnotationManager = unknown
> {
  canvas: TCanvas; // Renderer type
  renderer: TRenderer; // AnnotationRenderer type
  currentTool: TTool; // BaseTool type
  activeToolType: string | null;
  toolActivatedByKeyboard: boolean;
  toolManagerDrawing: boolean;
  onAnnotationCreate?: (annotation: Annotation) => void;
  annotationManager?: TAnnotationManager;
  onActivateTool: (toolType: string) => boolean;
  onDeactivateTool: () => void;
  onScreenToWorld: (screenPoint: Point) => Point;
  onIsPointInImageBounds: (point: Point) => boolean;
  onMeetsMinimumSize: (annotation: Annotation) => boolean;
  onClampPointToImageBounds: (point: Point) => Point;
}

/**
 * Options for configuring the tool manager
 * @interface ToolManagerOptions
 */
export interface ToolManagerOptions<TAnnotationManager = unknown> {
  defaultStyle: AnnotationStyle;
  availableTools: Tool[];
  annotationManager?: TAnnotationManager;
}

/**
 * Options for configuring comparison functionality
 * @interface ComparisonOptions
 */
export interface ComparisonOptions {
  sliderPosition?: number; // 0-100 percentage
  sliderWidth?: number;
  sliderColor?: string;
  enableSynchronizedZoom?: boolean;
  enableSynchronizedPan?: boolean;
  eventHandlers?: EventHandlers;
  comparisonMode?: boolean; // Enable comparison mode (before/after with annotations)
}

/**
 * State of comparison functionality
 * @interface ComparisonState
 */
export interface ComparisonState {
  sliderPosition: number;
  isDragging: boolean;
  beforeImage: CustomImageData | null;
  afterImage: CustomImageData | null;
  comparisonMode: boolean;
}

/**
 * Options for configuring zoom and pan functionality
 * @interface ZoomPanOptions
 */
export interface ZoomPanOptions {
  enableZoom?: boolean;
  enablePan?: boolean;
  maxZoom?: number;
  minZoom?: number;
  zoomSpeed?: number;
  panSpeed?: number;
}