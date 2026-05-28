import { appReducer, createInitialState, DEFAULT_ANNOTATION_STYLE } from '../../core/state';
import type { AppAction, AppState } from '../../core/state';
import type { Annotation } from '../../types';

const ann = (id: string): Annotation => ({
  id,
  type: 'rect',
  points: [
    { x: 0, y: 0 },
    { x: 10, y: 10 }
  ],
  style: { strokeColor: '#000', strokeWidth: 1 }
});

describe('appReducer', () => {
  let state: AppState;

  beforeEach(() => {
    state = createInitialState();
  });

  describe('image slice', () => {
    it('image/load-start sets isLoading and clears error', () => {
      const withError = appReducer(state, { type: 'image/load-error', payload: 'oops' });
      const next = appReducer(withError, { type: 'image/load-start' });
      expect(next.image.isLoading).toBe(true);
      expect(next.image.error).toBeNull();
    });

    it('image/load-success stores image data', () => {
      const data = { url: 'x', element: {} as HTMLImageElement, originalSize: { width: 1, height: 1 }, type: 'image/png', fileName: 'a.png' } as never;
      const next = appReducer(state, { type: 'image/load-success', payload: data });
      expect(next.image.data).toBe(data);
      expect(next.image.isLoading).toBe(false);
    });

    it('image/clear is a no-op when already clear', () => {
      const next = appReducer(state, { type: 'image/clear' });
      expect(next).toBe(state);
    });
  });

  describe('view slice', () => {
    it('view/set merges updates', () => {
      const next = appReducer(state, { type: 'view/set', payload: { scale: 2 } });
      expect(next.view.scale).toBe(2);
      expect(next.view.offset).toEqual({ x: 0, y: 0 });
    });

    it('view/set returns same state when nothing changes', () => {
      const next = appReducer(state, { type: 'view/set', payload: {} });
      expect(next).toBe(state);
    });
  });

  describe('annotation slice', () => {
    it('annotation/add inserts and marks dirty', () => {
      const next = appReducer(state, { type: 'annotation/add', payload: ann('a') });
      expect(next.annotation.items.get('a')).toBeDefined();
      expect(next.annotation.hasUnsavedChanges).toBe(true);
    });

    it('annotation/remove deletes and clears selection if same id', () => {
      let s = appReducer(state, { type: 'annotation/add', payload: ann('a') });
      s = appReducer(s, { type: 'annotation/select', payload: 'a' });
      s = appReducer(s, { type: 'annotation/remove', payload: 'a' });
      expect(s.annotation.items.has('a')).toBe(false);
      expect(s.annotation.selectedId).toBeNull();
    });

    it('annotation/remove is no-op for unknown id', () => {
      const next = appReducer(state, { type: 'annotation/remove', payload: 'nope' });
      expect(next).toBe(state);
    });

    it('annotation/clear empties items and selection', () => {
      let s = appReducer(state, { type: 'annotation/add', payload: ann('a') });
      s = appReducer(s, { type: 'annotation/select', payload: 'a' });
      s = appReducer(s, { type: 'annotation/clear' });
      expect(s.annotation.items.size).toBe(0);
      expect(s.annotation.selectedId).toBeNull();
      expect(s.annotation.hasUnsavedChanges).toBe(true);
    });

    it('annotation/clear is no-op when already empty', () => {
      const next = appReducer(state, { type: 'annotation/clear' });
      expect(next).toBe(state);
    });

    it('annotation/select is no-op when same id', () => {
      const s = appReducer(state, { type: 'annotation/select', payload: null });
      expect(s).toBe(state);
    });

    it('annotation/update only updates existing items', () => {
      const next = appReducer(state, { type: 'annotation/update', payload: ann('missing') });
      expect(next).toBe(state);
    });

    it('annotation/reset-changes clears the flag', () => {
      const s = appReducer(state, { type: 'annotation/add', payload: ann('a') });
      const next = appReducer(s, { type: 'annotation/reset-changes' });
      expect(next.annotation.hasUnsavedChanges).toBe(false);
    });

    it('annotation/reset-changes is no-op when already clean', () => {
      const next = appReducer(state, { type: 'annotation/reset-changes' });
      expect(next).toBe(state);
    });

    it('default style is exposed', () => {
      expect(state.annotation.defaultStyle).toEqual(DEFAULT_ANNOTATION_STYLE);
    });
  });

  describe('tool slice', () => {
    it('tool/activate switches active and resets drawing', () => {
      let s = appReducer(state, { type: 'tool/set-drawing', payload: true });
      s = appReducer(s, { type: 'tool/activate', payload: 'rect' });
      expect(s.tool.active).toBe('rect');
      expect(s.tool.drawing).toBe(false);
    });

    it('tool/activate no-op when same', () => {
      const next = appReducer(state, { type: 'tool/activate', payload: null });
      expect(next).toBe(state);
    });

    it('tool/update-config merges', () => {
      const s = appReducer(state, { type: 'tool/update-config', payload: { zoom: true } });
      expect(s.tool.config.zoom).toBe(true);
    });

    it('tool/set-drawing no-op when same value', () => {
      const next = appReducer(state, { type: 'tool/set-drawing', payload: false });
      expect(next).toBe(state);
    });
  });

  describe('comparison slice', () => {
    it('comparison/toggle flips enabled', () => {
      const s = appReducer(state, { type: 'comparison/toggle' });
      expect(s.comparison.enabled).toBe(true);
      const s2 = appReducer(s, { type: 'comparison/toggle' });
      expect(s2.comparison.enabled).toBe(false);
    });

    it('comparison/set no-op when same value', () => {
      const next = appReducer(state, { type: 'comparison/set', payload: false });
      expect(next).toBe(state);
    });

    it('comparison/slider updates position', () => {
      const s = appReducer(state, { type: 'comparison/slider', payload: 0.25 });
      expect(s.comparison.sliderPosition).toBe(0.25);
    });

    it('comparison/slider no-op when same value', () => {
      const next = appReducer(state, { type: 'comparison/slider', payload: 0.5 });
      expect(next).toBe(state);
    });
  });

  describe('overlay slice', () => {
    it('overlay/open then overlay/close toggles', () => {
      const opened = appReducer(state, { type: 'overlay/open' });
      expect(opened.overlay.open).toBe(true);
      const closed = appReducer(opened, { type: 'overlay/close' });
      expect(closed.overlay.open).toBe(false);
    });

    it('overlay/open no-op when already open', () => {
      const opened = appReducer(state, { type: 'overlay/open' });
      const again = appReducer(opened, { type: 'overlay/open' });
      expect(again).toBe(opened);
    });

    it('overlay/close no-op when already closed', () => {
      const next = appReducer(state, { type: 'overlay/close' });
      expect(next).toBe(state);
    });
  });

  it('unknown action returns same state', () => {
    const next = appReducer(state, { type: 'totally-unknown' } as unknown as AppAction);
    expect(next).toBe(state);
  });

  it('createInitialState accepts overrides', () => {
    const s = createInitialState({ view: { scale: 2, offset: { x: 0, y: 0 }, bounds: { width: 100, height: 100 }, minZoom: 0.1, maxZoom: 10 } });
    expect(s.view.scale).toBe(2);
    expect(s.view.bounds.width).toBe(100);
  });
});
