import { Renderer } from '../../../core';
import { Annotation, AnnotationStyle, Tool, Point } from '../../../types';
import { AnnotationRenderer } from '../Renderer';
import { AnnotationToolsEventHandler, EventHandlerOptions } from './EventHandler';
import { AnnotationToolsController, ControllerOptions } from './Controller';
import { AnnotationToolsUtils } from './Utils';

export interface ToolManagerOptions {
  defaultStyle: AnnotationStyle;
  availableTools: Tool[];
  annotationManager?: any; // Reference to AnnotationManager for keyboard shortcuts
}

export class AnnotationToolsManager {
  private canvas: Renderer;
  private renderer: AnnotationRenderer;
  private options: ToolManagerOptions;
  private eventHandler: AnnotationToolsEventHandler;
  private controller: AnnotationToolsController;
  private utils: AnnotationToolsUtils;
  private onAnnotationCreate?: (annotation: Annotation) => void;
  private toolManagerDrawing = false; // Track if we're currently drawing

  constructor(
    canvas: Renderer,
    renderer: AnnotationRenderer,
    options: ToolManagerOptions
  ) {
    this.canvas = canvas;
    this.renderer = renderer;
    this.options = options;

    // Initialize utils
    this.utils = new AnnotationToolsUtils(canvas);

    // Initialize controller
    const controllerOptions: ControllerOptions = {
      canvas,
      renderer,
      defaultStyle: options.defaultStyle,
      availableTools: options.availableTools,
      annotationManager: options.annotationManager
    };
    this.controller = new AnnotationToolsController(controllerOptions);

    // Initialize event handler
    const eventHandlerOptions: EventHandlerOptions = {
      canvas,
      renderer,
      currentTool: this.controller.getCurrentTool(),
      activeToolType: this.controller.getActiveToolType(),
      toolActivatedByKeyboard: this.controller.getToolActivatedByKeyboard(),
      toolManagerDrawing: this.toolManagerDrawing,
      annotationManager: options.annotationManager,
      onToolChange: (toolType) => {
        // Update event handler when tool changes
        this.updateEventHandlerOptions();
      },
      onActivateTool: (toolType) => {
        const result = this.controller.activateTool(toolType);
        this.controller.setToolActivatedByKeyboard(true);
        this.updateEventHandlerOptions();
        return result;
      },
      onDeactivateTool: () => {
        this.controller.deactivateTool();
        this.updateEventHandlerOptions();
      },
      onScreenToWorld: (screenPoint) => this.utils.screenToWorld(screenPoint),
      onIsPointInImageBounds: (point) => this.utils.isPointInImageBounds(point),
      onMeetsMinimumSize: (annotation) => this.utils.meetsMinimumSize(annotation, this.controller.getActiveToolType()),
      onClampPointToImageBounds: (point) => this.utils.clampPointToImageBounds(point)
    };

    // Add optional callback if defined
    if (this.onAnnotationCreate) {
      eventHandlerOptions.onAnnotationCreate = this.onAnnotationCreate;
    }
    this.eventHandler = new AnnotationToolsEventHandler(eventHandlerOptions);

    // Setup event listeners
    this.eventHandler.setupEventListeners();
  }

  /**
   * Update event handler options when internal state changes
   */
  private updateEventHandlerOptions(): void {
    const updateOptions: Partial<EventHandlerOptions> = {
      currentTool: this.controller.getCurrentTool(),
      activeToolType: this.controller.getActiveToolType(),
      toolActivatedByKeyboard: this.controller.getToolActivatedByKeyboard(),
      toolManagerDrawing: this.toolManagerDrawing
    };

    // Add optional callback if defined
    if (this.onAnnotationCreate) {
      updateOptions.onAnnotationCreate = this.onAnnotationCreate;
    }

    this.eventHandler.updateOptions(updateOptions);
  }

  /**
   * Activate a tool (click on tool button)
   */
  activateTool(toolType: string): boolean {
    return this.controller.activateTool(toolType);
  }

  /**
   * Deactivate current tool
   */
  deactivateTool(): void {
    this.controller.deactivateTool();
  }

  /**
   * Select a tool by type (legacy method for backward compatibility)
   */
  selectTool(toolType: string): boolean {
    return this.controller.selectTool(toolType);
  }

  /**
   * Get current tool
   */
  getCurrentTool() {
    return this.controller.getCurrentTool();
  }

  /**
   * Get current tool type
   */
  getCurrentToolType(): string | null {
    return this.controller.getCurrentToolType();
  }

  /**
   * Get active tool type (for UI highlighting)
   */
  getActiveToolType(): string | null {
    return this.controller.getActiveToolType();
  }

  /**
   * Set callback for tool change events
   */
  setOnToolChange(callback: (toolType: string | null) => void): void {
    this.controller.setOnToolChange(callback);
  }

  /**
   * Update tool style
   */
  updateToolStyle(style: Partial<AnnotationStyle>): void {
    this.controller.updateToolStyle(style);
  }

  /**
   * Get available tools
   */
  getAvailableTools(): Tool[] {
    return this.controller.getAvailableTools();
  }

  /**
   * Set annotation create callback
   */
  setOnAnnotationCreate(callback: (annotation: Annotation) => void): void {
    this.onAnnotationCreate = callback;
    this.updateEventHandlerOptions();
  }

  /**
   * Render current drawing preview
   */
  renderPreview(): void {
    this.controller.renderPreview();
  }

  /**
   * Check if currently drawing
   */
  isDrawing(): boolean {
    return this.controller.isDrawing();
  }

  /**
   * Check if tool manager is currently drawing
   */
  isToolManagerDrawing(): boolean {
    return this.toolManagerDrawing;
  }

  /**
   * Check if any tool is active
   */
  isToolActive(): boolean {
    return this.controller.isToolActive();
  }

  /**
   * Cancel current drawing
   */
  cancelCurrentDrawing(): void {
    this.controller.cancelCurrentDrawing();
  }

  /**
   * Get current tool configuration
   */
  getToolConfig(): { rect: boolean; arrow: boolean; text: boolean; circle: boolean; line: boolean } {
    return this.controller.getToolConfig();
  }

  /**
   * Update tool configuration
   */
  updateToolConfig(annotationConfig: any): void {
    this.controller.updateToolConfig(annotationConfig);
  }

  /**
   * Destroy tool manager and clean up
   */
  destroy(): void {
    this.eventHandler.destroy();
    this.controller.destroy();
  }
}