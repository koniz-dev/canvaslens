import type { Renderer } from '../../../core/Renderer';
import type { ToolOptions } from '../../../types';
import type { AnnotationRenderer } from '../Renderer';
import type { BaseTool } from './components/BaseTool';

/**
 * A ToolPlugin describes one annotation tool and knows how to construct
 * an instance of it. Registering a plugin makes the tool available to the
 * AnnotationToolsController.
 *
 * @example
 * ```ts
 * const myStarTool: ToolPlugin = {
 *   type: 'star',
 *   name: 'Star',
 *   icon: '⭐',
 *   create: (canvas, renderer, options) => new StarTool(canvas, renderer, options)
 * };
 * app.tools.register(myStarTool);
 * ```
 */
export interface ToolPlugin {
  /** Unique identifier — used by `activateTool(type)` and tool config flags. */
  readonly type: string;
  /** Human-readable name (used for UI labels). */
  readonly name: string;
  /** Optional icon (emoji, character, or short string). */
  readonly icon?: string;
  /** Factory that constructs the underlying tool instance. */
  create(canvas: Renderer, renderer: AnnotationRenderer, options: ToolOptions): BaseTool;
}
