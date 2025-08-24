import { CanvasLens } from '../../src/index';
import { CanvasLensOptions } from '../../src/types';

describe('CanvasLens Functional Tests', () => {
  let container: HTMLElement;
  let canvasLens: any;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (canvasLens) {
      canvasLens.destroy();
    }
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('Basic Functionality', () => {
    it('should create instance with default settings', () => {
      const options: CanvasLensOptions = {
        container
      };

      expect(() => {
        canvasLens = CanvasLens.create(container, options);
      }).not.toThrow();

      expect(canvasLens).toBeDefined();
      expect(canvasLens.getCanvasLens).toBeDefined();
    });

    it('should handle different image orientations', () => {
      const landscapeOptions: CanvasLensOptions = {
        container,
        width: 1200,
        height: 800
      };

      const portraitOptions: CanvasLensOptions = {
        container,
        width: 800,
        height: 1200
      };

      expect(() => {
        const landscapeCanvasLens = CanvasLens.create(container, landscapeOptions);
        landscapeCanvasLens.destroy();
      }).not.toThrow();

      expect(() => {
        const portraitCanvasLens = CanvasLens.create(container, portraitOptions);
        portraitCanvasLens.destroy();
      }).not.toThrow();
    });

    it('should handle resize operations', () => {
      const options: CanvasLensOptions = {
        container
      };

      canvasLens = CanvasLens.create(container, options);

      expect(() => {
        canvasLens.resize(1000, 800);
      }).not.toThrow();

      expect(() => {
        canvasLens.resize(600, 400);
      }).not.toThrow();
    });

    it('should handle invalid configurations gracefully', () => {
      expect(() => {
        CanvasLens.create(container, {} as CanvasLensOptions);
      }).not.toThrow();
    });
  });

  describe('Image Loading', () => {
    beforeEach(() => {
      const options: CanvasLensOptions = {
        container
      };
      canvasLens = CanvasLens.create(container, options);
    });

    it('should load images successfully', async () => {
      const testImageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iYmx1ZSIvPjwvc3ZnPg==';
      
      await expect(canvasLens.loadImage(testImageUrl)).resolves.not.toThrow();
    });

    it('should handle image loading from file', () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
      
      expect(() => {
        canvasLens.loadImageFromFile(mockFile);
      }).not.toThrow();
    });

    it('should check image loaded state', () => {
      expect(canvasLens.isImageLoaded()).toBe(false);
    });
  });

  describe('Zoom and Pan Features', () => {
    beforeEach(() => {
      const options: CanvasLensOptions = {
        container,
        enableZoom: true,
        enablePan: true
      };
      canvasLens = CanvasLens.create(container, options);
    });

    it('should perform zoom operations', () => {
      const coreCanvasLens = canvasLens.getCanvasLens();
      
      expect(() => {
        coreCanvasLens.zoomIn();
        coreCanvasLens.zoomOut();
        coreCanvasLens.zoomTo(2.0);
      }).not.toThrow();
    });

    it('should get zoom and pan state', () => {
      const zoomLevel = canvasLens.getZoomLevel();
      const panOffset = canvasLens.getPanOffset();

      expect(zoomLevel).toBeGreaterThan(0);
      expect(panOffset).toHaveProperty('x');
      expect(panOffset).toHaveProperty('y');
    });

    it('should fit image to view', () => {
      const coreCanvasLens = canvasLens.getCanvasLens();
      
      expect(() => {
        coreCanvasLens.fitToView();
        coreCanvasLens.resetView();
      }).not.toThrow();
    });
  });

  describe('Annotation Features', () => {
    beforeEach(() => {
      const options: CanvasLensOptions = {
        container,
        enableAnnotations: true
      };
      canvasLens = CanvasLens.create(container, options);
    });

    it('should activate and deactivate annotation tools', () => {
      expect(() => {
        canvasLens.activateTool('rect');
        expect(canvasLens.getActiveTool()).toBe('rect');
        
        canvasLens.activateTool('arrow');
        expect(canvasLens.getActiveTool()).toBe('arrow');
        
        canvasLens.deactivateTool();
        expect(canvasLens.getActiveTool()).toBeNull();
      }).not.toThrow();
    });

    it('should manage annotations', () => {
      const testAnnotation = {
        id: 'test-1',
        type: 'rect' as const,
        points: [{ x: 10, y: 10 }, { x: 50, y: 50 }],
        style: {
          strokeColor: '#ff0000',
          strokeWidth: 2
        }
      };

      expect(() => {
        canvasLens.addAnnotation(testAnnotation);
        const annotations = canvasLens.getAnnotations();
        expect(annotations.length).toBeGreaterThan(0);
        
        canvasLens.removeAnnotation('test-1');
        canvasLens.clearAnnotations();
      }).not.toThrow();
    });
  });

  describe('Event Handling', () => {
    it('should handle event callbacks', () => {
      const mockCallbacks = {
        onImageLoad: jest.fn(),
        onZoomChange: jest.fn(),
        onAnnotationAdd: jest.fn()
      };

      const options: CanvasLensOptions = {
        container,
        ...mockCallbacks
      };

      canvasLens = CanvasLens.create(container, options);
      
      expect(canvasLens).toBeDefined();
    });
  });

  describe('Component Lifecycle', () => {
    it('should handle component destruction', () => {
      const options: CanvasLensOptions = {
        container
      };

      canvasLens = CanvasLens.create(container, options);
      
      expect(() => {
        canvasLens.destroy();
      }).not.toThrow();

      // Should throw when trying to access destroyed component
      expect(() => {
        canvasLens.getCanvasLens();
      }).toThrow();
    });

    it('should handle multiple create/destroy cycles', () => {
      const options: CanvasLensOptions = {
        container
      };

      for (let i = 0; i < 3; i++) {
        const instance = CanvasLens.create(container, options);
        expect(instance).toBeDefined();
        instance.destroy();
      }
    });
  });
});
