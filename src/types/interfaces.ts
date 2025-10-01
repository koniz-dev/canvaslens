import { Size } from './index';

export interface AnnotationManager {
  destroy(): void;
  isToolActive(): boolean;
  getActiveToolType(): string | null;
  activateTool(toolType: string): boolean;
  deactivateTool(): void;
  addAnnotation(annotation: any): void;
  removeAnnotation(id: string): void;
  getAllAnnotations(): any[];
  clearAll(): void;
  getImageBounds(): any;
  isDrawing(): boolean;
}

export interface ImageViewer {
  getImageData(): any;
  isImageLoaded(): boolean;
  getZoomLevel(): number;
  getPanOffset(): { x: number; y: number };
  resize(size: Size): void;
  fitToView(): void;
  resetView(): void;
  getCanvas(): any;
  getZoomPanHandler(): any;
  getAnnotationManager(): AnnotationManager | null;
  setEventHandlers(handlers: any): void;
  render(): void;
  getImageBounds(): any;
}
