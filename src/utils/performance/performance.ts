/**
 * Performance monitoring utilities for CanvasLens
 */

export interface PerformanceMetrics {
  renderTime: number;
  annotationCount: number;
  visibleAnnotations: number;
  viewportCullingRatio: number;
  memoryUsage?: number;
  fps?: number;
  frameDrops?: number;
  userInteractions?: number;
  timestamp: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 100; // Keep last 100 measurements
  private isEnabled = false;
  private frameCount = 0;
  private lastFrameTime = 0;
  private fps = 0;
  private frameDrops = 0;
  private userInteractions = 0;
  private lastInteractionTime = 0;

  constructor(enabled: boolean = false) {
    this.isEnabled = enabled;
  }

  /**
   * Enable or disable performance monitoring
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Start timing a render operation
   */
  startRender(): number {
    if (!this.isEnabled) return 0;
    return performance.now();
  }

  /**
   * End timing a render operation and record metrics
   */
  endRender(
    startTime: number,
    annotationCount: number,
    visibleAnnotations: number
  ): void {
    if (!this.isEnabled || startTime === 0) return;

    const renderTime = performance.now() - startTime;
    const viewportCullingRatio = annotationCount > 0 ? 
      (annotationCount - visibleAnnotations) / annotationCount : 0;

    const memoryUsage = this.getMemoryUsage();
    this.updateFPS();
    
    const metric: PerformanceMetrics = {
      renderTime,
      annotationCount,
      visibleAnnotations,
      viewportCullingRatio,
      ...(memoryUsage !== undefined && { memoryUsage }),
      fps: this.fps,
      frameDrops: this.frameDrops,
      userInteractions: this.userInteractions,
      timestamp: Date.now()
    };

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  /**
   * Get current memory usage (if available)
   */
  private getMemoryUsage(): number | undefined {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize;
    }
    return undefined;
  }

  /**
   * Get average render time
   */
  getAverageRenderTime(): number {
    if (this.metrics.length === 0) return 0;
    
    const totalTime = this.metrics.reduce((sum, metric) => sum + metric.renderTime, 0);
    return totalTime / this.metrics.length;
  }

  /**
   * Get average viewport culling ratio
   */
  getAverageCullingRatio(): number {
    if (this.metrics.length === 0) return 0;
    
    const totalRatio = this.metrics.reduce((sum, metric) => sum + metric.viewportCullingRatio, 0);
    return totalRatio / this.metrics.length;
  }

  /**
   * Get performance summary
   */
  getSummary(): {
    averageRenderTime: number;
    averageCullingRatio: number;
    totalMeasurements: number;
    memoryUsage?: number;
  } {
    const memoryUsage = this.getMemoryUsage();
    return {
      averageRenderTime: this.getAverageRenderTime(),
      averageCullingRatio: this.getAverageCullingRatio(),
      totalMeasurements: this.metrics.length,
      ...(memoryUsage !== undefined && { memoryUsage })
    };
  }

  /**
   * Update FPS calculation
   */
  private updateFPS(): void {
    const now = performance.now();
    this.frameCount++;
    
    if (this.lastFrameTime === 0) {
      this.lastFrameTime = now;
      return;
    }
    
    const deltaTime = now - this.lastFrameTime;
    if (deltaTime >= 1000) { // Update FPS every second
      this.fps = Math.round((this.frameCount * 1000) / deltaTime);
      
      // Detect frame drops (FPS < 30)
      if (this.fps < 30) {
        this.frameDrops++;
      }
      
      this.frameCount = 0;
      this.lastFrameTime = now;
    }
  }

  /**
   * Record user interaction
   */
  recordUserInteraction(): void {
    if (!this.isEnabled) return;
    
    this.userInteractions++;
    this.lastInteractionTime = Date.now();
  }

  /**
   * Get current FPS
   */
  getCurrentFPS(): number {
    return this.fps;
  }

  /**
   * Get frame drop count
   */
  getFrameDrops(): number {
    return this.frameDrops;
  }

  /**
   * Get user interaction count
   */
  getUserInteractions(): number {
    return this.userInteractions;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    this.frameCount = 0;
    this.lastFrameTime = 0;
    this.fps = 0;
    this.frameDrops = 0;
    this.userInteractions = 0;
    this.lastInteractionTime = 0;
  }

  /**
   * Get all metrics (for debugging)
   */
  getAllMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * Performance decorator for methods
 */
export function measurePerformance(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;

  descriptor.value = function (...args: any[]) {
    const _startTime = performance.now();
    const result = method.apply(this, args);
    const _endTime = performance.now();
    
    return result;
  };

  return descriptor;
}
