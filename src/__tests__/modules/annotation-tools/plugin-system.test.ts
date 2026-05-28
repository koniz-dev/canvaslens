import { App } from '../../../core/App';
import {
  BUILT_IN_TOOL_PLUGINS,
  RECTANGLE_TOOL_PLUGIN,
  ToolRegistry,
  createDefaultToolRegistry
} from '../../../modules/annotation/tools';
import { BaseTool } from '../../../modules/annotation/tools/components/BaseTool';
import type { ToolPlugin } from '../../../modules/annotation/tools/ToolPlugin';
import type { Annotation, Point } from '../../../types';

class StarTool extends BaseTool {
  startDrawing(point: Point): Annotation {
    this.isDrawing = true;
    this.startPoint = point;
    return this.createAnnotation([point], { shape: 'star' });
  }
  continueDrawing(_point: Point): void {
    /* preview happens elsewhere */
  }
  finishDrawing(point: Point): Annotation {
    this.isDrawing = false;
    return this.createAnnotation([point], { shape: 'star' });
  }
  getType(): Annotation['type'] {
    return 'rect'; // BaseTool's Annotation['type'] is constrained; for the demo we re-use rect
  }
}

const STAR_PLUGIN: ToolPlugin = {
  type: 'star',
  name: 'Star',
  icon: '⭐',
  create: (canvas, renderer, options) => new StarTool(canvas, renderer, options)
};

describe('ToolRegistry', () => {
  it('register / get / has / list / size', () => {
    const r = new ToolRegistry();
    expect(r.size()).toBe(0);
    r.register(RECTANGLE_TOOL_PLUGIN);
    expect(r.size()).toBe(1);
    expect(r.has('rect')).toBe(true);
    expect(r.get('rect')).toBe(RECTANGLE_TOOL_PLUGIN);
    expect(r.list()).toContain(RECTANGLE_TOOL_PLUGIN);
  });

  it('unregister removes a plugin', () => {
    const r = new ToolRegistry([RECTANGLE_TOOL_PLUGIN]);
    expect(r.unregister('rect')).toBe(true);
    expect(r.unregister('missing')).toBe(false);
    expect(r.has('rect')).toBe(false);
  });

  it('clear empties the registry', () => {
    const r = new ToolRegistry(BUILT_IN_TOOL_PLUGINS);
    expect(r.size()).toBe(5);
    r.clear();
    expect(r.size()).toBe(0);
  });

  it('registering the same type warns but overrides', () => {
    const r = new ToolRegistry([RECTANGLE_TOOL_PLUGIN]);
    const replacement: ToolPlugin = { ...RECTANGLE_TOOL_PLUGIN, name: 'Replacement' };
    r.register(replacement);
    expect(r.get('rect')!.name).toBe('Replacement');
  });

  it('createDefaultToolRegistry contains the five built-ins', () => {
    const r = createDefaultToolRegistry();
    expect(r.size()).toBe(5);
    for (const t of ['rect', 'arrow', 'text', 'circle', 'line']) {
      expect(r.has(t)).toBe(true);
    }
  });
});

describe('App plugin integration', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container.parentElement) document.body.removeChild(container);
  });

  it('App exposes the toolRegistry pre-populated with built-ins', () => {
    const app = new App({ container, tools: { annotation: { rect: true } } });
    expect(app.toolRegistry).toBeDefined();
    expect(app.toolRegistry.size()).toBe(5);
    app.destroy();
  });

  it('plugins option adds new plugins to the registry', () => {
    const app = new App({
      container,
      plugins: [STAR_PLUGIN],
      tools: { annotation: { rect: true } }
    });
    expect(app.toolRegistry.has('star')).toBe(true);
    expect(app.toolRegistry.size()).toBe(6);
    app.destroy();
  });

  it('custom plugin is available via activateTool', () => {
    const app = new App({
      container,
      plugins: [STAR_PLUGIN],
      tools: { annotation: { rect: true } }
    });
    const ok = app.activateTool('star');
    expect(ok).toBe(true);
    expect(app.getActiveTool()).toBe('star');
    app.destroy();
  });

  it('built-in plugins still work when extra plugins are provided', () => {
    const app = new App({
      container,
      plugins: [STAR_PLUGIN],
      tools: { annotation: { rect: true, arrow: true } }
    });
    expect(app.activateTool('rect')).toBe(true);
    expect(app.activateTool('arrow')).toBe(true);
    app.destroy();
  });
});
