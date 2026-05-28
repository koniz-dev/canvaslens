// Annotation module
export {
  AnnotationManager,
  AnnotationRenderer,
} from './annotation';

export {
  AnnotationToolsManager,
  AnnotationToolsEventHandler,
  AnnotationToolsController,
  AnnotationToolsUtils,
  AnnotationToolsConfig,
  ToolRegistry,
  RECTANGLE_TOOL_PLUGIN,
  ARROW_TOOL_PLUGIN,
  TEXT_TOOL_PLUGIN,
  CIRCLE_TOOL_PLUGIN,
  LINE_TOOL_PLUGIN,
  BUILT_IN_TOOL_PLUGINS,
  createDefaultToolRegistry,
  BaseTool,
  RectangleTool,
  ArrowTool,
  TextTool,
  CircleTool,
  LineTool,
} from './annotation/tools';
export type { ToolPlugin } from './annotation/tools';

// Comparison module
export {
  ComparisonManager,
  ComparisonViewer,
} from './comparison';

// Zoom-pan module
export { ZoomPanHandler } from './zoom-pan';
