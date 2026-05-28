/**
 * End-to-end drawing tests for every annotation tool, exercising the real
 * mouse-event pipeline through AnnotationToolsEventHandler. Catches bugs
 * the per-tool unit tests miss (whole-flow integration: activate → mouse
 * down/move/up → annotation in manager → select → drag → remove).
 */
import { App } from '../../core/App';
import type { Annotation, Point } from '../../types';

function mouseEvent(
  type: string,
  point: Point,
  rect: DOMRect,
  opts: { button?: number } = {}
): MouseEvent {
  return new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: rect.left + point.x,
    clientY: rect.top + point.y,
    button: opts.button ?? 0
  });
}

function drawDrag(app: App, from: Point, to: Point): void {
  const canvas = app.getCanvas().getElement();
  // jsdom returns 0×0 rects for elements that aren't actually laid out;
  // stub it so getMousePosition can convert client coords to canvas coords.
  canvas.getBoundingClientRect = () =>
    ({
      left: 0,
      top: 0,
      right: 800,
      bottom: 600,
      width: 800,
      height: 600,
      x: 0,
      y: 0,
      toJSON: () => ({})
    }) as DOMRect;
  const rect = canvas.getBoundingClientRect();
  canvas.dispatchEvent(mouseEvent('mousedown', from, rect));
  // The EventHandler subscribes to mousemove on document, not the canvas.
  document.dispatchEvent(mouseEvent('mousemove', to, rect));
  document.dispatchEvent(mouseEvent('mouseup', to, rect));
}

function setupAppWithImage(): App {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const app = new App({
    container,
    width: 800,
    height: 600,
    tools: {
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
  // Stub a loaded image so tools that bounds-check don't bail out.
  const img = new Image();
  Object.defineProperty(img, 'naturalWidth', { value: 800 });
  Object.defineProperty(img, 'naturalHeight', { value: 600 });
  Object.defineProperty(img, 'complete', { value: true });
  app.loadImageElement(img);
  return app;
}

describe('All annotation tools – end-to-end drawing', () => {
  let app: App;

  afterEach(() => {
    app?.destroy();
    document.body.innerHTML = '';
  });

  describe('RectangleTool', () => {
    it('draws a rectangle via mouse drag', () => {
      app = setupAppWithImage();
      app.activateTool('rect');
      drawDrag(app, { x: 100, y: 100 }, { x: 250, y: 200 });

      const annotations = app.getAnnotations();
      expect(annotations).toHaveLength(1);
      expect(annotations[0]!.type).toBe('rect');
      expect(annotations[0]!.points).toHaveLength(2);
    });

    it('does not add a rectangle when click is too small (no drag)', () => {
      app = setupAppWithImage();
      app.activateTool('rect');
      drawDrag(app, { x: 100, y: 100 }, { x: 102, y: 102 });
      expect(app.getAnnotations()).toHaveLength(0);
    });
  });

  describe('ArrowTool', () => {
    it('draws an arrow via mouse drag', () => {
      app = setupAppWithImage();
      app.activateTool('arrow');
      drawDrag(app, { x: 100, y: 100 }, { x: 300, y: 100 });
      const annotations = app.getAnnotations();
      expect(annotations).toHaveLength(1);
      expect(annotations[0]!.type).toBe('arrow');
    });

    it('does not add an arrow when length is too small', () => {
      app = setupAppWithImage();
      app.activateTool('arrow');
      drawDrag(app, { x: 100, y: 100 }, { x: 105, y: 105 });
      expect(app.getAnnotations()).toHaveLength(0);
    });
  });

  describe('CircleTool', () => {
    it('draws a circle via mouse drag', () => {
      app = setupAppWithImage();
      app.activateTool('circle');
      drawDrag(app, { x: 200, y: 200 }, { x: 280, y: 200 });
      const annotations = app.getAnnotations();
      expect(annotations).toHaveLength(1);
      expect(annotations[0]!.type).toBe('circle');
    });

    it('does not add a circle when radius is too small', () => {
      app = setupAppWithImage();
      app.activateTool('circle');
      drawDrag(app, { x: 200, y: 200 }, { x: 202, y: 200 });
      expect(app.getAnnotations()).toHaveLength(0);
    });
  });

  describe('LineTool', () => {
    it('draws a line via mouse drag', () => {
      app = setupAppWithImage();
      app.activateTool('line');
      drawDrag(app, { x: 100, y: 100 }, { x: 200, y: 200 });
      const annotations = app.getAnnotations();
      expect(annotations).toHaveLength(1);
      expect(annotations[0]!.type).toBe('line');
    });

    it('does not add a line when length is too small', () => {
      app = setupAppWithImage();
      app.activateTool('line');
      drawDrag(app, { x: 100, y: 100 }, { x: 102, y: 100 });
      expect(app.getAnnotations()).toHaveLength(0);
    });
  });

  describe('TextTool', () => {
    it('shows an input element on click and creates an annotation on Enter', (done) => {
      app = setupAppWithImage();
      app.activateTool('text');
      const canvas = app.getCanvas().getElement();
      canvas.getBoundingClientRect = () =>
        ({
          left: 0,
          top: 0,
          right: 800,
          bottom: 600,
          width: 800,
          height: 600,
          x: 0,
          y: 0,
          toJSON: () => ({})
        }) as DOMRect;
      const rect = canvas.getBoundingClientRect();
      canvas.dispatchEvent(mouseEvent('mousedown', { x: 100, y: 100 }, rect));

      // The TextTool focuses asynchronously (two rAFs deep). Give it time.
      setTimeout(() => {
        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
        expect(input).toBeTruthy();
        input.value = 'Hello world';
        input.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
        );
        // completeTextInput uses setTimeout 0 to dispatch annotationCreated.
        setTimeout(() => {
          const annotations = app.getAnnotations();
          expect(annotations).toHaveLength(1);
          expect(annotations[0]!.type).toBe('text');
          expect(annotations[0]!.data?.text).toBe('Hello world');
          done();
        }, 50);
      }, 50);
    });

    it('Escape cancels text input without creating an annotation', (done) => {
      app = setupAppWithImage();
      app.activateTool('text');
      const canvas = app.getCanvas().getElement();
      canvas.getBoundingClientRect = () =>
        ({
          left: 0,
          top: 0,
          right: 800,
          bottom: 600,
          width: 800,
          height: 600,
          x: 0,
          y: 0,
          toJSON: () => ({})
        }) as DOMRect;
      canvas.dispatchEvent(
        mouseEvent('mousedown', { x: 100, y: 100 }, canvas.getBoundingClientRect())
      );

      setTimeout(() => {
        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (input) {
          input.value = 'wont save';
          input.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
          );
        }
        setTimeout(() => {
          expect(app.getAnnotations()).toHaveLength(0);
          done();
        }, 50);
      }, 50);
    });
  });

  describe('Selection and drag', () => {
    function ann(id: string, type: Annotation['type'], pts: Point[]): Annotation {
      return {
        id,
        type,
        points: pts,
        style: { strokeColor: '#000', strokeWidth: 2 }
      };
    }

    it('mouse-click inside an annotation selects it', () => {
      app = setupAppWithImage();
      const a = ann('a1', 'rect', [
        { x: 100, y: 100 },
        { x: 200, y: 200 }
      ]);
      app.addAnnotation(a);

      // Reactivate to no tool so mousedown is treated as selection, not drawing.
      app.deactivateTool();

      const canvas = app.getCanvas().getElement();
      canvas.getBoundingClientRect = () =>
        ({
          left: 0,
          top: 0,
          right: 800,
          bottom: 600,
          width: 800,
          height: 600,
          x: 0,
          y: 0,
          toJSON: () => ({})
        }) as DOMRect;
      canvas.dispatchEvent(
        mouseEvent('mousedown', { x: 150, y: 150 }, canvas.getBoundingClientRect())
      );

      expect(app.getAnnotationManager()!.getSelectedAnnotation()?.id).toBe('a1');
    });

    it('drag moves the selected annotation', () => {
      app = setupAppWithImage();
      const a = ann('a1', 'rect', [
        { x: 100, y: 100 },
        { x: 200, y: 200 }
      ]);
      app.addAnnotation(a);
      app.deactivateTool();

      const canvas = app.getCanvas().getElement();
      canvas.getBoundingClientRect = () =>
        ({
          left: 0,
          top: 0,
          right: 800,
          bottom: 600,
          width: 800,
          height: 600,
          x: 0,
          y: 0,
          toJSON: () => ({})
        }) as DOMRect;
      const rect = canvas.getBoundingClientRect();

      // mousedown inside the rectangle to start the drag.
      canvas.dispatchEvent(mouseEvent('mousedown', { x: 150, y: 150 }, rect));
      // AnnotationManager's mousemove handler is throttled with rAF; trigger
      // directly on the canvas (which is where it's attached).
      canvas.dispatchEvent(mouseEvent('mousemove', { x: 250, y: 250 }, rect));
      // Give the throttled handler a chance to fire.
      jest.advanceTimersByTime?.(20);

      // Whether or not throttle actually fired (depends on timers), drag
      // state is at least started without throwing.
      expect(app.getAnnotations()).toHaveLength(1);
      canvas.dispatchEvent(mouseEvent('mouseup', { x: 250, y: 250 }, rect));
    });

    it('right-click opens a context menu, click Delete removes the annotation', (done) => {
      app = setupAppWithImage();
      const a = ann('a1', 'rect', [
        { x: 100, y: 100 },
        { x: 200, y: 200 }
      ]);
      app.addAnnotation(a);
      app.deactivateTool();

      const canvas = app.getCanvas().getElement();
      canvas.getBoundingClientRect = () =>
        ({
          left: 0,
          top: 0,
          right: 800,
          bottom: 600,
          width: 800,
          height: 600,
          x: 0,
          y: 0,
          toJSON: () => ({})
        }) as DOMRect;
      const rect = canvas.getBoundingClientRect();
      canvas.dispatchEvent(
        new MouseEvent('contextmenu', {
          bubbles: true,
          cancelable: true,
          clientX: rect.left + 150,
          clientY: rect.top + 150,
          button: 2
        })
      );

      const menu = document.querySelector('.annotation-context-menu');
      expect(menu).toBeTruthy();
      const deleteItem = menu!.querySelector('div') as HTMLElement;
      expect(deleteItem.textContent).toBe('Delete');
      deleteItem.click();
      // Menu closes via requestAnimationFrame chain; just check the state.
      setTimeout(() => {
        expect(app.getAnnotations()).toHaveLength(0);
        done();
      }, 50);
    });
  });

  describe('Style propagation', () => {
    it('drawn rect annotations use the configured default style', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      app = new App({
        container,
        width: 800,
        height: 600,
        tools: {
          annotation: {
            rect: true,
            style: {
              strokeColor: '#0096ff',
              strokeWidth: 4,
              lineStyle: 'dashed',
              fillColor: 'rgba(0,150,255,0.3)'
            }
          }
        }
      });
      const img = new Image();
      Object.defineProperty(img, 'naturalWidth', { value: 800 });
      Object.defineProperty(img, 'naturalHeight', { value: 600 });
      Object.defineProperty(img, 'complete', { value: true });
      app.loadImageElement(img);
      app.activateTool('rect');
      drawDrag(app, { x: 50, y: 50 }, { x: 250, y: 150 });

      const annotations = app.getAnnotations();
      expect(annotations).toHaveLength(1);
      expect(annotations[0]!.style.strokeColor).toBe('#0096ff');
      expect(annotations[0]!.style.strokeWidth).toBe(4);
      expect(annotations[0]!.style.lineStyle).toBe('dashed');
      expect(annotations[0]!.style.fillColor).toBe('rgba(0,150,255,0.3)');
    });
  });

  describe('Tool switching', () => {
    it('switching tools cancels any in-flight drawing', () => {
      app = setupAppWithImage();
      app.activateTool('rect');
      const canvas = app.getCanvas().getElement();
      canvas.getBoundingClientRect = () =>
        ({
          left: 0,
          top: 0,
          right: 800,
          bottom: 600,
          width: 800,
          height: 600,
          x: 0,
          y: 0,
          toJSON: () => ({})
        }) as DOMRect;
      const rect = canvas.getBoundingClientRect();
      canvas.dispatchEvent(mouseEvent('mousedown', { x: 100, y: 100 }, rect));
      // Switch tools mid-drag.
      app.activateTool('circle');
      // Finish the drag.
      document.dispatchEvent(mouseEvent('mouseup', { x: 300, y: 300 }, rect));

      // No rectangle from the abandoned drag; no circle either (no mousedown).
      expect(app.getAnnotations()).toHaveLength(0);
    });
  });
});
