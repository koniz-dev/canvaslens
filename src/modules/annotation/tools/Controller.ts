import type { Renderer } from '../../../core/Renderer';
import type { AnnotationStyle, Tool, ToolOptions, Point, ControllerOptions } from '../../../types';
import type { AnnotationManager } from '../Manager';
import type { AnnotationRenderer } from '../Renderer';
import { createDefaultToolRegistry } from './built-in-plugins';
import { BaseTool } from './components/BaseTool';
import { ToolRegistry } from './ToolRegistry';

// Type-safe alias với proper types
type TypedControllerOptions = ControllerOptions<
  Renderer,
  AnnotationRenderer,
  AnnotationManager | undefined,
  ToolRegistry
>;

export class AnnotationToolsController {
  private options: TypedControllerOptions;
  private registry: ToolRegistry;
  private tools: Map<string, BaseTool> = new Map();
  private currentTool: BaseTool | null = null;
  private activeToolType: string | null = null;
  private toolActivatedByKeyboard = false;

  constructor(options: TypedControllerOptions) {
    this.options = options;
    this.registry = options.registry ?? createDefaultToolRegistry();
    this.initializeTools();
  }

  /**
   * Construct tool instances from the registry. Each plugin produces one
   * BaseTool keyed by `plugin.type`.
   */
  private initializeTools(): void {
    const toolOptions: ToolOptions = {
      style: this.options.defaultStyle
    };

    for (const plugin of this.registry.list()) {
      this.tools.set(
        plugin.type,
        plugin.create(this.options.canvas, this.options.renderer, toolOptions)
      );
    }

    // Default active tool: prefer 'rect' if available, else the first registered tool.
    this.currentTool = this.tools.get('rect') ?? this.tools.values().next().value ?? null;
  }

  /** The registry currently driving this controller's tool set. */
  getRegistry(): ToolRegistry {
    return this.registry;
  }

  /** Direct access to a tool instance by type — used by
   *  ShapeDrawingController to drive shape tools without going through
   *  EventHandler. */
  getToolByType(type: string): BaseTool | undefined {
    return this.tools.get(type);
  }

  /**
   * Activate a tool (click on tool button)
   */
  activateTool(toolType: string): boolean {
    const tool = this.tools.get(toolType);
    if (!tool) {
      return false;
    }

    // For now, allow all tools to be activated
    // Tool availability is controlled by the UI configuration

    // Cancel current drawing if switching tools
    if (this.currentTool && this.currentTool !== tool) {
      this.currentTool.cancelDrawing();
    }

    this.currentTool = tool;
    this.activeToolType = toolType;

    return true;
  }

  /**
   * Deactivate current tool
   */
  deactivateTool(): void {
    // Cancel current drawing
    if (this.currentTool) {
      this.currentTool.cancelDrawing();
    }

    this.currentTool = null;
    this.activeToolType = null;
    this.toolActivatedByKeyboard = false; // Reset flag
  }

  /**
   * Select a tool by type (legacy method for backward compatibility)
   */
  selectTool(toolType: string): boolean {
    return this.activateTool(toolType);
  }

  /**
   * Get current tool
   */
  getCurrentTool(): BaseTool | null {
    return this.currentTool;
  }

  /**
   * Get current tool type
   */
  getCurrentToolType(): string | null {
    return this.currentTool?.getType() || null;
  }

  /**
   * Get active tool type (for UI highlighting)
   */
  getActiveToolType(): string | null {
    return this.activeToolType;
  }


  /**
   * Update tool style
   */
  updateToolStyle(style: Partial<AnnotationStyle>): void {
    const newStyle = { ...this.options.defaultStyle, ...style };
    this.options.defaultStyle = newStyle;

    // Update all tools
    this.tools.forEach(tool => {
      tool.updateOptions({ style: newStyle });
    });
  }

  /**
   * Get available tools
   */
  getAvailableTools(): Tool[] {
    return this.options.availableTools;
  }

  /**
   * Get current tool configuration. Returns a record keyed by registered tool
   * types so plugin-provided tools are surfaced just like built-ins.
   */
  getToolConfig(): Record<string, boolean> {
    const cfg: Record<string, boolean> = {};
    for (const type of this.tools.keys()) cfg[type] = true;
    // Preserve the legacy keys so callers that destructure rect/arrow/… still work.
    for (const k of ['rect', 'arrow', 'text', 'circle', 'line'] as const) {
      if (!(k in cfg)) cfg[k] = false;
    }
    return cfg;
  }

  /**
   * Update tool configuration: deactivate any tool turned off, and forward
   * the `style` slice (if present) to all tools so subsequent draws use the
   * new style.
   */
  updateToolConfig(annotationConfig: Record<string, unknown>): void {
    this.tools.forEach((_tool, toolType) => {
      const isEnabled = annotationConfig[toolType];
      if (isEnabled === false && this.activeToolType === toolType) {
        this.deactivateTool();
      }
    });

    const style = annotationConfig.style as Partial<AnnotationStyle> | undefined;
    if (style && typeof style === 'object') {
      this.updateToolStyle(style);
    }
  }

  /**
   * Check if currently drawing
   */
  isDrawing(): boolean {
    return this.currentTool?.isCurrentlyDrawing() || false;
  }

  /**
   * Check if any tool is active
   */
  isToolActive(): boolean {
    return this.activeToolType !== null;
  }

  /**
   * Cancel current drawing
   */
  cancelCurrentDrawing(): void {
    if (this.currentTool) {
      this.currentTool.cancelDrawing();
    }
  }

  /**
   * Render current drawing preview
   */
  renderPreview(): void {
    if (!this.currentTool || !this.currentTool.isCurrentlyDrawing()) return;

    const tool = this.currentTool;
    if (tool && 'getPreviewPoints' in tool && typeof tool.getPreviewPoints === 'function') {
      const points = (tool as { getPreviewPoints: () => Point[] }).getPreviewPoints();
      if (points.length > 0) {
        // Render preview (no need to apply view transform since points are in world coordinates)
        this.options.renderer.renderPreview(
          this.currentTool.getType(),
          points,
          this.options.defaultStyle
        );
      }
    }
  }

  /**
   * Get tool activated by keyboard flag
   */
  getToolActivatedByKeyboard(): boolean {
    return this.toolActivatedByKeyboard;
  }

  /**
   * Set tool activated by keyboard flag
   */
  setToolActivatedByKeyboard(activated: boolean): void {
    this.toolActivatedByKeyboard = activated;
  }

  /**
   * Destroy controller and clean up
   */
  destroy(): void {
    // Cancel any active drawing
    this.cancelCurrentDrawing();

    // Clear tools
    this.tools.clear();
    this.currentTool = null;
    this.activeToolType = null;
  }
}
