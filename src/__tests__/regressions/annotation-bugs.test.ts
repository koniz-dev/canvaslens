/**
 * Regression tests for the four annotation bugs reported in the v2.0.x audit:
 *   1. Annotations couldn't be resized — no handles existed.
 *   2. Annotations could be dragged outside the loaded image's bounds.
 *   3a. Text annotations rendered with default fontSize 16 were nearly
 *       invisible on busy backgrounds.
 *   3b. After activating the text tool the cursor stayed as "text" when
 *       the user switched to another tool.
 */
import { App } from '../../core/App';
import { Renderer } from '../../core/Renderer';
import type { Annotation, Point } from '../../types';

function bound(canvas: HTMLCanvasElement, w = 800, h = 600): void {
  canvas.getBoundingClientRect = () =>
    ({
      left: 0,
      top: 0,
      right: w,
      bottom: h,
      width: w,
      height: h,
      x: 0,
      y: 0,
      toJSON: () => ({})
    }) as DOMRect;
}

function mouseAt(target: EventTarget, type: string, x: number, y: number, button = 0): void {
  target.dispatchEvent(
    new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button })
  );
}

function setupApp(opts: { tools?: any } = {}): App {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const app = new App({
    container,
    width: 800,
    height: 600,
    tools: opts.tools ?? {
      annotation: {
        rect: true,
        arrow: true,
        text: true,
        circle: true,
        line: true,
        style: { strokeColor: '#000', strokeWidth: 2 }
      }
    }
  });
  const img = new Image();
  Object.defineProperty(img, 'naturalWidth', { value: 800 });
  Object.defineProperty(img, 'naturalHeight', { value: 600 });
  Object.defineProperty(img, 'complete', { value: true });
  app.loadImageElement(img);
  bound(app.getCanvas().getElement());
  return app;
}

const ann = (id: string, type: Annotation['type'], pts: Point[]): Annotation => ({
  id,
  type,
  points: pts,
  style: { strokeColor: '#000', strokeWidth: 2 }
});

describe('Annotation bug fixes', () => {
  let app: App;
  afterEach(() => {
    app?.destroy();
    document.body.innerHTML = '';
  });

  describe('#1 — resize handles', () => {
    it('rect: 4 corner handles, drag bottom-right to grow', () => {
      app = setupApp();
      const a = ann('r', 'rect', [
        { x: 100, y: 100 },
        { x: 200, y: 200 }
      ]);
      app.addAnnotation(a);
      app.getAnnotationManager()!.selectAnnotation(a);
      app.deactivateTool();

      const am = app.getAnnotationManager()!;
      const handles = am.getHandlePoints(a);
      expect(handles).toHaveLength(4);
      // Corners in order: TL, TR, BR, BL
      expect(handles[0]).toEqual({ x: 100, y: 100 });
      expect(handles[2]).toEqual({ x: 200, y: 200 });

      // Grab the BR handle and drag it.
      const canvas = app.getCanvas().getElement();
      mouseAt(canvas, 'mousedown', 200, 200);
      canvas.dispatchEvent(
        new MouseEvent('mousemove', {
          bubbles: true,
          clientX: 300,
          clientY: 280
        })
      );
      mouseAt(canvas, 'mouseup', 300, 280);

      const updated = app.getAnnotations()[0]!;
      expect(updated.points[1]).toEqual({ x: 300, y: 280 });
    });

    it('circle: single edge handle resizes radius', () => {
      app = setupApp();
      const a = ann('c', 'circle', [
        { x: 200, y: 200 }, // centre
        { x: 250, y: 200 } // edge (radius 50)
      ]);
      app.addAnnotation(a);
      app.getAnnotationManager()!.selectAnnotation(a);
      app.deactivateTool();

      const handles = app.getAnnotationManager()!.getHandlePoints(a);
      expect(handles).toEqual([{ x: 250, y: 200 }]);

      const canvas = app.getCanvas().getElement();
      mouseAt(canvas, 'mousedown', 250, 200);
      canvas.dispatchEvent(
        new MouseEvent('mousemove', { bubbles: true, clientX: 300, clientY: 200 })
      );
      mouseAt(canvas, 'mouseup', 300, 200);

      const updated = app.getAnnotations()[0]!;
      expect(updated.points[1]).toEqual({ x: 300, y: 200 });
    });

    it('line/arrow: 2 endpoint handles', () => {
      app = setupApp();
      const a = ann('l', 'arrow', [
        { x: 100, y: 100 },
        { x: 200, y: 200 }
      ]);
      app.addAnnotation(a);
      app.getAnnotationManager()!.selectAnnotation(a);
      app.deactivateTool();

      const handles = app.getAnnotationManager()!.getHandlePoints(a);
      expect(handles).toHaveLength(2);
      expect(handles[0]).toEqual({ x: 100, y: 100 });
      expect(handles[1]).toEqual({ x: 200, y: 200 });
    });

    it('text annotations expose no handles (no meaningful resize)', () => {
      app = setupApp();
      const a = ann('t', 'text', [{ x: 100, y: 100 }]);
      // text annotations need data.text to render but it's not required for handles
      app.addAnnotation(a);
      expect(app.getAnnotationManager()!.getHandlePoints(a)).toEqual([]);
    });
  });

  describe('#7 — circle stays inside image bounds', () => {
    it('drawing a circle with a far edge shrinks the radius to fit', () => {
      app = setupApp();
      app.activateTool('circle');
      const canvas = app.getCanvas().getElement();
      // Centre near top-left, edge clamped to image rect first, then radius shrunk.
      mouseAt(canvas, 'mousedown', 50, 50);
      document.dispatchEvent(
        new MouseEvent('mousemove', { bubbles: true, clientX: 5000, clientY: 5000 })
      );
      document.dispatchEvent(
        new MouseEvent('mouseup', { bubbles: true, clientX: 5000, clientY: 5000 })
      );

      const c = app.getAnnotations()[0]!;
      expect(c.type).toBe('circle');
      const [center, edge] = c.points;
      const radius = Math.hypot(edge!.x - center!.x, edge!.y - center!.y);
      // The maximum radius from (50, 50) inside 0..800 / 0..600 is min(50,750,50,550) = 50.
      expect(radius).toBeLessThanOrEqual(50 + 0.001);
      // The whole circle must be inside the image.
      expect(center!.x - radius).toBeGreaterThanOrEqual(-0.001);
      expect(center!.y - radius).toBeGreaterThanOrEqual(-0.001);
      expect(center!.x + radius).toBeLessThanOrEqual(800 + 0.001);
      expect(center!.y + radius).toBeLessThanOrEqual(600 + 0.001);
    });

    it('resizing the edge handle past the image clamps the radius', () => {
      app = setupApp();
      const a = ann('c', 'circle', [
        { x: 300, y: 300 },
        { x: 320, y: 300 }
      ]);
      app.addAnnotation(a);
      app.getAnnotationManager()!.selectAnnotation(a);
      app.deactivateTool();

      const canvas = app.getCanvas().getElement();
      mouseAt(canvas, 'mousedown', 320, 300); // grab the edge handle
      canvas.dispatchEvent(
        new MouseEvent('mousemove', { bubbles: true, clientX: 5000, clientY: 5000 })
      );
      mouseAt(canvas, 'mouseup', 5000, 5000);

      const c = app.getAnnotations()[0]!;
      const [center, edge] = c.points;
      const radius = Math.hypot(edge!.x - center!.x, edge!.y - center!.y);
      // (300,300) in 0..800 / 0..600 → maxRadius = min(300,500,300,300) = 300
      expect(radius).toBeLessThanOrEqual(300 + 0.001);
    });

    it('drag-move clamps using the actual circle bbox (centre ± radius)', () => {
      app = setupApp();
      const a = ann('c', 'circle', [
        { x: 400, y: 300 },
        { x: 500, y: 300 } // radius 100
      ]);
      app.addAnnotation(a);
      app.deactivateTool();

      const canvas = app.getCanvas().getElement();
      mouseAt(canvas, 'mousedown', 400, 300); // grab the centre area (no handle there)
      canvas.dispatchEvent(
        new MouseEvent('mousemove', { bubbles: true, clientX: -1000, clientY: -1000 })
      );
      mouseAt(canvas, 'mouseup', -1000, -1000);

      const c = app.getAnnotations()[0]!;
      const [center, edge] = c.points;
      const radius = Math.hypot(edge!.x - center!.x, edge!.y - center!.y);
      // Whole circle still inside 0..800 / 0..600 after the huge drag.
      expect(center!.x - radius).toBeGreaterThanOrEqual(-0.001);
      expect(center!.y - radius).toBeGreaterThanOrEqual(-0.001);
      expect(center!.x + radius).toBeLessThanOrEqual(800 + 0.001);
      expect(center!.y + radius).toBeLessThanOrEqual(600 + 0.001);
    });
  });

  describe('#2 — drag clamps to image bounds', () => {
    it('rect dragged way outside is clamped so it stays in the image', () => {
      app = setupApp();
      const a = ann('r', 'rect', [
        { x: 400, y: 300 },
        { x: 500, y: 400 }
      ]);
      app.addAnnotation(a);
      app.deactivateTool();

      const canvas = app.getCanvas().getElement();
      // mousedown inside the rect to start drag
      mouseAt(canvas, 'mousedown', 450, 350);
      // huge drag to top-left, far off canvas
      canvas.dispatchEvent(
        new MouseEvent('mousemove', { bubbles: true, clientX: -500, clientY: -500 })
      );
      mouseAt(canvas, 'mouseup', -500, -500);

      const moved = app.getAnnotations()[0]!;
      // Image bounds: (0,0)-(800,600) for an 800x600 canvas + loaded image.
      // The rectangle should be inside.
      for (const p of moved.points) {
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.y).toBeGreaterThanOrEqual(0);
        expect(p.x).toBeLessThanOrEqual(800);
        expect(p.y).toBeLessThanOrEqual(600);
      }
    });
  });

  describe('#3a — text annotation rendering', () => {
    it('default fontSize bumped from 16 to 20 for visibility', () => {
      app = setupApp();
      const a = app.getAnnotationManager()!;
      // Triggering activateTool('text') wires the default style; we read the
      // store-level default.
      expect(app.store.getState().annotation.defaultStyle.fontSize).toBe(20);
    });

    it('AnnotationRenderer applies a contrast outline before fill', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      const canvas = new Renderer(container, { width: 800, height: 600 });
      const ctx = canvas.getContext();
      const strokeSpy = jest.spyOn(ctx, 'strokeText');
      const fillSpy = jest.spyOn(ctx, 'fillText');

      // Render a text annotation directly via the renderer.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { AnnotationRenderer } = require('../../modules/annotation/Renderer');
      const r = new AnnotationRenderer(canvas);
      r.render({
        id: 't',
        type: 'text',
        points: [{ x: 50, y: 50 }],
        data: { text: 'Hi' },
        style: { strokeColor: '#e63946', strokeWidth: 2, fontSize: 20 }
      });
      expect(strokeSpy).toHaveBeenCalledWith('Hi', 50, 50);
      expect(fillSpy).toHaveBeenCalledWith('Hi', 50, 50);
      canvas.destroy();
    });
  });

  describe('#4 — updateTools(style) propagates to subsequent draws', () => {
    it('a rect drawn after updateTools uses the new style', () => {
      app = setupApp();
      const canvas = app.getCanvas().getElement();
      app.activateTool('rect');
      mouseAt(canvas, 'mousedown', 50, 50);
      document.dispatchEvent(
        new MouseEvent('mousemove', { bubbles: true, clientX: 150, clientY: 130 })
      );
      document.dispatchEvent(
        new MouseEvent('mouseup', { bubbles: true, clientX: 150, clientY: 130 })
      );

      app.updateTools({
        annotation: {
          rect: true,
          style: { strokeColor: '#0066cc', strokeWidth: 8, lineStyle: 'dashed' }
        }
      });

      mouseAt(canvas, 'mousedown', 200, 50);
      document.dispatchEvent(
        new MouseEvent('mousemove', { bubbles: true, clientX: 300, clientY: 130 })
      );
      document.dispatchEvent(
        new MouseEvent('mouseup', { bubbles: true, clientX: 300, clientY: 130 })
      );

      const list = app.getAnnotations();
      expect(list).toHaveLength(2);
      expect(list[1]!.style.strokeColor).toBe('#0066cc');
      expect(list[1]!.style.strokeWidth).toBe(8);
      expect(list[1]!.style.lineStyle).toBe('dashed');
      // First rect must keep its original style.
      expect(list[0]!.style.strokeColor).not.toBe('#0066cc');
    });
  });

  describe('#5 — updateSelectedAnnotationStyle', () => {
    it('updates the selected annotation in place, leaves others alone', () => {
      app = setupApp();
      const a = ann('a1', 'rect', [
        { x: 50, y: 50 },
        { x: 150, y: 150 }
      ]);
      const b = ann('b1', 'rect', [
        { x: 200, y: 50 },
        { x: 300, y: 150 }
      ]);
      app.addAnnotation(a);
      app.addAnnotation(b);
      app.getAnnotationManager()!.selectAnnotation(a);

      const ok = app.updateSelectedAnnotationStyle({
        strokeColor: '#00aa00',
        strokeWidth: 10,
        fillColor: 'rgba(0,170,0,0.25)'
      });
      expect(ok).toBe(true);

      const list = app.getAnnotations();
      expect(list.find((x) => x.id === 'a1')!.style.strokeColor).toBe('#00aa00');
      expect(list.find((x) => x.id === 'a1')!.style.fillColor).toBe('rgba(0,170,0,0.25)');
      // The other rect retains its original style.
      expect(list.find((x) => x.id === 'b1')!.style.strokeColor).toBe('#000');
    });

    it('returns false when no annotation is selected', () => {
      app = setupApp();
      app.addAnnotation(
        ann('x', 'rect', [
          { x: 0, y: 0 },
          { x: 10, y: 10 }
        ])
      );
      // No selection.
      expect(app.updateSelectedAnnotationStyle({ strokeColor: '#0f0' })).toBe(false);
    });
  });

  describe('#6 — text tool works for multiple sequential annotations', () => {
    function typeText(app: App, x: number, y: number, value: string, done: () => void): void {
      const canvas = app.getCanvas().getElement();
      mouseAt(canvas, 'mousedown', x, y);
      // The text tool focuses asynchronously via two rAFs.
      setTimeout(() => {
        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (!input) {
          done();
          return;
        }
        input.value = value;
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        // completeTextInput uses setTimeout 0 to dispatch annotationCreated.
        setTimeout(done, 30);
      }, 30);
    }

    it('creates three text annotations in sequence', (done) => {
      app = setupApp();
      app.activateTool('text');

      typeText(app, 100, 100, 'one', () => {
        expect(app.getAnnotations()).toHaveLength(1);
        typeText(app, 200, 200, 'two', () => {
          expect(app.getAnnotations()).toHaveLength(2);
          typeText(app, 300, 300, 'three', () => {
            expect(app.getAnnotations()).toHaveLength(3);
            const types = app.getAnnotations().map((a) => a.type);
            expect(types.every((t) => t === 'text')).toBe(true);
            const texts = app.getAnnotations().map((a) => a.data?.text);
            expect(texts).toEqual(['one', 'two', 'three']);
            done();
          });
        });
      });
    });
  });

  describe('#8 — overlay opens with the source App\'s image + annotations', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { OverlayManager } = require('../../components/OverlayManager');

    it('seeds the overlay App with the source image element', () => {
      app = setupApp();
      const mgr = new OverlayManager(document.createElement('div'));
      mgr.openOverlay({ sourceApp: app });
      const ov = mgr.getOverlayApp();
      expect(ov).toBeDefined();
      expect(ov.isImageLoaded()).toBe(true);
      mgr.closeOverlay();
    });

    it('copies source annotations into the overlay on open', () => {
      app = setupApp();
      app.addAnnotation(
        ann('a', 'rect', [
          { x: 10, y: 10 },
          { x: 50, y: 50 }
        ])
      );
      app.addAnnotation(
        ann('b', 'circle', [
          { x: 200, y: 200 },
          { x: 220, y: 200 }
        ])
      );
      const mgr = new OverlayManager(document.createElement('div'));
      mgr.openOverlay({ sourceApp: app });
      const ov = mgr.getOverlayApp();
      expect(ov.getAnnotations()).toHaveLength(2);
      const types = ov.getAnnotations().map((x: Annotation) => x.type).sort();
      expect(types).toEqual(['circle', 'rect']);
      mgr.closeOverlay();
    });

    it('syncs annotation edits in the overlay back to the source on close', () => {
      app = setupApp();
      app.addAnnotation(
        ann('original', 'rect', [
          { x: 10, y: 10 },
          { x: 50, y: 50 }
        ])
      );
      const mgr = new OverlayManager(document.createElement('div'));
      mgr.openOverlay({ sourceApp: app });
      const ov = mgr.getOverlayApp();
      // Add a new annotation inside the overlay.
      ov.addAnnotation(
        ann('added-in-overlay', 'arrow', [
          { x: 100, y: 100 },
          { x: 200, y: 200 }
        ])
      );
      mgr.closeOverlay();

      // The source App should now reflect the overlay's edits.
      const ids = app.getAnnotations().map((x) => x.id).sort();
      expect(ids).toEqual(['added-in-overlay', 'original']);
    });

    it('mutating the overlay copy does not affect the source until close', () => {
      app = setupApp();
      const orig = ann('a', 'rect', [
        { x: 10, y: 10 },
        { x: 50, y: 50 }
      ]);
      app.addAnnotation(orig);
      const mgr = new OverlayManager(document.createElement('div'));
      mgr.openOverlay({ sourceApp: app });
      const ov = mgr.getOverlayApp();
      // Tweak the overlay's copy.
      const copy = ov.getAnnotations()[0];
      copy.points[1].x = 9999;
      // Source untouched while overlay is open.
      expect(app.getAnnotations()[0].points[1].x).toBe(50);
      mgr.closeOverlay();
      // After close, source mirrors the overlay (= 9999 in our case).
      expect(app.getAnnotations()[0].points[1].x).toBe(9999);
    });

    it('open + close is idempotent', () => {
      app = setupApp();
      const mgr = new OverlayManager(document.createElement('div'));
      mgr.openOverlay({ sourceApp: app });
      expect(mgr.isOverlayOpen()).toBe(true);
      mgr.openOverlay({ sourceApp: app }); // no-op when already open
      mgr.closeOverlay();
      expect(mgr.isOverlayOpen()).toBe(false);
      mgr.closeOverlay(); // safe second close
    });
  });

  describe('#9 — transparent background option', () => {
    it('setBackgroundColor("transparent") only clears, does not fill', () => {
      app = setupApp();
      const ctx = app.getCanvas().getContext();
      const clearSpy = jest.spyOn(ctx, 'clearRect');
      const fillSpy = jest.spyOn(ctx, 'fillRect');
      clearSpy.mockClear();
      fillSpy.mockClear();

      app.setBackgroundColor('transparent');

      expect(clearSpy).toHaveBeenCalled();
      // fillRect should NOT be called for transparent (only clearRect).
      const fillCalls = fillSpy.mock.calls.filter(
        (c) => c[0] === 0 && c[1] === 0 // background fill calls land at (0,0)
      );
      expect(fillCalls.length).toBe(0);
    });

    it('setBackgroundColor("#ff0000") clears + fills with the colour', () => {
      app = setupApp();
      const ctx = app.getCanvas().getContext();
      const clearSpy = jest.spyOn(ctx, 'clearRect');
      const fillSpy = jest.spyOn(ctx, 'fillRect');
      clearSpy.mockClear();
      fillSpy.mockClear();

      app.setBackgroundColor('#ff0000');

      expect(clearSpy).toHaveBeenCalled();
      expect(fillSpy).toHaveBeenCalled();
    });

    it('treats "", null, "none" the same as transparent', () => {
      app = setupApp();
      const ctx = app.getCanvas().getContext();
      const fillSpy = jest.spyOn(ctx, 'fillRect');

      for (const value of ['', null, 'none'] as const) {
        fillSpy.mockClear();
        app.setBackgroundColor(value);
        const fillCalls = fillSpy.mock.calls.filter((c) => c[0] === 0 && c[1] === 0);
        expect(fillCalls.length).toBe(0);
      }
    });
  });

  describe('#10 — export / import round-trip', () => {
    it('exportAnnotations + importAnnotations round-trip', () => {
      app = setupApp();
      app.addAnnotation(
        ann('r', 'rect', [
          { x: 10, y: 10 },
          { x: 100, y: 100 }
        ])
      );
      app.addAnnotation(
        ann('c', 'circle', [
          { x: 200, y: 200 },
          { x: 250, y: 200 }
        ])
      );

      const json = app.exportAnnotations();
      const before = app.getAnnotations();
      app.clearAnnotations();
      expect(app.getAnnotations()).toHaveLength(0);

      app.importAnnotations(json);
      const after = app.getAnnotations();
      expect(after).toHaveLength(before.length);
      for (let i = 0; i < before.length; i++) {
        expect(after[i]!.id).toBe(before[i]!.id);
        expect(after[i]!.type).toBe(before[i]!.type);
        expect(after[i]!.points).toEqual(before[i]!.points);
        expect(after[i]!.style.strokeColor).toBe(before[i]!.style.strokeColor);
      }
    });

    it('importAnnotations accepts large JSON (1000 annotations)', () => {
      app = setupApp();
      const list = [];
      for (let i = 0; i < 1000; i++) {
        list.push(
          ann(`id-${i}`, 'rect', [
            { x: i, y: i },
            { x: i + 5, y: i + 5 }
          ])
        );
      }
      const json = JSON.stringify(list);
      // Roughly ~250 KB for 1000 rects — well under the 1 MB cap.
      expect(json.length).toBeGreaterThan(100_000);
      app.importAnnotations(json);
      expect(app.getAnnotations()).toHaveLength(1000);
    });

    it('CanvasLens exposes exportAnnotations / importAnnotations', async () => {
      const { CanvasLens } = await import('../../CanvasLens');
      if (!customElements.get('canvas-lens')) {
        customElements.define('canvas-lens', CanvasLens);
      }
      const el = document.createElement('canvas-lens') as HTMLElement & {
        exportAnnotations: () => string;
        importAnnotations: (json: string) => void;
        getAnnotations: () => Annotation[];
        addAnnotation: (a: Annotation) => void;
        clearAnnotations: () => void;
      };
      el.setAttribute('width', '800');
      el.setAttribute('height', '600');
      el.setAttribute('tools', '{"annotation":{"rect":true}}');
      document.body.appendChild(el);
      await new Promise((r) => setTimeout(r, 30));

      el.addAnnotation(
        ann('a', 'rect', [
          { x: 0, y: 0 },
          { x: 10, y: 10 }
        ])
      );
      const json = el.exportAnnotations();
      expect(typeof json).toBe('string');
      expect(JSON.parse(json)).toHaveLength(1);

      el.clearAnnotations();
      expect(el.getAnnotations()).toHaveLength(0);

      el.importAnnotations(json);
      expect(el.getAnnotations()).toHaveLength(1);

      document.body.removeChild(el);
    });
  });

  describe('#11 — clicks in canvas margins clamp instead of bailing', () => {
    // Previously: EventHandler.handleMouseDown returned early if the click
    // landed outside the image's bounding rect, so when the canvas was
    // larger than the image (any flex / responsive layout) clicking near
    // the edges did nothing — most visibly: the text tool felt broken.

    it('text tool: click outside image area clamps to a valid start point', (done) => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      const a = new App({
        container,
        width: 800,
        height: 600,
        tools: { annotation: { text: true, style: { strokeColor: '#000', strokeWidth: 1 } } }
      });
      // Stub a loaded image at (100, 79) – (700, 479).
      const img = new Image();
      Object.defineProperty(img, 'naturalWidth', { value: 600 });
      Object.defineProperty(img, 'naturalHeight', { value: 400 });
      Object.defineProperty(img, 'complete', { value: true });
      a.loadImageElement(img);
      bound(a.getCanvas().getElement(), 800, 600);
      a.activateTool('text');

      const canvas = a.getCanvas().getElement();
      // Click in the top-left margin (outside image bounds 100..700, 79..479).
      mouseAt(canvas, 'mousedown', 30, 20);
      setTimeout(() => {
        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
        expect(input).toBeTruthy();
        input.value = 'in margin';
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        setTimeout(() => {
          const list = a.getAnnotations();
          expect(list).toHaveLength(1);
          // Point should have been clamped into the image rect.
          const [p] = list[0]!.points;
          const b = a.getImageBounds()!;
          expect(p!.x).toBeGreaterThanOrEqual(b.x);
          expect(p!.y).toBeGreaterThanOrEqual(b.y);
          a.destroy();
          done();
        }, 30);
      }, 30);
    });

    it('rect tool: starting outside the image clamps the start, drag draws normally', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      const a = new App({
        container,
        width: 800,
        height: 600,
        tools: { annotation: { rect: true, style: { strokeColor: '#000', strokeWidth: 1 } } }
      });
      const img = new Image();
      Object.defineProperty(img, 'naturalWidth', { value: 600 });
      Object.defineProperty(img, 'naturalHeight', { value: 400 });
      Object.defineProperty(img, 'complete', { value: true });
      a.loadImageElement(img);
      bound(a.getCanvas().getElement(), 800, 600);
      a.activateTool('rect');

      const canvas = a.getCanvas().getElement();
      // mousedown in the top-left margin
      mouseAt(canvas, 'mousedown', 30, 20);
      document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 300, clientY: 300 }));
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: 300, clientY: 300 }));

      expect(a.getAnnotations()).toHaveLength(1);
      a.destroy();
    });
  });

  describe('#12 — text tool reliability', () => {
    function clickAndType(app: App, x: number, y: number, value: string, done: () => void): void {
      const canvas = app.getCanvas().getElement();
      mouseAt(canvas, 'mousedown', x, y);
      setTimeout(() => {
        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (!input) {
          done();
          return;
        }
        input.value = value;
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        setTimeout(done, 30);
      }, 20);
    }

    it('creates many text annotations in sequence (10×)', (done) => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      const a = new App({
        container,
        width: 800,
        height: 600,
        tools: { annotation: { text: true, style: { strokeColor: '#000', strokeWidth: 1 } } }
      });
      const img = new Image();
      Object.defineProperty(img, 'naturalWidth', { value: 600 });
      Object.defineProperty(img, 'naturalHeight', { value: 400 });
      Object.defineProperty(img, 'complete', { value: true });
      a.loadImageElement(img);
      bound(a.getCanvas().getElement(), 800, 600);
      a.activateTool('text');

      let i = 0;
      const next = (): void => {
        if (i === 10) {
          expect(a.getAnnotations()).toHaveLength(10);
          a.destroy();
          done();
          return;
        }
        clickAndType(a, 200 + (i % 5) * 50, 200 + Math.floor(i / 5) * 60, `t${i}`, () => {
          i++;
          next();
        });
      };
      next();
    });

    it('Escape cancels without saving and the tool stays active', (done) => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      const a = new App({
        container,
        width: 800,
        height: 600,
        tools: { annotation: { text: true, style: { strokeColor: '#000', strokeWidth: 1 } } }
      });
      const img = new Image();
      Object.defineProperty(img, 'naturalWidth', { value: 600 });
      Object.defineProperty(img, 'naturalHeight', { value: 400 });
      Object.defineProperty(img, 'complete', { value: true });
      a.loadImageElement(img);
      bound(a.getCanvas().getElement(), 800, 600);
      a.activateTool('text');

      const canvas = a.getCanvas().getElement();
      mouseAt(canvas, 'mousedown', 200, 200);
      setTimeout(() => {
        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
        expect(input).toBeTruthy();
        input.value = 'discard me';
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        setTimeout(() => {
          expect(a.getAnnotations()).toHaveLength(0);
          expect(a.getActiveTool()).toBe('text');
          // Next click should still spawn an input.
          mouseAt(canvas, 'mousedown', 300, 300);
          setTimeout(() => {
            const input2 = document.querySelector('input[type="text"]');
            expect(input2).toBeTruthy();
            a.destroy();
            done();
          }, 30);
        }, 30);
      }, 30);
    });
  });

  describe('#13 — activating a tool while comparison is on auto-exits comparison', () => {
    // Bug from the demo: user turns on comparison, then clicks the Text
    // tool. The toolChange event fires but clicking the canvas does nothing
    // because the EventHandler bails when comparison is active. The tool
    // looks broken even though it's "active". Fix: activating ANY tool
    // implicitly leaves comparison mode (they conflict on the same canvas).

    it('text tool activation turns comparison off', () => {
      app = setupApp({
        tools: {
          comparison: true,
          annotation: { text: true, style: { strokeColor: '#000', strokeWidth: 1 } }
        }
      });
      app.setComparisonMode(true);
      expect(app.isComparisonMode()).toBe(true);

      app.activateTool('text');

      expect(app.isComparisonMode()).toBe(false);
      expect(app.getActiveTool()).toBe('text');
    });

    it('rect tool activation also exits comparison', () => {
      app = setupApp({
        comparison: true,
        annotation: { rect: true, style: { strokeColor: '#000', strokeWidth: 1 } }
      });
      app.setComparisonMode(true);
      app.activateTool('rect');
      expect(app.isComparisonMode()).toBe(false);
    });

    it('after auto-exit, the text tool actually creates an input on click', (done) => {
      app = setupApp({
        tools: {
          comparison: true,
          annotation: { text: true, style: { strokeColor: '#000', strokeWidth: 1 } }
        }
      });
      app.setComparisonMode(true);
      app.activateTool('text');

      const canvas = app.getCanvas().getElement();
      mouseAt(canvas, 'mousedown', 200, 200);
      setTimeout(() => {
        const input = document.querySelector('input[type="text"]');
        expect(input).toBeTruthy();
        app.destroy();
        done();
      }, 30);
    });
  });

  describe('#3b — cursor updates on tool switch', () => {
    it('cursor changes from text to crosshair when switching text→rect', () => {
      app = setupApp();
      const canvasEl = app.getCanvas().getElement();
      app.activateTool('text');
      expect(canvasEl.style.cursor).toBe('text');
      app.activateTool('rect');
      expect(canvasEl.style.cursor).toBe('crosshair');
    });

    it('cursor clears on deactivateTool', () => {
      app = setupApp();
      const canvasEl = app.getCanvas().getElement();
      app.activateTool('text');
      app.deactivateTool();
      expect(canvasEl.style.cursor).toBe('');
    });
  });
});
