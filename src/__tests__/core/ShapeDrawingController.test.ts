import { App } from '../../core/App';

/**
 * ShapeDrawingController owns drawing for rect / arrow / circle / line.
 * Mirror of TextInputController for shape tools — capture-phase
 * listeners on the canvas, no detours through EventHandler / Controller /
 * Manager dispatch.
 */
describe('ShapeDrawingController (via App)', () => {
  let container: HTMLDivElement;
  let app: App;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    app = new App({
      container,
      width: 800,
      height: 600,
      tools: {
        annotation: {
          rect: true,
          arrow: true,
          circle: true,
          line: true,
          text: true,
          style: { strokeColor: '#000', strokeWidth: 1 }
        }
      }
    });
    const img = new Image();
    Object.defineProperty(img, 'naturalWidth', { value: 600 });
    Object.defineProperty(img, 'naturalHeight', { value: 400 });
    Object.defineProperty(img, 'complete', { value: true });
    app.loadImageElement(img);
    app.getCanvas().getElement().getBoundingClientRect = () =>
      ({ left: 0, top: 0, right: 800, bottom: 600, width: 800, height: 600, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect;
  });

  afterEach(() => {
    app.destroy();
    document.body.querySelectorAll('input[data-canvaslens-text-input]').forEach((n) => n.remove());
    if (container.parentElement) document.body.removeChild(container);
  });

  function dragOn(startX: number, startY: number, endX: number, endY: number, button = 0): void {
    const canvas = app.getCanvas().getElement();
    canvas.dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true, clientX: startX, clientY: startY, button })
    );
    document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: endX, clientY: endY }));
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: endX, clientY: endY }));
  }

  describe('rect', () => {
    it('drag creates a rect annotation', () => {
      app.activateTool('rect');
      dragOn(200, 200, 350, 300);
      expect(app.getAnnotations()).toHaveLength(1);
      expect(app.getAnnotations()[0]!.type).toBe('rect');
    });

    it('tiny drag is rejected by the tool', () => {
      app.activateTool('rect');
      dragOn(200, 200, 202, 202);
      expect(app.getAnnotations()).toHaveLength(0);
    });
  });

  describe('arrow', () => {
    it('drag creates an arrow annotation', () => {
      app.activateTool('arrow');
      dragOn(200, 200, 400, 200);
      expect(app.getAnnotations()).toHaveLength(1);
      expect(app.getAnnotations()[0]!.type).toBe('arrow');
    });
  });

  describe('circle', () => {
    it('drag creates a circle annotation', () => {
      app.activateTool('circle');
      dragOn(300, 300, 380, 300);
      expect(app.getAnnotations()).toHaveLength(1);
      expect(app.getAnnotations()[0]!.type).toBe('circle');
    });

    it('drawing close to the edge clamps the radius', () => {
      app.activateTool('circle');
      // Centre slightly inside the image, drag way past the edge.
      dragOn(200, 200, 9999, 9999);
      const ann = app.getAnnotations()[0]!;
      const [center, edge] = ann.points;
      const radius = Math.hypot(edge!.x - center!.x, edge!.y - center!.y);
      const bounds = app.getImageBounds()!;
      // Whole circle must fit inside the image.
      expect(center!.x - radius).toBeGreaterThanOrEqual(bounds.x - 0.001);
      expect(center!.y - radius).toBeGreaterThanOrEqual(bounds.y - 0.001);
      expect(center!.x + radius).toBeLessThanOrEqual(bounds.x + bounds.width + 0.001);
      expect(center!.y + radius).toBeLessThanOrEqual(bounds.y + bounds.height + 0.001);
    });
  });

  describe('line', () => {
    it('drag creates a line annotation', () => {
      app.activateTool('line');
      dragOn(200, 200, 350, 350);
      expect(app.getAnnotations()).toHaveLength(1);
      expect(app.getAnnotations()[0]!.type).toBe('line');
    });
  });

  describe('right-click (button=2) also draws shapes', () => {
    it('rect drag with button=2', () => {
      app.activateTool('rect');
      dragOn(200, 200, 350, 300, 2);
      expect(app.getAnnotations()).toHaveLength(1);
      expect(app.getAnnotations()[0]!.type).toBe('rect');
    });
  });

  describe('Escape cancels in-progress draw', () => {
    it('rect: mousedown + Esc → no annotation, tool stays active', () => {
      app.activateTool('rect');
      const canvas = app.getCanvas().getElement();
      canvas.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 200, clientY: 200, button: 0 }));
      document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 300, clientY: 300 }));
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: 300, clientY: 300 }));
      expect(app.getAnnotations()).toHaveLength(0);
      expect(app.getActiveTool()).toBe('rect');
    });
  });

  describe('Tool isolation', () => {
    it('text tool does NOT trigger shape drawing', () => {
      app.activateTool('text');
      // Simulate the rect-drag motion — should NOT produce a rect.
      dragOn(200, 200, 300, 300);
      // (No rect annotation; a text input may or may not be present
      // depending on TextInputController, but no shape gets created.)
      const shapeAnnotations = app.getAnnotations().filter((a) => a.type !== 'text');
      expect(shapeAnnotations).toHaveLength(0);
    });

    it('idle (no tool) does not draw on drag', () => {
      app.deactivateTool();
      dragOn(200, 200, 300, 300);
      expect(app.getAnnotations()).toHaveLength(0);
    });
  });

  describe('many sequential draws', () => {
    it('5 rects in a row', () => {
      app.activateTool('rect');
      for (let i = 0; i < 5; i++) {
        dragOn(100 + i * 30, 100, 200 + i * 30, 200);
      }
      expect(app.getAnnotations()).toHaveLength(5);
      expect(app.getAnnotations().every((a) => a.type === 'rect')).toBe(true);
    });
  });
});
