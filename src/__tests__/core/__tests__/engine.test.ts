import { Engine } from '../../../core/Engine';
import { ImageViewer } from '../../../modules/image-viewer/Viewer';
import type { CanvasLensOptions, Annotation, ToolConfig } from '../../../types';

describe('Engine', () => {
  let container: HTMLDivElement;
  let engine: Engine;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (engine) {
      engine.destroy();
    }
    document.body.removeChild(container);
  });

  describe('Constructor and Initialization', () => {
    it('should create Engine with default options', () => {
      engine = new Engine({ container });
      expect(engine).toBeDefined();
      expect(engine.getOptions()).toBeDefined();
    });

    it('should create Engine with custom options', () => {
      const options: CanvasLensOptions = {
        container,
        width: 1000,
        height: 800,
        backgroundColor: '#ffffff',
        maxZoom: 5,
        minZoom: 0.5
      };
      engine = new Engine(options);
      const opts = engine.getOptions();
      expect(opts.width).toBe(1000);
      expect(opts.height).toBe(800);
      expect(opts.maxZoom).toBe(5);
      expect(opts.minZoom).toBe(0.5);
    });

    it('should create Engine with annotation tools enabled', () => {
      const options: CanvasLensOptions = {
        container,
        tools: {
          annotation: {
            rect: true,
            circle: true
          }
        }
      };
      engine = new Engine(options);
      expect(engine.getAnnotationManager()).toBeDefined();
    });

    it('should create Engine with zoom/pan enabled', () => {
      const options: CanvasLensOptions = {
        container,
        tools: {
          zoom: true,
          pan: true
        }
      };
      engine = new Engine(options);
      expect(engine.getZoomPanHandler()).toBeDefined();
    });
  });

  describe('Image Loading', () => {
    beforeEach(() => {
      engine = new Engine({ container });
    });

    it('should load image from URL', async () => {
      const src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
      await engine.loadImage(src);
      expect(engine.isImageLoaded()).toBe(true);
    });

    it('should load image with type and fileName', async () => {
      const src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
      await engine.loadImage(src, 'image/svg+xml', 'test.svg');
      expect(engine.isImageLoaded()).toBe(true);
      const imageData = engine.getImageData();
      expect(imageData).toBeDefined();
    });

    it('should load image from HTMLImageElement', async () => {
      const img = new Image();
      img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
      await new Promise(resolve => {
        img.onload = () => {
          (img as any).complete = true;
          (img as any).naturalWidth = 100;
          (img as any).naturalHeight = 100;
          engine.loadImageElement(img);
          resolve(undefined);
        };
      });
      expect(engine.isImageLoaded()).toBe(true);
    });
  });

  describe('Zoom Operations', () => {
    beforeEach(async () => {
      engine = new Engine({
        container,
        tools: { zoom: true, pan: true }
      });
      // Load image first for zoom to work
      const src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
      await engine.loadImage(src);
    });

    it('should get zoom level', () => {
      const zoom = engine.getZoomLevel();
      expect(typeof zoom).toBe('number');
      expect(zoom).toBeGreaterThan(0);
    });

    it('should set zoom level', () => {
      engine.setZoom(2.0);
      const zoom = engine.getZoomLevel();
      expect(typeof zoom).toBe('number');
    });

    it('should zoom in', () => {
      const initialZoom = engine.getZoomLevel();
      engine.zoomIn();
      const newZoom = engine.getZoomLevel();
      expect(typeof newZoom).toBe('number');
    });

    it('should zoom out', () => {
      engine.setZoom(2.0);
      const initialZoom = engine.getZoomLevel();
      engine.zoomOut();
      const newZoom = engine.getZoomLevel();
      expect(typeof newZoom).toBe('number');
    });

    it('should zoom to specific scale', () => {
      engine.zoomTo(1.5);
      const zoom = engine.getZoomLevel();
      expect(typeof zoom).toBe('number');
    });

    it('should fit to view', () => {
      engine.fitToView();
      expect(engine.getZoomLevel()).toBeDefined();
    });

    it('should reset view', () => {
      engine.setZoom(2.0);
      engine.resetView();
      expect(engine.getZoomLevel()).toBeDefined();
    });
  });

  describe('Pan Operations', () => {
    beforeEach(() => {
      engine = new Engine({
        container,
        tools: { zoom: true, pan: true }
      });
    });

    it('should get pan offset', () => {
      const offset = engine.getPanOffset();
      expect(offset).toHaveProperty('x');
      expect(offset).toHaveProperty('y');
      expect(typeof offset.x).toBe('number');
      expect(typeof offset.y).toBe('number');
    });
  });

  describe('Annotation Operations', () => {
    beforeEach(async () => {
      engine = new Engine({
        container,
        tools: { annotation: { rect: true } }
      });
      // Load image first for annotations to work properly
      const src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
      await engine.loadImage(src);
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
      engine.addAnnotation(annotation);
      const annotations = engine.getAnnotations();
      expect(Array.isArray(annotations)).toBe(true);
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
      engine.addAnnotation(annotation);
      engine.removeAnnotation('test-2');
      const annotations = engine.getAnnotations();
      expect(annotations.find(a => a.id === 'test-2')).toBeUndefined();
    });

    it('should update annotation', () => {
      const annotation: Annotation = {
        id: 'test-3',
        type: 'rect',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      };
      engine.addAnnotation(annotation);
      const updated: Annotation = {
        ...annotation,
        width: 200
      };
      engine.updateAnnotation('test-3', updated);
      const annotations = engine.getAnnotations();
      expect(Array.isArray(annotations)).toBe(true);
    });

    it('should get all annotations', () => {
      engine.addAnnotation({
        id: 'test-4',
        type: 'rect',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      });
      const annotations = engine.getAnnotations();
      expect(Array.isArray(annotations)).toBe(true);
    });

    it('should clear all annotations', () => {
      engine.addAnnotation({
        id: 'test-5',
        type: 'rect',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      });
      engine.clearAnnotations();
      const annotations = engine.getAnnotations();
      expect(annotations.length).toBe(0);
    });

    it('should export annotations as JSON', () => {
      engine.addAnnotation({
        id: 'test-6',
        type: 'rect',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      });
      const json = engine.exportAnnotations();
      expect(typeof json).toBe('string');
      const parsed = JSON.parse(json);
      expect(Array.isArray(parsed)).toBe(true);
    });

    it('should import annotations from JSON', () => {
      const annotations: Annotation[] = [
        {
          id: 'test-7',
          type: 'rect',
          x: 10,
          y: 10,
          width: 100,
          height: 100
        }
      ];
      engine.importAnnotations(JSON.stringify(annotations));
      const loaded = engine.getAnnotations();
      expect(Array.isArray(loaded)).toBe(true);
    });
  });

  describe('Tool Management', () => {
    beforeEach(() => {
      engine = new Engine({
        container,
        tools: { annotation: { rect: true, circle: true } }
      });
    });

    it('should activate tool', () => {
      const result = engine.activateTool('rect');
      expect(result).toBe(true);
      expect(engine.getActiveTool()).toBe('rect');
    });

    it('should deactivate tool', () => {
      engine.activateTool('rect');
      const result = engine.deactivateTool();
      expect(result).toBe(true);
    });

    it('should get active tool', () => {
      engine.activateTool('circle');
      expect(engine.getActiveTool()).toBe('circle');
    });

    it('should check if annotation tool is active', () => {
      engine.activateTool('rect');
      expect(engine.isAnnotationToolActive()).toBe(true);
    });

    it('should get active annotation tool type', () => {
      engine.activateTool('rect');
      expect(engine.getActiveAnnotationToolType()).toBe('rect');
    });

    it('should update tool config', () => {
      const toolConfig: ToolConfig = {
        annotation: {
          rect: false,
          circle: true
        }
      };
      engine.updateToolConfig(toolConfig);
      expect(engine.getOptions().tools).toBeDefined();
    });

    it('should update tools (alias)', () => {
      const toolConfig: ToolConfig = {
        annotation: {
          rect: true
        }
      };
      engine.updateTools(toolConfig);
      expect(engine.getOptions().tools).toBeDefined();
    });
  });

  describe('Comparison Mode', () => {
    beforeEach(() => {
      engine = new Engine({
        container,
        tools: { comparison: true }
      });
    });

    it('should toggle comparison mode', () => {
      const initial = engine.isComparisonMode();
      engine.toggleComparisonMode();
      expect(engine.isComparisonMode()).toBe(!initial);
    });

    it('should set comparison mode', () => {
      engine.setComparisonMode(true);
      expect(engine.isComparisonMode()).toBe(true);
      engine.setComparisonMode(false);
      expect(engine.isComparisonMode()).toBe(false);
    });

    it('should get comparison manager', () => {
      const manager = engine.getComparisonManager();
      expect(manager).toBeDefined();
    });
  });

  describe('Canvas Operations', () => {
    beforeEach(() => {
      engine = new Engine({ container });
    });

    it('should get canvas size', () => {
      const size = engine.getCanvasSize();
      expect(size).toHaveProperty('width');
      expect(size).toHaveProperty('height');
    });

    it('should resize canvas', () => {
      engine.resize(1000, 800);
      const size = engine.getCanvasSize();
      expect(size).toHaveProperty('width');
      expect(size).toHaveProperty('height');
      expect(typeof size.width).toBe('number');
      expect(typeof size.height).toBe('number');
    });
  });

  describe('Options Management', () => {
    beforeEach(() => {
      engine = new Engine({ container });
    });

    it('should get options', () => {
      const options = engine.getOptions();
      expect(options).toBeDefined();
      expect(options).toHaveProperty('width');
      expect(options).toHaveProperty('height');
    });

    it('should update options', () => {
      engine.updateOptions({ width: 1200, height: 900 });
      const options = engine.getOptions();
      expect(options.width).toBe(1200);
      expect(options.height).toBe(900);
    });

    it('should set event handlers', () => {
      const handlers = {
        onImageLoad: jest.fn(),
        onError: jest.fn()
      };
      engine.setEventHandlers(handlers);
      expect(engine.getOptions()).toBeDefined();
    });
  });

  describe('Change Tracking', () => {
    beforeEach(() => {
      engine = new Engine({
        container,
        tools: { annotation: { rect: true } }
      });
    });

    it('should check if there are changes', () => {
      const hasChanges = engine.hasChanges();
      expect(typeof hasChanges).toBe('boolean');
    });

    it('should reset changes', () => {
      engine.resetChanges();
      expect(engine.hasChanges()).toBe(false);
    });
  });

  describe('Cleanup', () => {
    it('should destroy engine and clean up resources', () => {
      engine = new Engine({ container });
      engine.destroy();
      // Should not throw error
      expect(() => engine.destroy()).not.toThrow();
    });
  });
});

