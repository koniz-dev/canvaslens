# CanvasLens Examples & Use Cases

## Table of Contents

- [Basic Usage](#basic-usage)
- [Framework Integration](#framework-integration)
- [Advanced Features](#advanced-features)
- [Real-World Use Cases](#real-world-use-cases)
- [Custom Implementations](#custom-implementations)
- [Performance Examples](#performance-examples)

## Basic Usage

### 1. Simple Image Viewer

```html
<!DOCTYPE html>
<html>
<head>
    <title>Basic Image Viewer</title>
    <style>
        canvas-lens {
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            display: block;
        }
    </style>
</head>
<body>
    <canvas-lens 
        src="https://picsum.photos/800/600"
        width="800px" 
        height="600px">
    </canvas-lens>
    
    <script type="module">
        import { CanvasLens } from '@koniz-dev/canvaslens';
        
        // Optional: Add event listeners
        const viewer = document.querySelector('canvas-lens');
        viewer.addEventListener('imageload', (e) => {
            console.log('Image loaded:', e.detail);
        });
    </script>
</body>
</html>
```

### 2. Image Viewer with Zoom and Pan

```html
<canvas-lens 
    src="https://example.com/large-image.jpg"
    width="100%" 
    height="500px"
    tools='{"zoom": true, "pan": true}'
    max-zoom="5"
    min-zoom="0.5">
</canvas-lens>
```

### 3. Annotation Tools

```html
<canvas-lens 
    src="https://example.com/document.jpg"
    width="800px" 
    height="600px"
    tools='{
        "zoom": true, 
        "pan": true, 
        "annotation": {
            "rect": true, 
            "arrow": true, 
            "text": true, 
            "circle": true, 
            "line": true
        }
    }'>
</canvas-lens>
```

### 3.1. Annotation Tools with Custom Styles

```html
<canvas-lens 
    src="https://example.com/document.jpg"
    width="800px" 
    height="600px"
    tools='{
        "zoom": true, 
        "pan": true, 
        "annotation": {
            "rect": true, 
            "arrow": true, 
            "style": {
                "strokeColor": "#0096ff",
                "strokeWidth": 3,
                "lineStyle": "dashed",
                "fillColor": "rgba(0, 150, 255, 0.3)",
                "shadowColor": "rgba(0, 0, 0, 0.3)",
                "shadowBlur": 10
            }
        }
    }'>
</canvas-lens>
```

See [Annotation Styles Guide](./annotation-styles.md) for complete styling options.

### 4. Before/After Comparison

```html
<canvas-lens 
    src="https://example.com/before.jpg"
    width="800px" 
    height="600px"
    tools='{"comparison": true}'>
</canvas-lens>

<script type="module">
    import { CanvasLens } from '@koniz-dev/canvaslens';
    
    const viewer = document.querySelector('canvas-lens');
    
    // Set comparison image
    viewer.addEventListener('imageload', async () => {
        await viewer.setComparisonImage('https://example.com/after.jpg');
    });
</script>
```

## Framework Integration

### React

#### Basic React Component

```jsx
import React, { useRef, useEffect } from 'react';
import { CanvasLens } from '@koniz-dev/canvaslens';

const ImageViewer = ({ src, width = "800px", height = "600px" }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const viewer = new CanvasLens();
      viewer.src = src;
      viewer.width = width;
      viewer.height = height;
      containerRef.current.appendChild(viewer);
      
      // Add event listeners
      const handleImageLoad = (e) => {
        console.log('Image loaded:', e.detail);
      };
      
      viewer.addEventListener('imageload', handleImageLoad);
      
      return () => {
        viewer.removeEventListener('imageload', handleImageLoad);
        if (containerRef.current && viewer.parentNode) {
          containerRef.current.removeChild(viewer);
        }
      };
    }
  }, [src, width, height]);

  return <div ref={containerRef} />;
};

export default ImageViewer;
```

#### React Hook for CanvasLens

```jsx
import { useState, useEffect, useRef } from 'react';
import { CanvasLens } from '@koniz-dev/canvaslens';

const useCanvasLens = (options = {}) => {
  const [viewer, setViewer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const canvasLens = new CanvasLens();
      
      // Set up event listeners
      const handleImageLoad = () => {
        setIsLoading(false);
        setError(null);
      };
      
      const handleError = (e) => {
        setError(e.detail.message);
        setIsLoading(false);
      };

      canvasLens.addEventListener('imageload', handleImageLoad);
      canvasLens.addEventListener('error', handleError);

      // Apply options
      Object.assign(canvasLens, options);
      
      containerRef.current.appendChild(canvasLens);
      setViewer(canvasLens);

      return () => {
        canvasLens.removeEventListener('imageload', handleImageLoad);
        canvasLens.removeEventListener('error', handleError);
        if (containerRef.current && canvasLens.parentNode) {
          containerRef.current.removeChild(canvasLens);
        }
      };
    }
  }, []);

  const loadImage = async (src, type, fileName) => {
    if (viewer) {
      setIsLoading(true);
      setError(null);
      try {
        await viewer.loadImage(src, type, fileName);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    }
  };

  const getImageData = () => {
    return viewer ? viewer.getImageData() : null;
  };

  const getZoomLevel = () => {
    return viewer ? viewer.getZoomLevel() : 1;
  };

  const getPanOffset = () => {
    return viewer ? viewer.getPanOffset() : { x: 0, y: 0 };
  };

  return {
    containerRef,
    viewer,
    isLoading,
    error,
    loadImage,
    getImageData,
    getZoomLevel,
    getPanOffset
  };
};

// Usage
const MyComponent = () => {
  const { containerRef, viewer, isLoading, error, loadImage } = useCanvasLens({
    width: "800px",
    height: "600px",
    tools: JSON.stringify({
      zoom: true,
      pan: true,
      annotation: { rect: true, arrow: true }
    })
  });

  return (
    <div>
      <div ref={containerRef} />
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <button onClick={() => loadImage('https://example.com/image.jpg')}>
        Load Image
      </button>
    </div>
  );
};
```

### Vue 3

#### Vue Composition API

```vue
<template>
  <div>
    <div ref="container" class="canvas-container"></div>
    <div v-if="isLoading" class="loading">Loading...</div>
    <div v-if="error" class="error">Error: {{ error }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { CanvasLens } from '@koniz-dev/canvaslens';

const props = defineProps({
  src: String,
  width: { type: String, default: '800px' },
  height: { type: String, default: '600px' },
  tools: { type: Object, default: () => ({}) }
});

const emit = defineEmits(['imageload', 'error', 'annotationadd']);

const container = ref(null);
const viewer = ref(null);
const isLoading = ref(false);
const error = ref(null);

onMounted(() => {
  if (container.value) {
    viewer.value = new CanvasLens();
    
    // Set properties
    viewer.value.src = props.src;
    viewer.value.width = props.width;
    viewer.value.height = props.height;
    viewer.value.tools = JSON.stringify(props.tools);
    
    // Set up event listeners
    const handleImageLoad = (e) => {
      isLoading.value = false;
      error.value = null;
      emit('imageload', e.detail);
    };
    
    const handleError = (e) => {
      error.value = e.detail.message;
      isLoading.value = false;
      emit('error', e.detail);
    };
    
    const handleAnnotationAdd = (e) => {
      emit('annotationadd', e.detail);
    };
    
    viewer.value.addEventListener('imageload', handleImageLoad);
    viewer.value.addEventListener('error', handleError);
    viewer.value.addEventListener('annotationadd', handleAnnotationAdd);
    
    container.value.appendChild(viewer.value);
  }
});

onUnmounted(() => {
  if (viewer.value && viewer.value.parentNode) {
    viewer.value.parentNode.removeChild(viewer.value);
  }
});

const loadImage = async (src) => {
  if (viewer.value) {
    isLoading.value = true;
    error.value = null;
    try {
      await viewer.value.loadImage(src);
    } catch (err) {
      error.value = err.message;
      isLoading.value = false;
    }
  }
};

defineExpose({
  loadImage,
  viewer
});
</script>

<style scoped>
.canvas-container {
  border: 1px solid #ddd;
  border-radius: 8px;
}

.loading, .error {
  padding: 10px;
  text-align: center;
}

.error {
  color: red;
}
</style>
```

### Angular

#### Angular Component

```typescript
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CanvasLens } from '@koniz-dev/canvaslens';

@Component({
  selector: 'app-image-viewer',
  template: `
    <div #container class="canvas-container"></div>
    <div *ngIf="isLoading" class="loading">Loading...</div>
    <div *ngIf="error" class="error">Error: {{ error }}</div>
  `,
  styles: [`
    .canvas-container {
      border: 1px solid #ddd;
      border-radius: 8px;
    }
    .loading, .error {
      padding: 10px;
      text-align: center;
    }
    .error {
      color: red;
    }
  `]
})
export class ImageViewerComponent implements OnInit, OnDestroy {
  @ViewChild('container', { static: true }) container!: ElementRef;
  @Input() src: string = '';
  @Input() width: string = '800px';
  @Input() height: string = '600px';
  @Input() tools: any = {};

  private viewer: CanvasLens | null = null;
  isLoading = false;
  error: string | null = null;

  ngOnInit() {
    this.initializeViewer();
  }

  ngOnDestroy() {
    this.destroyViewer();
  }

  private initializeViewer() {
    if (this.container.nativeElement) {
      this.viewer = new CanvasLens();
      
      // Set properties
      this.viewer.src = this.src;
      this.viewer.width = this.width;
      this.viewer.height = this.height;
      this.viewer.tools = JSON.stringify(this.tools);
      
      // Set up event listeners
      const handleImageLoad = () => {
        this.isLoading = false;
        this.error = null;
      };
      
      const handleError = (e: any) => {
        this.error = e.detail.message;
        this.isLoading = false;
      };
      
      this.viewer.addEventListener('imageload', handleImageLoad);
      this.viewer.addEventListener('error', handleError);
      
      this.container.nativeElement.appendChild(this.viewer);
    }
  }

  private destroyViewer() {
    if (this.viewer && this.viewer.parentNode) {
      this.viewer.parentNode.removeChild(this.viewer);
      this.viewer = null;
    }
  }

  async loadImage(src: string) {
    if (this.viewer) {
      this.isLoading = true;
      this.error = null;
      try {
        await this.viewer.loadImage(src);
      } catch (err: any) {
        this.error = err.message;
        this.isLoading = false;
      }
    }
  }
}
```

## Advanced Features

### 1. Custom Annotation Styles

```javascript
const viewer = document.querySelector('canvas-lens');

// Custom annotation with specific styling
const customAnnotation = {
  id: 'custom-1',
  type: 'rect',
  points: [
    { x: 100, y: 100 },
    { x: 300, y: 100 },
    { x: 300, y: 250 },
    { x: 100, y: 250 }
  ],
  style: {
    strokeColor: '#ff0000',
    strokeWidth: 3,
    fillColor: 'rgba(255, 0, 0, 0.2)',
    lineStyle: 'dashed'
  }
};

viewer.addAnnotation(customAnnotation);
```

### 2. Dynamic Tool Configuration

```javascript
const viewer = document.querySelector('canvas-lens');

// Update tools dynamically
function updateTools(newTools) {
  viewer.updateTools(newTools);
}

// Example: Enable only rectangle tool
updateTools({
  zoom: true,
  pan: true,
  annotation: {
    rect: true,
    arrow: false,
    text: false,
    circle: false,
    line: false
  }
});

// Example: Enable all annotation tools
updateTools({
  zoom: true,
  pan: true,
  annotation: {
    rect: true,
    arrow: true,
    text: true,
    circle: true,
    line: true
  }
});
```

### 3. Programmatic View Control

```javascript
const viewer = document.querySelector('canvas-lens');

// Zoom operations
viewer.zoomIn(1.5); // Zoom in by 1.5x
viewer.zoomOut(1.2); // Zoom out by 1.2x
viewer.zoomTo(2.5); // Set zoom to 2.5x

// View control
viewer.fitToView(); // Fit image to viewport
viewer.resetView(); // Reset to initial state

// Get current view state
const zoom = viewer.getZoomLevel();
const pan = viewer.getPanOffset();
console.log(`Zoom: ${zoom}, Pan: ${pan.x}, ${pan.y}`);

// Check if image is loaded
if (viewer.isImageLoaded()) {
  const imageData = viewer.getImageData();
  console.log('Image info:', imageData);
}
```

### 4. Annotation Management

```javascript
const viewer = document.querySelector('canvas-lens');

// Add multiple annotations
const annotations = [
  {
    id: 'rect-1',
    type: 'rect',
    points: [
      { x: 50, y: 50 },
      { x: 150, y: 50 },
      { x: 150, y: 130 },
      { x: 50, y: 130 }
    ],
    style: { 
      strokeColor: '#ff0000',
      strokeWidth: 2,
      fillColor: 'rgba(255, 0, 0, 0.1)'
    }
  },
  {
    id: 'arrow-1',
    type: 'arrow',
    points: [
      { x: 200, y: 100 },
      { x: 350, y: 100 }
    ],
    style: { 
      strokeColor: '#00ff00',
      strokeWidth: 3
    }
  },
  {
    id: 'text-1',
    type: 'text',
    points: [{ x: 300, y: 200 }],
    style: { 
      strokeColor: '#0000ff',
      strokeWidth: 1,
      fontSize: 16, 
      fontFamily: 'Arial'
    },
    data: { text: 'Important Note' }
  }
];

annotations.forEach(annotation => {
  viewer.addAnnotation(annotation);
});

// Get all annotations
const allAnnotations = viewer.getAnnotations();
console.log(`Total annotations: ${allAnnotations.length}`);

// Remove specific annotation
viewer.removeAnnotation('rect-1');

// Clear all annotations
viewer.clearAnnotations();
```

### 5. Comparison Mode with Custom Controls

```html
<div class="comparison-container">
  <canvas-lens 
    id="comparison-viewer"
    src="https://example.com/before.jpg"
    width="800px" 
    height="600px"
    tools='{"comparison": true}'>
  </canvas-lens>
  
  <div class="comparison-controls">
    <button onclick="toggleComparison()">Toggle Comparison</button>
    <button onclick="enableComparison()">Enable Comparison</button>
    <button onclick="disableComparison()">Disable Comparison</button>
  </div>
</div>

<script type="module">
  import { CanvasLens } from '@koniz-dev/canvaslens';
  
  const viewer = document.getElementById('comparison-viewer');
  
  function toggleComparison() {
    viewer.toggleComparisonMode();
  }
  
  function enableComparison() {
    viewer.setComparisonMode(true);
  }
  
  function disableComparison() {
    viewer.setComparisonMode(false);
  }
  
  // Check comparison state
  function checkComparisonState() {
    if (viewer.isComparisonMode()) {
      console.log('Comparison mode is active');
    }
  }
  
  // Listen for comparison changes
  viewer.addEventListener('comparisonchange', (e) => {
    console.log('Comparison position changed:', e.detail);
  });
</script>
```

## Real-World Use Cases

### 1. Medical Image Viewer

```html
<div class="medical-viewer">
  <canvas-lens 
    id="medical-viewer"
    src="https://example.com/xray.jpg"
    width="100%" 
    height="600px"
    tools='{
      "zoom": true, 
      "pan": true, 
      "annotation": {
        "rect": true, 
        "arrow": true, 
        "text": true
      }
    }'
    max-zoom="8">
  </canvas-lens>
  
  <div class="medical-controls">
    <button onclick="addMeasurement()">Add Measurement</button>
    <button onclick="addNote()">Add Note</button>
    <button onclick="exportAnnotations()">Export Annotations</button>
  </div>
</div>

<script type="module">
  import { CanvasLens } from '@koniz-dev/canvaslens';
  
  const viewer = document.getElementById('medical-viewer');
  
  function addMeasurement() {
    const success = viewer.activateTool('rect');
    if (success) {
      console.log('Rectangle tool activated for measurements');
    }
  }
  
  function addNote() {
    const success = viewer.activateTool('text');
    if (success) {
      console.log('Text tool activated for notes');
    }
  }
  
  function exportAnnotations() {
    const annotations = viewer.getAnnotations();
    const imageData = viewer.getImageData();
    const exportData = {
      image: imageData,
      annotations: annotations,
      exportDate: new Date().toISOString()
    };
    
    const data = JSON.stringify(exportData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'medical-annotations.json';
    a.click();
  }
</script>
```

### 2. Design Review Tool

```html
<div class="design-review">
  <canvas-lens 
    id="design-viewer"
    src="https://example.com/design.jpg"
    width="100%" 
    height="700px"
    tools='{
      "zoom": true, 
      "pan": true, 
      "annotation": {
        "rect": true, 
        "arrow": true, 
        "text": true, 
        "circle": true
      }
    }'>
  </canvas-lens>
  
  <div class="review-panel">
    <h3>Review Comments</h3>
    <div id="comments-list"></div>
    <button onclick="saveReview()">Save Review</button>
  </div>
</div>

<script type="module">
  import { CanvasLens } from '@koniz-dev/canvaslens';
  
  const viewer = document.getElementById('design-viewer');
  const commentsList = document.getElementById('comments-list');
  
  viewer.addEventListener('annotationadd', (e) => {
    const annotation = e.detail;
    addCommentToList(annotation);
  });
  
  function addCommentToList(annotation) {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment';
    commentDiv.setAttribute('data-id', annotation.id);
    
    const position = annotation.points[0];
    const text = annotation.data?.text || '';
    
    commentDiv.innerHTML = `
      <strong>${annotation.type.toUpperCase()}</strong>
      <p>Position: (${position.x}, ${position.y})</p>
      ${text ? `<p>Text: ${text}</p>` : ''}
      <button onclick="removeComment('${annotation.id}')">Remove</button>
    `;
    commentsList.appendChild(commentDiv);
  }
  
  function removeComment(id) {
    viewer.removeAnnotation(id);
    // Remove from comments list
    const commentDiv = document.querySelector(`[data-id="${id}"]`);
    if (commentDiv) {
      commentDiv.remove();
    }
  }
  
  function saveReview() {
    const annotations = viewer.getAnnotations();
    const imageData = viewer.getImageData();
    const review = {
      timestamp: new Date().toISOString(),
      image: imageData,
      annotations: annotations,
      hasChanges: viewer.hasChanges()
    };
    
    // Save to server or local storage
    localStorage.setItem('design-review', JSON.stringify(review));
    alert('Review saved successfully!');
  }
</script>
```

### 3. Before/After Gallery

```html
<div class="before-after-gallery">
  <h2>Before & After Gallery</h2>
  
  <div class="gallery-item">
    <h3>Kitchen Renovation</h3>
    <canvas-lens 
      src="https://example.com/kitchen-before.jpg"
      width="600px" 
      height="400px"
      tools='{"comparison": true}'>
    </canvas-lens>
  </div>
  
  <div class="gallery-item">
    <h3>Living Room Makeover</h3>
    <canvas-lens 
      src="https://example.com/living-before.jpg"
      width="600px" 
      height="400px"
      tools='{"comparison": true}'>
    </canvas-lens>
  </div>
</div>

<script type="module">
  import { CanvasLens } from '@koniz-dev/canvaslens';
  
  // Set up all comparison viewers
  const viewers = document.querySelectorAll('canvas-lens');
  
  viewers.forEach((viewer, index) => {
    const afterImages = [
      'https://example.com/kitchen-after.jpg',
      'https://example.com/living-after.jpg'
    ];
    
    // Enable comparison mode
    viewer.setComparisonMode(true);
    
    // Listen for comparison changes
    viewer.addEventListener('comparisonchange', (e) => {
      console.log(`Gallery item ${index} comparison position:`, e.detail);
    });
  });
</script>
```

### 4. Document Annotation System

```html
<div class="document-annotation">
  <div class="toolbar">
    <button onclick="selectTool('rect')">Rectangle</button>
    <button onclick="selectTool('arrow')">Arrow</button>
    <button onclick="selectTool('text')">Text</button>
    <button onclick="selectTool('highlight')">Highlight</button>
    <button onclick="clearAll()">Clear All</button>
    <button onclick="exportDocument()">Export</button>
  </div>
  
  <canvas-lens 
    id="document-viewer"
    src="https://example.com/document.pdf"
    width="100%" 
    height="800px"
    tools='{
      "zoom": true, 
      "pan": true, 
      "annotation": {
        "rect": true, 
        "arrow": true, 
        "text": true
      }
    }'>
  </canvas-lens>
</div>

<script type="module">
  import { CanvasLens } from '@koniz-dev/canvaslens';
  
  const viewer = document.getElementById('document-viewer');
  
  function selectTool(tool) {
    if (tool === 'highlight') {
      // Custom highlight tool using rectangle with transparent fill
      const success = viewer.activateTool('rect');
      if (success) {
        console.log('Highlight tool activated');
        // Set custom style for highlighting
      }
    } else {
      const success = viewer.activateTool(tool);
      if (success) {
        console.log(`${tool} tool activated`);
      }
    }
  }
  
  function clearAll() {
    if (confirm('Are you sure you want to clear all annotations?')) {
      viewer.clearAnnotations();
    }
  }
  
  function exportDocument() {
    const annotations = viewer.getAnnotations();
    const imageData = viewer.getImageData();
    const documentData = {
      source: viewer.src,
      image: imageData,
      annotations: annotations,
      exportDate: new Date().toISOString(),
      hasChanges: viewer.hasChanges()
    };
    
    // Export as JSON or PDF with annotations
    const data = JSON.stringify(documentData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document-annotations.json';
    a.click();
  }
</script>
```

## Custom Implementations

### 1. Custom Tool Implementation

```javascript
class CustomTool {
  constructor(viewer) {
    this.viewer = viewer;
    this.isActive = false;
    this.startPoint = null;
  }
  
  activate() {
    this.isActive = true;
    this.viewer.canvas.style.cursor = 'crosshair';
  }
  
  deactivate() {
    this.isActive = false;
    this.viewer.canvas.style.cursor = 'default';
  }
  
  onMouseDown(event) {
    if (!this.isActive) return;
    
    const rect = this.viewer.canvas.getBoundingClientRect();
    this.startPoint = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }
  
  onMouseMove(event) {
    if (!this.isActive || !this.startPoint) return;
    
    // Custom drawing logic
    this.drawPreview(event);
  }
  
  onMouseUp(event) {
    if (!this.isActive || !this.startPoint) return;
    
    const rect = this.viewer.canvas.getBoundingClientRect();
    const endPoint = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    
    // Create custom annotation
    const annotation = this.createAnnotation(this.startPoint, endPoint);
    this.viewer.addAnnotation(annotation);
    
    this.startPoint = null;
  }
  
  createAnnotation(start, end) {
    return {
      id: `custom-${Date.now()}`,
      type: 'custom',
      points: [start, end],
      style: {
        strokeColor: '#ff0000',
        strokeWidth: 2,
        lineStyle: 'solid'
      },
      data: {
        startPoint: start,
        endPoint: end
      }
    };
  }
  
  drawPreview(event) {
    // Custom preview drawing logic
  }
}

// Usage
const viewer = document.querySelector('canvas-lens');
const customTool = new CustomTool(viewer);

// Add custom tool to toolbar
document.getElementById('custom-tool-btn').addEventListener('click', () => {
  customTool.activate();
});
```

### 2. Custom Event System

```javascript
class CanvasLensEventManager {
  constructor(viewer) {
    this.viewer = viewer;
    this.customEvents = new Map();
    this.setupCustomEvents();
  }
  
  setupCustomEvents() {
    // Custom event: annotation style changed
    this.viewer.addEventListener('annotationadd', (e) => {
      this.emit('annotationStyleChanged', {
        annotation: e.detail,
        style: e.detail.style
      });
    });
    
    // Custom event: view state changed
    this.viewer.addEventListener('zoomchange', (e) => {
      this.emit('viewStateChanged', {
        zoom: e.detail,
        pan: this.viewer.getPan()
      });
    });
  }
  
  on(event, callback) {
    if (!this.customEvents.has(event)) {
      this.customEvents.set(event, []);
    }
    this.customEvents.get(event).push(callback);
  }
  
  off(event, callback) {
    if (this.customEvents.has(event)) {
      const callbacks = this.customEvents.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }
  
  emit(event, data) {
    if (this.customEvents.has(event)) {
      this.customEvents.get(event).forEach(callback => {
        callback(data);
      });
    }
  }
}

// Usage
const viewer = document.querySelector('canvas-lens');
const eventManager = new CanvasLensEventManager(viewer);

eventManager.on('annotationStyleChanged', (data) => {
  console.log('Annotation style changed:', data);
});

eventManager.on('viewStateChanged', (data) => {
  console.log('View state changed:', data);
});
```

## Performance Examples

### 1. Lazy Loading Images

```javascript
class LazyImageLoader {
  constructor(viewer) {
    this.viewer = viewer;
    this.imageQueue = [];
    this.loading = false;
  }
  
  addToQueue(imageSrc) {
    this.imageQueue.push(imageSrc);
    this.processQueue();
  }
  
  async processQueue() {
    if (this.loading || this.imageQueue.length === 0) return;
    
    this.loading = true;
    const imageSrc = this.imageQueue.shift();
    
    try {
      await this.viewer.loadImage(imageSrc);
      console.log('Image loaded successfully:', imageSrc);
    } catch (error) {
      console.error('Failed to load image:', imageSrc, error);
    } finally {
      this.loading = false;
      this.processQueue(); // Process next image
    }
  }
}

// Usage
const viewer = document.querySelector('canvas-lens');
const lazyLoader = new LazyImageLoader(viewer);

// Add images to queue
lazyLoader.addToQueue('https://example.com/image1.jpg');
lazyLoader.addToQueue('https://example.com/image2.jpg');
lazyLoader.addToQueue('https://example.com/image3.jpg');
```

### 2. Image Preloading

```javascript
class ImagePreloader {
  constructor() {
    this.cache = new Map();
  }
  
  async preloadImage(src) {
    if (this.cache.has(src)) {
      return this.cache.get(src);
    }
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.cache.set(src, img);
        resolve(img);
      };
      img.onerror = reject;
      img.src = src;
    });
  }
  
  async preloadImages(srcs) {
    const promises = srcs.map(src => this.preloadImage(src));
    return Promise.all(promises);
  }
}

// Usage
const preloader = new ImagePreloader();
const imageSources = [
  'https://example.com/image1.jpg',
  'https://example.com/image2.jpg',
  'https://example.com/image3.jpg'
];

// Preload all images
preloader.preloadImages(imageSources).then(() => {
  console.log('All images preloaded');
  
  // Now load first image in viewer
  const viewer = document.querySelector('canvas-lens');
  viewer.loadImage(imageSources[0]);
});
```

### 3. Annotation Optimization

```javascript
class AnnotationOptimizer {
  constructor(viewer) {
    this.viewer = viewer;
    this.annotationCache = new Map();
    this.setupOptimization();
  }
  
  setupOptimization() {
    // Debounce annotation rendering
    this.debouncedRender = this.debounce(() => {
      this.viewer.render();
    }, 16); // ~60fps
    
    // Listen for annotation changes
    this.viewer.addEventListener('annotationadd', () => {
      this.debouncedRender();
    });
    
    this.viewer.addEventListener('annotationremove', () => {
      this.debouncedRender();
    });
  }
  
  debounce(func, wait) {
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
  
  optimizeAnnotations(annotations) {
    // Remove annotations outside viewport
    const viewport = this.getViewport();
    return annotations.filter(annotation => {
      return this.isAnnotationInViewport(annotation, viewport);
    });
  }
  
  getViewport() {
    const zoom = this.viewer.getZoomLevel();
    const pan = this.viewer.getPanOffset();
    const canvas = this.viewer.canvas;
    
    return {
      x: -pan.x / zoom,
      y: -pan.y / zoom,
      width: canvas.width / zoom,
      height: canvas.height / zoom
    };
  }
  
  isAnnotationInViewport(annotation, viewport) {
    // Check if any point of the annotation is within the viewport
    return annotation.points.some(point => {
      return point.x >= viewport.x && 
             point.x <= viewport.x + viewport.width &&
             point.y >= viewport.y && 
             point.y <= viewport.y + viewport.height;
    });
  }
}

// Usage
const viewer = document.querySelector('canvas-lens');
const optimizer = new AnnotationOptimizer(viewer);
```

These examples demonstrate the versatility and power of CanvasLens across different use cases, from simple image viewing to complex annotation systems. The library's modular architecture and comprehensive API make it suitable for a wide range of applications.
