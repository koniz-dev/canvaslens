import { CanvasLensOptions, EventHandlers, ImageData, Annotation, Point } from './types';
import { CoreCanvasLens } from './index';

export interface CanvasLensProps {
  // Image props
  src?: string;
  imageType?: string;
  fileName?: string;
  
  // Size props
  width?: number | string;
  height?: number | string;
  
  // Configuration props
  backgroundColor?: string;
  enableZoom?: boolean;
  enablePan?: boolean;
  enableAnnotations?: boolean;
  enableComparison?: boolean;
  maxZoom?: number;
  minZoom?: number;
  
  // Overlay mode
  overlayMode?: boolean;
  
  // Tool props
  activeTool?: 'rect' | 'arrow' | 'text' | 'circle' | 'line' | null;
  
  // Event handlers
  onImageLoad?: (imageData: ImageData) => void;
  onZoomChange?: (scale: number) => void;
  onPanChange?: (offset: Point) => void;
  onAnnotationAdd?: (annotation: Annotation) => void;
  onAnnotationRemove?: (annotationId: string) => void;
  onToolChange?: (toolType: string | null) => void;
  onComparisonChange?: (position: number) => void;
  onSave?: (imageData: ImageData) => void;
  onClose?: () => void;
  onClick?: (event: MouseEvent) => void;
}

export interface CanvasLensInstance {
  // Core methods
  loadImage: (src: string, type?: string, fileName?: string) => Promise<void>;
  loadImageFromFile: (file: File) => void;
  resize: (width: number, height: number) => void;
  
  // Tool methods
  activateTool: (toolType: string) => boolean;
  deactivateTool: () => boolean;
  getActiveTool: () => string | null;
  
  // Annotation methods
  addAnnotation: (annotation: Annotation) => void;
  removeAnnotation: (annotationId: string) => void;
  clearAnnotations: () => void;
  getAnnotations: () => Annotation[];
  
  // Comparison methods
  setComparisonImage: (src: string) => Promise<void>;
  setComparisonPosition: (position: number) => void;
  getComparisonPosition: () => number;
  
  // Overlay methods
  openOverlay: () => void;
  closeOverlay: () => void;
  saveChanges: () => void;
  
  // Getter methods
  getCanvasLens: () => CoreCanvasLens;
  getImageViewer: () => any;
  getZoomPanHandler: () => any;
  getAnnotationManager: () => any;
  getComparisonManager: () => any;
  
  // State methods
  isImageLoaded: () => boolean;
  getImageData: () => ImageData | null;
  getZoomLevel: () => number;
  getPanOffset: () => Point;
  isOverlayOpen: () => boolean;
  
  // Destroy
  destroy: () => void;
}

export interface CanvasLensFactory {
  create: (container: HTMLElement, props: CanvasLensProps) => CanvasLensInstance;
  update: (instance: CanvasLensInstance, props: CanvasLensProps) => void;
  destroy: (instance: CanvasLensInstance) => void;
}

/**
 * Factory function to create CanvasLens instance
 */
export function createCanvasLens(
  container: HTMLElement, 
  props: CanvasLensProps
): CanvasLensInstance {
  let canvasLens: CoreCanvasLens | null = null;
  let isDestroyed = false;
  let overlayContainer: HTMLElement | null = null;
  let overlayCanvasLens: CoreCanvasLens | null = null;
  let isOverlayOpen = false;

  // Parse width and height
  const parseSize = (size: number | string | undefined, defaultSize: number): number => {
    if (typeof size === 'number') return size;
    if (typeof size === 'string') {
      if (size.endsWith('px')) return parseInt(size);
      if (size.endsWith('%')) return (container.clientWidth * parseInt(size)) / 100;
      return parseInt(size) || defaultSize;
    }
    return defaultSize;
  };

  const width = parseSize(props.width, 800);
  const height = parseSize(props.height, 600);

  // Create CanvasLens options
  const options: CanvasLensOptions = {
    container,
    width,
    height,
    backgroundColor: props.backgroundColor || '#f0f0f0',
    enableZoom: props.enableZoom !== false,
    enablePan: props.enablePan !== false,
    enableAnnotations: props.enableAnnotations || false,
    enableComparison: props.enableComparison || false,
    maxZoom: props.maxZoom || 10,
    minZoom: props.minZoom || 0.1
  };

  // Create CanvasLens instance
  canvasLens = new CoreCanvasLens(options);

  // Set event handlers
  const eventHandlers: EventHandlers = {};
  if (props.onImageLoad) eventHandlers.onImageLoad = props.onImageLoad;
  if (props.onZoomChange) eventHandlers.onZoomChange = props.onZoomChange;
  if (props.onPanChange) eventHandlers.onPanChange = props.onPanChange;
  if (props.onAnnotationAdd) eventHandlers.onAnnotationAdd = props.onAnnotationAdd;
  if (props.onAnnotationRemove) eventHandlers.onAnnotationRemove = props.onAnnotationRemove;
  if (props.onToolChange) eventHandlers.onToolChange = props.onToolChange;
  if (props.onComparisonChange) eventHandlers.onComparisonChange = props.onComparisonChange;

  canvasLens.setEventHandlers(eventHandlers);

  // Set initial tool if provided
  if (props.activeTool) {
    canvasLens.activateAnnotationTool(props.activeTool);
  }

  // Load initial image if src is provided
  if (props.src) {
    canvasLens.loadImage(props.src, props.imageType, props.fileName);
  }

  // Add click handler if provided
  if (props.onClick) {
    container.addEventListener('click', props.onClick);
  }

  // Create overlay container
  const createOverlay = () => {
    if (overlayContainer) return;

    overlayContainer = document.createElement('div');
    overlayContainer.style.cssText = `
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
      if (overlayCanvasLens) {
        overlayCanvasLens.deactivateAnnotationTool();
      }
    });

    // Annotation tool
    const annotationButton = createToolButton('Annotation', '✏️', () => {
      if (overlayCanvasLens) {
        overlayCanvasLens.activateAnnotationTool('rect');
      }
    });

    // Comparison tool
    const comparisonButton = createToolButton('Comparison', '⚖️', () => {
              // Toggle comparison mode
        if (overlayCanvasLens) {
          // Implementation for comparison toggle
          // TODO: Implement comparison toggle functionality
        }
    });

    toolButtons.appendChild(zoomButton);
    toolButtons.appendChild(annotationButton);
    toolButtons.appendChild(comparisonButton);

    // Action buttons
    const actionButtons = document.createElement('div');
    actionButtons.style.cssText = `
      display: flex;
      gap: 10px;
      align-items: center;
    `;

    const saveButton = createToolButton('Save', '💾', () => {
      if (props.onSave && overlayCanvasLens) {
        const imageViewer = overlayCanvasLens.getImageViewer();
        const imageData = imageViewer ? imageViewer.getImageData() : null;
        if (imageData) {
          props.onSave(imageData);
        }
      }
      closeOverlay();
    });

    const closeButton = createToolButton('Close', '✕', closeOverlay);

    actionButtons.appendChild(saveButton);
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

    overlayContainer.appendChild(header);
    overlayContainer.appendChild(canvasContainer);

    // Create overlay CanvasLens instance
    const overlayOptions: CanvasLensOptions = {
      container: canvasContainer,
      width: canvasContainer.clientWidth,
      height: canvasContainer.clientHeight,
      backgroundColor: props.backgroundColor || '#f0f0f0',
      enableZoom: props.enableZoom !== false,
      enablePan: props.enablePan !== false,
      enableAnnotations: props.enableAnnotations || false,
      enableComparison: props.enableComparison || false,
      maxZoom: props.maxZoom || 10,
      minZoom: props.minZoom || 0.1
    };

    overlayCanvasLens = new CoreCanvasLens(overlayOptions);
    overlayCanvasLens.setEventHandlers(eventHandlers);

    // Load current image to overlay
    if (canvasLens && canvasLens.isImageLoaded()) {
      const imageViewer = canvasLens.getImageViewer();
      const imageData = imageViewer ? imageViewer.getImageData() : null;
      if (imageData) {
        overlayCanvasLens.loadImageElement(imageData.element, imageData.type, imageData.fileName);
      }
    }
  };

  const openOverlay = () => {
    if (isOverlayOpen) return;
    
    createOverlay();
    if (overlayContainer) {
      document.body.appendChild(overlayContainer);
      isOverlayOpen = true;
    }
  };

  const closeOverlay = () => {
    if (!isOverlayOpen) return;
    
    if (overlayContainer) {
      document.body.removeChild(overlayContainer);
      overlayContainer = null;
      overlayCanvasLens = null;
      isOverlayOpen = false;
    }
    
    if (props.onClose) {
      props.onClose();
    }
  };

  const saveChanges = () => {
    if (overlayCanvasLens && props.onSave) {
      const imageViewer = overlayCanvasLens.getImageViewer();
      const imageData = imageViewer ? imageViewer.getImageData() : null;
      if (imageData) {
        props.onSave(imageData);
      }
    }
  };

  // Create component instance
  const instance: CanvasLensInstance = {
    loadImage: async (src: string, type?: string, fileName?: string) => {
      if (canvasLens && !isDestroyed) {
        await canvasLens.loadImage(src, type, fileName);
      }
    },

    loadImageFromFile: (file: File) => {
      if (canvasLens && !isDestroyed) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            canvasLens!.loadImageElement(img, file.type, file.name);
          };
          img.src = e.target!.result as string;
        };
        reader.readAsDataURL(file);
      }
    },

    resize: (width: number, height: number) => {
      if (canvasLens && !isDestroyed) {
        canvasLens.resize(width, height);
      }
    },

    activateTool: (toolType: string) => {
      if (canvasLens && !isDestroyed) {
        return canvasLens.activateAnnotationTool(toolType);
      }
      return false;
    },

    deactivateTool: () => {
      if (canvasLens && !isDestroyed) {
        canvasLens.deactivateAnnotationTool();
        return true;
      }
      return false;
    },

    getActiveTool: () => {
      if (canvasLens && !isDestroyed) {
        return canvasLens.getActiveAnnotationToolType();
      }
      return null;
    },

    addAnnotation: (annotation: Annotation) => {
      if (canvasLens && !isDestroyed) {
        const annotationManager = canvasLens.getAnnotationManager();
        if (annotationManager) {
          annotationManager.addAnnotation(annotation);
        }
      }
    },

    removeAnnotation: (annotationId: string) => {
      if (canvasLens && !isDestroyed) {
        const annotationManager = canvasLens.getAnnotationManager();
        if (annotationManager) {
          annotationManager.removeAnnotation(annotationId);
        }
      }
    },

    clearAnnotations: () => {
      if (canvasLens && !isDestroyed) {
        const annotationManager = canvasLens.getAnnotationManager();
        if (annotationManager) {
          // Clear all annotations by removing them one by one
          const annotations = annotationManager.getAllAnnotations();
          annotations.forEach(annotation => {
            annotationManager.removeAnnotation(annotation.id);
          });
        }
      }
    },

    getAnnotations: () => {
      if (canvasLens && !isDestroyed) {
        const annotationManager = canvasLens.getAnnotationManager();
        return annotationManager ? annotationManager.getAllAnnotations() : [];
      }
      return [];
    },

    setComparisonImage: async (src: string) => {
      if (canvasLens && !isDestroyed) {
        // TODO: Implement comparison functionality
        // This will be implemented when comparison module is fully integrated
      }
    },

    setComparisonPosition: (position: number) => {
      if (canvasLens && !isDestroyed) {
        // TODO: Implement comparison position
        // This will be implemented when comparison module is fully integrated
      }
    },

    getComparisonPosition: () => {
      return 0.5; // Default position
    },

    openOverlay,
    closeOverlay,
    saveChanges,

    getCanvasLens: () => {
      if (!canvasLens || isDestroyed) {
        throw new Error('CanvasLens instance is not available');
      }
      return canvasLens;
    },

    getImageViewer: () => {
      if (canvasLens && !isDestroyed) {
        return canvasLens.getImageViewer();
      }
      return null;
    },

    getZoomPanHandler: () => {
      if (canvasLens && !isDestroyed) {
        return canvasLens.getZoomPanHandler();
      }
      return null;
    },

    getAnnotationManager: () => {
      if (canvasLens && !isDestroyed) {
        return canvasLens.getAnnotationManager();
      }
      return null;
    },

    getComparisonManager: () => {
      // TODO: Implement comparison manager
      return null;
    },

    isImageLoaded: () => {
      if (canvasLens && !isDestroyed) {
        return canvasLens.isImageLoaded();
      }
      return false;
    },

    getImageData: () => {
      if (canvasLens && !isDestroyed) {
        const imageViewer = canvasLens.getImageViewer();
        return imageViewer ? imageViewer.getImageData() : null;
      }
      return null;
    },

    getZoomLevel: () => {
      if (canvasLens && !isDestroyed) {
        const zoomPanHandler = canvasLens.getZoomPanHandler();
        return zoomPanHandler ? zoomPanHandler.getZoomLevel() : 1;
      }
      return 1;
    },

    getPanOffset: () => {
      if (canvasLens && !isDestroyed) {
        const zoomPanHandler = canvasLens.getZoomPanHandler();
        return zoomPanHandler ? zoomPanHandler.getPanOffset() : { x: 0, y: 0 };
      }
      return { x: 0, y: 0 };
    },

    isOverlayOpen: () => isOverlayOpen,

    destroy: () => {
      if (!isDestroyed) {
        isDestroyed = true;
        closeOverlay();
        if (props.onClick) {
          container.removeEventListener('click', props.onClick);
        }
        // CanvasLens will automatically cleanup when container is removed
        canvasLens = null;
      }
    }
  };

  return instance;
}

/**
 * Update component instance with new props
 */
export function updateCanvasLens(
  instance: CanvasLensInstance,
  props: CanvasLensProps
): void {
  const canvasLens = instance.getCanvasLens();
  
  // Update event handlers
  const eventHandlers: EventHandlers = {};
  if (props.onImageLoad) eventHandlers.onImageLoad = props.onImageLoad;
  if (props.onZoomChange) eventHandlers.onZoomChange = props.onZoomChange;
  if (props.onPanChange) eventHandlers.onPanChange = props.onPanChange;
  if (props.onAnnotationAdd) eventHandlers.onAnnotationAdd = props.onAnnotationAdd;
  if (props.onAnnotationRemove) eventHandlers.onAnnotationRemove = props.onAnnotationRemove;
  if (props.onToolChange) eventHandlers.onToolChange = props.onToolChange;
  if (props.onComparisonChange) eventHandlers.onComparisonChange = props.onComparisonChange;

  canvasLens.setEventHandlers(eventHandlers);

  // Update tool
  if (props.activeTool !== undefined) {
    if (props.activeTool) {
      instance.activateTool(props.activeTool);
    } else {
      instance.deactivateTool();
    }
  }

  // Load new image if src changed
  if (props.src && props.src !== instance.getImageData()?.element.src) {
    instance.loadImage(props.src, props.imageType, props.fileName);
  }
}

/**
 * Factory object for component management
 */
export const CanvasLens: CanvasLensFactory = {
  create: createCanvasLens,
  update: updateCanvasLens,
  destroy: (instance: CanvasLensInstance) => instance.destroy()
};
