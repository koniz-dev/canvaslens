# CanvasLens Component Usage

CanvasLens supports usage as a component in various frameworks through the Component Pattern. This allows you to use `<CanvasLens />` naturally in Vue, React, Angular and other frameworks.

## Component Interface

### Props Interface
```typescript
interface CanvasLensProps {
  // Image props
  src?: string;
  imageType?: string;
  fileName?: string;
  
  // Size props
  width?: number | string;  // Support px, %, or number
  height?: number | string; // Support px, %, or number
  
  // Configuration props
  backgroundColor?: string;
  enableZoom?: boolean;
  enablePan?: boolean;
  enableAnnotations?: boolean;
  enableComparison?: boolean;
  maxZoom?: number;
  minZoom?: number;
  
  // Overlay mode
  overlayMode?: boolean;
  
  // Tool props
  activeTool?: 'rect' | 'arrow' | 'text' | 'circle' | 'line' | null;
  
  // Event handlers
  onImageLoad?: (imageData: ImageData) => void;
  onZoomChange?: (scale: number) => void;
  onPanChange?: (offset: Point) => void;
  onAnnotationAdd?: (annotation: Annotation) => void;
  onAnnotationRemove?: (annotationId: string) => void;
  onToolChange?: (toolType: string | null) => void;
  onComparisonChange?: (position: number) => void;
  onSave?: (imageData: ImageData) => void;
  onClose?: () => void;
  onClick?: (event: MouseEvent) => void;
}
```

### Component Instance Methods
```typescript
interface CanvasLensInstance {
  // Core methods
  loadImage: (src: string, type?: string, fileName?: string) => Promise<void>;
  loadImageFromFile: (file: File) => void;
  resize: (width: number, height: number) => void;
  
  // Tool methods
  activateTool: (toolType: string) => boolean;
  deactivateTool: () => boolean;
  getActiveTool: () => string | null;
  
  // Annotation methods
  addAnnotation: (annotation: Annotation) => void;
  removeAnnotation: (annotationId: string) => void;
  clearAnnotations: () => void;
  getAnnotations: () => Annotation[];
  
  // Comparison methods
  setComparisonImage: (src: string) => Promise<void>;
  setComparisonPosition: (position: number) => void;
  getComparisonPosition: () => number;
  
  // Overlay methods
  openOverlay: () => void;
  closeOverlay: () => void;
  saveChanges: () => void;
  
  // Getter methods
  getCanvasLens: () => CoreCanvasLens;
  getImageViewer: () => any;
  getZoomPanHandler: () => any;
  getAnnotationManager: () => any;
  getComparisonManager: () => any;
  
  // State methods
  isImageLoaded: () => boolean;
  getImageData: () => ImageData | null;
  getZoomLevel: () => number;
  getPanOffset: () => Point;
  isOverlayOpen: () => boolean;
  
  // Destroy
  destroy: () => void;
}
```

## Factory Functions

### createCanvasLens
```typescript
function createCanvasLens(
  container: HTMLElement, 
  props: CanvasLensProps
): CanvasLensInstance
```

### updateCanvasLens
```typescript
function updateCanvasLens(
  instance: CanvasLensInstance,
  props: CanvasLensProps
): void
```

### CanvasLens Factory
```typescript
const CanvasLens: CanvasLensFactory = {
  create: createCanvasLens,
  update: updateCanvasLens,
  destroy: (instance: CanvasLensInstance) => instance.destroy()
};
```

## Basic Usage

### Vanilla JavaScript/TypeScript
```typescript
import { CanvasLens } from '@koniz-dev/canvaslens';

const container = document.getElementById('viewer');
const instance = CanvasLens.create(container, {
  width: '100%',
  height: '100%',
  enableZoom: true,
  enablePan: true,
  enableAnnotations: true,
  enableComparison: true,
  onImageLoad: (imageData) => {
    console.log('Image loaded:', imageData.naturalSize);
  },
  onSave: (imageData) => {
    console.log('Changes saved');
  }
});

// Load an image
await instance.loadImage('https://example.com/image.jpg');

// Open overlay mode
instance.openOverlay();
```

### React Integration
```tsx
import React, { useEffect, useRef } from 'react';
import { CanvasLens } from '@koniz-dev/canvaslens';

const CanvasLensComponent: React.FC<CanvasLensProps> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<CanvasLensInstance | null>(null);

  useEffect(() => {
    if (containerRef.current && !instanceRef.current) {
      instanceRef.current = CanvasLens.create(containerRef.current, props);
    }

    return () => {
      if (instanceRef.current) {
        instanceRef.current.destroy();
        instanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (instanceRef.current) {
      CanvasLens.update(instanceRef.current, props);
    }
  }, [props]);

  return <div ref={containerRef} style={{ width: '100%', height: '400px' }} />;
};

// Usage
<CanvasLensComponent
  enableZoom={true}
  enableAnnotations={true}
  onImageLoad={(imageData) => console.log('Loaded:', imageData)}
/>
```

### Vue Integration
```vue
<template>
  <div ref="container" style="width: 100%; height: 400px;"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { CanvasLens } from '@koniz-dev/canvaslens';

const props = defineProps<CanvasLensProps>();
const container = ref<HTMLElement>();
let instance: CanvasLensInstance | null = null;

onMounted(() => {
  if (container.value) {
    instance = CanvasLens.create(container.value, props);
  }
});

onUnmounted(() => {
  if (instance) {
    instance.destroy();
  }
});

watch(props, (newProps) => {
  if (instance) {
    CanvasLens.update(instance, newProps);
  }
});
</script>
```

## Features

### Image Loading
- Load images from URL or file input
- Automatic aspect ratio preservation
- High-quality rendering

### Zoom & Pan
- Mouse wheel zoom with cursor-centered zooming
- Drag to pan with smooth interactions
- Configurable zoom limits

### Annotations
- Rectangle, arrow, text, circle, and line tools
- Interactive drawing with mouse controls
- Customizable styles and colors

### Comparison
- Before/after image comparison
- Interactive slider control
- Synchronized zoom and pan

### Overlay Mode
- Full-screen professional editing interface
- All tools available in overlay mode
- Save functionality for applying changes

## Event Handling

### Image Events
```typescript
onImageLoad: (imageData: ImageData) => void;
```

### Zoom & Pan Events
```typescript
onZoomChange: (scale: number) => void;
onPanChange: (offset: Point) => void;
```

### Annotation Events
```typescript
onAnnotationAdd: (annotation: Annotation) => void;
onAnnotationRemove: (annotationId: string) => void;
onToolChange: (toolType: string | null) => void;
```

### Comparison Events
```typescript
onComparisonChange: (position: number) => void;
```

### Overlay Events
```typescript
onSave: (imageData: ImageData) => void;
onClose: () => void;
```

## Best Practices

1. **Always destroy instances**: Clean up resources when component unmounts
2. **Handle errors**: Wrap image loading in try-catch blocks
3. **Responsive design**: Use percentage values for width/height
4. **Performance**: Use `enableAnnotations: false` if not needed
5. **Accessibility**: Provide alt text and keyboard navigation

## Troubleshooting

### Common Issues

1. **Image not loading**: Check CORS settings and image URL
2. **Performance issues**: Reduce image size or disable unused features
3. **Memory leaks**: Always call `destroy()` when removing component
4. **TypeScript errors**: Ensure proper type imports and interfaces
