import { CanvasLens } from '../../src/index';

describe('CanvasLens Web Component Integration Tests', () => {
  let container: HTMLElement;
  let canvasLens: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);
    
    // Create canvas-lens element
    canvasLens = document.createElement('canvas-lens');
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
  });

  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
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
      expect(typeof canvasLens.getActiveTool()).toBe('string') || expect(canvasLens.getActiveTool()).toBeNull();
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
  });

  describe('Resize', () => {
    it('should handle resize', () => {
      expect(() => {
        canvasLens.resize(1000, 800);
      }).not.toThrow();
    });
  });
});
