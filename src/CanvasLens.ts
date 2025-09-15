import { CanvasLensOptions, EventHandlers, ImageData, Annotation, Point, ToolConfig } from './types';
import { Engine } from './core/Engine';
import { warn } from './utils/logger';

// Web Component for CanvasLens
export class CanvasLensElement extends HTMLElement {
  private canvasLens: Engine | null = null;
  private isDestroyed = false;
  private overlayContainer: HTMLElement | null = null;
  private overlayCanvasLens: Engine | null = null;
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
      this.canvasLens = new Engine({
        ...options,
        container
      });

      // Set up event handlers to forward events to the web component
      this.canvasLens.setEventHandlers({
        onImageLoad: (imageData: ImageData) => {
          this.dispatchEvent(new CustomEvent('imageLoad', { detail: imageData }));
        },
        onImageLoadError: (error: Error) => {
          this.dispatchEvent(new CustomEvent('imageLoadError', { detail: error }));
        },
        onZoomChange: (zoom: number) => {
          this.dispatchEvent(new CustomEvent('zoomChange', { detail: zoom }));
        },
        onPanChange: (pan: Point) => {
          this.dispatchEvent(new CustomEvent('panChange', { detail: pan }));
        },
        onAnnotationAdd: (annotation: Annotation) => {
          this.dispatchEvent(new CustomEvent('annotationAdd', { detail: annotation }));
        },
        onAnnotationRemove: (annotation: string) => {
          this.dispatchEvent(new CustomEvent('annotationRemove', { detail: annotation }));
        },
        onToolChange: (tool: string | null) => {
          this.dispatchEvent(new CustomEvent('toolChange', { detail: tool }));
        },
        onComparisonChange: (comparison: number) => {
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
      // Use the provided defaultSize which should be the actual container size
      return (defaultSize * percentage) / 100;
    }
    return parseInt(size) || defaultSize;
  }

  private ensureCanvasSize(): void {
    // Use requestAnimationFrame to ensure DOM is fully rendered
    requestAnimationFrame(() => {
      if (this.canvasLens && !this.isDestroyed) {
        // Get actual container dimensions
        const containerWidth = this.clientWidth || this.offsetWidth || 800;
        const containerHeight = this.clientHeight || this.offsetHeight || 600;
        
        const width = this.parseSize(this.getAttribute('width'), containerWidth);
        const height = this.parseSize(this.getAttribute('height'), containerHeight);
        
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

    // Listen for window resize to recalculate canvas size
    window.addEventListener('resize', () => {
      this.ensureCanvasSize();
    });
  }

  private handleAttributeChange(name: string, value: string) {
    if (!this.canvasLens || this.isDestroyed) return;

    switch (name) {
      case 'src':
        if (value) {
          this.canvasLens.loadImage(value, this.getAttribute('image-type') || undefined, this.getAttribute('file-name') || undefined);
          // Reset changes when new image is loaded
          this.resetChanges();
        }
        break;
      case 'width':
      case 'height':
        const width = this.parseSize(this.getAttribute('width'), 800);
        const height = this.parseSize(this.getAttribute('height'), 600);
        this.canvasLens.resize(width, height);
        break;
      case 'tools':
        // Update tool configuration without reinitializing
        if (this.canvasLens) {
          try {
            const toolConfig = JSON.parse(value);
            this.canvasLens.updateToolConfig(toolConfig);
          } catch (error) {
            warn('Invalid tools configuration:', error);
          }
        }
        break;
      case 'max-zoom':
      case 'min-zoom':
        // Reinitialize with new options (zoom limits require reinitialization)
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
      try {
        await this.canvasLens.loadImage(src, type, fileName);
        // Reset changes when new image is loaded
        this.resetChanges();
      } catch (error) {
        console.error('Failed to load image:', error);
        throw error;
      }
    } else {
      throw new Error('CanvasLens is not initialized or has been destroyed');
    }
  }

  loadImageFromFile(file: File): void {
    if (!this.canvasLens || this.isDestroyed) {
      console.error('CanvasLens is not initialized or has been destroyed');
      return;
    }

    if (!file || !file.type.startsWith('image/')) {
      console.error('Invalid file: not an image');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target?.result) {
        console.error('Failed to read file');
        return;
      }
      
      const img = new Image();
      img.onload = () => {
        // Check if canvasLens still exists and is not destroyed
        if (this.canvasLens && !this.isDestroyed) {
          try {
            this.canvasLens.loadImageElement(img, file.type, file.name);
            // Reset changes when new image is loaded
            this.resetChanges();
          } catch (error) {
            console.error('Failed to load image element:', error);
          }
        }
      };
      img.onerror = () => {
        console.error('Failed to load image from file');
      };
      img.src = e.target.result as string;
    };
    reader.onerror = () => {
      console.error('Failed to read file');
    };
    reader.readAsDataURL(file);
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
      } else {
        console.warn('Annotation manager not available');
      }
    }
  }

  removeAnnotation(annotationId: string): void {
    if (this.canvasLens && !this.isDestroyed) {
      const annotationManager = this.canvasLens.getAnnotationManager();
      if (annotationManager) {
        annotationManager.removeAnnotation(annotationId);
      } else {
        console.warn('Annotation manager not available');
      }
    }
  }

  clearAnnotations(): void {
    if (this.canvasLens && !this.isDestroyed) {
      const annotationManager = this.canvasLens.getAnnotationManager();
      if (annotationManager) {
        annotationManager.clearAll();
      } else {
        console.warn('Annotation manager not available');
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

  /**
   * Update tool configuration without reinitializing the component
   */
  updateTools(toolConfig: ToolConfig): void {
    if (this.canvasLens && !this.isDestroyed) {
      this.canvasLens.updateToolConfig(toolConfig);
    } else {
      warn('CanvasLens is not initialized or has been destroyed');
    }
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
      // Destroy overlay canvas lens first
      if (this.overlayCanvasLens) {
        this.overlayCanvasLens.destroy();
        this.overlayCanvasLens = null;
      }
      
      // Remove overlay container from DOM
      if (this.overlayContainer.parentNode) {
        this.overlayContainer.parentNode.removeChild(this.overlayContainer);
      }
      this.overlayContainer = null;
      this.overlayOpen = false;
    }
  }

  isOverlayOpen(): boolean {
    return this.overlayOpen;
  }

  /**
   * Check if there are any changes to the image (annotations)
   */
  hasChanges(): boolean {
    if (this.canvasLens && !this.isDestroyed) {
      return this.canvasLens.hasChanges();
    }
    return false;
  }

  /**
   * Toggle comparison mode
   */
  toggleComparisonMode(): void {
    if (this.canvasLens && !this.isDestroyed) {
      this.canvasLens.toggleComparisonMode();
    }
  }

  /**
   * Set comparison mode
   */
  setComparisonMode(enabled: boolean): void {
    if (this.canvasLens && !this.isDestroyed) {
      this.canvasLens.setComparisonMode(enabled);
    }
  }

  /**
   * Check if comparison mode is enabled
   */
  isComparisonMode(): boolean {
    if (this.canvasLens && !this.isDestroyed) {
      return this.canvasLens.isComparisonMode();
    }
    return false;
  }

  /**
   * Reset the changes flag
   */
  resetChanges(): void {
    if (this.canvasLens && !this.isDestroyed) {
      this.canvasLens.resetChanges();
    }
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

    const createToolButton = (text: string, icon: string, onClick: () => void, isActive: boolean = false) => {
      const button = document.createElement('button');
      button.innerHTML = `${icon} ${text}`;
      button.style.cssText = `
        background: ${isActive ? '#3498db' : '#34495e'};
        border: none;
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: background 0.2s;
      `;
      button.onmouseover = () => button.style.background = isActive ? '#2980b9' : '#4a5f7a';
      button.onmouseout = () => button.style.background = isActive ? '#3498db' : '#34495e';
      button.onclick = onClick;
      return button;
    };

    // Zoom/Pan tool
    const zoomButton = createToolButton('Zoom & Pan', '🔍', () => {});

    // Annotation tool
    const annotationButton = createToolButton('Annotation', '✏️', () => {});

    // Comparison tool
    const comparisonButton = createToolButton('Comparison', '⚖️', () => {});

    // Function to update button states in overlay
    const updateOverlayButtonStates = (activeButton: HTMLButtonElement | null) => {
      const allButtons = [zoomButton, annotationButton, comparisonButton];
      allButtons.forEach(btn => {
        if (btn === activeButton) {
          btn.style.background = '#3498db';
          btn.onmouseover = () => btn.style.background = '#2980b9';
          btn.onmouseout = () => btn.style.background = '#3498db';
        } else {
          btn.style.background = '#34495e';
          btn.onmouseover = () => btn.style.background = '#4a5f7a';
          btn.onmouseout = () => btn.style.background = '#34495e';
        }
      });
    };

    // Track active button state
    let activeButton: HTMLButtonElement | null = null;

    // Update button click handlers to include toggle state management
    zoomButton.onclick = () => {
      if (activeButton === zoomButton) {
        // Deactivate if same button clicked
        updateOverlayButtonStates(null);
        activeButton = null;
        toggleAnnotationTools(false);
        // Reset to default state (all tools enabled)
        if (this.overlayCanvasLens) {
          const config = {
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
          this.overlayCanvasLens.updateTools(config);
          this.overlayCanvasLens.deactivateAnnotationTool();
        }
      } else {
        // Activate zoom/pan mode
        updateOverlayButtonStates(zoomButton);
        activeButton = zoomButton;
        toggleAnnotationTools(false);
        if (this.overlayCanvasLens) {
          const config = {
            zoom: true,
            pan: true,
            annotation: {
              rect: false,
              arrow: false,
              text: false,
              circle: false,
              line: false
            },
            comparison: false
          };
          this.overlayCanvasLens.updateTools(config);
          this.overlayCanvasLens.deactivateAnnotationTool();
          updateComparisonButtonState();
        }
      }
    };

    annotationButton.onclick = () => {
      if (activeButton === annotationButton) {
        // Deactivate if same button clicked
        updateOverlayButtonStates(null);
        activeButton = null;
        toggleAnnotationTools(false);
        // Reset to default state (all tools enabled)
        if (this.overlayCanvasLens) {
          const config = {
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
          this.overlayCanvasLens.updateTools(config);
          this.overlayCanvasLens.deactivateAnnotationTool();
          updateComparisonButtonState();
        }
      } else {
        // Activate annotation mode
        updateOverlayButtonStates(annotationButton);
        activeButton = annotationButton;
        toggleAnnotationTools(true);
        if (this.overlayCanvasLens) {
          const config = {
            zoom: false,
            pan: false,
            annotation: {
              rect: true,
              arrow: true,
              text: true,
              circle: true,
              line: true
            },
            comparison: false
          };
          this.overlayCanvasLens.updateTools(config);
          this.overlayCanvasLens.activateAnnotationTool('rect');
          updateAnnotationToolButtonStates('rect');
          updateComparisonButtonState();
        }
      }
    };

    comparisonButton.onclick = () => {
      if (activeButton === comparisonButton) {
        // Deactivate if same button clicked
        updateOverlayButtonStates(null);
        activeButton = null;
        toggleAnnotationTools(false);
        // Disable comparison mode
        if (this.overlayCanvasLens) {
          this.overlayCanvasLens.setComparisonMode(false);
          updateComparisonButtonState();
        }
      } else {
        // Activate comparison mode
        updateOverlayButtonStates(comparisonButton);
        activeButton = comparisonButton;
        toggleAnnotationTools(false);
        if (this.overlayCanvasLens) {
          this.overlayCanvasLens.toggleComparisonMode();
          updateComparisonButtonState();
        }
      }
    };

    toolButtons.appendChild(zoomButton);
    toolButtons.appendChild(annotationButton);
    toolButtons.appendChild(comparisonButton);

    // Create annotation tools container
    const annotationToolsContainer = document.createElement('div');
    annotationToolsContainer.style.cssText = `
      position: absolute;
      top: 60px;
      left: 0;
      right: 0;
      display: none;
      flex-direction: row;
      gap: 20px;
      padding: 15px 20px;
      background: #2c3e50;
      border-bottom: 1px solid #34495e;
      z-index: 10001;
      align-items: center;
    `;

    // Create annotation tools row
    const annotationToolsRow = document.createElement('div');
    annotationToolsRow.style.cssText = `
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    `;

    // Create annotation settings row
    const annotationSettingsRow = document.createElement('div');
    annotationSettingsRow.style.cssText = `
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      align-items: center;
    `;

    // Create annotation tool buttons
    const annotationTools = [
      { type: 'rect', icon: '⬜', text: 'Rectangle' },
      { type: 'arrow', icon: '↗', text: 'Arrow' },
      { type: 'text', icon: 'T', text: 'Text' },
      { type: 'circle', icon: '⭕', text: 'Circle' },
      { type: 'line', icon: '📏', text: 'Line' }
    ];

    const annotationToolButtons: HTMLButtonElement[] = [];
    annotationTools.forEach(tool => {
      const toolButton = createToolButton(tool.text, tool.icon, () => {
        if (this.overlayCanvasLens) {
          // Toggle tool - if same tool is active, deactivate it
          const currentTool = this.overlayCanvasLens.getActiveAnnotationToolType();
          if (currentTool === tool.type) {
            this.overlayCanvasLens.deactivateAnnotationTool();
            updateAnnotationToolButtonStates(null);
          } else {
            this.overlayCanvasLens.activateAnnotationTool(tool.type);
            updateAnnotationToolButtonStates(tool.type);
          }
          updateComparisonButtonState();
        }
      });
      annotationToolButtons.push(toolButton);
      annotationToolsRow.appendChild(toolButton);
    });

    // Function to update annotation tool button states
    const updateAnnotationToolButtonStates = (activeTool: string | null) => {
      annotationToolButtons.forEach((btn, index) => {
        const toolType = annotationTools[index]?.type;
        if (toolType === activeTool) {
          btn.style.background = '#3498db';
          btn.onmouseover = () => btn.style.background = '#2980b9';
          btn.onmouseout = () => btn.style.background = '#3498db';
        } else {
          btn.style.background = '#34495e';
          btn.onmouseover = () => btn.style.background = '#4a5f7a';
          btn.onmouseout = () => btn.style.background = '#34495e';
        }
      });
    };

    // Create annotation settings controls
    // Color controls
    const colorGroup = document.createElement('div');
    colorGroup.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 5px;
    `;
    
    const colorLabel = document.createElement('label');
    colorLabel.textContent = 'Color';
    colorLabel.style.cssText = `
      color: white;
      font-size: 12px;
      font-weight: bold;
    `;
    
    const colorControls = document.createElement('div');
    colorControls.style.cssText = `
      display: flex;
      gap: 5px;
      align-items: center;
    `;
    
    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.value = '#ff0000';
    colorPicker.style.cssText = `
      width: 30px;
      height: 30px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    `;
    
    const colorHex = document.createElement('input');
    colorHex.type = 'text';
    colorHex.value = '#ff0000';
    colorHex.placeholder = '#ff0000';
    colorHex.style.cssText = `
      width: 70px;
      height: 30px;
      padding: 0 8px;
      border: 1px solid #34495e;
      border-radius: 4px;
      background: #34495e;
      color: white;
      font-size: 12px;
    `;
    
    colorControls.appendChild(colorPicker);
    colorControls.appendChild(colorHex);
    colorGroup.appendChild(colorLabel);
    colorGroup.appendChild(colorControls);
    
    // Width controls
    const widthGroup = document.createElement('div');
    widthGroup.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 5px;
    `;
    
    const widthLabel = document.createElement('label');
    widthLabel.textContent = 'Width';
    widthLabel.style.cssText = `
      color: white;
      font-size: 12px;
      font-weight: bold;
    `;
    
    const widthControls = document.createElement('div');
    widthControls.style.cssText = `
      display: flex;
      gap: 5px;
      align-items: center;
    `;
    
    const decreaseWidthBtn = document.createElement('button');
    decreaseWidthBtn.textContent = '−';
    decreaseWidthBtn.style.cssText = `
      width: 30px;
      height: 30px;
      border: none;
      border-radius: 4px;
      background: #34495e;
      color: white;
      cursor: pointer;
      font-size: 16px;
    `;
    
    const strokeWidth = document.createElement('input');
    strokeWidth.type = 'number';
    strokeWidth.min = '1';
    strokeWidth.max = '20';
    strokeWidth.value = '2';
    strokeWidth.style.cssText = `
      width: 50px;
      height: 30px;
      padding: 0 8px;
      border: 1px solid #34495e;
      border-radius: 4px;
      background: #34495e;
      color: white;
      font-size: 12px;
      text-align: center;
    `;
    
    const increaseWidthBtn = document.createElement('button');
    increaseWidthBtn.textContent = '+';
    increaseWidthBtn.style.cssText = `
      width: 30px;
      height: 30px;
      border: none;
      border-radius: 4px;
      background: #34495e;
      color: white;
      cursor: pointer;
      font-size: 16px;
    `;
    
    widthControls.appendChild(decreaseWidthBtn);
    widthControls.appendChild(strokeWidth);
    widthControls.appendChild(increaseWidthBtn);
    widthGroup.appendChild(widthLabel);
    widthGroup.appendChild(widthControls);
    
    // Style controls
    const styleGroup = document.createElement('div');
    styleGroup.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 5px;
    `;
    
    const styleLabel = document.createElement('label');
    styleLabel.textContent = 'Style';
    styleLabel.style.cssText = `
      color: white;
      font-size: 12px;
      font-weight: bold;
    `;
    
    const lineStyle = document.createElement('select');
    lineStyle.style.cssText = `
      height: 30px;
      padding: 0 8px;
      border: 1px solid #34495e;
      border-radius: 4px;
      background: #34495e;
      color: white;
      font-size: 12px;
      cursor: pointer;
    `;
    
    const solidOption = document.createElement('option');
    solidOption.value = 'solid';
    solidOption.textContent = '━━━ Solid';
    
    const dashedOption = document.createElement('option');
    dashedOption.value = 'dashed';
    dashedOption.textContent = '┅┅┅ Dashed';
    
    const dottedOption = document.createElement('option');
    dottedOption.value = 'dotted';
    dottedOption.textContent = '┈┈┈ Dotted';
    
    lineStyle.appendChild(solidOption);
    lineStyle.appendChild(dashedOption);
    lineStyle.appendChild(dottedOption);
    
    styleGroup.appendChild(styleLabel);
    styleGroup.appendChild(lineStyle);
    
    // Add controls to settings row
    annotationSettingsRow.appendChild(colorGroup);
    annotationSettingsRow.appendChild(widthGroup);
    annotationSettingsRow.appendChild(styleGroup);
    
    // Add rows to container (now in same row)
    annotationToolsContainer.appendChild(annotationToolsRow);
    annotationToolsContainer.appendChild(annotationSettingsRow);

    // Annotation settings event listeners
    // Color picker
    colorPicker.addEventListener('change', (e: any) => {
      const color = e.target.value;
      colorHex.value = color;
      updateAnnotationStyle({ strokeColor: color });
    });

    // Color hex input
    colorHex.addEventListener('change', (e: any) => {
      const hex = e.target.value;
      if (/^#[0-9A-F]{6}$/i.test(hex)) {
        colorPicker.value = hex;
        updateAnnotationStyle({ strokeColor: hex });
      } else {
        // Invalid hex, revert to previous value
        colorHex.value = colorPicker.value;
      }
    });

    // Width controls
    decreaseWidthBtn.addEventListener('click', () => {
      const currentWidth = parseInt(strokeWidth.value);
      if (currentWidth > 1) {
        strokeWidth.value = (currentWidth - 1).toString();
        updateAnnotationStyle({ strokeWidth: currentWidth - 1 });
      }
    });

    increaseWidthBtn.addEventListener('click', () => {
      const currentWidth = parseInt(strokeWidth.value);
      if (currentWidth < 20) {
        strokeWidth.value = (currentWidth + 1).toString();
        updateAnnotationStyle({ strokeWidth: currentWidth + 1 });
      }
    });

    strokeWidth.addEventListener('change', (e: any) => {
      const width = parseInt(e.target.value);
      if (width >= 1 && width <= 20) {
        updateAnnotationStyle({ strokeWidth: width });
      } else {
        // Invalid width, revert to previous value
        strokeWidth.value = '2';
        updateAnnotationStyle({ strokeWidth: 2 });
      }
    });

    // Line style
    lineStyle.addEventListener('change', (e: any) => {
      updateAnnotationStyle({ lineStyle: e.target.value });
    });

    // Function to update annotation style
    const updateAnnotationStyle = (style: { strokeColor?: string; strokeWidth?: number; lineStyle?: 'solid' | 'dashed' | 'dotted' }) => {
      if (this.overlayCanvasLens) {
        const annotationManager = this.overlayCanvasLens.getAnnotationManager();
        if (annotationManager) {
          annotationManager.updateStyle(style);
        }
      }
    };

    // Function to show/hide annotation tools
    const toggleAnnotationTools = (show: boolean) => {
      annotationToolsContainer.style.display = show ? 'flex' : 'none';
      // Adjust canvas container margin based on annotation tools visibility
      if (show) {
        canvasContainer.style.marginTop = '120px'; // 60px header + 60px annotation tools/settings
        canvasContainer.style.height = 'calc(90vh - 120px)';
      } else {
        canvasContainer.style.marginTop = '60px'; // Only header
        canvasContainer.style.height = 'calc(90vh - 60px)';
      }
    };

    // Function to update comparison button state
    const updateComparisonButtonState = () => {
      if (this.overlayCanvasLens) {
        const hasImage = this.overlayCanvasLens.isImageLoaded();
        const hasChanges = hasImage && this.overlayCanvasLens.hasChanges();
        
        // Enable comparison button only when there are changes to the original image
        comparisonButton.disabled = !hasImage || !hasChanges;
        
        if (hasChanges) {
          comparisonButton.title = 'Compare with original image';
        } else {
          comparisonButton.title = 'No changes to compare';
        }
      }
    };

    // Action buttons
    const actionButtons = document.createElement('div');
    actionButtons.style.cssText = `
      display: flex;
      gap: 10px;
      align-items: center;
    `;

    const closeButton = document.createElement('button');
    closeButton.innerHTML = '✕';
    closeButton.style.cssText = `
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    closeButton.onmouseover = () => closeButton.style.background = 'rgba(255, 255, 255, 0.1)';
    closeButton.onmouseout = () => closeButton.style.background = 'none';
    closeButton.onclick = () => this.closeOverlay();

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
      background: transparent;
      border-radius: 8px;
      overflow: hidden;
    `;

    this.overlayContainer.appendChild(header);
    this.overlayContainer.appendChild(annotationToolsContainer);
    this.overlayContainer.appendChild(canvasContainer);

    // Wait for the container to be rendered before creating the Engine
    // Use requestAnimationFrame to ensure the DOM is updated
    requestAnimationFrame(() => {
      // Get actual dimensions after rendering
      const actualWidth = canvasContainer.clientWidth || window.innerWidth * 0.9;
      const actualHeight = canvasContainer.clientHeight || (window.innerHeight * 0.9 - 60);
      

      // Create overlay CanvasLens instance
      const overlayOptions: CanvasLensOptions = {
        container: canvasContainer,
        width: actualWidth,
        height: actualHeight,
        backgroundColor: this.getAttribute('background-color') || '#f0f0f0',
        tools: this.parseToolsConfig(),
        maxZoom: parseFloat(this.getAttribute('max-zoom') || '10'),
        minZoom: parseFloat(this.getAttribute('min-zoom') || '0.1')
      };

      this.overlayCanvasLens = new Engine(overlayOptions);

      // Set up event listeners for the overlay canvas lens
      // Note: We'll need to access the CanvasLens element to add event listeners
      // For now, we'll update the comparison button state after image load
      
      // Initial update of comparison button state
      updateComparisonButtonState();

      // Load current image to overlay
      if (this.canvasLens && this.canvasLens.isImageLoaded()) {
        const imageViewer = this.canvasLens.getImageViewer();
        const imageData = imageViewer ? imageViewer.getImageData() : null;
        if (imageData) {
          this.overlayCanvasLens.loadImageElementOverlay(imageData.element, imageData.type, imageData.fileName);
        } else {
          console.warn('No image data available for overlay');
        }
      } else {
        console.warn('Main canvas lens not loaded or no image loaded');
      }
    });
  }

  private destroy(): void {
    if (!this.isDestroyed) {
      this.isDestroyed = true;
      
      // Close overlay if open
      this.closeOverlay();
      
      // Destroy canvas lens instance
      if (this.canvasLens) {
        this.canvasLens.destroy();
        this.canvasLens = null;
      }
      
      // Clear overlay container
      if (this.overlayContainer && this.overlayContainer.parentNode) {
        this.overlayContainer.parentNode.removeChild(this.overlayContainer);
        this.overlayContainer = null;
      }
      
      // Clear overlay canvas lens
      if (this.overlayCanvasLens) {
        this.overlayCanvasLens.destroy();
        this.overlayCanvasLens = null;
      }
    }
  }
}

// Register the custom element
if (typeof window !== 'undefined' && !customElements.get('canvas-lens')) {
  customElements.define('canvas-lens', CanvasLensElement);
}

// Export for backward compatibility
export const CanvasLens = CanvasLensElement;

