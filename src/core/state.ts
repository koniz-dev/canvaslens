import type {
  Annotation,
  AnnotationStyle,
  CustomImageData,
  Point,
  Size,
  ToolConfig
} from '../types';

export interface ImageSlice {
  data: CustomImageData | null;
  isLoading: boolean;
  error: string | null;
}

export interface ViewSlice {
  scale: number;
  offset: Point;
  bounds: Size;
  minZoom: number;
  maxZoom: number;
}

export interface AnnotationSlice {
  items: ReadonlyMap<string, Annotation>;
  selectedId: string | null;
  hasUnsavedChanges: boolean;
  defaultStyle: AnnotationStyle;
}

export interface ToolSlice {
  active: string | null;
  config: ToolConfig;
  drawing: boolean;
}

export interface ComparisonSlice {
  enabled: boolean;
  sliderPosition: number;
  beforeImage: CustomImageData | null;
  afterImage: CustomImageData | null;
}

export interface OverlaySlice {
  open: boolean;
}

export interface AppState {
  image: ImageSlice;
  view: ViewSlice;
  annotation: AnnotationSlice;
  tool: ToolSlice;
  comparison: ComparisonSlice;
  overlay: OverlaySlice;
}

export type AppAction =
  | { type: 'image/load-start' }
  | { type: 'image/load-success'; payload: CustomImageData }
  | { type: 'image/load-error'; payload: string }
  | { type: 'image/clear' }
  | {
      type: 'view/set';
      payload: Partial<Pick<ViewSlice, 'scale' | 'offset' | 'bounds' | 'minZoom' | 'maxZoom'>>;
    }
  | { type: 'annotation/add'; payload: Annotation }
  | { type: 'annotation/remove'; payload: string }
  | { type: 'annotation/clear' }
  | { type: 'annotation/select'; payload: string | null }
  | { type: 'annotation/update'; payload: Annotation }
  | { type: 'annotation/reset-changes' }
  | { type: 'annotation/set-default-style'; payload: AnnotationStyle }
  | { type: 'tool/activate'; payload: string | null }
  | { type: 'tool/set-drawing'; payload: boolean }
  | { type: 'tool/update-config'; payload: ToolConfig }
  | { type: 'comparison/toggle' }
  | { type: 'comparison/set'; payload: boolean }
  | { type: 'comparison/slider'; payload: number }
  | {
      type: 'comparison/set-images';
      payload: { before: CustomImageData | null; after: CustomImageData | null };
    }
  | { type: 'overlay/open' }
  | { type: 'overlay/close' };

export const DEFAULT_ANNOTATION_STYLE: AnnotationStyle = {
  strokeColor: '#ff0000',
  strokeWidth: 2,
  lineStyle: 'solid',
  fontSize: 16,
  fontFamily: 'Arial, sans-serif'
};

export const createInitialState = (overrides: Partial<AppState> = {}): AppState => ({
  image: { data: null, isLoading: false, error: null, ...overrides.image },
  view: {
    scale: 1,
    offset: { x: 0, y: 0 },
    bounds: { width: 800, height: 600 },
    minZoom: 0.1,
    maxZoom: 10,
    ...overrides.view
  },
  annotation: {
    items: new Map(),
    selectedId: null,
    hasUnsavedChanges: false,
    defaultStyle: { ...DEFAULT_ANNOTATION_STYLE },
    ...overrides.annotation
  },
  tool: { active: null, config: {}, drawing: false, ...overrides.tool },
  comparison: {
    enabled: false,
    sliderPosition: 0.5,
    beforeImage: null,
    afterImage: null,
    ...overrides.comparison
  },
  overlay: { open: false, ...overrides.overlay }
});

export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'image/load-start':
      if (state.image.isLoading && state.image.error === null) return state;
      return { ...state, image: { ...state.image, isLoading: true, error: null } };

    case 'image/load-success':
      return { ...state, image: { data: action.payload, isLoading: false, error: null } };

    case 'image/load-error':
      return { ...state, image: { ...state.image, isLoading: false, error: action.payload } };

    case 'image/clear':
      if (!state.image.data && !state.image.error && !state.image.isLoading) return state;
      return { ...state, image: { data: null, isLoading: false, error: null } };

    case 'view/set': {
      const next = { ...state.view, ...action.payload };
      if (
        next.scale === state.view.scale &&
        next.offset === state.view.offset &&
        next.bounds === state.view.bounds &&
        next.minZoom === state.view.minZoom &&
        next.maxZoom === state.view.maxZoom
      ) {
        return state;
      }
      return { ...state, view: next };
    }

    case 'annotation/add': {
      const items = new Map(state.annotation.items);
      items.set(action.payload.id, action.payload);
      return {
        ...state,
        annotation: { ...state.annotation, items, hasUnsavedChanges: true }
      };
    }

    case 'annotation/remove': {
      if (!state.annotation.items.has(action.payload)) return state;
      const items = new Map(state.annotation.items);
      items.delete(action.payload);
      const selectedId =
        state.annotation.selectedId === action.payload ? null : state.annotation.selectedId;
      return {
        ...state,
        annotation: { ...state.annotation, items, selectedId, hasUnsavedChanges: true }
      };
    }

    case 'annotation/clear':
      if (state.annotation.items.size === 0 && state.annotation.selectedId === null) {
        return state;
      }
      return {
        ...state,
        annotation: {
          ...state.annotation,
          items: new Map(),
          selectedId: null,
          hasUnsavedChanges: true
        }
      };

    case 'annotation/select':
      if (state.annotation.selectedId === action.payload) return state;
      return { ...state, annotation: { ...state.annotation, selectedId: action.payload } };

    case 'annotation/update': {
      if (!state.annotation.items.has(action.payload.id)) return state;
      const items = new Map(state.annotation.items);
      items.set(action.payload.id, action.payload);
      return {
        ...state,
        annotation: { ...state.annotation, items, hasUnsavedChanges: true }
      };
    }

    case 'annotation/reset-changes':
      if (!state.annotation.hasUnsavedChanges) return state;
      return { ...state, annotation: { ...state.annotation, hasUnsavedChanges: false } };

    case 'annotation/set-default-style':
      return { ...state, annotation: { ...state.annotation, defaultStyle: action.payload } };

    case 'tool/activate':
      if (state.tool.active === action.payload) return state;
      return { ...state, tool: { ...state.tool, active: action.payload, drawing: false } };

    case 'tool/set-drawing':
      if (state.tool.drawing === action.payload) return state;
      return { ...state, tool: { ...state.tool, drawing: action.payload } };

    case 'tool/update-config':
      return {
        ...state,
        tool: { ...state.tool, config: { ...state.tool.config, ...action.payload } }
      };

    case 'comparison/toggle':
      return {
        ...state,
        comparison: { ...state.comparison, enabled: !state.comparison.enabled }
      };

    case 'comparison/set':
      if (state.comparison.enabled === action.payload) return state;
      return { ...state, comparison: { ...state.comparison, enabled: action.payload } };

    case 'comparison/slider':
      if (state.comparison.sliderPosition === action.payload) return state;
      return { ...state, comparison: { ...state.comparison, sliderPosition: action.payload } };

    case 'comparison/set-images':
      return {
        ...state,
        comparison: {
          ...state.comparison,
          beforeImage: action.payload.before,
          afterImage: action.payload.after
        }
      };

    case 'overlay/open':
      if (state.overlay.open) return state;
      return { ...state, overlay: { open: true } };

    case 'overlay/close':
      if (!state.overlay.open) return state;
      return { ...state, overlay: { open: false } };

    default:
      return state;
  }
};
