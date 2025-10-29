import { Engine } from '../core/Engine';
import type { Annotation, CustomImageData, Point, ToolConfig } from '../types';
import { ErrorType } from '../types';
import { ErrorHandler, safeAsync } from '../utils/core/error-handler';
import { error, warn } from '../utils/core/logger';
import { AttributeParser } from './AttributeParser';
import { EventManager } from './EventManager';
import { OverlayManager } from './OverlayManager';

export class CanvasLensCore {
  private element: HTMLElement;
  private canvasLens: Engine | null = null;
  private eventManager: EventManager;
  private overlayManager: OverlayManager;
  private isDestroyed = false;
  private isInitialized = false;
  private hasUnsavedChanges = false;

  constructor(element: HTMLElement) {
    this.element = element;
    this.eventManager = new EventManager(element);
    this.overlayManager = new OverlayManager(element);
  }

  /**
   * Initialize the CanvasLens component
   */
  initialize(): void {
    // Guard: Prevent multiple initializations unless reinitializing
    if (this.isInitialized && !this.isDestroyed) {
      warn('CanvasLens is already initialized. Use reinitialize() to force reinitialization.');
      return;
    }

    if (this.shadowRoot) {
      // Reset destroyed flag if reinitializing
      this.isDestroyed = false;
      this.createContainer();
      this.initializeCanvasLens();
      this.setupEventHandlers();
      this.ensureCanvasSize();
      this.loadInitialImage();
      this.isInitialized = true;
    } else {
      throw ErrorHandler.createError(
        ErrorType.INITIALIZATION,
        'Shadow root not available',
        { element: this.element }
      );
    }
  }

  /**
   * Destroy the component and clean up resources
   */
  destroy(): void {
    if (this.isDestroyed) return;

    this.isDestroyed = true;
    this.isInitialized = false;

    if (this.canvasLens) {
      this.canvasLens.destroy();
      this.canvasLens = null;
    }

    this.eventManager.destroy();
    this.overlayManager.destroy();
  }

  /**
   * Handle attribute changes
   */
  handleAttributeChange(name: string, value: string): void {
    if (!this.canvasLens || this.isDestroyed) return;

    try {
      switch (name) {
        case 'src':
          if (value) {
            this.canvasLens.loadImage(
              value,
              this.element.getAttribute('image-type') || undefined,
              this.element.getAttribute('file-name') || undefined
            );
            this.resetChanges();
          }
          break;
        case 'width':
        case 'height': {
          const { width, height } = AttributeParser.getContainerDimensions(this.element);
          this.canvasLens.resize(width, height);
          break;
        }
        case 'tools':
          this.updateToolConfig(value);
          break;
        case 'max-zoom':
        case 'min-zoom':
          this.reinitialize();
          break;
      }
    } catch (err) {
      error(`Failed to handle attribute change for ${name}:`, err);
    }
  }

  /**
   * Load image from URL
   */
  async loadImage(src: string, type?: string, fileName?: string): Promise<void> {
    if (!this.canvasLens || this.isDestroyed) {
      throw ErrorHandler.createError(
        ErrorType.INITIALIZATION,
        'CanvasLens is not initialized or has been destroyed',
        { isDestroyed: this.isDestroyed }
      );
    }

    const canvasLens = this.canvasLens;
    return safeAsync(
      async () => {
        if (!canvasLens) {
          throw ErrorHandler.createError(
            ErrorType.INITIALIZATION,
            'CanvasLens is not initialized',
            { src, type, fileName }
          );
        }
        await canvasLens.loadImage(src, type, fileName);
        this.resetChanges();
      },
      ErrorType.IMAGE_LOAD,
      { src, type, fileName },
      () => {
        warn('Image load failed, using fallback');
        this.showImageLoadError(src);
      }
    ) as Promise<void>;
  }

  /**
   * Load image from file
   */
  loadImageFromFile(file: File): void {
    if (!this.canvasLens || this.isDestroyed) {
      throw ErrorHandler.createError(
        ErrorType.INITIALIZATION,
        'CanvasLens is not initialized or has been destroyed',
        { isDestroyed: this.isDestroyed }
      );
    }

    if (!file || !file.type.startsWith('image/')) {
      throw ErrorHandler.createError(
        ErrorType.IMAGE_LOAD,
        'Invalid file: not an image',
        { fileType: file.type, fileName: file.name }
      );
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target?.result) {
        ErrorHandler.handleImageLoadError(
          new Error('Failed to read file'),
          file.name,
          { fileName: file.name, fileType: file.type }
        );
        return;
      }

      const img = new Image();
      img.onload = () => {
        if (this.canvasLens && !this.isDestroyed) {
          this.canvasLens.loadImageElement(img, file.type, file.name);
          this.resetChanges();
        }
      };
      img.onerror = () => {
        ErrorHandler.handleImageLoadError(
          new Error('Failed to load image from file'),
          file.name,
          { fileName: file.name, fileType: file.type }
        );
      };
      img.src = e.target.result as string;
    };
    reader.onerror = () => {
      ErrorHandler.handleImageLoadError(
        new Error('Failed to read file'),
        file.name,
        { fileName: file.name, fileType: file.type }
      );
    };
    reader.readAsDataURL(file);
  }

  /**
   * Resize the canvas
   */
  resize(width: number, height: number): void {
    if (this.canvasLens && !this.isDestroyed) {
      this.canvasLens.resize(width, height);
    }
  }

  /**
   * Zoom controls
   */
  zoomIn(factor?: number): void {
    if (this.canvasLens && !this.isDestroyed) {
      this.canvasLens.zoomIn(factor);
    }
  }

  zoomOut(factor?: number): void {
    if (this.canvasLens && !this.isDestroyed) {
      this.canvasLens.zoomOut(factor);
    }
  }

  zoomTo(scale: number): void {
    if (this.canvasLens && !this.isDestroyed) {
      this.canvasLens.zoomTo(scale);
    }
  }

  fitToView(): void {
    if (this.canvasLens && !this.isDestroyed) {
      this.canvasLens.fitToView();
    }
  }

  resetView(): void {
    if (this.canvasLens && !this.isDestroyed) {
      this.canvasLens.resetView();
    }
  }

  /**
   * Tool controls
   */
  activateTool(toolType: string): boolean {
    if (this.canvasLens && !this.isDestroyed) {
      return this.canvasLens.activateTool(toolType);
    }
    return false;
  }

  deactivateTool(): boolean {
    if (this.canvasLens && !this.isDestroyed) {
      return this.canvasLens.deactivateTool();
    }
    return false;
  }

  getActiveTool(): string | null {
    if (this.canvasLens && !this.isDestroyed) {
      return this.canvasLens.getActiveTool();
    }
    return null;
  }

  /**
   * Annotation controls
   */
  addAnnotation(annotation: Annotation): void {
    if (this.canvasLens && !this.isDestroyed) {
      this.canvasLens.addAnnotation(annotation);
      this.hasUnsavedChanges = true;
    }
  }

  removeAnnotation(annotationId: string): void {
    if (this.canvasLens && !this.isDestroyed) {
      this.canvasLens.removeAnnotation(annotationId);
      this.hasUnsavedChanges = true;
    }
  }

  clearAnnotations(): void {
    if (this.canvasLens && !this.isDestroyed) {
      this.canvasLens.clearAnnotations();
      this.hasUnsavedChanges = true;
    }
  }

  /**
   * Comparison mode controls
   */
  toggleComparisonMode(): void {
    if (this.canvasLens && !this.isDestroyed) {
      this.canvasLens.toggleComparisonMode();
    }
  }

  setComparisonMode(enabled: boolean): void {
    if (this.canvasLens && !this.isDestroyed) {
      this.canvasLens.setComparisonMode(enabled);
    }
  }

  isComparisonMode(): boolean {
    if (this.canvasLens && !this.isDestroyed) {
      return this.canvasLens.isComparisonMode();
    }
    return false;
  }

  getAnnotations(): Annotation[] {
    if (this.canvasLens && !this.isDestroyed) {
      return this.canvasLens.getAnnotations();
    }
    return [];
  }

  /**
   * Overlay controls
   */
  openOverlay(): void {
    this.overlayManager.openOverlay();
  }

  closeOverlay(): void {
    this.overlayManager.closeOverlay();
  }

  isOverlayOpen(): boolean {
    return this.overlayManager.isOverlayOpen();
  }

  /**
   * State queries
   */
  isImageLoaded(): boolean {
    if (this.canvasLens && !this.isDestroyed) {
      return this.canvasLens.isImageLoaded();
    }
    return false;
  }

  getImageData(): CustomImageData | null {
    if (this.canvasLens && !this.isDestroyed) {
      return this.canvasLens.getImageData();
    }
    return null;
  }

  getZoomLevel(): number {
    if (this.canvasLens && !this.isDestroyed) {
      return this.canvasLens.getZoomLevel();
    }
    return 1;
  }

  getPanOffset(): Point {
    if (this.canvasLens && !this.isDestroyed) {
      return this.canvasLens.getPanOffset();
    }
    return { x: 0, y: 0 };
  }

  hasChanges(): boolean {
    return this.hasUnsavedChanges;
  }

  /**
   * Get the shadow root
   */
  private get shadowRoot(): ShadowRoot | null {
    return (this.element as HTMLElement & { shadowRoot?: ShadowRoot }).shadowRoot || null;
  }

  /**
   * Create the main container
   */
  private createContainer(): void {
    if (!this.shadowRoot) return;

    // Clear existing container if reinitializing
    while (this.shadowRoot.firstChild) {
      this.shadowRoot.removeChild(this.shadowRoot.firstChild);
    }

    const container = document.createElement('div');
    container.style.cssText = `
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
    `;
    this.shadowRoot.appendChild(container);
  }

  /**
   * Initialize CanvasLens engine
   */
  private initializeCanvasLens(): void {
    if (!this.shadowRoot) return;

    const container = this.shadowRoot.firstElementChild as HTMLElement;
    const options = AttributeParser.parseAttributes(this.element, container);

    this.canvasLens = new Engine(options);
  }

  /**
   * Set up event handlers
   */
  private setupEventHandlers(): void {
    if (!this.canvasLens) return;

    const eventHandlers = this.eventManager.createEventHandlers();
    this.canvasLens.setEventHandlers(eventHandlers);
    this.eventManager.setupEventListeners();
  }

  /**
   * Ensure canvas has proper size
   */
  private ensureCanvasSize(): void {
    requestAnimationFrame(() => {
      if (this.canvasLens && !this.isDestroyed) {
        const { width, height } = AttributeParser.getContainerDimensions(this.element);

        if (width > 0 && height > 0) {
          this.canvasLens.resize(width, height);
        }
      }
    });
  }

  /**
   * Load initial image if src is provided
   */
  private loadInitialImage(): void {
    const src = this.element.getAttribute('src');
    if (src && this.canvasLens) {
      this.canvasLens.loadImage(
        src,
        this.element.getAttribute('image-type') || undefined,
        this.element.getAttribute('file-name') || undefined
      );
    }
  }

  /**
   * Update tool configuration
   */
  private updateToolConfig(value: string): void {
    if (!this.canvasLens) return;

    try {
      const toolConfig = JSON.parse(value);
      this.canvasLens.updateToolConfig(toolConfig);
    } catch (error) {
      warn('Invalid tools configuration:', error);
    }
  }

  /**
   * Update tools configuration (public API)
   * @param toolConfig - Tool configuration object
   */
  updateTools(toolConfig: ToolConfig): void {
    if (!this.canvasLens) return;
    this.canvasLens.updateTools(toolConfig);
  }

  /**
   * Reinitialize with new options
   */
  private reinitialize(): void {
    if (!this.canvasLens) return;

    const currentImageData = this.canvasLens.getImageData();
    this.destroy();
    this.initialize();

    if (currentImageData && this.canvasLens) {
      this.canvasLens.loadImageElement(
        currentImageData.element,
        currentImageData.type,
        currentImageData.fileName
      );
    }
  }

  /**
   * Reset changes flag
   */
  private resetChanges(): void {
    this.hasUnsavedChanges = false;
  }

  /**
   * Show image load error placeholder
   */
  private showImageLoadError(src: string): void {
    if (!this.shadowRoot) return;

    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      background: #f5f5f5;
      color: #666;
      font-family: Arial, sans-serif;
      text-align: center;
      flex-direction: column;
    `;
    const iconDiv = document.createElement('div');
    iconDiv.textContent = '⚠️';
    iconDiv.style.cssText = 'font-size: 24px; margin-bottom: 10px;';

    const titleDiv = document.createElement('div');
    titleDiv.textContent = 'Failed to load image';
    titleDiv.style.cssText = 'font-size: 16px; margin-bottom: 5px;';

    const srcDiv = document.createElement('div');
    srcDiv.textContent = src;
    srcDiv.style.cssText = 'font-size: 12px; color: #999;';

    errorDiv.appendChild(iconDiv);
    errorDiv.appendChild(titleDiv);
    errorDiv.appendChild(srcDiv);

    const container = this.shadowRoot.firstElementChild;
    if (container) {
      // Clear container safely
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      container.appendChild(errorDiv);
    }
  }
}
