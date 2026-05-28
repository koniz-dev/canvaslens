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

v2.0.0 is an **architectural refactor**. The `<canvas-lens>` Web Component
public API (attributes, methods, DOM events) is mostly unchanged — if you
only used the Web Component tag, your code keeps working. The breaking
changes are around internal classes and exports that some advanced users
may have imported directly.

### TL;DR — what changed under the hood

- 5 layers of proxy classes (`CanvasLens → CanvasLensCore → Engine →
  ImageViewer → Manager`) collapsed into one `App` orchestrator.
- New centralised state (`Store`), typed pub/sub (`EventBus`), and
  ramp-coalesced `RenderScheduler` in `src/core/`.
- New `ToolPlugin` system: register custom annotation tools without
  modifying the library.
- DOM-building extracted into `src/ui/` (`ContextMenu`,
  `ErrorPlaceholder`, `OverlayShell`).
- Attribute parsing + optional keyboard adapter moved to `src/input/`
  (`AttributeBinder`, `KeyboardInput`).

### Removed exports (breaking — if you imported these)

| Removed | Replacement |
|---|---|
| `Engine` | `App` (same surface, fewer layers) |
| `CanvasLensCore` | `App` |
| `ImageViewer` (the `modules/image-viewer/Viewer` class) | `App` |
| `EventManager` | App now dispatches DOM CustomEvents directly when given an `element` option |
| `AttributeParser` | `AttributeBinder` |

```ts
// v1
import { Engine } from '@koniz-dev/canvaslens';
const engine = new Engine({ container, tools: {...} });

// v2
import { App } from '@koniz-dev/canvaslens';
const app = new App({ container, tools: {...} });
// Same methods: loadImage, addAnnotation, zoomTo, fitToView, …
```

```ts
// v1
import { AttributeParser } from '@koniz-dev/canvaslens';
const opts = AttributeParser.parseAttributes(element, container);

// v2
import { AttributeBinder } from '@koniz-dev/canvaslens';
const opts = AttributeBinder.read(element, container);
```

### New: ToolPlugin system

Custom annotation tools can be registered without forking the library:

```ts
import { App, ToolPlugin } from '@koniz-dev/canvaslens';

const myStarTool: ToolPlugin = {
  type: 'star',
  name: 'Star',
  icon: '⭐',
  create: (canvas, renderer, options) => new MyStarTool(canvas, renderer, options),
};

const app = new App({
  container,
  plugins: [myStarTool],
  tools: { annotation: { rect: true } }
});

app.activateTool('star');
```

### New: Store + EventBus (advanced)

For applications that need reactive integration with React/Vue/Svelte:

```ts
const app = new App({ container, tools: { zoom: true, pan: true } });

// Subscribe to slice-level changes
app.store.select(
  (s) => s.image.data,
  (image) => console.log('image changed', image)
);

// Subscribe to typed events
app.bus.on('image:loaded', (data) => console.log('loaded', data));
app.bus.on('annotation:added', (a) => console.log('added', a));
```

### New: UI helpers

Reusable DOM components extracted from the old inline blocks:

```ts
import { ContextMenu, ErrorPlaceholder, OverlayShell } from '@koniz-dev/canvaslens';

ContextMenu.show({
  x: event.clientX,
  y: event.clientY,
  items: [{ label: 'Delete', onClick: () => app.removeAnnotation(id) }]
});
```

### Bug fixes

- AnnotationManager's mouse listener removal previously called
  `removeEventListener(type, handler.bind(this))`, which creates a new
  function reference and never matches the registered listener. This
  caused listeners to accumulate when an AnnotationManager was created
  and destroyed multiple times. v2.0 saves bound references in fields so
  add/remove pair correctly.

### Did the Web Component API change?

No — these all work the same in v2:

- Attributes: `src`, `width`, `height`, `tools`, `max-zoom`, `min-zoom`,
  `background-color`, `image-type`, `file-name`.
- Methods: `loadImage`, `loadImageFromFile`, `zoomIn`/`zoomOut`/`zoomTo`,
  `fitToView`, `resetView`, `activateTool`/`deactivateTool`,
  `addAnnotation`/`removeAnnotation`/`clearAnnotations`,
  `toggleComparisonMode`/`setComparisonMode`, `openOverlay`/`closeOverlay`.
- DOM events: `imageLoad`, `imageLoadError`, `zoomChange`, `panChange`,
  `annotationAdd`, `annotationRemove`, `toolChange`, `comparisonChange`.

Only users who imported internal classes need to make changes.

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

1. **Removed internal classes**: `Engine`, `CanvasLensCore`, `ImageViewer`,
   `EventManager`, `AttributeParser` are no longer exported.
2. **`App` replaces them** with one orchestrator that owns the store,
   bus, canvas, and sub-modules.
3. **`AttributeParser` → `AttributeBinder`** (same purpose, new module).
4. The Web Component public surface (attributes, methods, DOM events) is
   unchanged.

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
// Note: getTools() method is not available in current implementation
// Use updateTools() to configure tools instead

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