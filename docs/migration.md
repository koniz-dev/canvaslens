# CanvasLens Migration Guide

## Table of Contents

- [Migration Overview](#migration-overview)
- [Version Migration](#version-migration)
- [Framework Migration](#framework-migration)
- [API Migration](#api-migration)
- [Configuration Migration](#configuration-migration)
- [Breaking Changes](#breaking-changes)
- [Migration Checklist](#migration-checklist)
- [Rollback Procedures](#rollback-procedures)

## Migration Overview

This guide helps you migrate from other image viewing libraries to CanvasLens or upgrade between CanvasLens versions. It covers common migration scenarios, breaking changes, and provides step-by-step instructions for smooth transitions.

### Migration Types

1. **Library Migration**: Moving from other image viewing libraries to CanvasLens
2. **Version Migration**: Upgrading between CanvasLens versions
3. **Framework Migration**: Moving between different JavaScript frameworks
4. **API Migration**: Adapting to API changes

## Version Migration

### From v0.0.x to v0.1.0

#### Breaking Changes

##### 1. Tool Configuration Format

**Before (v0.0.x):**
```javascript
// Old format
viewer.tools = {
  zoom: true,
  pan: true,
  annotations: ['rect', 'arrow', 'text']
};
```

**After (v0.1.0):**
```javascript
// New format
viewer.tools = JSON.stringify({
  zoom: true,
  pan: true,
  annotation: {
    rect: true,
    arrow: true,
    text: true
  }
});
```

**Migration Steps:**
```javascript
// Migration helper function
function migrateToolConfig(oldConfig) {
  const newConfig = {
    zoom: oldConfig.zoom || false,
    pan: oldConfig.pan || false,
    annotation: {}
  };
  
  if (oldConfig.annotations && Array.isArray(oldConfig.annotations)) {
    oldConfig.annotations.forEach(tool => {
      newConfig.annotation[tool] = true;
    });
  }
  
  return JSON.stringify(newConfig);
}

// Usage
const oldTools = {
  zoom: true,
  pan: true,
  annotations: ['rect', 'arrow', 'text']
};

const newTools = migrateToolConfig(oldTools);
viewer.tools = newTools;
```

##### 2. Event Handler Changes

**Before (v0.0.x):**
```javascript
// Old event handling
viewer.onImageLoad = function(CustomImageData) {
  console.log('Image loaded:', CustomImageData);
};
```

**After (v0.1.0):**
```javascript
// New event handling
viewer.addEventListener('imageload', function(event) {
  console.log('Image loaded:', event.detail);
});
```

**Migration Steps:**
```javascript
// Migration helper
function migrateEventHandlers(viewer, oldHandlers) {
  const eventMap = {
    onImageLoad: 'imageload',
    onZoomChange: 'zoomchange',
    onPanChange: 'panchange',
    onAnnotationAdd: 'annotationadd',
    onAnnotationRemove: 'annotationremove',
    onToolChange: 'toolchange'
  };
  
  Object.keys(oldHandlers).forEach(oldEvent => {
    const newEvent = eventMap[oldEvent];
    if (newEvent && oldHandlers[oldEvent]) {
      viewer.addEventListener(newEvent, oldHandlers[oldEvent]);
    }
  });
}

// Usage
const oldHandlers = {
  onImageLoad: (data) => console.log('Loaded:', data),
  onZoomChange: (zoom) => console.log('Zoom:', zoom)
};

migrateEventHandlers(viewer, oldHandlers);
```

##### 3. Method Name Changes

**Before (v0.0.x):**
```javascript
// Old method names
viewer.setImage('image.jpg');
viewer.setZoomLevel(2.0);
viewer.setPanOffset(100, 50);
```

**After (v0.1.0):**
```javascript
// New method names
viewer.loadImage('image.jpg');
viewer.zoomTo(2.0);
viewer.setPan(100, 50);
```

**Migration Steps:**
```javascript
// Create compatibility layer
function createCompatibilityLayer(viewer) {
  return {
    setImage: (src) => viewer.loadImage(src),
    setZoomLevel: (level) => viewer.zoomTo(level),
    setPanOffset: (x, y) => viewer.setPan(x, y),
    getZoomLevel: () => viewer.getZoom(),
    getPanOffset: () => viewer.getPan()
  };
}

// Usage
const compatViewer = createCompatibilityLayer(viewer);
compatViewer.setImage('image.jpg'); // Works with old API
```

### From v0.1.x to v0.2.x (Future)

#### Planned Breaking Changes

##### 1. Annotation Format Changes

**Current (v0.1.x):**
```javascript
const annotation = {
  id: 'rect-1',
  type: 'rect',
  x: 100,
  y: 100,
  width: 200,
  height: 150
};
```

**Future (v0.2.x):**
```javascript
const annotation = {
  id: 'rect-1',
  type: 'rect',
  bounds: {
    x: 100,
    y: 100,
    width: 200,
    height: 150
  },
  metadata: {
    createdAt: new Date().toISOString(),
    createdBy: 'user123'
  }
};
```

**Migration Preparation:**
```javascript
// Prepare for future migration
function createFutureCompatibleAnnotation(annotation) {
  return {
    id: annotation.id,
    type: annotation.type,
    bounds: {
      x: annotation.x,
      y: annotation.y,
      width: annotation.width,
      height: annotation.height
    },
    metadata: {
      createdAt: new Date().toISOString(),
      createdBy: 'system'
    }
  };
}
```

## Framework Migration

### From React to Vue

#### React Implementation
```jsx
// React component
import React, { useRef, useEffect } from 'react';
import { CanvasLens } from '@koniz-dev/canvaslens';

const ImageViewer = ({ src, width, height }) => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      viewerRef.current = new CanvasLens();
      viewerRef.current.src = src;
      viewerRef.current.width = width;
      viewerRef.current.height = height;
      containerRef.current.appendChild(viewerRef.current);
    }

    return () => {
      if (viewerRef.current && viewerRef.current.parentNode) {
        viewerRef.current.parentNode.removeChild(viewerRef.current);
      }
    };
  }, [src, width, height]);

  return <div ref={containerRef} />;
};
```

#### Vue Implementation
```vue
<!-- Vue component -->
<template>
  <div ref="container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { CanvasLens } from '@koniz-dev/canvaslens';

const props = defineProps(['src', 'width', 'height']);
const container = ref(null);
const viewer = ref(null);

onMounted(() => {
  if (container.value) {
    viewer.value = new CanvasLens();
    viewer.value.src = props.src;
    viewer.value.width = props.width;
    viewer.value.height = props.height;
    container.value.appendChild(viewer.value);
  }
});

onUnmounted(() => {
  if (viewer.value && viewer.value.parentNode) {
    viewer.value.parentNode.removeChild(viewer.value);
  }
});

watch(() => props.src, (newSrc) => {
  if (viewer.value) {
    viewer.value.src = newSrc;
  }
});
</script>
```

### From Angular to React

#### Angular Implementation
```typescript
// Angular component
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CanvasLens } from '@koniz-dev/canvaslens';

@Component({
  selector: 'app-image-viewer',
  template: '<div #container></div>'
})
export class ImageViewerComponent implements OnInit, OnDestroy {
  @ViewChild('container', { static: true }) container!: ElementRef;
  @Input() src: string = '';
  @Input() width: string = '800px';
  @Input() height: string = '600px';

  private viewer: CanvasLens | null = null;

  ngOnInit() {
    if (this.container.nativeElement) {
      this.viewer = new CanvasLens();
      this.viewer.src = this.src;
      this.viewer.width = this.width;
      this.viewer.height = this.height;
      this.container.nativeElement.appendChild(this.viewer);
    }
  }

  ngOnDestroy() {
    if (this.viewer && this.viewer.parentNode) {
      this.viewer.parentNode.removeChild(this.viewer);
    }
  }
}
```

#### React Implementation
```jsx
// React component
import React, { useRef, useEffect } from 'react';
import { CanvasLens } from '@koniz-dev/canvaslens';

const ImageViewer = ({ src, width, height }) => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      viewerRef.current = new CanvasLens();
      viewerRef.current.src = src;
      viewerRef.current.width = width;
      viewerRef.current.height = height;
      containerRef.current.appendChild(viewerRef.current);
    }

    return () => {
      if (viewerRef.current && viewerRef.current.parentNode) {
        viewerRef.current.parentNode.removeChild(viewerRef.current);
      }
    };
  }, [src, width, height]);

  return <div ref={containerRef} />;
};
```

## API Migration

### From Other Image Viewing Libraries

#### From OpenSeadragon

**OpenSeadragon Implementation:**
```javascript
// OpenSeadragon
const viewer = OpenSeadragon({
  id: "viewer",
  prefixUrl: "openseadragon-images/",
  tileSources: "image.dzi"
});
```

**CanvasLens Implementation:**
```javascript
// CanvasLens
const viewer = document.querySelector('canvas-lens');
viewer.src = 'image.jpg';
viewer.width = '800px';
viewer.height = '600px';
```

**Migration Helper:**
```javascript
function migrateFromOpenSeadragon(osdConfig) {
  const viewer = document.querySelector('canvas-lens');
  
  // Map OpenSeadragon options to CanvasLens
  if (osdConfig.tileSources) {
    viewer.src = osdConfig.tileSources;
  }
  
  if (osdConfig.showNavigationControl) {
    viewer.tools = JSON.stringify({
      zoom: true,
      pan: true
    });
  }
  
  return viewer;
}
```

#### From Leaflet

**Leaflet Implementation:**
```javascript
// Leaflet
const map = L.map('map').setView([51.505, -0.09], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
```

**CanvasLens Implementation:**
```javascript
// CanvasLens
const viewer = document.querySelector('canvas-lens');
viewer.src = 'map-image.jpg';
viewer.tools = JSON.stringify({
  zoom: true,
  pan: true
});
```

**Migration Helper:**
```javascript
function migrateFromLeaflet(leafletMap) {
  const viewer = document.querySelector('canvas-lens');
  
  // Extract map image
  const mapImage = leafletMap.getContainer().toDataURL();
  viewer.src = mapImage;
  
  // Enable zoom and pan
  viewer.tools = JSON.stringify({
    zoom: true,
    pan: true
  });
  
  return viewer;
}
```

#### From Fabric.js

**Fabric.js Implementation:**
```javascript
// Fabric.js
const canvas = new fabric.Canvas('canvas');
canvas.add(new fabric.Rect({
  left: 100,
  top: 100,
  width: 200,
  height: 150,
  fill: 'red'
}));
```

**CanvasLens Implementation:**
```javascript
// CanvasLens
const viewer = document.querySelector('canvas-lens');
viewer.src = 'image.jpg';
viewer.tools = JSON.stringify({
  annotation: {
    rect: true
  }
});

// Add annotation
viewer.addAnnotation({
  id: 'rect-1',
  type: 'rect',
  x: 100,
  y: 100,
  width: 200,
  height: 150,
  style: {
    fillColor: 'red'
  }
});
```

**Migration Helper:**
```javascript
function migrateFromFabric(fabricCanvas) {
  const viewer = document.querySelector('canvas-lens');
  
  // Set background image
  if (fabricCanvas.backgroundImage) {
    viewer.src = fabricCanvas.backgroundImage.src;
  }
  
  // Migrate objects to annotations
  const annotations = fabricCanvas.getObjects().map((obj, index) => {
    return {
      id: `annotation-${index}`,
      type: mapFabricTypeToCanvasLens(obj.type),
      x: obj.left,
      y: obj.top,
      width: obj.width,
      height: obj.height,
      style: {
        fillColor: obj.fill,
        strokeColor: obj.stroke,
        strokeWidth: obj.strokeWidth
      }
    };
  });
  
  annotations.forEach(annotation => {
    viewer.addAnnotation(annotation);
  });
  
  return viewer;
}

function mapFabricTypeToCanvasLens(fabricType) {
  const typeMap = {
    'rect': 'rect',
    'circle': 'circle',
    'line': 'line',
    'text': 'text',
    'path': 'arrow'
  };
  
  return typeMap[fabricType] || 'rect';
}
```

## Configuration Migration

### From JSON Configuration to Attributes

#### Old Configuration Format
```javascript
// Old format
const config = {
  image: {
    src: 'image.jpg',
    width: 800,
    height: 600
  },
  tools: {
    zoom: true,
    pan: true,
    annotations: ['rect', 'arrow']
  },
  style: {
    backgroundColor: '#f0f0f0',
    border: '1px solid #ccc'
  }
};
```

#### New Configuration Format
```html
<!-- New format -->
<canvas-lens 
  src="image.jpg"
  width="800px"
  height="600px"
  background-color="#f0f0f0"
  tools='{"zoom": true, "pan": true, "annotation": {"rect": true, "arrow": true}}'>
</canvas-lens>
```

**Migration Helper:**
```javascript
function migrateConfiguration(oldConfig) {
  const element = document.createElement('canvas-lens');
  
  // Map image configuration
  if (oldConfig.image) {
    element.src = oldConfig.image.src;
    element.width = `${oldConfig.image.width}px`;
    element.height = `${oldConfig.image.height}px`;
  }
  
  // Map tools configuration
  if (oldConfig.tools) {
    const tools = {
      zoom: oldConfig.tools.zoom || false,
      pan: oldConfig.tools.pan || false,
      annotation: {}
    };
    
    if (oldConfig.tools.annotations) {
      oldConfig.tools.annotations.forEach(tool => {
        tools.annotation[tool] = true;
      });
    }
    
    element.tools = JSON.stringify(tools);
  }
  
  // Map style configuration
  if (oldConfig.style) {
    if (oldConfig.style.backgroundColor) {
      element.setAttribute('background-color', oldConfig.style.backgroundColor);
    }
  }
  
  return element;
}
```

### From CSS Classes to Custom Properties

#### Old CSS Approach
```css
/* Old approach */
.canvas-lens-viewer {
  width: 800px;
  height: 600px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
}

.canvas-lens-viewer.zoom-enabled {
  cursor: zoom-in;
}

.canvas-lens-viewer.pan-enabled {
  cursor: grab;
}
```

#### New CSS Approach
```css
/* New approach */
canvas-lens {
  --canvas-width: 800px;
  --canvas-height: 600px;
  --background-color: #f0f0f0;
  --border: 1px solid #ccc;
  
  width: var(--canvas-width);
  height: var(--canvas-height);
  background-color: var(--background-color);
  border: var(--border);
}

canvas-lens[data-zoom-enabled] {
  cursor: zoom-in;
}

canvas-lens[data-pan-enabled] {
  cursor: grab;
}
```

**Migration Helper:**
```css
/* Migration helper CSS */
.canvas-lens-viewer {
  /* Map old classes to new custom properties */
  --canvas-width: 800px;
  --canvas-height: 600px;
  --background-color: #f0f0f0;
  --border: 1px solid #ccc;
}

/* Convert class-based styles to attribute-based */
.canvas-lens-viewer.zoom-enabled {
  cursor: zoom-in;
}

canvas-lens[data-zoom-enabled] {
  cursor: zoom-in;
}
```

## Breaking Changes

### v0.1.0 Breaking Changes

#### 1. Tool Configuration Format

**Breaking Change:** Tool configuration now requires JSON string format.

**Impact:** High - affects all tool configurations.

**Migration Required:** Yes - update all tool configurations.

**Example:**
```javascript
// Before
viewer.tools = { zoom: true, pan: true };

// After
viewer.tools = JSON.stringify({ zoom: true, pan: true });
```

#### 2. Event Handler Changes

**Breaking Change:** Event handlers now use addEventListener instead of direct assignment.

**Impact:** Medium - affects event handling code.

**Migration Required:** Yes - update all event handlers.

**Example:**
```javascript
// Before
viewer.onImageLoad = handler;

// After
viewer.addEventListener('imageload', handler);
```

#### 3. Method Name Changes

**Breaking Change:** Several method names have changed.

**Impact:** Medium - affects method calls.

**Migration Required:** Yes - update method calls.

**Example:**
```javascript
// Before
viewer.setImage(src);
viewer.setZoomLevel(level);

// After
viewer.loadImage(src);
viewer.zoomTo(level);
```

### v0.2.0 Planned Breaking Changes

#### 1. Annotation Format Changes

**Breaking Change:** Annotation format will change to include bounds and metadata.

**Impact:** High - affects all annotation handling.

**Migration Required:** Yes - update annotation format.

**Example:**
```javascript
// Before
const annotation = {
  id: 'rect-1',
  type: 'rect',
  x: 100,
  y: 100,
  width: 200,
  height: 150
};

// After
const annotation = {
  id: 'rect-1',
  type: 'rect',
  bounds: {
    x: 100,
    y: 100,
    width: 200,
    height: 150
  },
  metadata: {
    createdAt: new Date().toISOString(),
    createdBy: 'user123'
  }
};
```

#### 2. API Method Changes

**Breaking Change:** Some API methods will be renamed or restructured.

**Impact:** Medium - affects API usage.

**Migration Required:** Yes - update API calls.

**Example:**
```javascript
// Before
viewer.getAnnotations();
viewer.clearAnnotations();

// After
viewer.getAnnotations();
viewer.clearAllAnnotations();
```

## Migration Checklist

### Pre-Migration

- [ ] **Backup Current Implementation**
  - [ ] Create backup of current code
  - [ ] Document current functionality
  - [ ] Test current implementation

- [ ] **Review Breaking Changes**
  - [ ] Read migration guide
  - [ ] Identify affected code
  - [ ] Plan migration strategy

- [ ] **Prepare Migration Environment**
  - [ ] Set up test environment
  - [ ] Install new version
  - [ ] Prepare migration tools

### During Migration

- [ ] **Update Dependencies**
  - [ ] Update package.json
  - [ ] Install new version
  - [ ] Update imports

- [ ] **Update Configuration**
  - [ ] Migrate tool configurations
  - [ ] Update event handlers
  - [ ] Update method calls

- [ ] **Update Code**
  - [ ] Update API calls
  - [ ] Update event handling
  - [ ] Update configuration

- [ ] **Test Migration**
  - [ ] Test basic functionality
  - [ ] Test all features
  - [ ] Test edge cases

### Post-Migration

- [ ] **Verify Functionality**
  - [ ] Test all features
  - [ ] Check performance
  - [ ] Verify compatibility

- [ ] **Update Documentation**
  - [ ] Update code comments
  - [ ] Update user documentation
  - [ ] Update API documentation

- [ ] **Deploy and Monitor**
  - [ ] Deploy to staging
  - [ ] Monitor for issues
  - [ ] Deploy to production

## Rollback Procedures

### Quick Rollback

#### 1. Revert Code Changes
```bash
# Revert to previous commit
git revert HEAD

# Or reset to previous commit
git reset --hard HEAD~1
```

#### 2. Revert Dependencies
```bash
# Revert package.json
git checkout HEAD~1 -- package.json

# Reinstall dependencies
npm install
```

#### 3. Revert Configuration
```bash
# Revert configuration files
git checkout HEAD~1 -- config/
```

### Full Rollback

#### 1. Complete System Rollback
```bash
# Create rollback branch
git checkout -b rollback-$(date +%Y%m%d)

# Revert to previous version
git reset --hard <previous-commit-hash>

# Force push to rollback
git push origin rollback-$(date +%Y%m%d) --force
```

#### 2. Database Rollback (if applicable)
```sql
-- Rollback database changes
-- (Specific to your database schema)
```

#### 3. Configuration Rollback
```bash
# Restore configuration files
cp backup/config/* config/

# Restart services
systemctl restart your-service
```

### Rollback Testing

#### 1. Test Rollback
```bash
# Test rollback in staging
git checkout rollback-$(date +%Y%m%d)
npm test
```

#### 2. Verify Functionality
```bash
# Run integration tests
npm run test:integration

# Run performance tests
npm run test:performance
```

#### 3. Monitor System
```bash
# Monitor system health
npm run monitor

# Check logs
tail -f logs/application.log
```

### Rollback Communication

#### 1. Notify Team
- Send rollback notification
- Explain reason for rollback
- Provide timeline for fix

#### 2. Update Documentation
- Update rollback procedures
- Document lessons learned
- Update migration guide

#### 3. Plan Next Steps
- Identify root cause
- Plan fix implementation
- Schedule next migration attempt

This migration guide provides comprehensive instructions for migrating to CanvasLens from other libraries or upgrading between versions. Follow the checklist and use the provided helpers to ensure a smooth migration process.
