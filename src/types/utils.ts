import type { Point, Rectangle, Size } from './index';

/**
 * Options for image loading
 * @interface ImageLoadOptions
 */
export interface ImageLoadOptions {
  /** Maximum image size before lazy loading (in bytes) */
  maxSizeForEagerLoad?: number;
  /** Enable progressive loading for large images */
  progressiveLoading?: boolean;
  /** Enable image compression for large images */
  enableCompression?: boolean;
  /** Compression quality (0-1) */
  compressionQuality?: number;
  /** Enable WebP format if supported */
  preferWebP?: boolean;
  /** Enable AVIF format if supported */
  preferAVIF?: boolean;
}

/**
 * Options for lazy loading
 * @interface LazyLoadOptions
 */
export interface LazyLoadOptions {
  /** Threshold for triggering lazy load (in pixels) */
  threshold?: number;
  /** Root margin for intersection observer */
  rootMargin?: string;
  /** Enable placeholder while loading */
  showPlaceholder?: boolean;
  /** Placeholder image URL */
  placeholderUrl?: string;
}

/**
 * Region for rendering optimization
 * @interface RenderRegion
 */
export interface RenderRegion {
  /** Region bounds */
  bounds: Rectangle;
  /** Region priority (higher = render first) */
  priority: number;
  /** Whether region is dirty and needs re-rendering */
  dirty: boolean;
  /** Last render timestamp */
  lastRenderTime: number;
}

/**
 * Options for rendering
 * @interface RenderOptions
 */
export interface RenderOptions {
  /** Enable viewport culling */
  enableCulling?: boolean;
  /** Culling margin in pixels */
  cullingMargin?: number;
  /** Maximum render regions per frame */
  maxRegionsPerFrame?: number;
  /** Enable dirty region tracking */
  enableDirtyRegions?: boolean;
  /** Enable render batching */
  enableBatching?: boolean;
  /** Batch size for rendering */
  batchSize?: number;
}

/**
 * Information about viewport for culling
 * @interface ViewportInfo
 */
export interface ViewportInfo {
  /** Current viewport position */
  position: Point;
  /** Current viewport size */
  size: Size;
  /** Viewport bounds */
  bounds: Rectangle;
  /** Zoom level */
  zoom: number;
}

/**
 * Object that can be culled based on viewport
 * @interface CullableObject
 */
export interface CullableObject {
  /** Object bounds */
  bounds: Rectangle;
  /** Whether object is visible */
  visible: boolean;
  /** Object priority */
  priority: number;
  /** Object type */
  type: string;
}

/**
 * Performance metrics
 * @interface PerformanceMetrics
 */
export interface PerformanceMetrics {
  /** Timestamp */
  timestamp: number;
  /** Frames per second */
  fps?: number;
  /** Render time in milliseconds */
  renderTime: number;
  /** Number of objects rendered */
  frameDrops?: number;
  /** Memory usage in bytes */
  memoryUsage?: number;
  /** Number of annotations rendered */
  annotationCount: number;
  /** Number of visible annotations */
  visibleAnnotations: number;
  /** Viewport culling ratio */
  viewportCullingRatio: number;
  /** Number of user interactions */
  userInteractions?: number;
}
