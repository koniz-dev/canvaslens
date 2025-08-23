// Core types for CanvasLens library

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rectangle extends Point, Size {}

export interface ViewState {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export interface ImageData {
  element: HTMLImageElement;
  naturalSize: Size;
  displaySize: Size;
  position: Point;
  type?: string;
  fileName?: string;
}

export interface CanvasLensOptions {
  container: HTMLElement;
  width?: number;
  height?: number;
  backgroundColor?: string;
  enableZoom?: boolean;
  enablePan?: boolean;
  enableAnnotations?: boolean;
  maxZoom?: number;
  minZoom?: number;
}

export interface Annotation {
  id: string;
  type: 'rect' | 'arrow' | 'text' | 'circle' | 'line';
  points: Point[];
  style: AnnotationStyle;
  data?: any;
}

export interface AnnotationStyle {
  strokeColor: string;
  fillColor?: string;
  strokeWidth: number;
  fontSize?: number;
  fontFamily?: string;
}

export interface Tool {
  name: string;
  type: Annotation['type'];
  icon?: string;
}

export interface EventHandlers {
  onImageLoad?: (imageData: ImageData) => void;
  onZoomChange?: (scale: number) => void;
  onPanChange?: (offset: Point) => void;
  onAnnotationAdd?: (annotation: Annotation) => void;
  onAnnotationRemove?: (annotationId: string) => void;
  onToolChange?: (toolType: string | null) => void;
  onSliderChange?: (position: number) => void;
}
