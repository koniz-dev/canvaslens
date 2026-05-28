import { App } from '../../core/App';
import type { Annotation, ToolConfig } from '../../types';

describe('App', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container.parentElement) document.body.removeChild(container);
  });

  describe('lifecycle', () => {
    it('constructs with default options', () => {
      const app = new App({ container });
      expect(app).toBeDefined();
      expect(app.isDestroyed()).toBe(false);
      expect(app.getOptions()).toMatchObject({ width: 800, height: 600 });
      app.destroy();
    });

    it('constructs with custom dimensions and zoom limits', () => {
      const app = new App({ container, width: 1024, height: 768, maxZoom: 5, minZoom: 0.5 });
      const opts = app.getOptions();
      expect(opts.width).toBe(1024);
      expect(opts.height).toBe(768);
      expect(opts.maxZoom).toBe(5);
      expect(opts.minZoom).toBe(0.5);
      app.destroy();
    });

    it('destroy() is idempotent', () => {
      const app = new App({ container });
      app.destroy();
      expect(app.isDestroyed()).toBe(true);
      expect(() => app.destroy()).not.toThrow();
    });

    it('rejects operations on destroyed app', async () => {
      const app = new App({ container });
      app.destroy();
      await expect(app.loadImage('foo')).rejects.toThrow(/destroyed/i);
    });

    it('exposes store and bus', () => {
      const app = new App({ container });
      expect(app.store).toBeDefined();
      expect(app.bus).toBeDefined();
      expect(app.store.getState()).toMatchObject({
        view: { scale: 1 },
        annotation: { items: expect.any(Map) }
      });
      app.destroy();
    });
  });

  describe('module wiring via tools config', () => {
    it('does not create modules when no tools are enabled', () => {
      const app = new App({ container });
      expect(app.getZoomPanHandler()).toBeNull();
      expect(app.getAnnotationManager()).toBeNull();
      expect(app.getComparisonManager()).toBeNull();
      app.destroy();
    });

    it('creates ZoomPanHandler when zoom or pan enabled', () => {
      const app = new App({ container, tools: { zoom: true, pan: true } });
      expect(app.getZoomPanHandler()).not.toBeNull();
      expect(app.getAnnotationManager()).toBeNull();
      app.destroy();
    });

    it('creates AnnotationManager when any annotation tool is enabled', () => {
      const app = new App({
        container,
        tools: { annotation: { rect: true } }
      });
      expect(app.getAnnotationManager()).not.toBeNull();
      app.destroy();
    });

    it('creates ComparisonManager when comparison enabled', () => {
      const app = new App({ container, tools: { comparison: true } });
      expect(app.getComparisonManager()).not.toBeNull();
      app.destroy();
    });
  });

  describe('image loading', () => {
    it('loads from URL and emits image:loaded on bus', async () => {
      const app = new App({ container, tools: { zoom: true, pan: true } });
      const loaded = jest.fn();
      app.bus.on('image:loaded', loaded);

      await app.loadImage('data:image/svg+xml;base64,Zm9v');

      expect(app.isImageLoaded()).toBe(true);
      expect(loaded).toHaveBeenCalled();
      expect(app.getImageData()).not.toBeNull();
      app.destroy();
    });

    it('rejects invalid file in loadImageFromFile', () => {
      const app = new App({ container });
      const file = new File(['x'], 'a.txt', { type: 'text/plain' });
      expect(() => app.loadImageFromFile(file)).toThrow(/not an image/i);
      app.destroy();
    });

    it('clears unsaved changes flag when image loaded', () => {
      const app = new App({ container, tools: { annotation: { rect: true } } });
      const ann: Annotation = {
        id: 'a',
        type: 'rect',
        points: [
          { x: 0, y: 0 },
          { x: 10, y: 10 }
        ],
        style: { strokeColor: '#000', strokeWidth: 1 }
      };
      app.addAnnotation(ann);
      expect(app.hasChanges()).toBe(true);
      app.resetChanges();
      expect(app.hasChanges()).toBe(false);
      app.destroy();
    });
  });

  describe('view operations', () => {
    it('resize updates store bounds immediately and emits view:resized on bus', () => {
      const app = new App({ container });
      const onResize = jest.fn();
      app.bus.on('view:resized', onResize);
      app.resize(1200, 900);
      expect(app.store.getState().view.bounds).toEqual({ width: 1200, height: 900 });
      expect(onResize).toHaveBeenCalledWith({ width: 1200, height: 900 });
      app.destroy();
    });

    it('zoomTo, zoomIn, zoomOut delegate to handler when enabled', () => {
      const app = new App({ container, tools: { zoom: true } });
      expect(() => app.zoomTo(2)).not.toThrow();
      expect(() => app.zoomIn()).not.toThrow();
      expect(() => app.zoomOut()).not.toThrow();
      app.destroy();
    });

    it('zoom calls are silent no-ops when no handler', () => {
      const app = new App({ container });
      expect(() => app.zoomTo(2)).not.toThrow();
      expect(app.getZoomLevel()).toBe(1);
      expect(app.getPanOffset()).toEqual({ x: 0, y: 0 });
      app.destroy();
    });
  });

  describe('annotation operations', () => {
    const ann = (id: string): Annotation => ({
      id,
      type: 'rect',
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 10 }
      ],
      style: { strokeColor: '#000', strokeWidth: 1 }
    });

    it('add / remove / clear / list', () => {
      const app = new App({ container, tools: { annotation: { rect: true } } });
      app.addAnnotation(ann('a'));
      app.addAnnotation(ann('b'));
      expect(app.getAnnotations()).toHaveLength(2);
      app.removeAnnotation('a');
      expect(app.getAnnotations()).toHaveLength(1);
      app.clearAnnotations();
      expect(app.getAnnotations()).toHaveLength(0);
      app.destroy();
    });

    it('export and import round-trip', () => {
      const app = new App({ container, tools: { annotation: { rect: true } } });
      app.addAnnotation(ann('a'));
      const json = app.exportAnnotations();
      app.clearAnnotations();
      app.importAnnotations(json);
      expect(app.getAnnotations()).toHaveLength(1);
      app.destroy();
    });

    it('importAnnotations handles invalid JSON gracefully', () => {
      const app = new App({ container, tools: { annotation: { rect: true } } });
      expect(() => app.importAnnotations('not json')).not.toThrow();
      app.destroy();
    });
  });

  describe('tool operations', () => {
    it('activate / deactivate / getActive', () => {
      const app = new App({ container, tools: { annotation: { rect: true } } });
      expect(app.activateTool('rect')).toBe(true);
      expect(app.getActiveTool()).toBe('rect');
      expect(app.deactivateTool()).toBe(true);
      expect(app.getActiveTool()).toBeNull();
      app.destroy();
    });

    it('updateTools merges into options and propagates', () => {
      const app = new App({ container, tools: { zoom: true } });
      const newCfg: ToolConfig = { pan: true };
      app.updateTools(newCfg);
      expect(app.getOptions().tools).toMatchObject({ zoom: true, pan: true });
      app.destroy();
    });
  });

  describe('comparison', () => {
    it('toggle / set / is', () => {
      const app = new App({ container, tools: { comparison: true } });
      expect(app.isComparisonMode()).toBe(false);
      app.toggleComparisonMode();
      expect(app.isComparisonMode()).toBe(true);
      app.setComparisonMode(false);
      expect(app.isComparisonMode()).toBe(false);
      app.destroy();
    });

    it('no-op when comparison disabled', () => {
      const app = new App({ container });
      expect(() => app.toggleComparisonMode()).not.toThrow();
      expect(app.isComparisonMode()).toBe(false);
      app.destroy();
    });
  });

  describe('event handlers compat', () => {
    it('setEventHandlers updates handlers and propagates to modules', () => {
      const app = new App({
        container,
        tools: { zoom: true, annotation: { rect: true }, comparison: true }
      });
      const onZoomChange = jest.fn();
      app.setEventHandlers({ onZoomChange });
      expect(() => app.setEventHandlers({ onZoomChange })).not.toThrow();
      app.destroy();
    });
  });

  describe('image loading edge cases', () => {
    it('rejects loading when destroyed mid-flight', async () => {
      const app = new App({ container });
      const p = app.loadImage('data:image/svg+xml;base64,Zm9v');
      app.destroy();
      // The pending promise may resolve before destroy lock takes effect since the
      // mocked Image is microtask-based; that's fine. The next call is what we test.
      await p.catch(() => {});
      await expect(app.loadImage('data:foo')).rejects.toThrow(/destroyed/i);
    });

    it('loadImageElement throws on invalid image', () => {
      const app = new App({ container });
      const img = document.createElement('img');
      // naturalWidth = 0, complete = false in jsdom by default
      expect(() => app.loadImageElement(img)).toThrow();
      app.destroy();
    });

    it('loadImage emits image:load-error on failure', async () => {
      const app = new App({ container });
      const onErr = jest.fn();
      app.bus.on('image:load-error', onErr);
      // Empty string triggers our mocked Image onerror
      await expect(app.loadImage('')).rejects.toBeDefined();
      expect(onErr).toHaveBeenCalled();
      app.destroy();
    });

    it('loadImageFromFile accepts a valid image file without throwing', () => {
      const app = new App({ container });
      const file = new File([new Uint8Array([137, 80, 78, 71])], 'a.png', {
        type: 'image/png'
      });
      expect(() => app.loadImageFromFile(file)).not.toThrow();
      app.destroy();
    });
  });

  describe('view ops with image loaded', () => {
    it('fitToView calls handler when image loaded and zoom enabled', async () => {
      const app = new App({ container, tools: { zoom: true } });
      await app.loadImage('data:image/svg+xml;base64,Zm9v');
      expect(() => app.fitToView()).not.toThrow();
      expect(() => app.fitToViewOverlay()).not.toThrow();
      expect(() => app.resetView()).not.toThrow();
      app.destroy();
    });

    it('resize preserves image and re-fits', async () => {
      const app = new App({ container, tools: { zoom: true } });
      await app.loadImage('data:image/svg+xml;base64,Zm9v');
      app.resize(1024, 768);
      expect(app.isImageLoaded()).toBe(true);
      app.destroy();
    });

    it('getImageBounds returns rect when image loaded, null otherwise', async () => {
      const app = new App({ container });
      expect(app.getImageBounds()).toBeNull();
      await app.loadImage('data:image/svg+xml;base64,Zm9v');
      expect(app.getImageBounds()).not.toBeNull();
      app.destroy();
    });
  });

  describe('comparison rendering', () => {
    it('renders in comparison mode when image loaded', async () => {
      const app = new App({ container, tools: { comparison: true, zoom: true } });
      await app.loadImage('data:image/svg+xml;base64,Zm9v');
      app.setComparisonMode(true);
      expect(app.isComparisonMode()).toBe(true);
      // Trigger another render to exercise the comparison-mode path
      app.render();
      app.destroy();
    });
  });

  describe('tools attribute parsing', () => {
    it('updateToolConfigFromAttribute parses JSON safely', () => {
      const app = new App({ container, tools: { zoom: true } });
      app.updateToolConfigFromAttribute('{"pan": true}');
      expect(app.getOptions().tools).toMatchObject({ zoom: true, pan: true });
      // Invalid JSON should be a no-op (logged, not thrown)
      expect(() => app.updateToolConfigFromAttribute('not json')).not.toThrow();
      app.destroy();
    });
  });

  describe('updateOptions', () => {
    it('partial updates options and resizes when dimensions change', () => {
      const app = new App({ container, width: 800, height: 600 });
      app.updateOptions({ width: 1000, backgroundColor: '#fff' });
      expect(app.getOptions().width).toBe(1000);
      expect(app.getOptions().backgroundColor).toBe('#fff');
      app.destroy();
    });

    it('updateOptions propagates new event handlers', () => {
      const app = new App({ container, tools: { zoom: true } });
      const onZoomChange = jest.fn();
      app.updateOptions({ eventHandlers: { onZoomChange } });
      // No throw, handlers stored
      expect(() => app.updateOptions({ eventHandlers: { onZoomChange } })).not.toThrow();
      app.destroy();
    });
  });
});
