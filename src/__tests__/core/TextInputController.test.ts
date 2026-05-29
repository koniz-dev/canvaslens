import { App } from '../../core/App';

/**
 * TextInputController is the dedicated text-tool path: it owns a
 * mousedown listener attached BEFORE every other module, spawns the
 * <input> into `document.body`, and commits / cancels via Enter / Esc.
 */
describe('TextInputController (via App)', () => {
  let container: HTMLDivElement;
  let app: App;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    app = new App({
      container,
      width: 800,
      height: 600,
      tools: { annotation: { text: true, rect: true, style: { strokeColor: '#000', strokeWidth: 1 } } }
    });
    const img = new Image();
    Object.defineProperty(img, 'naturalWidth', { value: 600 });
    Object.defineProperty(img, 'naturalHeight', { value: 400 });
    Object.defineProperty(img, 'complete', { value: true });
    app.loadImageElement(img);
    // Give the canvas a deterministic bounding rect.
    app.getCanvas().getElement().getBoundingClientRect = () =>
      ({ left: 0, top: 0, right: 800, bottom: 600, width: 800, height: 600, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect;
  });

  afterEach(() => {
    app.destroy();
    document.body.querySelectorAll('input[data-canvaslens-text-input]').forEach((n) => n.remove());
    if (container.parentElement) document.body.removeChild(container);
  });

  function fireMouseDown(x: number, y: number, button = 0): void {
    app
      .getCanvas()
      .getElement()
      .dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: x, clientY: y, button }));
  }

  it('does nothing when no tool is active', () => {
    fireMouseDown(200, 200);
    expect(document.querySelectorAll('input[data-canvaslens-text-input]')).toHaveLength(0);
  });

  it('does nothing when a non-text tool is active', () => {
    app.activateTool('rect');
    fireMouseDown(200, 200);
    expect(document.querySelectorAll('input[data-canvaslens-text-input]')).toHaveLength(0);
  });

  it('spawns an input on mousedown while text tool is active', () => {
    app.activateTool('text');
    fireMouseDown(200, 200);
    const inputs = document.querySelectorAll('input[data-canvaslens-text-input]');
    expect(inputs).toHaveLength(1);
    const input = inputs[0] as HTMLInputElement;
    expect(input.parentNode).toBe(document.body);
  });

  it('spawns the input on right-click (button=2) too', () => {
    app.activateTool('text');
    fireMouseDown(200, 200, 2);
    expect(document.querySelectorAll('input[data-canvaslens-text-input]')).toHaveLength(1);
  });

  it('ignores middle-click', () => {
    app.activateTool('text');
    fireMouseDown(200, 200, 1);
    expect(document.querySelectorAll('input[data-canvaslens-text-input]')).toHaveLength(0);
  });

  it('Enter commits a non-empty input and creates an annotation', () => {
    app.activateTool('text');
    fireMouseDown(200, 200);
    const input = document.querySelector('input[data-canvaslens-text-input]') as HTMLInputElement;
    input.value = 'hello';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(document.querySelectorAll('input[data-canvaslens-text-input]')).toHaveLength(0);
    expect(app.getAnnotations()).toHaveLength(1);
    expect(app.getAnnotations()[0]!.type).toBe('text');
    expect(app.getAnnotations()[0]!.data?.text).toBe('hello');
  });

  it('Enter on empty input commits nothing', () => {
    app.activateTool('text');
    fireMouseDown(200, 200);
    const input = document.querySelector('input[data-canvaslens-text-input]') as HTMLInputElement;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(app.getAnnotations()).toHaveLength(0);
  });

  it('Escape cancels without saving and tool stays active', () => {
    app.activateTool('text');
    fireMouseDown(200, 200);
    const input = document.querySelector('input[data-canvaslens-text-input]') as HTMLInputElement;
    input.value = 'discard me';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(document.querySelectorAll('input[data-canvaslens-text-input]')).toHaveLength(0);
    expect(app.getAnnotations()).toHaveLength(0);
    expect(app.getActiveTool()).toBe('text');
  });

  it('handles many sequential text annotations', () => {
    app.activateTool('text');
    for (let i = 0; i < 10; i++) {
      fireMouseDown(200 + i * 30, 200);
      const input = document.querySelector('input[data-canvaslens-text-input]') as HTMLInputElement;
      input.value = `t${i}`;
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    }
    expect(app.getAnnotations()).toHaveLength(10);
  });

  it('clicking again with input open commits the previous one first', () => {
    app.activateTool('text');
    fireMouseDown(200, 200);
    let input = document.querySelector('input[data-canvaslens-text-input]') as HTMLInputElement;
    input.value = 'first';
    // Click somewhere else — should commit 'first' and open a new input
    fireMouseDown(400, 300);
    expect(app.getAnnotations()).toHaveLength(1);
    expect(app.getAnnotations()[0]!.data?.text).toBe('first');
    expect(document.querySelectorAll('input[data-canvaslens-text-input]')).toHaveLength(1);
  });

  it('clamps the start point to image bounds when click lands outside', () => {
    app.activateTool('text');
    // Image bounds are (100, 100) – (700, 500) for a centered 600×400 image
    // inside an 800×600 canvas. Click well above the image:
    fireMouseDown(10, 10);
    const input = document.querySelector('input[data-canvaslens-text-input]') as HTMLInputElement;
    input.value = 'edge';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    const bounds = app.getImageBounds()!;
    const point = app.getAnnotations()[0]!.points[0]!;
    expect(point.x).toBeGreaterThanOrEqual(bounds.x);
    expect(point.y).toBeGreaterThanOrEqual(bounds.y);
  });

  it('stopImmediatePropagation prevents the rect tool from also firing', () => {
    // If the controller didn't stop the event, the EventHandler would try
    // to process the click for whatever the active tool is.
    app.activateTool('text');
    fireMouseDown(200, 200);
    // No rect annotation should have been created.
    expect(app.getAnnotations()).toHaveLength(0);
    expect(document.querySelectorAll('input[data-canvaslens-text-input]')).toHaveLength(1);
  });

  it('destroy() removes the listener', () => {
    app.activateTool('text');
    app.destroy();
    fireMouseDown(200, 200);
    expect(document.querySelectorAll('input[data-canvaslens-text-input]')).toHaveLength(0);
  });
});
