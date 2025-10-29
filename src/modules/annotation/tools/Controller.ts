import type { Renderer } from '../../../core/Renderer';
import type { AnnotationStyle, Tool, ToolOptions, Point, ControllerOptions } from '../../../types';
import type { AnnotationRenderer } from '../Renderer';
import { ArrowTool } from './components/ArrowTool';
import { BaseTool } from './components/BaseTool';
import { CircleTool } from './components/CircleTool';
import { LineTool } from './components/LineTool';
import { RectangleTool } from './components/RectangleTool';
import { TextTool } from './components/TextTool';

export class AnnotationToolsController {
  private options: ControllerOptions;
  private tools: Map<string, BaseTool> = new Map();
  private currentTool: BaseTool | null = null;
  private activeToolType: string | null = null;
  private toolActivatedByKeyboard = false;

  constructor(options: ControllerOptions) {
    this.options = options;
    this.initializeTools();
  }

  /**
   * Initialize all available tools
   */
  private initializeTools(): void {
    const toolOptions: ToolOptions = {
      style: this.options.defaultStyle
    };

    // Create tool instances
    this.tools.set('rect', new RectangleTool(this.options.canvas as unknown as Renderer, this.options.renderer as unknown as AnnotationRenderer, toolOptions));
    this.tools.set('arrow', new ArrowTool(this.options.canvas as unknown as Renderer, this.options.renderer as unknown as AnnotationRenderer, toolOptions));
    this.tools.set('text', new TextTool(this.options.canvas as unknown as Renderer, this.options.renderer as unknown as AnnotationRenderer, toolOptions));
    this.tools.set('circle', new CircleTool(this.options.canvas as unknown as Renderer, this.options.renderer as unknown as AnnotationRenderer, toolOptions));
    this.tools.set('line', new LineTool(this.options.canvas as unknown as Renderer, this.options.renderer as unknown as AnnotationRenderer, toolOptions));

    // Set default tool to rectangle
    this.currentTool = this.tools.get('rect') || null;
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
   * Get current tool configuration
   */
  getToolConfig(): { rect: boolean; arrow: boolean; text: boolean; circle: boolean; line: boolean } {
    return {
      rect: this.tools.has('rect'),
      arrow: this.tools.has('arrow'),
      text: this.tools.has('text'),
      circle: this.tools.has('circle'),
      line: this.tools.has('line')
    };
  }

  /**
   * Update tool configuration
   */
  updateToolConfig(annotationConfig: Record<string, unknown>): void {
    // Update tool availability based on configuration
    this.tools.forEach((_tool, toolType) => {
      const isEnabled = annotationConfig[toolType];
      if (isEnabled === false) {
        // If tool is disabled and currently active, deactivate it
        if (this.activeToolType === toolType) {
          this.deactivateTool();
        }
      }
    });
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
        (this.options.renderer as unknown as AnnotationRenderer).renderPreview(
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
