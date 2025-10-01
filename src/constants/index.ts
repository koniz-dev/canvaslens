export const DEFAULT_CONFIG = {
  WIDTH: 800,
  HEIGHT: 600,
  BACKGROUND_COLOR: '#f0f0f0',
  MAX_ZOOM: 10,
  MIN_ZOOM: 0.1,
  DEFAULT_ZOOM_FACTOR: 1.2
} as const;

export const TOOL_TYPES = {
  RECT: 'rect',
  ARROW: 'arrow',
  TEXT: 'text',
  CIRCLE: 'circle',
  LINE: 'line'
} as const;

export const ANNOTATION_STYLES = {
  DEFAULT_STROKE_COLOR: '#ff0000',
  DEFAULT_FILL_COLOR: 'rgba(255, 0, 0, 0.2)',
  DEFAULT_STROKE_WIDTH: 2,
  DEFAULT_FONT_SIZE: 14,
  DEFAULT_FONT_FAMILY: 'Arial, sans-serif'
} as const;

export const EVENTS = {
  IMAGE_LOAD: 'imageload',
  ZOOM_CHANGE: 'zoomchange',
  PAN_CHANGE: 'panchange',
  ANNOTATION_ADD: 'annotationadd',
  ANNOTATION_REMOVE: 'annotationremove',
  TOOL_CHANGE: 'toolchange',
  COMPARISON_CHANGE: 'comparisonchange'
} as const;

export const KEYBOARD_SHORTCUTS = {
  RECT_TOOL: 'Alt+r',
  ARROW_TOOL: 'Alt+a',
  TEXT_TOOL: 'Alt+t',
  CIRCLE_TOOL: 'Alt+c',
  LINE_TOOL: 'Alt+l',
  ESCAPE: 'Escape',
  DELETE: 'Delete',
  BACKSPACE: 'Backspace'
} as const;
