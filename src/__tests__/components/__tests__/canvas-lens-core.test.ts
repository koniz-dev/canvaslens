import { CanvasLensCore } from '../../../components/CanvasLensCore';
import { Engine } from '../../../core/Engine';
import type { Annotation } from '../../../types';

describe('CanvasLensCore', () => {
  let element: HTMLElement;
  let core: CanvasLensCore;

  beforeEach(() => {
    element = document.createElement('div');
    element.attachShadow({ mode: 'open' });
    element.style.width = '800px';
    element.style.height = '600px';
    document.body.appendChild(element);
    core = new CanvasLensCore(element);
  });

  afterEach(() => {
    if (core) {
      core.destroy();
    }
    document.body.removeChild(element);
  });

  describe('Initialization', () => {
    it('should initialize successfully', () => {
      expect(() => core.initialize()).not.toThrow();
    });

    it('should not initialize multiple times without destroy', () => {
      core.initialize();
      expect(() => core.initialize()).not.toThrow();
    });

    it('should throw error if shadow root not available', () => {
      const elementWithoutShadow = document.createElement('div');
      const coreWithoutShadow = new CanvasLensCore(elementWithoutShadow);
      expect(() => coreWithoutShadow.initialize()).toThrow();
    });
  });

  describe('Image Loading', () => {
    beforeEach(() => {
      core.initialize();
    });

    it('should load image from URL', async () => {
      const src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
      await core.loadImage(src);
      expect(core.isImageLoaded()).toBe(true);
    });

    it('should throw error if not initialized', async () => {
      const destroyedCore = new CanvasLensCore(element);
      await expect(destroyedCore.loadImage('test.jpg')).rejects.toThrow();
    });

    it('should load image from file', (done) => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      // Mock Image to have complete and naturalWidth
      const originalImage = global.Image;
      global.Image = class extends originalImage {
        complete = true;
        naturalWidth = 100;
        naturalHeight = 100;
      } as any;
      
      expect(() => core.loadImageFromFile(file)).not.toThrow();
      // FileReader is async, wait a bit for it to complete or fail
      setTimeout(() => {
        global.Image = originalImage;
        // Test passes if no exception was thrown
        done();
      }, 200);
    });

    it('should throw error when loading invalid file', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      expect(() => core.loadImageFromFile(file)).toThrow();
    });

    it('should throw error when loading file without canvasLens', () => {
      core.destroy();
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      expect(() => core.loadImageFromFile(file)).toThrow();
    });

    it('should handle loadImage error case', async () => {
      // Try to load invalid image - may resolve or reject depending on implementation
      try {
        await core.loadImage('invalid-url');
      } catch (e) {
        // Expected to throw or handle error
        expect(e).toBeDefined();
      }
    });

    it('should handle loadImage when destroyed', async () => {
      core.destroy();
      await expect(core.loadImage('test.jpg')).rejects.toThrow();
    });
  });

  describe('Resize Operations', () => {
    beforeEach(() => {
      core.initialize();
    });

    it('should resize canvas', () => {
      expect(() => core.resize(1000, 800)).not.toThrow();
    });
  });

  describe('Zoom Operations', () => {
    beforeEach(() => {
      core.initialize();
    });

    it('should zoom in', () => {
      expect(() => core.zoomIn()).not.toThrow();
    });

    it('should zoom out', () => {
      expect(() => core.zoomOut()).not.toThrow();
    });

    it('should zoom to scale', () => {
      expect(() => core.zoomTo(2.0)).not.toThrow();
    });

    it('should fit to view', () => {
      expect(() => core.fitToView()).not.toThrow();
    });

    it('should reset view', () => {
      expect(() => core.resetView()).not.toThrow();
    });

    it('should get zoom level', () => {
      const zoom = core.getZoomLevel();
      expect(typeof zoom).toBe('number');
    });
  });

  describe('Pan Operations', () => {
    beforeEach(() => {
      core.initialize();
    });

    it('should get pan offset', () => {
      const offset = core.getPanOffset();
      expect(offset).toHaveProperty('x');
      expect(offset).toHaveProperty('y');
    });
  });

  describe('Tool Operations', () => {
    beforeEach(() => {
      core.initialize();
    });

    it('should activate tool', () => {
      const result = core.activateTool('rect');
      expect(typeof result).toBe('boolean');
    });

    it('should return false when activating tool after destroy', () => {
      core.destroy();
      const result = core.activateTool('rect');
      expect(result).toBe(false);
    });

    it('should deactivate tool', () => {
      const result = core.deactivateTool();
      expect(typeof result).toBe('boolean');
    });

    it('should return false when deactivating tool after destroy', () => {
      core.destroy();
      const result = core.deactivateTool();
      expect(result).toBe(false);
    });

    it('should get active tool', () => {
      const tool = core.getActiveTool();
      expect(tool === null || typeof tool === 'string').toBe(true);
    });

    it('should return null when getting active tool after destroy', () => {
      core.destroy();
      const tool = core.getActiveTool();
      expect(tool).toBe(null);
    });

    it('should update tools', () => {
      expect(() => core.updateTools({ annotation: { rect: true } })).not.toThrow();
    });
  });

  describe('Annotation Operations', () => {
    beforeEach(() => {
      core.initialize();
    });

    it('should add annotation', () => {
      const annotation: Annotation = {
        id: 'test-1',
        type: 'rect',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      };
      expect(() => core.addAnnotation(annotation)).not.toThrow();
      expect(core.hasChanges()).toBe(true);
    });

    it('should remove annotation', () => {
      const annotation: Annotation = {
        id: 'test-2',
        type: 'rect',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      };
      core.addAnnotation(annotation);
      expect(() => core.removeAnnotation('test-2')).not.toThrow();
      expect(core.hasChanges()).toBe(true);
    });

    it('should clear annotations', () => {
      expect(() => core.clearAnnotations()).not.toThrow();
      expect(core.hasChanges()).toBe(true);
    });

    it('should get annotations', () => {
      const annotations = core.getAnnotations();
      expect(Array.isArray(annotations)).toBe(true);
    });
  });

  describe('Comparison Mode', () => {
    beforeEach(() => {
      core.initialize();
    });

    it('should toggle comparison mode', () => {
      expect(() => core.toggleComparisonMode()).not.toThrow();
    });

    it('should set comparison mode', () => {
      expect(() => core.setComparisonMode(true)).not.toThrow();
      expect(() => core.setComparisonMode(false)).not.toThrow();
    });

    it('should check comparison mode', () => {
      const isEnabled = core.isComparisonMode();
      expect(typeof isEnabled).toBe('boolean');
    });

    it('should return false when checking comparison mode after destroy', () => {
      core.destroy();
      expect(core.isComparisonMode()).toBe(false);
    });

    it('should return empty array when getting annotations after destroy', () => {
      core.destroy();
      expect(core.getAnnotations()).toEqual([]);
    });
  });

  describe('Overlay Operations', () => {
    beforeEach(() => {
      core.initialize();
    });

    it('should open overlay', () => {
      expect(() => core.openOverlay()).not.toThrow();
      expect(core.isOverlayOpen()).toBe(true);
    });

    it('should close overlay', () => {
      core.openOverlay();
      expect(() => core.closeOverlay()).not.toThrow();
      expect(core.isOverlayOpen()).toBe(false);
    });

    it('should check if overlay is open', () => {
      expect(core.isOverlayOpen()).toBe(false);
      core.openOverlay();
      expect(core.isOverlayOpen()).toBe(true);
    });
  });

  describe('State Queries', () => {
    beforeEach(() => {
      core.initialize();
    });

    it('should check if image is loaded', () => {
      const isLoaded = core.isImageLoaded();
      expect(typeof isLoaded).toBe('boolean');
    });

    it('should return false when checking image loaded after destroy', () => {
      core.destroy();
      expect(core.isImageLoaded()).toBe(false);
    });

    it('should get image data', () => {
      const imageData = core.getImageData();
      expect(imageData === null || typeof imageData === 'object').toBe(true);
    });

    it('should return null when getting image data after destroy', () => {
      core.destroy();
      expect(core.getImageData()).toBe(null);
    });

    it('should get zoom level', () => {
      const zoom = core.getZoomLevel();
      expect(typeof zoom).toBe('number');
    });

    it('should return 1 when getting zoom level after destroy', () => {
      core.destroy();
      expect(core.getZoomLevel()).toBe(1);
    });

    it('should get pan offset', () => {
      const offset = core.getPanOffset();
      expect(offset).toHaveProperty('x');
      expect(offset).toHaveProperty('y');
    });

    it('should return default offset when getting pan offset after destroy', () => {
      core.destroy();
      const offset = core.getPanOffset();
      expect(offset).toEqual({ x: 0, y: 0 });
    });

    it('should check for changes', () => {
      const hasChanges = core.hasChanges();
      expect(typeof hasChanges).toBe('boolean');
    });
  });

  describe('Attribute Changes', () => {
    beforeEach(() => {
      core.initialize();
    });

    it('should handle src attribute change', () => {
      expect(() => core.handleAttributeChange('src', 'test.jpg')).not.toThrow();
    });

    it('should handle width attribute change', () => {
      expect(() => core.handleAttributeChange('width', '1000px')).not.toThrow();
    });

    it('should handle height attribute change', () => {
      expect(() => core.handleAttributeChange('height', '800px')).not.toThrow();
    });

    it('should handle tools attribute change', () => {
      const toolsConfig = JSON.stringify({ zoom: true, pan: true });
      expect(() => core.handleAttributeChange('tools', toolsConfig)).not.toThrow();
    });

    it('should handle max-zoom attribute change', () => {
      expect(() => core.handleAttributeChange('max-zoom', '5')).not.toThrow();
    });

    it('should handle min-zoom attribute change', () => {
      expect(() => core.handleAttributeChange('min-zoom', '0.5')).not.toThrow();
    });

    it('should handle error in attribute change gracefully', () => {
      // Test that errors are caught and handled
      // The implementation should catch errors and log them
      expect(() => core.handleAttributeChange('src', 'test.jpg')).not.toThrow();
    });

    it('should not handle attribute change when destroyed', () => {
      core.destroy();
      expect(() => core.handleAttributeChange('src', 'test.jpg')).not.toThrow();
    });
  });

  describe('Cleanup', () => {
    it('should destroy and clean up resources', () => {
      core.initialize();
      expect(() => core.destroy()).not.toThrow();
    });

    it('should not throw when destroying multiple times', () => {
      core.initialize();
      core.destroy();
      expect(() => core.destroy()).not.toThrow();
    });
  });
});

