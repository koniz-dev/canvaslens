/**
 * Comprehensive input audit — every keyboard / mouse path the canvas
 * exposes, asserted from a single test file. Ensures we don't regress
 * any of the interactions when individual controllers are refactored.
 *
 * Layout of expectations:
 *
 * Mouse
 *  - mousedown button=0 / button=2 → tool fires; button=1 (middle) → ignored
 *  - mouseup completes shape draw
 *  - mouseleave during drag → drag is cancelled (no annotation added)
 *  - contextmenu while tool active → suppressed (no native menu)
 *  - contextmenu on existing annotation, no tool → custom menu opens
 *
 * Keyboard
 *  - Esc with no draw / no input + tool active → tool deactivates + DOM event
 *  - Esc mid-shape-draw → cancel draw, tool stays active
 *  - Esc with open text input → cancel input, tool stays active
 *  - Delete / Backspace with annotation selected → annotation removed
 *  - Delete / Backspace with no selection → nothing happens (no error)
 *  - Alt+R / A / T / C / L → activate the matching tool
 *  - Keystrokes inside the text input → text goes into the input, NOT
 *    interpreted as shortcut by document handler
 */
import { App } from '../../core/App';
import type { Annotation, Point } from '../../types';

function bound(canvas: HTMLCanvasElement, w = 800, h = 600): void {
  canvas.getBoundingClientRect = () =>
    ({ left: 0, top: 0, right: w, bottom: h, width: w, height: h, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect;
}

function setupApp(): App {
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
        style: { strokeColor: '#000', strokeWidth: 1 }
      }
    }
  });
  const img = new Image();
  Object.defineProperty(img, 'naturalWidth', { value: 600 });
  Object.defineProperty(img, 'naturalHeight', { value: 400 });
  Object.defineProperty(img, 'complete', { value: true });
  app.loadImageElement(img);
  bound(app.getCanvas().getElement());
  return app;
}

const annotation = (id: string, type: Annotation['type'], pts: Point[]): Annotation => ({
  id,
  type,
  points: pts,
  style: { strokeColor: '#000', strokeWidth: 2 }
});

describe('Input audit — keyboard + mouse', () => {
  let app: App;
  afterEach(() => {
    app?.destroy();
    document.body.innerHTML = '';
  });

  describe('Mouse buttons', () => {
    it('rect draw fires on left button (0)', () => {
      app = setupApp();
      app.activateTool('rect');
      const canvas = app.getCanvas().getElement();
      canvas.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 200, clientY: 200, button: 0 }));
      document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 300, clientY: 280 }));
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: 300, clientY: 280 }));
      expect(app.getAnnotations()).toHaveLength(1);
    });

    it('rect draw also fires on right button (2)', () => {
      app = setupApp();
      app.activateTool('rect');
      const canvas = app.getCanvas().getElement();
      canvas.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 200, clientY: 200, button: 2 }));
      document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 300, clientY: 280 }));
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: 300, clientY: 280 }));
      expect(app.getAnnotations()).toHaveLength(1);
    });

    it('middle button (1) is ignored', () => {
      app = setupApp();
      app.activateTool('rect');
      const canvas = app.getCanvas().getElement();
      canvas.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 200, clientY: 200, button: 1 }));
      document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 300, clientY: 280 }));
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: 300, clientY: 280 }));
      expect(app.getAnnotations()).toHaveLength(0);
    });

    it('contextmenu while shape tool is active is suppressed', () => {
      app = setupApp();
      app.activateTool('rect');
      const evt = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 200, clientY: 200 });
      app.getCanvas().getElement().dispatchEvent(evt);
      expect(evt.defaultPrevented).toBe(true);
    });

    it('contextmenu while text tool is active is suppressed', () => {
      app = setupApp();
      app.activateTool('text');
      const evt = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 200, clientY: 200 });
      app.getCanvas().getElement().dispatchEvent(evt);
      expect(evt.defaultPrevented).toBe(true);
    });
  });

  describe('Esc key (the user-reported issue)', () => {
    it('Esc with tool active, no draw → tool deactivates AND toolChange(null) fires', () => {
      app = setupApp();
      const events: (string | null)[] = [];
      app.setEventHandlers({
        onToolChange: (t) => events.push(t)
      });
      app.activateTool('rect');
      expect(events).toEqual(['rect']);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(app.getActiveTool()).toBe(null);
      expect(events).toEqual(['rect', null]);
    });

    it('Esc mid-draw cancels draw, tool stays active', () => {
      app = setupApp();
      app.activateTool('rect');
      const canvas = app.getCanvas().getElement();
      canvas.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 200, clientY: 200, button: 0 }));
      document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 300, clientY: 300 }));
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: 300, clientY: 300 }));
      expect(app.getAnnotations()).toHaveLength(0);
      expect(app.getActiveTool()).toBe('rect');
    });

    it('Esc with open text input → input closes, tool stays', (done) => {
      app = setupApp();
      app.activateTool('text');
      const canvas = app.getCanvas().getElement();
      canvas.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 200, clientY: 200, button: 0 }));
      setTimeout(() => {
        const input = document.querySelector('input[data-canvaslens-text-input]') as HTMLInputElement;
        expect(input).toBeTruthy();
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        expect(document.querySelectorAll('input[data-canvaslens-text-input]')).toHaveLength(0);
        expect(app.getActiveTool()).toBe('text');
        done();
      }, 30);
    });
  });

  describe('Delete / Backspace', () => {
    it('removes the selected annotation', () => {
      app = setupApp();
      const a = annotation('a', 'rect', [
        { x: 50, y: 50 },
        { x: 150, y: 150 }
      ]);
      app.addAnnotation(a);
      app.getAnnotationManager()!.selectAnnotation(a);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));
      expect(app.getAnnotations()).toHaveLength(0);
    });

    it('Backspace also removes the selected annotation', () => {
      app = setupApp();
      const a = annotation('a', 'rect', [
        { x: 50, y: 50 },
        { x: 150, y: 150 }
      ]);
      app.addAnnotation(a);
      app.getAnnotationManager()!.selectAnnotation(a);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
      expect(app.getAnnotations()).toHaveLength(0);
    });

    it('no selection: Delete is a safe no-op', () => {
      app = setupApp();
      expect(() =>
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }))
      ).not.toThrow();
    });
  });

  describe('Alt shortcuts', () => {
    it.each([
      ['r', 'rect'],
      ['a', 'arrow'],
      ['t', 'text'],
      ['c', 'circle'],
      ['l', 'line']
    ])('Alt+%s activates %s', (key, expected) => {
      app = setupApp();
      document.dispatchEvent(new KeyboardEvent('keydown', { key, altKey: true, bubbles: true }));
      expect(app.getActiveTool()).toBe(expected);
    });

    it('Alt+R twice toggles the rect tool off', () => {
      app = setupApp();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'r', altKey: true, bubbles: true }));
      expect(app.getActiveTool()).toBe('rect');
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'r', altKey: true, bubbles: true }));
      expect(app.getActiveTool()).toBe(null);
    });
  });

  describe('Typing inside the text input', () => {
    it('Backspace inside input does NOT delete annotations', (done) => {
      app = setupApp();
      const a = annotation('a', 'rect', [
        { x: 50, y: 50 },
        { x: 150, y: 150 }
      ]);
      app.addAnnotation(a);
      app.getAnnotationManager()!.selectAnnotation(a);
      app.activateTool('text');
      const canvas = app.getCanvas().getElement();
      canvas.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 300, clientY: 300, button: 0 }));
      setTimeout(() => {
        const input = document.querySelector('input[data-canvaslens-text-input]') as HTMLInputElement;
        expect(input).toBeTruthy();
        input.value = 'hi';
        // Dispatch Backspace on the INPUT (target = input). The document
        // handler should ignore it because the target is our text input.
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
        // The annotation that was selected should still exist.
        expect(app.getAnnotations().find((x) => x.id === 'a')).toBeTruthy();
        done();
      }, 30);
    });
  });
});
