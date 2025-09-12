import { CanvasLensOptions, EventHandlers, ImageData, Annotation, Point, ToolConfig } from './types';
import { CoreCanvasLens } from './CoreCanvasLens';
import { warn } from './utils/logger';

// Web Component for CanvasLens
export class CanvasLensElement extends HTMLElement {
  private canvasLens: CoreCanvasLens | null = null;
  private isDestroyed = false;
  private overlayContainer: HTMLElement | null = null;
  private overlayCanvasLens: CoreCanvasLens | null = null;
  private overlayOpen = false;

  // Define observed attributes for reactivity
  static get observedAttributes() {
    return [
      'src', 'width', 'height', 'background-color', 
      'tools', 'max-zoom', 'min-zoom'
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
    if (oldValue !== newValue) {
      this.handleAttributeChange(name, newValue);
    }
  }

  private initialize() {
    if (this.shadowRoot) {
      // Create container
      const container = document.createElement('div');
      container.style.cssText = `
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
      `;
      this.shadowRoot.appendChild(container);

      // Parse attributes
      const options = this.parseAttributes();
      
      // Create CanvasLens instance
      this.canvasLens = new CoreCanvasLens({
        ...options,
        container
      });

      // Set up event handlers to forward events to the web component
      this.canvasLens.setEventHandlers({
        onImageLoad: (imageData) => {
          this.dispatchEvent(new CustomEvent('imageLoad', { detail: imageData }));
        },
        onImageLoadError: (error) => {
          this.dispatchEvent(new CustomEvent('imageLoadError', { detail: error }));
        },
        onZoomChange: (zoom) => {
          this.dispatchEvent(new CustomEvent('zoomChange', { detail: zoom }));
        },
        onPanChange: (pan) => {
          this.dispatchEvent(new CustomEvent('panChange', { detail: pan }));
        },
        onAnnotationAdd: (annotation) => {
          this.dispatchEvent(new CustomEvent('annotationAdd', { detail: annotation }));
        },
        onAnnotationRemove: (annotation) => {
          this.dispatchEvent(new CustomEvent('annotationRemove', { detail: annotation }));
        },
        onToolChange: (tool) => {
          this.dispatchEvent(new CustomEvent('toolChange', { detail: tool }));
        },
        onComparisonChange: (comparison) => {
          this.dispatchEvent(new CustomEvent('comparisonChange', { detail: comparison }));
        }
      });

      // Set up event listeners
      this.setupEventListeners();

      // Ensure canvas has proper size after rendering
      this.ensureCanvasSize();

      // Load initial image if src is provided
      const src = this.getAttribute('src');
      if (src) {
        this.canvasLens.loadImage(src, this.getAttribute('image-type') || undefined, this.getAttribute('file-name') || undefined);
      }
    }
  }

  private parseAttributes(): CanvasLensOptions {
    const width = this.parseSize(this.getAttribute('width'), 800);
    const height = this.parseSize(this.getAttribute('height'), 600);

    // Parse tools configuration
    const toolsConfig = this.parseToolsConfig();

    return {
      container: this.shadowRoot!.firstElementChild as HTMLElement,
      width,
      height,
      backgroundColor: this.getAttribute('background-color') || '#f0f0f0',
      tools: toolsConfig,
      maxZoom: parseFloat(this.getAttribute('max-zoom') || '10'),
      minZoom: parseFloat(this.getAttribute('min-zoom') || '0.1')
    };
  }

  private parseToolsConfig(): ToolConfig {
    const toolsAttr = this.getAttribute('tools');
    
    if (toolsAttr) {
      try {
        return JSON.parse(toolsAttr);
      } catch (e) {
        warn('Invalid tools configuration:', toolsAttr);
      }
    }

    // Default configuration - all tools enabled
    return {
      zoom: true,
      pan: true,
      annotation: {
        rect: true,
        arrow: true,
        text: true,
        circle: true,
        line: true
      },
      comparison: true
    };
  }

  private parseSize(size: string | null, defaultSize: number): number {
    if (!size) return defaultSize;
    if (size.endsWith('px')) return parseInt(size);
    if (size.endsWith('%')) {
      const percentage = parseInt(size);
      const containerSize = this.clientWidth || this.offsetWidth || 800;
      return (containerSize * percentage) / 100;
    }
    return parseInt(size) || defaultSize;
  }

  private ensureCanvasSize(): void {
    // Use requestAnimationFrame to ensure DOM is fully rendered
    requestAnimationFrame(() => {
      if (this.canvasLens && !this.isDestroyed) {
        const width = this.parseSize(this.getAttribute('width'), 800);
        const height = this.parseSize(this.getAttribute('height'), 600);
        
        // Only resize if we have valid dimensions
        if (width > 0 && height > 0) {
          this.canvasLens.resize(width, height);
        }
      }
    });
  }

  private setupEventListeners() {
    // Listen for custom events and forward them with lowercase names for external listeners
    this.addEventListener('imageLoad', (e: any) => {
      this.dispatchEvent(new CustomEvent('imageload', { detail: e.detail }));
    });

    this.addEventListener('imageLoadError', (e: any) => {
      this.dispatchEvent(new CustomEvent('imageloaderror', { detail: e.detail }));
    });

    this.addEventListener('zoomChange', (e: any) => {
      this.dispatchEvent(new CustomEvent('zoomchange', { detail: e.detail }));
    });

    this.addEventListener('panChange', (e: any) => {
      this.dispatchEvent(new CustomEvent('panchange', { detail: e.detail }));
    });

    this.addEventListener('annotationAdd', (e: any) => {
      this.dispatchEvent(new CustomEvent('annotationadd', { detail: e.detail }));
    });

    this.addEventListener('annotationRemove', (e: any) => {
      this.dispatchEvent(new CustomEvent('annotationremove', { detail: e.detail }));
    });

    this.addEventListener('toolChange', (e: any) => {
      this.dispatchEvent(new CustomEvent('toolchange', { detail: e.detail }));
    });

    this.addEventListener('comparisonChange', (e: any) => {
      this.dispatchEvent(new CustomEvent('comparisonchange', { detail: e.detail }));
    });
  }

  private handleAttributeChange(name: string, value: string) {
    if (!this.canvasLens || this.isDestroyed) return;

    switch (name) {
      case 'src':
        if (value) {
          this.canvasLens.loadImage(value, this.getAttribute('image-type') || undefined, this.getAttribute('file-name') || undefined);
        }
        break;
      case 'width':
      case 'height':
        const width = this.parseSize(this.getAttribute('width'), 800);
        const height = this.parseSize(this.getAttribute('height'), 600);
        this.canvasLens.resize(width, height);
        break;
      case 'tools':
      case 'max-zoom':
      case 'min-zoom':
        // Reinitialize with new options
        this.reinitialize();
        break;
    }
  }

  private reinitialize() {
    if (this.canvasLens) {
      const currentImageData = this.canvasLens.getImageViewer()?.getImageData();
      this.destroy();
      this.initialize();
      if (currentImageData && this.canvasLens) {
        this.canvasLens.loadImageElement(currentImageData.element, currentImageData.type, currentImageData.fileName);
      }
    }
  }

  // Public API methods
  async loadImage(src: string, type?: string, fileName?: string): Promise<void> {
    if (this.canvasLens && !this.isDestroyed) {
      await this.canvasLens.loadImage(src, type, fileName);
    }
  }

  loadImageFromFile(file: File): void {
    if (this.canvasLens && !this.isDestroyed) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          this.canvasLens!.loadImageElement(img, file.type, file.name);
        };
        img.src = e.target!.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  resize(width: number, height: number): void {
    if (this.canvasLens && !this.isDestroyed) {
      this.canvasLens.resize(width, height);
    }
  }

  activateTool(toolType: string): boolean {
    if (this.canvasLens && !this.isDestroyed) {
      return this.canvasLens.activateAnnotationTool(toolType);
    }
    return false;
  }

  deactivateTool(): boolean {
    if (this.canvasLens && !this.isDestroyed) {
      this.canvasLens.deactivateAnnotationTool();
      return true;
    }
    return false;
  }

  getActiveTool(): string | null {
    if (this.canvasLens && !this.isDestroyed) {
      return this.canvasLens.getActiveAnnotationToolType();
    }
    return null;
  }

  addAnnotation(annotation: Annotation): void {
    if (this.canvasLens && !this.isDestroyed) {
      const annotationManager = this.canvasLens.getAnnotationManager();
      if (annotationManager) {
        annotationManager.addAnnotation(annotation);
      }
    }
  }

  removeAnnotation(annotationId: string): void {
    if (this.canvasLens && !this.isDestroyed) {
      const annotationManager = this.canvasLens.getAnnotationManager();
      if (annotationManager) {
        annotationManager.removeAnnotation(annotationId);
      }
    }
  }

  clearAnnotations(): void {
    if (this.canvasLens && !this.isDestroyed) {
      const annotationManager = this.canvasLens.getAnnotationManager();
      if (annotationManager) {
        const annotations = annotationManager.getAllAnnotations();
        annotations.forEach(annotation => {
          annotationManager.removeAnnotation(annotation.id);
        });
      }
    }
  }

  getAnnotations(): Annotation[] {
    if (this.canvasLens && !this.isDestroyed) {
      const annotationManager = this.canvasLens.getAnnotationManager();
      return annotationManager ? annotationManager.getAllAnnotations() : [];
    }
    return [];
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

  getZoomLevel(): number {
    if (this.canvasLens && !this.isDestroyed) {
      return this.canvasLens.getZoom();
    }
    return 1;
  }

  getPanOffset(): Point {
    if (this.canvasLens && !this.isDestroyed) {
      return this.canvasLens.getPan();
    }
    return { x: 0, y: 0 };
  }

  zoomIn(factor: number = 1.2): void {
    if (this.canvasLens && !this.isDestroyed) {
      this.canvasLens.zoomIn(factor);
    }
  }

  zoomOut(factor: number = 1.2): void {
    if (this.canvasLens && !this.isDestroyed) {
      this.canvasLens.zoomOut(factor);
    }
  }

  zoomTo(scale: number): void {
    if (this.canvasLens && !this.isDestroyed) {
      this.canvasLens.setZoom(scale);
    }
  }

  isImageLoaded(): boolean {
    if (this.canvasLens && !this.isDestroyed) {
      return this.canvasLens.isImageLoaded();
    }
    return false;
  }

  getImageData(): ImageData | null {
    if (this.canvasLens && !this.isDestroyed) {
      const imageViewer = this.canvasLens.getImageViewer();
      return imageViewer ? imageViewer.getImageData() : null;
    }
    return null;
  }

  openOverlay(): void {
    if (this.overlayOpen) return;
    
    this.createOverlay();
    if (this.overlayContainer) {
      document.body.appendChild(this.overlayContainer);
      this.overlayOpen = true;
    }
  }

  closeOverlay(): void {
    if (!this.overlayOpen) return;
    
    if (this.overlayContainer) {
      document.body.removeChild(this.overlayContainer);
      this.overlayContainer = null;
      this.overlayCanvasLens = null;
      this.overlayOpen = false;
    }
  }

  isOverlayOpen(): boolean {
    return this.overlayOpen;
  }

  private createOverlay(): void {
    if (this.overlayContainer) return;

    this.overlayContainer = document.createElement('div');
    this.overlayContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.8);
      z-index: 10000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    `;

    // Create header with tools
    const header = document.createElement('div');
    header.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 60px;
      background: #2c3e50;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      color: white;
      z-index: 10001;
    `;

    // Title
    const title = document.createElement('h3');
    title.textContent = 'CanvasLens Editor';
    title.style.margin = '0';

    // Tool buttons
    const toolButtons = document.createElement('div');
    toolButtons.style.cssText = `
      display: flex;
      gap: 10px;
      align-items: center;
    `;

    const createToolButton = (text: string, icon: string, onClick: () => void) => {
      const button = document.createElement('button');
      button.innerHTML = `${icon} ${text}`;
      button.style.cssText = `
        background: #34495e;
        border: none;
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: background 0.2s;
      `;
      button.onmouseover = () => button.style.background = '#4a5f7a';
      button.onmouseout = () => button.style.background = '#34495e';
      button.onclick = onClick;
      return button;
    };

    // Zoom/Pan tool
    const zoomButton = createToolButton('Zoom & Pan', '🔍', () => {
      if (this.overlayCanvasLens) {
        this.overlayCanvasLens.deactivateAnnotationTool();
      }
    });

    // Annotation tool
    const annotationButton = createToolButton('Annotation', '✏️', () => {
      if (this.overlayCanvasLens) {
        this.overlayCanvasLens.activateAnnotationTool('rect');
      }
    });

    toolButtons.appendChild(zoomButton);
    toolButtons.appendChild(annotationButton);

    // Action buttons
    const actionButtons = document.createElement('div');
    actionButtons.style.cssText = `
      display: flex;
      gap: 10px;
      align-items: center;
    `;

    const closeButton = createToolButton('Close', '✕', () => this.closeOverlay());

    actionButtons.appendChild(closeButton);

    header.appendChild(title);
    header.appendChild(toolButtons);
    header.appendChild(actionButtons);

    // Create canvas container
    const canvasContainer = document.createElement('div');
    canvasContainer.style.cssText = `
      margin-top: 60px;
      width: 90vw;
      height: calc(90vh - 60px);
      background: white;
      border-radius: 8px;
      overflow: hidden;
    `;

    this.overlayContainer.appendChild(header);
    this.overlayContainer.appendChild(canvasContainer);

    // Create overlay CanvasLens instance
    const overlayOptions: CanvasLensOptions = {
      container: canvasContainer,
      width: canvasContainer.clientWidth,
      height: canvasContainer.clientHeight,
      backgroundColor: this.getAttribute('background-color') || '#f0f0f0',
      tools: this.parseToolsConfig(),
      maxZoom: parseFloat(this.getAttribute('max-zoom') || '10'),
      minZoom: parseFloat(this.getAttribute('min-zoom') || '0.1')
    };

    this.overlayCanvasLens = new CoreCanvasLens(overlayOptions);

    // Load current image to overlay
    if (this.canvasLens && this.canvasLens.isImageLoaded()) {
      const imageViewer = this.canvasLens.getImageViewer();
      const imageData = imageViewer ? imageViewer.getImageData() : null;
      if (imageData) {
        this.overlayCanvasLens.loadImageElement(imageData.element, imageData.type, imageData.fileName);
      }
    }
  }

  private destroy(): void {
    if (!this.isDestroyed) {
      this.isDestroyed = true;
      this.closeOverlay();
      this.canvasLens = null;
    }
  }
}

// Register the custom element
if (typeof window !== 'undefined' && !customElements.get('canvas-lens')) {
  customElements.define('canvas-lens', CanvasLensElement);
}

// Export for backward compatibility
export const CanvasLens = CanvasLensElement;

