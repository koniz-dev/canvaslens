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
