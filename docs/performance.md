# CanvasLens Performance Guide

## Table of Contents

- [Performance Overview](#performance-overview)
- [Image Optimization](#image-optimization)
- [Canvas Rendering Optimization](#canvas-rendering-optimization)
- [Memory Management](#memory-management)
- [Event Handling Optimization](#event-handling-optimization)
- [Annotation Performance](#annotation-performance)
- [Browser-Specific Optimizations](#browser-specific-optimizations)
- [Performance Monitoring](#performance-monitoring)
- [Best Practices](#best-practices)

## Performance Overview

CanvasLens is designed for high-performance image viewing and annotation with built-in optimization features. Performance can be affected by various factors including image size, browser capabilities, and implementation choices. This guide provides comprehensive strategies for optimizing CanvasLens performance.

### Performance Metrics

Key performance indicators to monitor:

- **Image Load Time**: Time to load and display images
- **Rendering FPS**: Frames per second during interactions
- **Memory Usage**: RAM consumption over time
- **CPU Usage**: Processor utilization during operations
- **Interaction Latency**: Response time to user actions
- **Canvas Operations**: Number of canvas operations per frame
- **Viewport Culling**: Efficiency of off-screen element culling

### Performance Targets

- **Image Load**: < 2 seconds for images up to 10MB
- **Rendering**: 60 FPS during zoom/pan operations
- **Memory**: < 500MB for typical usage
- **Interaction**: < 16ms response time (60 FPS)
- **Canvas Operations**: < 100 operations per frame
- **Viewport Culling**: 90%+ efficiency for large datasets

## Image Optimization

### 1. Image Size and Format

#### Optimal Image Sizes
```javascript
// Recommended image dimensions for different use cases
const imageSizeGuidelines = {
  thumbnail: { width: 200, height: 150 },
  preview: { width: 800, height: 600 },
  fullView: { width: 1920, height: 1080 },
  highRes: { width: 3840, height: 2160 } // 4K
};

// Resize images on server or client
function optimizeImageSize(src, targetWidth, targetHeight) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.src = src;
  });
}
```

#### Image Format Selection
```javascript
// Choose optimal format based on use case
function selectOptimalFormat(useCase) {
  const formatRecommendations = {
    photos: 'image/jpeg', // Best for photographs
    graphics: 'image/png', // Best for graphics with transparency
    animations: 'image/gif', // For simple animations
    modern: 'image/webp', // Best compression, modern browsers
    vector: 'image/svg+xml' // For scalable graphics
  };
  
  return formatRecommendations[useCase] || 'image/jpeg';
}
```

### 2. Progressive Loading

#### Low-Resolution Preview
```javascript
class ProgressiveImageLoader {
  constructor(viewer) {
    this.viewer = viewer;
    this.loadingQueue = [];
  }
  
  async loadProgressive(src, lowResSrc) {
    // Load low-resolution version first
    await this.viewer.loadImage(lowResSrc);
    
    // Load high-resolution in background
    const highResImg = new Image();
    highResImg.onload = () => {
      this.viewer.loadImage(src);
    };
    highResImg.src = src;
  }
  
  // Generate low-resolution version
  generateLowRes(src, scale = 0.25) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = src;
    });
  }
}
```

#### Image Tiling for Large Images
```javascript
class TiledImageLoader {
  constructor(viewer, tileSize = 512) {
    this.viewer = viewer;
    this.tileSize = tileSize;
    this.tileCache = new Map();
  }
  
  async loadTiledImage(imageUrl, imageWidth, imageHeight) {
    const tilesX = Math.ceil(imageWidth / this.tileSize);
    const tilesY = Math.ceil(imageHeight / this.tileSize);
    
    // Load visible tiles first
    const visibleTiles = this.getVisibleTiles(tilesX, tilesY);
    await this.loadTiles(imageUrl, visibleTiles);
    
    // Preload adjacent tiles
    const adjacentTiles = this.getAdjacentTiles(visibleTiles, tilesX, tilesY);
    this.preloadTiles(imageUrl, adjacentTiles);
  }
  
  getVisibleTiles(tilesX, tilesY) {
    const viewport = this.viewer.getViewport();
    const tiles = [];
    
    for (let x = 0; x < tilesX; x++) {
      for (let y = 0; y < tilesY; y++) {
        const tileBounds = {
          x: x * this.tileSize,
          y: y * this.tileSize,
          width: this.tileSize,
          height: this.tileSize
        };
        
        if (this.isTileVisible(tileBounds, viewport)) {
          tiles.push({ x, y });
        }
      }
    }
    
    return tiles;
  }
}
```

### 3. Image Caching

#### Browser Cache Optimization
```javascript
class ImageCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.accessOrder = [];
  }
  
  get(src) {
    if (this.cache.has(src)) {
      // Move to end of access order (most recently used)
      const index = this.accessOrder.indexOf(src);
      this.accessOrder.splice(index, 1);
      this.accessOrder.push(src);
      return this.cache.get(src);
    }
    return null;
  }
  
  set(src, image) {
    // Remove oldest if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldest = this.accessOrder.shift();
      this.cache.delete(oldest);
    }
    
    this.cache.set(src, image);
    this.accessOrder.push(src);
  }
  
  preload(src) {
    if (!this.cache.has(src)) {
      const img = new Image();
      img.onload = () => this.set(src, img);
      img.src = src;
    }
  }
}
```

#### Service Worker Caching
```javascript
// service-worker.js
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/images/')) {
    event.respondWith(
      caches.open('images-v1').then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          
          return fetch(event.request).then((fetchResponse) => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
  }
});
```

## Canvas Rendering Optimization

### 1. Rendering Pipeline Optimization

#### Efficient Canvas Operations
```javascript
class OptimizedRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.needsRedraw = false;
    this.lastFrameTime = 0;
  }
  
  // Use requestAnimationFrame for smooth rendering
  render() {
    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;
    
    if (deltaTime >= 16.67) { // ~60 FPS
      this.performRender();
      this.lastFrameTime = now;
    }
    
    if (this.needsRedraw) {
      requestAnimationFrame(() => this.render());
    }
  }
  
  performRender() {
    // Clear only the dirty regions
    this.clearDirtyRegions();
    
    // Render only what's needed
    this.renderImage();
    this.renderAnnotations();
    
    this.needsRedraw = false;
  }
  
  // Optimize canvas clearing
  clearDirtyRegions() {
    const dirtyRegions = this.getDirtyRegions();
    dirtyRegions.forEach(region => {
      this.ctx.clearRect(region.x, region.y, region.width, region.height);
    });
  }
}
```

#### Hardware Acceleration
```javascript
// Enable hardware acceleration
function enableHardwareAcceleration(canvas) {
  const ctx = canvas.getContext('2d');
  
  // Enable image smoothing for better quality
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  // Use CSS transforms for better performance
  canvas.style.transform = 'translateZ(0)';
  canvas.style.willChange = 'transform';
  
  // Enable GPU acceleration
  ctx.globalCompositeOperation = 'source-over';
}
```

### 2. Viewport Culling

#### Render Only Visible Content
```javascript
class ViewportCuller {
  constructor(viewer) {
    this.viewer = viewer;
  }
  
  isInViewport(element, viewport) {
    return !(
      element.x > viewport.x + viewport.width ||
      element.x + element.width < viewport.x ||
      element.y > viewport.y + viewport.height ||
      element.y + element.height < viewport.y
    );
  }
  
  getVisibleAnnotations(annotations, viewport) {
    return annotations.filter(annotation => 
      this.isInViewport(annotation, viewport)
    );
  }
  
  getVisibleImageRegion(imageBounds, viewport) {
    return {
      x: Math.max(imageBounds.x, viewport.x),
      y: Math.max(imageBounds.y, viewport.y),
      width: Math.min(
        imageBounds.x + imageBounds.width,
        viewport.x + viewport.width
      ) - Math.max(imageBounds.x, viewport.x),
      height: Math.min(
        imageBounds.y + imageBounds.height,
        viewport.y + viewport.height
      ) - Math.max(imageBounds.y, viewport.y)
    };
  }
}
```

### 3. Level of Detail (LOD)

#### Adaptive Quality Based on Zoom
```javascript
class AdaptiveQuality {
  constructor(viewer) {
    this.viewer = viewer;
    this.qualityLevels = {
      low: { scale: 0.5, quality: 0.7 },
      medium: { scale: 0.75, quality: 0.8 },
      high: { scale: 1.0, quality: 0.9 },
      ultra: { scale: 1.0, quality: 1.0 }
    };
  }
  
  getQualityLevel(zoom) {
    if (zoom < 0.5) return 'low';
    if (zoom < 1.0) return 'medium';
    if (zoom < 2.0) return 'high';
    return 'ultra';
  }
  
  renderWithAdaptiveQuality(image, zoom) {
    const quality = this.qualityLevels[this.getQualityLevel(zoom)];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = image.width * quality.scale;
    canvas.height = image.height * quality.scale;
    
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', quality.quality);
  }
}
```

## Memory Management

### 1. Resource Cleanup

#### Proper Disposal
```javascript
class ResourceManager {
  constructor() {
    this.resources = new Set();
    this.cleanupCallbacks = new Map();
  }
  
  register(resource, cleanupCallback) {
    this.resources.add(resource);
    this.cleanupCallbacks.set(resource, cleanupCallback);
  }
  
  dispose(resource) {
    if (this.resources.has(resource)) {
      const cleanup = this.cleanupCallbacks.get(resource);
      if (cleanup) {
        cleanup();
      }
      this.resources.delete(resource);
      this.cleanupCallbacks.delete(resource);
    }
  }
  
  disposeAll() {
    this.resources.forEach(resource => {
      this.dispose(resource);
    });
  }
}

// Usage in CanvasLens
class CanvasLensCore {
  constructor() {
    this.resourceManager = new ResourceManager();
  }
  
  destroy() {
    // Clean up all resources
    this.resourceManager.disposeAll();
    
    // Remove event listeners
    this.removeAllEventListeners();
    
    // Clear references
    this.canvas = null;
    this.ctx = null;
    this.image = null;
  }
}
```

#### Image Memory Management
```javascript
class ImageMemoryManager {
  constructor() {
    this.imageCache = new Map();
    this.maxCacheSize = 50; // Maximum number of images in cache
  }
  
  loadImage(src) {
    if (this.imageCache.has(src)) {
      return Promise.resolve(this.imageCache.get(src));
    }
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.addToCache(src, img);
        resolve(img);
      };
      
      img.onerror = reject;
      img.src = src;
    });
  }
  
  addToCache(src, img) {
    // Remove oldest images if cache is full
    if (this.imageCache.size >= this.maxCacheSize) {
      const firstKey = this.imageCache.keys().next().value;
      this.imageCache.delete(firstKey);
    }
    
    this.imageCache.set(src, img);
  }
  
  clearCache() {
    this.imageCache.clear();
  }
  
  // Monitor memory usage
  getMemoryUsage() {
    let totalSize = 0;
    this.imageCache.forEach((img) => {
      totalSize += img.width * img.height * 4; // RGBA
    });
    return totalSize;
  }
}
```

### 2. Garbage Collection Optimization

#### Object Pooling
```javascript
class ObjectPool {
  constructor(createFn, resetFn, initialSize = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.pool = [];
    
    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }
  
  acquire() {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    return this.createFn();
  }
  
  release(obj) {
    this.resetFn(obj);
    this.pool.push(obj);
  }
}

// Usage for annotations
const annotationPool = new ObjectPool(
  () => ({ id: '', type: '', x: 0, y: 0, width: 0, height: 0 }),
  (annotation) => {
    annotation.id = '';
    annotation.type = '';
    annotation.x = 0;
    annotation.y = 0;
    annotation.width = 0;
    annotation.height = 0;
  }
);
```

#### Weak References
```javascript
class WeakReferenceManager {
  constructor() {
    this.weakMap = new WeakMap();
  }
  
  setReference(key, value) {
    this.weakMap.set(key, value);
  }
  
  getReference(key) {
    return this.weakMap.get(key);
  }
  
  // WeakMap automatically handles garbage collection
  // No need for manual cleanup
}
```

## Event Handling Optimization

### 1. Event Debouncing and Throttling

#### Debounced Events
```javascript
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Usage for resize events
const debouncedResize = debounce(() => {
  viewer.handleResize();
}, 250);

window.addEventListener('resize', debouncedResize);
```

#### Throttled Events
```javascript
function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Usage for mouse move events
const throttledMouseMove = throttle((event) => {
  viewer.handleMouseMove(event);
}, 16); // ~60 FPS

canvas.addEventListener('mousemove', throttledMouseMove);
```

### 2. Event Delegation

#### Efficient Event Handling
```javascript
class EventDelegator {
  constructor(container) {
    this.container = container;
    this.handlers = new Map();
    this.setupDelegation();
  }
  
  setupDelegation() {
    // Use event delegation for better performance
    this.container.addEventListener('click', this.handleClick.bind(this));
    this.container.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.container.addEventListener('mouseup', this.handleMouseUp.bind(this));
  }
  
  handleClick(event) {
    const target = event.target;
    const handler = this.handlers.get('click');
    if (handler) {
      handler(event, target);
    }
  }
  
  register(eventType, handler) {
    this.handlers.set(eventType, handler);
  }
}
```

### 3. Passive Event Listeners

#### Optimize Scroll and Touch Events
```javascript
// Use passive listeners for better performance
canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
canvas.addEventListener('touchend', handleTouchEnd, { passive: true });

// Use passive for scroll events
window.addEventListener('scroll', handleScroll, { passive: true });
```

## Annotation Performance

### 1. Efficient Annotation Rendering

#### Batch Rendering
```javascript
class AnnotationRenderer {
  constructor(ctx) {
    this.ctx = ctx;
    this.renderQueue = [];
  }
  
  addToQueue(annotation) {
    this.renderQueue.push(annotation);
  }
  
  renderBatch() {
    // Group annotations by type for efficient rendering
    const grouped = this.groupByType(this.renderQueue);
    
    Object.keys(grouped).forEach(type => {
      this.renderType(type, grouped[type]);
    });
    
    this.renderQueue = [];
  }
  
  groupByType(annotations) {
    return annotations.reduce((groups, annotation) => {
      const type = annotation.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(annotation);
      return groups;
    }, {});
  }
  
  renderType(type, annotations) {
    // Set common properties for this type
    this.setCommonProperties(type);
    
    // Render all annotations of this type
    annotations.forEach(annotation => {
      this.renderAnnotation(annotation);
    });
  }
}
```

#### Annotation Caching
```javascript
class AnnotationCache {
  constructor() {
    this.cache = new Map();
    this.dirtyAnnotations = new Set();
  }
  
  getCached(annotation) {
    const key = this.getCacheKey(annotation);
    return this.cache.get(key);
  }
  
  setCached(annotation, canvas) {
    const key = this.getCacheKey(annotation);
    this.cache.set(key, canvas);
  }
  
  markDirty(annotation) {
    this.dirtyAnnotations.add(annotation.id);
  }
  
  isDirty(annotation) {
    return this.dirtyAnnotations.has(annotation.id);
  }
  
  getCacheKey(annotation) {
    return `${annotation.type}-${annotation.x}-${annotation.y}-${annotation.width}-${annotation.height}`;
  }
}
```

### 2. Annotation Selection Optimization

#### Spatial Indexing
```javascript
class SpatialIndex {
  constructor(cellSize = 100) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }
  
  add(annotation) {
    const cells = this.getCells(annotation);
    cells.forEach(cell => {
      if (!this.grid.has(cell)) {
        this.grid.set(cell, []);
      }
      this.grid.get(cell).push(annotation);
    });
  }
  
  remove(annotation) {
    const cells = this.getCells(annotation);
    cells.forEach(cell => {
      const cellAnnotations = this.grid.get(cell);
      if (cellAnnotations) {
        const index = cellAnnotations.indexOf(annotation);
        if (index > -1) {
          cellAnnotations.splice(index, 1);
        }
      }
    });
  }
  
  query(point) {
    const cell = this.getCell(point);
    const cellAnnotations = this.grid.get(cell) || [];
    
    return cellAnnotations.filter(annotation => 
      this.pointInAnnotation(point, annotation)
    );
  }
  
  getCells(annotation) {
    const cells = [];
    const startX = Math.floor(annotation.x / this.cellSize);
    const startY = Math.floor(annotation.y / this.cellSize);
    const endX = Math.floor((annotation.x + annotation.width) / this.cellSize);
    const endY = Math.floor((annotation.y + annotation.height) / this.cellSize);
    
    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        cells.push(`${x},${y}`);
      }
    }
    
    return cells;
  }
}
```

## Browser-Specific Optimizations

### 1. Chrome Optimizations

#### Chrome-Specific Features
```javascript
// Use Chrome's experimental features
if (window.chrome && window.chrome.runtime) {
  // Enable Chrome-specific optimizations
  canvas.style.willChange = 'transform';
  canvas.style.transform = 'translateZ(0)';
}

// Use Chrome's high-resolution timestamps
const startTime = performance.now();
// ... perform operation
const endTime = performance.now();
console.log(`Operation took ${endTime - startTime} milliseconds`);
```

### 2. Firefox Optimizations

#### Firefox-Specific Features
```javascript
// Optimize for Firefox
if (navigator.userAgent.includes('Firefox')) {
  // Use Firefox-specific canvas optimizations
  ctx.mozImageSmoothingEnabled = true;
  ctx.mozImageSmoothingQuality = 'high';
}
```

### 3. Safari Optimizations

#### Safari-Specific Features
```javascript
// Optimize for Safari
if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
  // Use Safari-specific optimizations
  canvas.style.webkitTransform = 'translateZ(0)';
  canvas.style.webkitBackfaceVisibility = 'hidden';
}
```

## Performance Monitoring

### 1. Built-in Performance Tools

#### Performance Monitor
```javascript
import { PerformanceMonitor, performanceMonitor } from '@koniz-dev/canvaslens';

// Enable performance monitoring
const monitor = new PerformanceMonitor();
monitor.start();

// Or use the global instance
performanceMonitor.start();

// Get performance metrics
const metrics = performanceMonitor.getMetrics();
console.log('FPS:', metrics.fps);
console.log('Memory:', metrics.memoryUsage);
console.log('Render Time:', metrics.renderTime);
```

#### Performance Profiling
```javascript
// Start performance profiling
performanceMonitor.startProfiling('image-load');

// Perform operations
await viewer.loadImage('large-image.jpg');

// Stop profiling and get results
const profile = performanceMonitor.stopProfiling('image-load');
console.log('Profile:', profile);
```

#### Render Optimizer
```javascript
import { RenderOptimizer } from '@koniz-dev/canvaslens';

// Create render optimizer
const optimizer = new RenderOptimizer(viewer);

// Enable optimizations
optimizer.enableDirtyRegionTracking();
optimizer.enableViewportCulling();
optimizer.enableFrameRateControl(60);
```

#### Viewport Culling
```javascript
import { ViewportCulling } from '@koniz-dev/canvaslens';

// Create viewport culler
const culler = new ViewportCulling(viewer);

// Enable culling for annotations
culler.enableForAnnotations();
culler.setCullingThreshold(100); // Only render 100 annotations at once
```

#### Memory Management
```javascript
import { MemoryManager } from '@koniz-dev/canvaslens';

// Create memory manager
const memoryManager = new MemoryManager();

// Enable memory monitoring
memoryManager.enableMonitoring();

// Set memory thresholds
memoryManager.setThresholds({
  warning: 100 * 1024 * 1024, // 100MB
  critical: 200 * 1024 * 1024  // 200MB
});

// Get memory usage
const usage = memoryManager.getUsage();
console.log('Memory usage:', usage);

// Clean up resources
memoryManager.cleanup();
```

#### Performance Metrics
```javascript
// Get comprehensive performance metrics
const metrics = performanceMonitor.getMetrics();

console.log('Performance Metrics:', {
  fps: metrics.fps,
  memoryUsage: metrics.memoryUsage,
  renderTime: metrics.renderTime,
  canvasOperations: metrics.canvasOperations,
  viewportCulling: metrics.viewportCulling,
  annotationCount: metrics.annotationCount
});
```

### 2. Performance Profiling

#### Custom Performance Marks
```javascript
class PerformanceProfiler {
  constructor() {
    this.marks = new Map();
  }
  
  startMark(name) {
    performance.mark(`${name}-start`);
  }
  
  endMark(name) {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const measure = performance.getEntriesByName(name)[0];
    this.marks.set(name, measure.duration);
    
    return measure.duration;
  }
  
  getMark(name) {
    return this.marks.get(name);
  }
  
  getAllMarks() {
    return Object.fromEntries(this.marks);
  }
}

// Usage
const profiler = new PerformanceProfiler();

profiler.startMark('image-load');
await viewer.loadImage('image.jpg');
const loadTime = profiler.endMark('image-load');

console.log(`Image load took ${loadTime}ms`);
```

## Best Practices

### 1. General Performance Guidelines

#### Built-in Performance Tools
```javascript
// ✅ Good - Use built-in performance tools
import { PerformanceMonitor, RenderOptimizer, ViewportCulling } from '@koniz-dev/canvaslens';

const monitor = new PerformanceMonitor();
const optimizer = new RenderOptimizer(viewer);
const culler = new ViewportCulling(viewer);

// Enable optimizations
monitor.start();
optimizer.enableDirtyRegionTracking();
culler.enableForAnnotations();
```

#### Code Organization
```javascript
// ✅ Good - Efficient object creation
const annotation = {
  id: generateId(),
  type: 'rect',
  points: [
    { x: startX, y: startY },
    { x: endX, y: startY },
    { x: endX, y: endY },
    { x: startX, y: endY }
  ],
  style: {
    strokeColor: '#ff0000',
    strokeWidth: 2
  }
};

// ❌ Bad - Inefficient object creation
const annotation = new Object();
annotation.id = generateId();
annotation.type = 'rect';
// ... more property assignments
```

#### Function Optimization
```javascript
// ✅ Good - Efficient function
function calculateDistance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

// ❌ Bad - Inefficient function
function calculateDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}
```

### 2. Canvas-Specific Best Practices

#### Efficient Drawing Operations
```javascript
// ✅ Good - Batch drawing operations
ctx.save();
ctx.strokeStyle = '#ff0000';
ctx.lineWidth = 2;
ctx.beginPath();

annotations.forEach(annotation => {
  ctx.rect(annotation.x, annotation.y, annotation.width, annotation.height);
});

ctx.stroke();
ctx.restore();

// ❌ Bad - Individual drawing operations
annotations.forEach(annotation => {
  ctx.save();
  ctx.strokeStyle = '#ff0000';
  ctx.lineWidth = 2;
  ctx.strokeRect(annotation.x, annotation.y, annotation.width, annotation.height);
  ctx.restore();
});
```

#### Minimize Canvas Operations
```javascript
// ✅ Good - Minimize operations
function renderOptimized() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0);
  
  // Render all annotations in one pass
  renderAnnotations();
}

// ❌ Bad - Too many operations
function renderInefficient() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0);
  
  // Multiple passes
  renderRectangles();
  renderArrows();
  renderText();
  renderCircles();
}
```

#### Performance Optimization
```javascript
// ✅ Good - Use built-in optimizations
import { RenderOptimizer } from '@koniz-dev/canvaslens';

const optimizer = new RenderOptimizer(viewer);
optimizer.enableDirtyRegionTracking();
optimizer.enableViewportCulling();
optimizer.enableFrameRateControl(60);

// ❌ Bad - Manual optimization without tools
// Manual dirty region tracking
// Manual viewport culling
// Manual frame rate control
```

### 3. Memory Management Best Practices

#### Proper Cleanup
```javascript
// ✅ Good - Proper cleanup
class CanvasLensComponent {
  destroy() {
    // Remove event listeners
    this.removeAllEventListeners();
    
    // Clear references
    this.canvas = null;
    this.ctx = null;
    this.image = null;
    
    // Clear caches
    this.clearCaches();
  }
}

// ❌ Bad - No cleanup
class CanvasLensComponent {
  // No cleanup method
  // Memory leaks will occur
}
```

#### Efficient Data Structures
```javascript
// ✅ Good - Efficient data structure
const annotations = new Map(); // O(1) lookup
annotations.set(id, annotation);

// ❌ Bad - Inefficient data structure
const annotations = []; // O(n) lookup
const annotation = annotations.find(a => a.id === id);
```

### 4. Performance Testing

#### Automated Performance Tests
```javascript
// Performance test example
describe('CanvasLens Performance', () => {
  it('should render large image within acceptable time', async () => {
    const startTime = performance.now();
    
    await viewer.loadImage('large-image.jpg');
    
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    expect(loadTime).toBeLessThan(2000); // Should load within 2 seconds
  });
  
  it('should maintain 60 FPS during zoom operations', () => {
    const fpsMonitor = new FPSMonitor();
    
    // Perform zoom operations
    for (let i = 0; i < 100; i++) {
      viewer.zoomTo(1 + i * 0.01);
      fpsMonitor.update();
    }
    
    expect(fpsMonitor.fps).toBeGreaterThan(55); // Should maintain high FPS
  });
});
```

This performance guide provides comprehensive strategies for optimizing CanvasLens performance across different scenarios. By following these guidelines and monitoring performance metrics, you can ensure that CanvasLens delivers smooth, responsive user experiences even with large images and complex annotations.
