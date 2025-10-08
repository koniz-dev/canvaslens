declare namespace JSX {
  interface IntrinsicElements {
    'canvas-lens': CanvasLensElementAttributes;
  }
}

interface CanvasLensElementAttributes {
  // Basic attributes
  src?: string;
  width?: string | number;
  height?: string | number;
  'background-color'?: string;
  
  // Tool configuration
  tools?: string | ToolConfig;
  
  // Zoom settings
  'max-zoom'?: string | number;
  'min-zoom'?: string | number;
  
  // Image metadata
  'image-type'?: string;
  'file-name'?: string;
  
  // Event handlers
  onimageload?: (event: CustomEvent<ImageData>) => void;
  onzoomchange?: (event: CustomEvent<number>) => void;
  onpanchange?: (event: CustomEvent<Point>) => void;
  onannotationadd?: (event: CustomEvent<Annotation>) => void;
  onannotationremove?: (event: CustomEvent<string>) => void;
  ontoolchange?: (event: CustomEvent<string | null>) => void;
  oncomparisonchange?: (event: CustomEvent<number>) => void;
}

interface ToolConfig {
  zoom?: boolean;
  pan?: boolean;
  annotation?: {
    rect?: boolean;
    arrow?: boolean;
    text?: boolean;
    circle?: boolean;
    line?: boolean;
  };
  comparison?: boolean;
}

interface Point {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface ImageData {
  element: HTMLImageElement;
  naturalSize: Size;
  displaySize: Size;
  position: Point;
  type?: string;
  fileName?: string;
}

interface Annotation {
  id: string;
  type: 'rect' | 'arrow' | 'text' | 'circle' | 'line';
  points: Point[];
  style: AnnotationStyle;
  data?: any;
}

interface AnnotationStyle {
  strokeColor: string;
  fillColor?: string;
  strokeWidth: number;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  fontSize?: number;
  fontFamily?: string;
}

// Extend HTMLElement to include CanvasLens methods
interface HTMLElement {
  // Image loading
  loadImage(src: string, type?: string, fileName?: string): Promise<void>;
  loadImageFromFile(file: File): void;
  
  // Resize
  resize(width: number, height: number): void;
  
  // Zoom controls
  zoomIn(factor?: number): void;
  zoomOut(factor?: number): void;
  zoomTo(scale: number): void;
  fitToView(): void;
  resetView(): void;
  
  // Tool controls
  activateTool(toolType: string): boolean;
  deactivateTool(): boolean;
  getActiveTool(): string | null;
  updateTools(toolConfig: ToolConfig): void;
  
  // Annotation controls
  addAnnotation(annotation: Annotation): void;
  removeAnnotation(annotationId: string): void;
  clearAnnotations(): void;
  getAnnotations(): Annotation[];
  
  // Overlay editor
  openOverlay(): void;
  closeOverlay(): void;
  isOverlayOpen(): boolean;
  
  // State queries
  isImageLoaded(): boolean;
  getImageData(): ImageData | null;
  getZoomLevel(): number;
  getPanOffset(): Point;
}

// Global type helpers for better IntelliSense

// Export types for use in other files
export {
  ToolConfig,
  Point,
  Size,
  ImageData,
  Annotation,
  AnnotationStyle,
  CanvasLensElementAttributes
};
