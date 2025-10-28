/**
 * Render optimization utilities for CanvasLens
 */
import { Rectangle } from '../../types';
import { ViewportCulling, ViewportInfo } from './viewport-culling';

export interface RenderRegion {
  /** Region bounds */
  bounds: Rectangle;
  /** Region priority (higher = render first) */
  priority: number;
  /** Whether region is dirty */
  dirty: boolean;
  /** Last render time */
  lastRenderTime: number;
}

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

export class RenderOptimizer {
  private static readonly DEFAULT_MAX_REGIONS = 10;
  private static readonly DEFAULT_BATCH_SIZE = 5;
  private static readonly DEFAULT_CULLING_MARGIN = 100;

  private renderRegions: Map<string, RenderRegion> = new Map();
  private dirtyRegions: Set<string> = new Set();
  private renderQueue: string[] = [];
  private isRendering = false;

  /**
   * Add or update a render region
   */
  addRenderRegion(
    id: string,
    bounds: Rectangle,
    priority: number = 0,
    dirty: boolean = true
  ): void {
    const region: RenderRegion = {
      bounds,
      priority,
      dirty,
      lastRenderTime: performance.now()
    };

    this.renderRegions.set(id, region);
    
    if (dirty) {
      this.dirtyRegions.add(id);
      this.addToRenderQueue(id, priority);
    }
  }

  /**
   * Mark region as dirty
   */
  markDirty(id: string): void {
    const region = this.renderRegions.get(id);
    if (region) {
      region.dirty = true;
      this.dirtyRegions.add(id);
      this.addToRenderQueue(id, region.priority);
    }
  }

  /**
   * Mark region as clean
   */
  markClean(id: string): void {
    const region = this.renderRegions.get(id);
    if (region) {
      region.dirty = false;
      this.dirtyRegions.delete(id);
    }
  }

  /**
   * Remove render region
   */
  removeRenderRegion(id: string): void {
    this.renderRegions.delete(id);
    this.dirtyRegions.delete(id);
    this.removeFromRenderQueue(id);
  }

  /**
   * Get regions to render based on viewport and options
   */
  getRegionsToRender(
    viewport: ViewportInfo,
    options: RenderOptions = {}
  ): RenderRegion[] {
    const {
      enableCulling = true,
      cullingMargin = RenderOptimizer.DEFAULT_CULLING_MARGIN,
      maxRegionsPerFrame = RenderOptimizer.DEFAULT_MAX_REGIONS,
      enableDirtyRegions = true
    } = options;

    let regions = Array.from(this.renderRegions.values());

    // Filter by dirty regions if enabled
    if (enableDirtyRegions) {
      regions = regions.filter(region => region.dirty);
    }

    // Apply viewport culling if enabled
    if (enableCulling) {
      const cullableRegions = regions.map(region => ({
        id: this.getRegionId(region),
        bounds: region.bounds,
        visible: true
      }));

      const expandedViewport = ViewportCulling.expandViewport(viewport, cullingMargin);
      const visibleRegions = ViewportCulling.cullObjects(cullableRegions, expandedViewport);
      const visibleIds = new Set(visibleRegions.map(r => r.id));

      regions = regions.filter(region => visibleIds.has(this.getRegionId(region)));
    }

    // Sort by priority and limit count
    regions.sort((a, b) => b.priority - a.priority);
    return regions.slice(0, maxRegionsPerFrame);
  }

  /**
   * Optimize render regions based on viewport changes
   */
  optimizeForViewport(
    viewport: ViewportInfo,
    options: RenderOptions = {}
  ): {
    regionsToRender: RenderRegion[];
    regionsToSkip: RenderRegion[];
    performanceMetrics: { renderTime: number; regionCount: number; skippedRegions: number };
  } {
    const startTime = performance.now();
    
    const regionsToRender = this.getRegionsToRender(viewport, options);
    const allRegions = Array.from(this.renderRegions.values());
    const regionsToSkip = allRegions.filter(region => 
      !regionsToRender.includes(region)
    );

    const endTime = performance.now();
    const optimizationTime = endTime - startTime;

    const performanceMetrics = {
      renderTime: optimizationTime,
      regionCount: regionsToRender.length,
      skippedRegions: regionsToSkip.length
    };

    return {
      regionsToRender,
      regionsToSkip,
      performanceMetrics
    };
  }

  /**
   * Batch render regions for better performance
   */
  batchRenderRegions(
    regions: RenderRegion[],
    batchSize: number = RenderOptimizer.DEFAULT_BATCH_SIZE
  ): RenderRegion[][] {
    const batches: RenderRegion[][] = [];
    
    for (let i = 0; i < regions.length; i += batchSize) {
      batches.push(regions.slice(i, i + batchSize));
    }

    return batches;
  }

  /**
   * Get render statistics
   */
  getRenderStatistics(): {
    totalRegions: number;
    dirtyRegions: number;
    queuedRegions: number;
    averagePriority: number;
    oldestDirtyRegion: number;
  } {
    const regions = Array.from(this.renderRegions.values());
    const dirtyRegions = regions.filter(r => r.dirty);
    const priorities = regions.map(r => r.priority);
    const dirtyTimes = dirtyRegions.map(r => r.lastRenderTime);

    return {
      totalRegions: regions.length,
      dirtyRegions: dirtyRegions.length,
      queuedRegions: this.renderQueue.length,
      averagePriority: priorities.length > 0 ? 
        priorities.reduce((a, b) => a + b, 0) / priorities.length : 0,
      oldestDirtyRegion: dirtyTimes.length > 0 ? 
        Math.min(...dirtyTimes) : 0
    };
  }

  /**
   * Clear all render regions
   */
  clear(): void {
    this.renderRegions.clear();
    this.dirtyRegions.clear();
    this.renderQueue = [];
  }

  /**
   * Add region to render queue with priority
   */
  private addToRenderQueue(id: string, priority: number): void {
    // Remove if already in queue
    this.removeFromRenderQueue(id);
    
    // Insert based on priority
    let insertIndex = this.renderQueue.length;
    for (let i = 0; i < this.renderQueue.length; i++) {
      const queuedId = this.renderQueue[i];
      if (queuedId) {
        const queuedRegion = this.renderRegions.get(queuedId);
        if (queuedRegion && queuedRegion.priority < priority) {
          insertIndex = i;
          break;
        }
      }
    }
    
    this.renderQueue.splice(insertIndex, 0, id);
  }

  /**
   * Remove region from render queue
   */
  private removeFromRenderQueue(id: string): void {
    const index = this.renderQueue.indexOf(id);
    if (index > -1) {
      this.renderQueue.splice(index, 1);
    }
  }

  /**
   * Get region ID from region object
   */
  private getRegionId(region: RenderRegion): string {
    for (const [id, r] of this.renderRegions.entries()) {
      if (r === region) {
        return id;
      }
    }
    return '';
  }

  /**
   * Create render region from bounds
   */
  static createRenderRegion(
    bounds: Rectangle,
    priority: number = 0
  ): RenderRegion {
    return {
      bounds,
      priority,
      dirty: true,
      lastRenderTime: performance.now()
    };
  }

  /**
   * Merge overlapping render regions
   */
  static mergeOverlappingRegions(regions: RenderRegion[]): RenderRegion[] {
    if (regions.length <= 1) return regions;

    const merged: RenderRegion[] = [];
    const processed = new Set<number>();

    for (let i = 0; i < regions.length; i++) {
      if (processed.has(i)) continue;

      let currentRegion = regions[i];
      if (!currentRegion) continue;
      
      processed.add(i);

      // Find overlapping regions
      for (let j = i + 1; j < regions.length; j++) {
        if (processed.has(j)) continue;

        const otherRegion = regions[j];
        if (otherRegion && this.regionsOverlap(currentRegion.bounds, otherRegion.bounds)) {
          currentRegion = this.mergeRegions(currentRegion, otherRegion);
          processed.add(j);
        }
      }

      merged.push(currentRegion);
    }

    return merged;
  }

  /**
   * Check if two regions overlap
   */
  private static regionsOverlap(bounds1: Rectangle, bounds2: Rectangle): boolean {
    return !(
      bounds1.x + bounds1.width < bounds2.x ||
      bounds2.x + bounds2.width < bounds1.x ||
      bounds1.y + bounds1.height < bounds2.y ||
      bounds2.y + bounds2.height < bounds1.y
    );
  }

  /**
   * Merge two render regions
   */
  private static mergeRegions(region1: RenderRegion, region2: RenderRegion): RenderRegion {
    const bounds1 = region1.bounds;
    const bounds2 = region2.bounds;

    const mergedBounds: Rectangle = {
      x: Math.min(bounds1.x, bounds2.x),
      y: Math.min(bounds1.y, bounds2.y),
      width: Math.max(bounds1.x + bounds1.width, bounds2.x + bounds2.width) - Math.min(bounds1.x, bounds2.x),
      height: Math.max(bounds1.y + bounds1.height, bounds2.y + bounds2.height) - Math.min(bounds1.y, bounds2.y)
    };

    return {
      bounds: mergedBounds,
      priority: Math.max(region1.priority, region2.priority),
      dirty: region1.dirty || region2.dirty,
      lastRenderTime: Math.min(region1.lastRenderTime, region2.lastRenderTime)
    };
  }
}
