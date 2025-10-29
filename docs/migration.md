# CanvasLens Migration Guide

## Table of Contents

- [Overview](#overview)
- [Version 2.0.0 Migration](#version-200-migration)
- [Version 1.5.0 Migration](#version-150-migration)
- [Version 1.0.0 Migration](#version-100-migration)
- [Breaking Changes](#breaking-changes)
- [Deprecated Features](#deprecated-features)
- [Migration Checklist](#migration-checklist)
- [Troubleshooting Migration Issues](#troubleshooting-migration-issues)

## Overview

This guide helps you migrate your CanvasLens implementation between major versions. Each section covers the specific changes, breaking changes, and migration steps for that version.

## Version 2.0.0 Migration

### Major Changes

#### 1. New Annotation System

**Before (v1.x):**
```javascript
// Old annotation structure
const annotation = {
  id: 'annotation-1',
  type: 'rect',
  x: 100,
  y: 100,
  width: 200,
  height: 150,
  style: {
    strokeColor: '#ff0000',
    strokeWidth: 2,
    fillColor: 'rgba(255, 0, 0, 0.1)'
  }
};
```

**After (v2.0.0):**
```javascript
// New annotation structure
const annotation = {
  id: 'annotation-1',
  type: 'rect',
  points: [
    { x: 100, y: 100 },
    { x: 300, y: 100 },
    { x: 300, y: 250 },
    { x: 100, y: 250 }
  ],
  style: {
    strokeColor: '#ff0000',
    strokeWidth: 2,
    fillColor: 'rgba(255, 0, 0, 0.1)',
    lineStyle: 'solid' // New property
  },
  data: { // New optional data property
    label: 'Important area',
    metadata: { priority: 'high' }
  }
};
```

**Migration Steps:**
1. Update annotation creation code to use `points` array
2. Convert existing annotations from `x, y, width, height` to `points`
3. Add `lineStyle` property to annotation styles
4. Update annotation rendering code to work with points

#### 2. Updated API Methods

**Before (v1.x):**
```javascript
// Old method names
const zoom = viewer.getZoom();
const pan = viewer.getPan();
viewer.setPan(x, y);
```

**After (v2.0.0):**
```javascript
// New method names
const zoom = viewer.getZoomLevel();
const pan = viewer.getPanOffset();
// setPan is no longer public - use programmatic panning
```

**Migration Steps:**
1. Replace `getZoom()` with `getZoomLevel()`
2. Replace `getPan()` with `getPanOffset()`
3. Remove direct calls to `setPan()` - use zoom and pan methods instead

#### 3. Enhanced Error Handling

**Before (v1.x):**
```javascript
// Basic error handling
viewer.addEventListener('error', (event) => {
  console.error('Error:', event.detail);
});
```

**After (v2.0.0):**
```javascript
// Enhanced error handling with types
viewer.addEventListener('error', (event) => {
  const error = event.detail;
  console.error('CanvasLens error:', error);
  
  switch (error.type) {
    case 'IMAGE_LOAD':
      console.error('Image loading failed:', error.message);
      break;
    case 'INITIALIZATION':
      console.error('Initialization failed:', error.message);
      break;
    case 'RENDER_ERROR':
      console.error('Rendering error:', error.message);
      break;
    case 'INVALID_TOOL':
      console.error('Invalid tool:', error.message);
      break;
    case 'ANNOTATION_ERROR':
      console.error('Annotation error:', error.message);
      break;
    case 'VIEW_ERROR':
      console.error('View error:', error.message);
      break;
  }
});
```

#### 4. New Performance Monitoring

**New in v2.0.0:**
```javascript
import { performanceMonitor } from '@koniz-dev/canvaslens';

// Enable performance monitoring
performanceMonitor.enable();

// Get metrics
const metrics = performanceMonitor.getMetrics();
console.log('FPS:', metrics.fps);
console.log('Memory usage:', metrics.memoryUsage);

// Start profiling
performanceMonitor.startProfiling('my-operation');
// ... do work ...
performanceMonitor.stopProfiling('my-operation');
```

#### 5. New Memory Management

**New in v2.0.0:**
```javascript
import { MemoryManager } from '@koniz-dev/canvaslens';

const memoryManager = new MemoryManager();
memoryManager.enableMonitoring();

// Set thresholds
memoryManager.setThresholds({
  warning: 50 * 1024 * 1024, // 50MB
  critical: 100 * 1024 * 1024 // 100MB
});

// Handle memory events
memoryManager.on('warning', (usage) => {
  console.warn('Memory usage high:', usage);
  memoryManager.cleanup();
});
```

### Migration Script

Here's a utility script to help migrate your existing annotations:

```javascript
// Migration utility for annotations
function migrateAnnotation(oldAnnotation) {
  const { x, y, width, height, ...rest } = oldAnnotation;
  
  return {
    ...rest,
    points: [
      { x, y },
      { x: x + width, y },
      { x: x + width, y: y + height },
      { x, y: y + height }
    ],
    style: {
      ...oldAnnotation.style,
      lineStyle: oldAnnotation.style.lineStyle || 'solid'
    }
  };
}

// Migrate all annotations
function migrateAnnotations(annotations) {
  return annotations.map(migrateAnnotation);
}

// Usage
const oldAnnotations = viewer.getAnnotations();
const newAnnotations = migrateAnnotations(oldAnnotations);
```

## Version 1.5.0 Migration

### Changes

#### 1. New Tool Configuration

**Before (v1.4.x):**
```javascript
// Old tool configuration
viewer.tools = '{"zoom": true, "pan": true, "annotation": true}';
```

**After (v1.5.0):**
```javascript
// New tool configuration
viewer.updateTools({
  zoom: true,
  pan: true,
  annotation: {
    rect: true,
    arrow: true,
    text: true,
    circle: false
  }
});
```

#### 2. Enhanced Event System

**New events in v1.5.0:**
```javascript
// New events
viewer.addEventListener('toolchange', (event) => {
  console.log('Tool changed to:', event.detail.tool);
});

viewer.addEventListener('comparisonchange', (event) => {
  console.log('Comparison mode changed:', event.detail.enabled);
});

viewer.addEventListener('overlayopen', (event) => {
  console.log('Overlay opened');
});

viewer.addEventListener('overlayclose', (event) => {
  console.log('Overlay closed');
});
```

## Version 1.0.0 Migration

### Initial Release

This was the first stable release of CanvasLens. If you're migrating from a pre-release version:

#### 1. Update Import Statement

**Before:**
```javascript
// Pre-release import
import CanvasLens from 'canvaslens';
```

**After:**
```javascript
// Stable release import
import { CanvasLens } from '@koniz-dev/canvaslens';
```

#### 2. Update HTML Usage

**Before:**
```html
<!-- Pre-release usage -->
<div id="canvas-container"></div>
```

**After:**
```html
<!-- Stable release usage -->
<canvas-lens src="image.jpg" width="800px" height="600px"></canvas-lens>
```

## Breaking Changes

### Version 2.0.0 Breaking Changes

1. **Annotation Structure**: Changed from `x, y, width, height` to `points` array
2. **API Method Names**: `getZoom()` → `getZoomLevel()`, `getPan()` → `getPanOffset()`
3. **Tool Configuration**: Enhanced tool configuration object structure
4. **Error Handling**: New error event structure with error types
5. **Memory Management**: New memory management system replaces manual cleanup

### Version 1.5.0 Breaking Changes

1. **Tool Configuration**: New tool configuration format
2. **Event Names**: Some event names changed for consistency

### Version 1.0.0 Breaking Changes

1. **Import Path**: Changed from `canvaslens` to `@koniz-dev/canvaslens`
2. **HTML Usage**: Changed from div-based to custom element usage

## Deprecated Features

### Version 2.0.0 Deprecations

- `getZoom()` method (use `getZoomLevel()`)
- `getPan()` method (use `getPanOffset()`)
- `setPan()` method (use programmatic panning)
- Old annotation structure (use new `points`-based structure)

### Version 1.5.0 Deprecations

- String-based tool configuration (use object-based configuration)
- Old event names (use new standardized event names)

## Migration Checklist

### Pre-Migration

- [ ] Backup your current implementation
- [ ] Review the changelog for the target version
- [ ] Test migration in a development environment
- [ ] Update your test suite to match new API

### During Migration

- [ ] Update import statements
- [ ] Update API method calls
- [ ] Migrate annotation data structure
- [ ] Update event handlers
- [ ] Update tool configuration
- [ ] Test all functionality

### Post-Migration

- [ ] Run full test suite
- [ ] Test in all target browsers
- [ ] Update documentation
- [ ] Monitor for any issues
- [ ] Update dependencies

## Troubleshooting Migration Issues

### Common Issues

#### 1. Annotation Rendering Issues

**Problem:** Annotations not rendering after migration

**Solution:**
```javascript
// Check if annotations have the correct structure
const annotations = viewer.getAnnotations();
annotations.forEach(annotation => {
  if (!annotation.points || !Array.isArray(annotation.points)) {
    console.error('Invalid annotation structure:', annotation);
    // Migrate the annotation
    const migrated = migrateAnnotation(annotation);
    viewer.removeAnnotation(annotation.id);
    viewer.addAnnotation(migrated);
  }
});
```

#### 2. Tool Activation Failures

**Problem:** Tools not activating after migration

**Solution:**
```javascript
// Check tool configuration
const tools = viewer.getTools();
console.log('Current tool config:', tools);

// Ensure tools are properly configured
if (!tools.annotation) {
  viewer.updateTools({
    ...tools,
    annotation: {
      rect: true,
      arrow: true,
      text: true,
      circle: true
    }
  });
}
```

#### 3. Performance Issues

**Problem:** Performance degraded after migration

**Solution:**
```javascript
// Enable performance monitoring
import { performanceMonitor } from '@koniz-dev/canvaslens';

performanceMonitor.enable();

// Check for performance issues
const metrics = performanceMonitor.getMetrics();
if (metrics.fps < 30) {
  console.warn('Low FPS detected:', metrics.fps);
  // Investigate and optimize
}
```

#### 4. Memory Leaks

**Problem:** Memory usage increasing after migration

**Solution:**
```javascript
// Use new memory management
import { MemoryManager } from '@koniz-dev/canvaslens';

const memoryManager = new MemoryManager();
memoryManager.enableMonitoring();

// Set up cleanup
viewer.addEventListener('destroy', () => {
  memoryManager.disposeAll();
});
```

### Getting Help

If you encounter issues during migration:

1. **Check the documentation** for the specific version you're migrating to
2. **Review the changelog** for any additional changes
3. **Search GitHub issues** for similar problems
4. **Create a new issue** with detailed information about your migration problem

### Migration Support

For complex migrations or enterprise support:

- **GitHub Discussions**: Community support for migration questions
- **GitHub Issues**: Report migration bugs or request help
- **Enterprise Support**: Contact for dedicated migration assistance

This migration guide should help you successfully upgrade CanvasLens to the latest version while maintaining all your existing functionality.