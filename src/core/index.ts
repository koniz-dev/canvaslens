// Application root and canvas exports
export { App } from './App';
export type { AppOptions } from './App';
export { Renderer } from './Renderer';
export type { CanvasHost } from './Renderer';
export type { ModuleContext } from './ModuleContext';

// Phase 1 foundation modules
export { EventBus } from './EventBus';
export type { EventMap, Handler, Unsubscribe } from './EventBus';
export { Store } from './Store';
export type { Listener, Selector, Reducer } from './Store';
export { RenderScheduler } from './RenderScheduler';
export type { RenderFn } from './RenderScheduler';
export {
  appReducer,
  createInitialState,
  DEFAULT_ANNOTATION_STYLE
} from './state';
export type {
  AppState,
  AppAction,
  ImageSlice,
  ViewSlice,
  AnnotationSlice,
  ToolSlice,
  ComparisonSlice,
  OverlaySlice
} from './state';
export type { AppEvents, PointerEventPayload, WheelEventPayload } from './AppEvents';
