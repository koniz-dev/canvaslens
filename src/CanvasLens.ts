/**
 * CanvasLens Web Component - A powerful HTML5 Canvas-based image viewing and annotation library
 * 
 * @example
 * ```html
 * <canvas-lens 
 *   src="https://example.com/image.jpg"
 *   width="800px" 
 *   height="600px"
 *   tools='{"zoom": true, "pan": true, "annotation": {"rect": true}}'>
 * </canvas-lens>
 * ```
 */
import { CanvasLensCore } from '@/components';
import { ToolConfig, Annotation, ImageData } from '@/types';
import { ErrorHandler, ErrorType } from '@/utils';

export class CanvasLens extends HTMLElement {
  private core: CanvasLensCore | null = null;

  static get observedAttributes() {
    return [
      'src', 'width', 'height', 'background-color', 
      'tools', 'max-zoom', 'min-zoom', 'image-type', 'file-name'
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.initialize();
  }

  disconnectedCallback() {
    this.destroy();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue && this.core) {
      this.core.handleAttributeChange(name, newValue);
    }
  }

  /**
   * Initialize the CanvasLens component
   */
  private initialize(): void {
    try {
      this.core = new CanvasLensCore(this);
      this.core.initialize();
    } catch (error) {
      ErrorHandler.handleError(
        error as Error,
        { element: this, operation: 'initialize' }
      );
      // Re-throw to prevent silent failures
      throw error;
    }
  }

  /**
   * Destroy the component and clean up resources
   */
  private destroy(): void {
    if (this.core) {
      this.core.destroy();
      this.core = null;
    }
  }

  /**
   * Load image from URL
   * @param src - Image URL
   * @param type - Image MIME type (optional)
   * @param fileName - File name (optional)
   */
  async loadImage(src: string, type?: string, fileName?: string): Promise<void> {
    if (this.core) {
      return this.core.loadImage(src, type, fileName);
    }
    throw ErrorHandler.createError(
      ErrorType.INITIALIZATION,
      'CanvasLens is not initialized'
    );
  }

  /**
   * Load image from File object
   * @param file - File object
   */
  loadImageFromFile(file: File): void {
    if (this.core) {
      this.core.loadImageFromFile(file);
    }
  }

  /**
   * Resize the canvas
   * @param width - New width
   * @param height - New height
   */
  resize(width: number, height: number): void {
    if (this.core) {
      this.core.resize(width, height);
    }
  }

  /**
   * Zoom in by the specified factor
   * @param factor - Zoom factor (default: 1.2)
   */
  zoomIn(factor?: number): void {
    if (this.core) {
      this.core.zoomIn(factor);
    }
  }

  /**
   * Zoom out by the specified factor
   * @param factor - Zoom factor (default: 1.2)
   */
  zoomOut(factor?: number): void {
    if (this.core) {
      this.core.zoomOut(factor);
    }
  }

  /**
   * Set zoom level to specific scale
   * @param scale - Zoom scale (1.0 = 100%)
   */
  zoomTo(scale: number): void {
    if (this.core) {
      this.core.zoomTo(scale);
    }
  }

  /**
   * Fit image to view
   */
  fitToView(): void {
    if (this.core) {
      this.core.fitToView();
    }
  }

  /**
   * Reset view to original state
   */
  resetView(): void {
    if (this.core) {
      this.core.resetView();
    }
  }

  /**
   * Activate a specific annotation or interaction tool
   * @param toolType - Tool type to activate ('rect', 'arrow', 'text', 'circle', 'line')
   * @returns true if tool was activated successfully, false if tool type is invalid or unavailable
   */
  activateTool(toolType: string): boolean {
    if (this.core) {
      return this.core.activateTool(toolType);
    }
    return false;
  }

  /**
   * Deactivate current tool
   * @returns true if tool was deactivated successfully
   */
  deactivateTool(): boolean {
    if (this.core) {
      return this.core.deactivateTool();
    }
    return false;
  }

  /**
   * Update tools configuration dynamically
   * @param toolConfig - Tool configuration object with enabled/disabled tools
   * @example
   * ```javascript
   * viewer.updateTools({
   *   zoom: true,
   *   pan: true,
   *   annotation: { rect: true, arrow: false, text: true }
   * });
   * ```
   */
  updateTools(toolConfig: ToolConfig): void {
    if (this.core) {
      this.core.updateTools(toolConfig);
    }
  }

  /**
   * Get currently active tool
   * @returns Active tool type or null
   */
  getActiveTool(): string | null {
    if (this.core) {
      return this.core.getActiveTool();
    }
    return null;
  }

  /**
   * Add a new annotation to the canvas
   * @param annotation - Annotation object with type, coordinates, and style properties
   * @example
   * ```javascript
   * viewer.addAnnotation({
   *   type: 'rect',
   *   x: 100, y: 100, width: 200, height: 150,
   *   style: { stroke: '#ff0000', fill: 'rgba(255,0,0,0.2)' }
   * });
   * ```
   */
  addAnnotation(annotation: Annotation): void {
    if (this.core) {
      this.core.addAnnotation(annotation);
    }
  }

  /**
   * Remove an annotation by ID
   * @param annotationId - Annotation ID to remove
   */
  removeAnnotation(annotationId: string): void {
    if (this.core) {
      this.core.removeAnnotation(annotationId);
    }
  }

  /**
   * Clear all annotations
   */
  clearAnnotations(): void {
    if (this.core) {
      this.core.clearAnnotations();
    }
  }

  /**
   * Get all annotations
   * @returns Array of annotations
   */
  getAnnotations(): Annotation[] {
    if (this.core) {
      return this.core.getAnnotations();
    }
    return [];
  }

  /**
   * Toggle comparison mode
   * Switches between normal view and comparison view with slider
   */
  toggleComparisonMode(): void {
    if (this.core) {
      this.core.toggleComparisonMode();
    }
  }

  /**
   * Set comparison mode
   * @param enabled - true to enable comparison mode, false to disable
   */
  setComparisonMode(enabled: boolean): void {
    if (this.core) {
      this.core.setComparisonMode(enabled);
    }
  }

  /**
   * Check if comparison mode is enabled
   * @returns true if comparison mode is enabled
   */
  isComparisonMode(): boolean {
    if (this.core) {
      return this.core.isComparisonMode();
    }
    return false;
  }

  /**
   * Open overlay mode for full-screen editing experience
   * Provides a professional editing interface with toolbar and enhanced controls
   */
  openOverlay(): void {
    if (this.core) {
      this.core.openOverlay();
    }
  }

  /**
   * Close overlay mode
   */
  closeOverlay(): void {
    if (this.core) {
      this.core.closeOverlay();
    }
  }

  /**
   * Check if overlay is open
   * @returns true if overlay is open
   */
  isOverlayOpen(): boolean {
    if (this.core) {
      return this.core.isOverlayOpen();
    }
    return false;
  }

  /**
   * Check if an image is loaded
   * @returns true if image is loaded
   */
  isImageLoaded(): boolean {
    if (this.core) {
      return this.core.isImageLoaded();
    }
    return false;
  }

  /**
   * Get current image data
   * @returns Image data object or null
   */
  getImageData(): ImageData | null {
    if (this.core) {
      return this.core.getImageData();
    }
    return null;
  }

  /**
   * Get current zoom level
   * @returns Current zoom level
   */
  getZoomLevel(): number {
    if (this.core) {
      return this.core.getZoomLevel();
    }
    return 1;
  }

  /**
   * Get current pan offset
   * @returns Pan offset object
   */
  getPanOffset(): { x: number; y: number } {
    if (this.core) {
      return this.core.getPanOffset();
    }
    return { x: 0, y: 0 };
  }

  /**
   * Check if there are unsaved changes
   * @returns true if there are changes
   */
  hasChanges(): boolean {
    if (this.core) {
      return this.core.hasChanges();
    }
    return false;
  }
}

if (!customElements.get('canvas-lens')) {
  customElements.define('canvas-lens', CanvasLens);
}
