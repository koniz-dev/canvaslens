import { CanvasLens } from '../../../CanvasLens';
import type { Annotation, ToolConfig } from '../../../types';

describe('CanvasLens Web Component', () => {
  let element: CanvasLens;

  beforeEach(() => {
    if (!customElements.get('canvas-lens')) {
      customElements.define('canvas-lens', CanvasLens);
    }
    element = document.createElement('canvas-lens') as CanvasLens;
    element.setAttribute('width', '800px');
    element.setAttribute('height', '600px');
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  });

  describe('Component Lifecycle', () => {
    it('should have observed attributes', () => {
      const attributes = CanvasLens.observedAttributes;
      expect(attributes).toContain('src');
      expect(attributes).toContain('width');
      expect(attributes).toContain('height');
    });

    it('should initialize when connected to DOM', () => {
      const newElement = document.createElement('canvas-lens') as CanvasLens;
      document.body.appendChild(newElement);
      expect(newElement.shadowRoot).toBeDefined();
      document.body.removeChild(newElement);
    });

    it('should clean up when disconnected from DOM', () => {
      const newElement = document.createElement('canvas-lens') as CanvasLens;
      document.body.appendChild(newElement);
      document.body.removeChild(newElement);
      // Should not throw
      expect(() => {
        document.body.appendChild(newElement);
        document.body.removeChild(newElement);
      }).not.toThrow();
    });
  });

  describe('Image Loading', () => {
    it('should load image from URL', async () => {
      const src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
      await element.loadImage(src);
      expect(element.isImageLoaded()).toBe(true);
    });

    it('should throw error if not initialized', async () => {
      const uninitialized = document.createElement('canvas-lens') as CanvasLens;
      await expect(uninitialized.loadImage('test.jpg')).rejects.toThrow();
    });

    it('should load image from file', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      expect(() => element.loadImageFromFile(file)).not.toThrow();
    });
  });

  describe('Resize Operations', () => {
    it('should resize canvas', () => {
      expect(() => element.resize(1000, 800)).not.toThrow();
    });
  });

  describe('Zoom Operations', () => {
    it('should zoom in', () => {
      expect(() => element.zoomIn()).not.toThrow();
    });

    it('should zoom out', () => {
      expect(() => element.zoomOut()).not.toThrow();
    });

    it('should zoom to scale', () => {
      expect(() => element.zoomTo(2.0)).not.toThrow();
    });

    it('should fit to view', () => {
      expect(() => element.fitToView()).not.toThrow();
    });

    it('should reset view', () => {
      expect(() => element.resetView()).not.toThrow();
    });

    it('should get zoom level', () => {
      const zoom = element.getZoomLevel();
      expect(typeof zoom).toBe('number');
      expect(zoom).toBeGreaterThan(0);
    });
  });

  describe('Pan Operations', () => {
    it('should get pan offset', () => {
      const offset = element.getPanOffset();
      expect(offset).toHaveProperty('x');
      expect(offset).toHaveProperty('y');
      expect(typeof offset.x).toBe('number');
      expect(typeof offset.y).toBe('number');
    });
  });

  describe('Tool Operations', () => {
    it('should activate tool', () => {
      const result = element.activateTool('rect');
      expect(typeof result).toBe('boolean');
    });

    it('should deactivate tool', () => {
      const result = element.deactivateTool();
      expect(typeof result).toBe('boolean');
    });

    it('should get active tool', () => {
      const tool = element.getActiveTool();
      expect(tool === null || typeof tool === 'string').toBe(true);
    });

    it('should update tools', () => {
      const toolConfig: ToolConfig = {
        annotation: { rect: true }
      };
      expect(() => element.updateTools(toolConfig)).not.toThrow();
    });
  });

  describe('Annotation Operations', () => {
    it('should add annotation', () => {
      const annotation: Annotation = {
        id: 'test-1',
        type: 'rect',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      };
      expect(() => element.addAnnotation(annotation)).not.toThrow();
    });

    it('should remove annotation', () => {
      expect(() => element.removeAnnotation('test-id')).not.toThrow();
    });

    it('should clear annotations', () => {
      expect(() => element.clearAnnotations()).not.toThrow();
    });

    it('should get annotations', () => {
      const annotations = element.getAnnotations();
      expect(Array.isArray(annotations)).toBe(true);
    });
  });

  describe('Comparison Mode', () => {
    it('should toggle comparison mode', () => {
      expect(() => element.toggleComparisonMode()).not.toThrow();
    });

    it('should set comparison mode', () => {
      expect(() => element.setComparisonMode(true)).not.toThrow();
      expect(() => element.setComparisonMode(false)).not.toThrow();
    });

    it('should check comparison mode', () => {
      const isEnabled = element.isComparisonMode();
      expect(typeof isEnabled).toBe('boolean');
    });
  });

  describe('Overlay Operations', () => {
    it('should open overlay', () => {
      expect(() => element.openOverlay()).not.toThrow();
      expect(element.isOverlayOpen()).toBe(true);
    });

    it('should close overlay', () => {
      element.openOverlay();
      expect(() => element.closeOverlay()).not.toThrow();
      expect(element.isOverlayOpen()).toBe(false);
    });

    it('should check if overlay is open', () => {
      expect(element.isOverlayOpen()).toBe(false);
      element.openOverlay();
      expect(element.isOverlayOpen()).toBe(true);
    });
  });

  describe('State Queries', () => {
    it('should check if image is loaded', () => {
      const isLoaded = element.isImageLoaded();
      expect(typeof isLoaded).toBe('boolean');
    });

    it('should get image data', () => {
      const imageData = element.getImageData();
      expect(imageData === null || typeof imageData === 'object').toBe(true);
    });

    it('should check for changes', () => {
      const hasChanges = element.hasChanges();
      expect(typeof hasChanges).toBe('boolean');
    });
  });

  describe('Attribute Changes', () => {
    it('should handle src attribute change', () => {
      element.setAttribute('src', 'test.jpg');
      // Should not throw
      expect(element.getAttribute('src')).toBe('test.jpg');
    });

    it('should handle width attribute change', () => {
      element.setAttribute('width', '1000px');
      expect(element.getAttribute('width')).toBe('1000px');
    });

    it('should handle height attribute change', () => {
      element.setAttribute('height', '800px');
      expect(element.getAttribute('height')).toBe('800px');
    });
  });
});

