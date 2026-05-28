import type { Annotation, CustomImageData, Point, Size } from '../types';

export interface PointerEventPayload {
  screen: Point;
  world: Point;
  button: number;
  original: MouseEvent;
}

export interface WheelEventPayload {
  screen: Point;
  world: Point;
  delta: number;
  original: WheelEvent;
}

export type AppEvents = {
  'image:loaded': CustomImageData;
  'image:load-error': Error;
  'view:zoom-changed': number;
  'view:pan-changed': Point;
  'view:resized': Size;
  'view:state-changed': undefined;
  'annotation:added': Annotation;
  'annotation:removed': string;
  'annotation:selected': Annotation | null;
  'annotation:updated': Annotation;
  'tool:changed': string | null;
  'comparison:changed': number;
  'comparison:slider-moved': number;
  'overlay:opened': undefined;
  'overlay:closed': undefined;
  'pointer:down': PointerEventPayload;
  'pointer:move': PointerEventPayload;
  'pointer:up': PointerEventPayload;
  'pointer:context-menu': PointerEventPayload;
  'pointer:wheel': WheelEventPayload;
  'key:down': KeyboardEvent;
  'render:request': string | undefined;
  destroy: undefined;
};
