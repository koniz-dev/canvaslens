import type { Rectangle } from '../types';
import type { AppEvents } from './AppEvents';
import type { EventBus } from './EventBus';
import type { AppAction, AppState } from './state';
import type { Store } from './Store';

/**
 * The shared context every cooperating module (zoom-pan, annotation,
 * comparison, …) receives from the App. Replaces the previous
 * cross-references via `canvas.imageViewer` / `canvas.annotationManager`.
 *
 * - `bus` / `store`: typed pub/sub + central state.
 * - Image queries: live, owned by the App because they depend on the
 *   loaded image + viewport (cannot be derived from the store alone).
 * - Cross-module requests: routed through the host so callers don't
 *   need a direct reference to the target manager.
 */
export interface ModuleContext {
  readonly bus: EventBus<AppEvents>;
  readonly store: Store<AppState, AppAction>;

  // Image / viewport queries
  getImageBounds(): Rectangle | null;
  isImageLoaded(): boolean;
  isComparisonMode(): boolean;

  // Annotation queries (currently owned by AnnotationManager state, not store)
  isAnnotationToolActive(): boolean;
  isAnnotationDrawing(): boolean;
  hasSelectedAnnotation(): boolean;

  // Cross-module requests
  deselectAnnotation(): void;
  deactivateAnnotationTool(): void;
  requestRender(): void;
}
