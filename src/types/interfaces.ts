import { Size, Annotation, CanvasImageData, EventHandlers } from './index';

export interface AnnotationManager {
  destroy(): void;
  isToolActive(): boolean;
  getActiveToolType(): string | null;
  activateTool(toolType: string): boolean;
  deactivateTool(): void;
  addAnnotation(annotation: Annotation): void;
  removeAnnotation(id: string): void;
  getAllAnnotations(): Annotation[];
  clearAll(): void;
  getImageBounds(): { x: number; y: number; width: number; height: number };
  isDrawing(): boolean;
}

export interface ImageViewer {
  getImageData(): CanvasImageData | null;
  isImageLoaded(): boolean;
  getZoomLevel(): number;
  getPanOffset(): { x: number; y: number };
  resize(size: Size): void;
  fitToView(): void;
  resetView(): void;
  getCanvas(): HTMLCanvasElement;
  getZoomPanHandler(): unknown;
  getAnnotationManager(): AnnotationManager | null;
  setEventHandlers(handlers: EventHandlers): void;
  render(): void;
  getImageBounds(): { x: number; y: number; width: number; height: number };
}
