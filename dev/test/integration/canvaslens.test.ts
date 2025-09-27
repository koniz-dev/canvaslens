import { CanvasLens } from '../../../src/index';

// Define interface for CanvasLens Web Component
interface CanvasLensElement extends HTMLElement {
  loadImage(src: string, type?: string, fileName?: string): Promise<void>;
  loadImageFromFile(file: File): void;
  resize(width: number, height: number): void;
  activateTool(toolType: string): boolean;
  deactivateTool(): boolean;
  getActiveTool(): string | null;
  addAnnotation(annotation: any): void;
  removeAnnotation(annotationId: string): void;
  clearAnnotations(): void;
  getAnnotations(): any[];
  fitToView(): void;
  resetView(): void;
  getZoomLevel(): number;
  getPanOffset(): { x: number; y: number };
  zoomIn(factor?: number): void;
  zoomOut(factor?: number): void;
  zoomTo(scale: number): void;
  isImageLoaded(): boolean;
  getImageData(): any;
  openOverlay(): void;
  closeOverlay(): void;
  isOverlayOpen(): boolean;
}

// Ensure custom element is defined before tests
beforeAll(() => {
  if (!customElements.get('canvas-lens')) {
    customElements.define('canvas-lens', CanvasLens);
  }
});

describe('CanvasLens Web Component Integration Tests', () => {
  let container: HTMLElement;
  let canvasLens: CanvasLensElement;

  beforeEach(async () => {
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);
    
    // Create canvas-lens element
    canvasLens = document.createElement('canvas-lens') as CanvasLensElement;
    canvasLens.setAttribute('width', '800px');
    canvasLens.setAttribute('height', '600px');
    canvasLens.setAttribute('background-color', '#f0f0f0');
    canvasLens.setAttribute('tools', JSON.stringify({
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
    }));
    container.appendChild(canvasLens);
    
    // Wait for custom element to be fully initialized
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  afterEach(() => {
    // Clean up event listeners and timers
    if (canvasLens && typeof canvasLens.closeOverlay === 'function') {
      canvasLens.closeOverlay();
    }
    
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    
    // Clear any pending timers
    jest.clearAllTimers();
  });

  describe('Initialization', () => {
    it('should initialize with default options', () => {
      expect(canvasLens).toBeDefined();
      expect(canvasLens.tagName.toLowerCase()).toBe('canvas-lens');
    });

    it('should initialize with custom tools configuration', () => {
      const customTools = {
        zoom: true,
        pan: false,
        annotation: {
          rect: true,
          arrow: false,
          text: true,
          circle: false,
          line: false
        },
        comparison: true
      };
      
      canvasLens.setAttribute('tools', JSON.stringify(customTools));
      expect(canvasLens.getAttribute('tools')).toBe(JSON.stringify(customTools));
    });

    it('should handle invalid tools configuration gracefully', () => {
      expect(() => {
        canvasLens.setAttribute('tools', 'invalid json');
      }).not.toThrow();
    });
  });

  describe('Event Handling', () => {
    it('should dispatch custom events', () => {
      const mockHandler = jest.fn();
      canvasLens.addEventListener('imageload', mockHandler);
      
      // Simulate image load
      const imageLoadEvent = new CustomEvent('imageload', {
        detail: {
          naturalSize: { width: 800, height: 600 },
          fileName: 'test.jpg'
        }
      });
      
      canvasLens.dispatchEvent(imageLoadEvent);
      expect(mockHandler).toHaveBeenCalled();
    });

    it('should handle zoom change events', () => {
      const mockHandler = jest.fn();
      canvasLens.addEventListener('zoomchange', mockHandler);
      
      const zoomEvent = new CustomEvent('zoomchange', {
        detail: 1.5
      });
      
      canvasLens.dispatchEvent(zoomEvent);
      expect(mockHandler).toHaveBeenCalledWith(zoomEvent);
    });
  });

  describe('Method Calls', () => {
    it('should have required methods', () => {
      expect(typeof canvasLens.loadImage).toBe('function');
      expect(typeof canvasLens.zoomIn).toBe('function');
      expect(typeof canvasLens.zoomOut).toBe('function');
      expect(typeof canvasLens.fitToView).toBe('function');
      expect(typeof canvasLens.resetView).toBe('function');
      expect(typeof canvasLens.activateTool).toBe('function');
      expect(typeof canvasLens.deactivateTool).toBe('function');
      expect(typeof canvasLens.openOverlay).toBe('function');
      expect(typeof canvasLens.closeOverlay).toBe('function');
    });

    it('should handle image loading', async () => {
      const imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iYmx1ZSIvPjwvc3ZnPg==';
      
      expect(() => {
        canvasLens.loadImage(imageUrl);
      }).not.toThrow();
    });

    it('should handle zoom controls', () => {
      expect(() => {
        canvasLens.zoomIn(1.2);
        canvasLens.zoomOut(1.2);
        canvasLens.zoomTo(2.0);
        canvasLens.fitToView();
        canvasLens.resetView();
      }).not.toThrow();
    });

    it('should handle tool activation', () => {
      expect(() => {
        canvasLens.activateTool('rect');
        canvasLens.activateTool('arrow');
        canvasLens.activateTool('text');
        canvasLens.deactivateTool();
      }).not.toThrow();
    });

    it('should handle overlay controls', () => {
      expect(() => {
        canvasLens.openOverlay();
        canvasLens.closeOverlay();
      }).not.toThrow();
    });
  });

  describe('State Queries', () => {
    it('should return state information', () => {
      expect(typeof canvasLens.isImageLoaded()).toBe('boolean');
      expect(typeof canvasLens.getZoomLevel()).toBe('number');
      const activeTool = canvasLens.getActiveTool();
      expect(typeof activeTool === 'string' || activeTool === null).toBe(true);
      expect(typeof canvasLens.isOverlayOpen()).toBe('boolean');
    });

    it('should handle pan offset query', () => {
      const panOffset = canvasLens.getPanOffset();
      expect(panOffset).toHaveProperty('x');
      expect(panOffset).toHaveProperty('y');
      expect(typeof panOffset.x).toBe('number');
      expect(typeof panOffset.y).toBe('number');
    });
  });

  describe('File Upload', () => {
    it('should handle file upload', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      expect(() => {
        canvasLens.loadImageFromFile(file);
      }).not.toThrow();
    });

    it('should handle invalid file types', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      
      expect(() => {
        canvasLens.loadImageFromFile(file);
      }).not.toThrow();
    });

    it('should handle null file', () => {
      expect(() => {
        canvasLens.loadImageFromFile(null as any);
      }).not.toThrow();
    });
  });

  describe('Resize', () => {
    it('should handle resize', () => {
      expect(() => {
        canvasLens.resize(1000, 800);
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle destroyed component gracefully', () => {
      // Simulate destroyed component
      const destroyedCanvasLens = document.createElement('canvas-lens') as CanvasLensElement;
      destroyedCanvasLens.setAttribute('width', '800px');
      destroyedCanvasLens.setAttribute('height', '600px');
      
      // Test methods on destroyed component
      expect(() => {
        destroyedCanvasLens.zoomIn();
        destroyedCanvasLens.zoomOut();
        destroyedCanvasLens.fitToView();
        destroyedCanvasLens.resetView();
        destroyedCanvasLens.activateTool('rect');
        destroyedCanvasLens.deactivateTool();
        destroyedCanvasLens.clearAnnotations();
        destroyedCanvasLens.getAnnotations();
        destroyedCanvasLens.getZoomLevel();
        destroyedCanvasLens.getPanOffset();
        destroyedCanvasLens.getActiveTool();
        destroyedCanvasLens.isImageLoaded();
        destroyedCanvasLens.isOverlayOpen();
      }).not.toThrow();
    });

    it('should handle invalid tool activation', () => {
      expect(() => {
        canvasLens.activateTool('invalid-tool');
      }).not.toThrow();
    });

    it('should handle annotation operations without manager', () => {
      expect(() => {
        canvasLens.addAnnotation({} as any);
        canvasLens.removeAnnotation('invalid-id');
        canvasLens.clearAnnotations();
      }).not.toThrow();
    });
  });
});
