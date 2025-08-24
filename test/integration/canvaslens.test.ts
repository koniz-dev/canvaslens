import { CanvasLens } from '../../src/index';
import { CanvasLensOptions } from '../../src/types';

describe('CanvasLens Integration Tests', () => {
  let container: HTMLElement;
  let canvasLens: any;

  beforeEach(() => {
    // Create a test container
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up
    if (canvasLens) {
      canvasLens.destroy();
    }
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('Initialization', () => {
    it('should initialize with default options', () => {
      const options: CanvasLensOptions = {
        container
      };

      expect(() => {
        canvasLens = CanvasLens.create(container, options);
      }).not.toThrow();

      expect(canvasLens).toBeDefined();
    });

    it('should initialize with custom options', () => {
      const options: CanvasLensOptions = {
        container,
        width: 1000,
        height: 800,
        backgroundColor: '#000000',
        enableZoom: false,
        enablePan: false,
        enableAnnotations: true,
        maxZoom: 5,
        minZoom: 0.5
      };

      expect(() => {
        canvasLens = CanvasLens.create(container, options);
      }).not.toThrow();

      expect(canvasLens).toBeDefined();
    });

    it('should handle missing container gracefully', () => {
      const options = {} as CanvasLensOptions;

      expect(() => {
        CanvasLens.create(container, options);
      }).not.toThrow();
    });
  });

  describe('Event Handling', () => {
    beforeEach(() => {
      const options: CanvasLensOptions = {
        container,
        enableZoom: true,
        enablePan: true
      };
      canvasLens = CanvasLens.create(container, options);
    });

    it('should handle mouse events', () => {
      // Test mouse down event
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 100,
        clientY: 100,
        button: 0
      });

      expect(() => {
        container.dispatchEvent(mouseDownEvent);
      }).not.toThrow();

      // Test mouse move event
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 150,
        clientY: 150
      });

      expect(() => {
        container.dispatchEvent(mouseMoveEvent);
      }).not.toThrow();

      // Test mouse up event
      const mouseUpEvent = new MouseEvent('mouseup', {
        clientX: 150,
        clientY: 150,
        button: 0
      });

      expect(() => {
        container.dispatchEvent(mouseUpEvent);
      }).not.toThrow();
    });

    it('should handle wheel events for zooming', () => {
      const wheelEvent = new WheelEvent('wheel', {
        deltaY: -100,
        clientX: 100,
        clientY: 100
      });

      expect(() => {
        container.dispatchEvent(wheelEvent);
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

    it('should load image from URL', async () => {
      const imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iYmx1ZSIvPjwvc3ZnPg==';
      
      await expect(canvasLens.loadImage(imageUrl)).resolves.not.toThrow();
    });

    it('should handle image loading errors', async () => {
      const invalidUrl = 'invalid-url';
      
      // Note: This might not throw depending on how the image loading is implemented
      await expect(canvasLens.loadImage(invalidUrl)).resolves.not.toThrow();
    });
  });

  describe('Zoom and Pan', () => {
    beforeEach(() => {
      const options: CanvasLensOptions = {
        container,
        enableZoom: true,
        enablePan: true
      };
      canvasLens = CanvasLens.create(container, options);
    });

    it('should zoom in and out', () => {
      expect(() => {
        canvasLens.getCanvasLens().zoomIn();
        canvasLens.getCanvasLens().zoomOut();
      }).not.toThrow();
    });

    it('should get zoom level', () => {
      const zoomLevel = canvasLens.getCanvasLens().getZoomLevel();
      expect(zoomLevel).toBeGreaterThan(0);
    });

    it('should get pan offset', () => {
      const panOffset = canvasLens.getCanvasLens().getPanOffset();
      expect(panOffset).toHaveProperty('x');
      expect(panOffset).toHaveProperty('y');
    });
  });

  describe('Annotations', () => {
    beforeEach(() => {
      const options: CanvasLensOptions = {
        container,
        enableAnnotations: true
      };
      canvasLens = CanvasLens.create(container, options);
    });

    it('should activate annotation tool', () => {
      expect(() => {
        canvasLens.activateTool('rect');
      }).not.toThrow();
    });

    it('should deactivate annotation tool', () => {
      expect(() => {
        canvasLens.deactivateTool();
      }).not.toThrow();
    });

    it('should get active tool', () => {
      canvasLens.activateTool('rect');
      const activeTool = canvasLens.getActiveTool();
      expect(activeTool).toBe('rect');
    });
  });

  describe('Component Lifecycle', () => {
    it('should destroy component properly', () => {
      const options: CanvasLensOptions = {
        container
      };
      canvasLens = CanvasLens.create(container, options);

      expect(() => {
        canvasLens.destroy();
      }).not.toThrow();

      // Should not throw when trying to access destroyed component
      expect(() => {
        canvasLens.getCanvasLens();
      }).toThrow();
    });
  });
});
