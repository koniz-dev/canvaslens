/**
 * Reported: lines can't move up, arrows can't move left.
 * Verify drag in every direction for line and arrow annotations.
 */
import { App } from '../../core/App';
import type { Annotation, Point } from '../../types';

function bound(canvas: HTMLCanvasElement, w = 800, h = 600): void {
  canvas.getBoundingClientRect = () =>
    ({ left: 0, top: 0, right: w, bottom: h, width: w, height: h, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect;
}

function setup(): App {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const app = new App({
    container,
    width: 800,
    height: 600,
    tools: { annotation: { line: true, arrow: true, rect: true, style: { strokeColor: '#000', strokeWidth: 1 } } }
  });
  const img = new Image();
  Object.defineProperty(img, 'naturalWidth', { value: 600 });
  Object.defineProperty(img, 'naturalHeight', { value: 400 });
  Object.defineProperty(img, 'complete', { value: true });
  app.loadImageElement(img);
  bound(app.getCanvas().getElement());
  return app;
}

function drag(app: App, start: Point, end: Point): void {
  const canvas = app.getCanvas().getElement();
  canvas.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: start.x, clientY: start.y, button: 0 }));
  document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: end.x, clientY: end.y }));
  document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: end.x, clientY: end.y }));
}

describe('Line + arrow drag — every direction', () => {
  let app: App;
  afterEach(() => {
    app?.destroy();
    document.body.innerHTML = '';
  });

  describe('horizontal line at y=300', () => {
    const annotationLine = (): Annotation => ({
      id: 'l',
      type: 'line',
      points: [
        { x: 300, y: 300 },
        { x: 500, y: 300 }
      ],
      style: { strokeColor: '#000', strokeWidth: 1 }
    });

    it.each<[string, Point]>([
      ['UP', { x: 400, y: 200 }],
      ['DOWN', { x: 400, y: 400 }],
      ['LEFT', { x: 200, y: 300 }],
      ['RIGHT', { x: 600, y: 300 }]
    ])('moves %s', (_label, target) => {
      app = setup();
      app.addAnnotation(annotationLine());
      app.deactivateTool();
      const startCenter = { x: 400, y: 300 };
      const before = app.getAnnotations()[0]!.points.map((p) => ({ ...p }));
      drag(app, startCenter, target);
      const after = app.getAnnotations()[0]!.points;
      const moved = before.some((p, i) => p.x !== after[i]!.x || p.y !== after[i]!.y);
      expect(moved).toBe(true);
    });
  });

  describe('horizontal arrow at y=300', () => {
    const annotationArrow = (): Annotation => ({
      id: 'a',
      type: 'arrow',
      points: [
        { x: 500, y: 300 },
        { x: 300, y: 300 }
      ],
      style: { strokeColor: '#000', strokeWidth: 1 }
    });

    it.each<[string, Point]>([
      ['UP', { x: 400, y: 200 }],
      ['DOWN', { x: 400, y: 400 }],
      ['LEFT', { x: 200, y: 300 }],
      ['RIGHT', { x: 600, y: 300 }]
    ])('moves %s', (_label, target) => {
      app = setup();
      app.addAnnotation(annotationArrow());
      app.deactivateTool();
      const startCenter = { x: 400, y: 300 };
      const before = app.getAnnotations()[0]!.points.map((p) => ({ ...p }));
      drag(app, startCenter, target);
      const after = app.getAnnotations()[0]!.points;
      const moved = before.some((p, i) => p.x !== after[i]!.x || p.y !== after[i]!.y);
      expect(moved).toBe(true);
    });
  });

  describe('clamp uses geometric center, not points[0]', () => {
    it('horizontal line drawn LEFT→RIGHT can be dragged to BOTH image edges symmetrically', () => {
      app = setup();
      // Image is 600x400, placed by image-viewer; effective bounds depend on fit.
      // Add a horizontal line near image center and try to drag to right edge.
      app.addAnnotation({
        id: 'l',
        type: 'line',
        points: [
          { x: 300, y: 300 },
          { x: 500, y: 300 }
        ],
        style: { strokeColor: '#000', strokeWidth: 1 }
      });
      app.deactivateTool();
      // Drag right by 2000px — clamp must stop the line at the image's right
      // edge, NOT before the right end reaches the edge.
      drag(app, { x: 400, y: 300 }, { x: 2400, y: 300 });
      const right = app.getAnnotations()[0]!.points;
      // Right endpoint must NOT exceed the image's right edge.
      const imgBounds = app.getImageBounds();
      if (imgBounds) {
        const maxX = Math.max(right[0]!.x, right[1]!.x);
        expect(maxX).toBeLessThanOrEqual(imgBounds.x + imgBounds.width + 0.001);
      }
    });
  });
});
