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
import { CanvasLensCore } from './components/CanvasLensCore';

export class CanvasLensElement extends HTMLElement {
  private core: CanvasLensCore | null = null;

  // Define observed attributes for reactivity
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
      console.error('Failed to initialize CanvasLens:', error);
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

  // Public API methods - delegate to core

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
    throw new Error('CanvasLens is not initialized');
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

  // Zoom controls

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

  // Tool controls

  /**
   * Activate a specific tool
   * @param toolType - Tool type to activate
   * @returns true if tool was activated successfully
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
   * Update tools configuration
   * @param toolConfig - Tool configuration object
   */
  updateTools(toolConfig: any): void {
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

  // Annotation controls

  /**
   * Add an annotation
   * @param annotation - Annotation object
   */
  addAnnotation(annotation: any): void {
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
  getAnnotations(): any[] {
    if (this.core) {
      return this.core.getAnnotations();
    }
    return [];
  }

  // Overlay controls

  /**
   * Open overlay mode (full-screen editor)
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

  // State queries

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
  getImageData(): any {
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

// Register the custom element
if (!customElements.get('canvas-lens')) {
  customElements.define('canvas-lens', CanvasLensElement);
}

// Export for module usage
export { CanvasLensElement as CanvasLens };
