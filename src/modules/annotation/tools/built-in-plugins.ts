import { ArrowTool } from './components/ArrowTool';
import { CircleTool } from './components/CircleTool';
import { LineTool } from './components/LineTool';
import { RectangleTool } from './components/RectangleTool';
import { TextTool } from './components/TextTool';
import type { ToolPlugin } from './ToolPlugin';
import { ToolRegistry } from './ToolRegistry';

export const RECTANGLE_TOOL_PLUGIN: ToolPlugin = {
  type: 'rect',
  name: 'Rectangle',
  icon: '⬜',
  create: (canvas, renderer, options) => new RectangleTool(canvas, renderer, options)
};

export const ARROW_TOOL_PLUGIN: ToolPlugin = {
  type: 'arrow',
  name: 'Arrow',
  icon: '↗',
  create: (canvas, renderer, options) => new ArrowTool(canvas, renderer, options)
};

export const TEXT_TOOL_PLUGIN: ToolPlugin = {
  type: 'text',
  name: 'Text',
  icon: 'T',
  create: (canvas, renderer, options) => new TextTool(canvas, renderer, options)
};

export const CIRCLE_TOOL_PLUGIN: ToolPlugin = {
  type: 'circle',
  name: 'Circle',
  icon: '⭕',
  create: (canvas, renderer, options) => new CircleTool(canvas, renderer, options)
};

export const LINE_TOOL_PLUGIN: ToolPlugin = {
  type: 'line',
  name: 'Line',
  icon: '📏',
  create: (canvas, renderer, options) => new LineTool(canvas, renderer, options)
};

export const BUILT_IN_TOOL_PLUGINS: readonly ToolPlugin[] = [
  RECTANGLE_TOOL_PLUGIN,
  ARROW_TOOL_PLUGIN,
  TEXT_TOOL_PLUGIN,
  CIRCLE_TOOL_PLUGIN,
  LINE_TOOL_PLUGIN
];

/** Build a registry pre-populated with the five built-in annotation tools. */
export function createDefaultToolRegistry(): ToolRegistry {
  return new ToolRegistry(BUILT_IN_TOOL_PLUGINS);
}
