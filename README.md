# CanvasLens

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/koniz-dev/canvaslens)
[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://www.npmjs.com/package/@koniz-dev/canvaslens)
[![npm](https://img.shields.io/npm/v/@koniz-dev/canvaslens.svg)](https://www.npmjs.com/package/@koniz-dev/canvaslens)

A powerful HTML5 Canvas-based image viewing and annotation library built with TypeScript. CanvasLens provides a unified Web Component for image viewing, zooming, panning, annotation, and before/after image comparison with optional overlay mode for professional editing.

## ✨ Features

- 🖼️ **Image Viewer**: Load images from URL or file input with automatic aspect ratio preservation
- 🔍 **Zoom & Pan**: Mouse wheel zoom with cursor-centered zooming, drag to pan
- ✏️ **Annotations**: Rectangle, arrow, text, circle, and line annotation tools with keyboard shortcuts
- 🔄 **Image Comparison**: Interactive slider-based before/after comparison
- 🖼️ **Overlay Mode**: Full-screen professional editing interface
- 🎯 **Web Component**: Standard HTML element that works with any framework
- ⚙️ **Declarative Configuration**: JSON-based tool configuration
- 🎨 **TypeScript Support**: Full type safety and IntelliSense with comprehensive type definitions
- 🛠️ **Production Ready**: Optimized build with production-safe logging
- 🧪 **Framework Agnostic**: Works seamlessly with React, Vue, Angular, and vanilla JavaScript
- 📱 **Responsive Design**: Adapts to different screen sizes and container dimensions
- 🎮 **Keyboard Shortcuts**: Full keyboard navigation support for accessibility

## 🚀 Installation

### NPM
```bash
npm install @koniz-dev/canvaslens
```

### Yarn
```bash
yarn add @koniz-dev/canvaslens
```

### PNPM
```bash
pnpm add @koniz-dev/canvaslens
```

### CDN (ES Modules)
```html
<script type="module">
  import { CanvasLens } from 'https://unpkg.com/@koniz-dev/canvaslens@latest/dist/index.js';
</script>
```

**Note**: This package is published to the npm registry and supports ES modules. No additional configuration is required for modern bundlers.

## 📖 Quick Start

### Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
    <title>CanvasLens Demo</title>
    <style>
        canvas-lens {
            border: 1px solid #ccc;
            margin: 20px;
            display: block;
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <canvas-lens 
        src="https://picsum.photos/800/600"
        width="800px" 
        height="600px"
        background-color="#f8f9fa"
        tools='{"zoom": true, "pan": true, "annotation": {"rect": true, "arrow": true, "text": true, "circle": true, "line": true}, "comparison": true}'>
    </canvas-lens>
    
    <script type="module">
        import { CanvasLens } from '@koniz-dev/canvaslens';
        
        const viewer = document.querySelector('canvas-lens');
        
        // Event listeners
        viewer.addEventListener('imageload', (e) => {
            console.log('Image loaded:', e.detail);
        });
        
        viewer.addEventListener('zoomchange', (e) => {
            console.log('Zoom level:', e.detail);
        });
        
        viewer.addEventListener('annotationadd', (e) => {
            console.log('Annotation added:', e.detail);
        });
        
        // Open overlay on double-click
        viewer.addEventListener('dblclick', () => {
            viewer.openOverlay();
        });
    </script>
</body>
</html>
```

### Complete Props and Events Example

```html
<!-- Complete Web Component with ALL props and events -->
<canvas-lens 
    src="https://example.com/image.jpg"
    width="800px"
    height="600px"
    background-color="#f0f0f0"
    tools='{"zoom": true, "pan": true, "annotation": {"rect": true, "arrow": true, "text": true, "circle": true, "line": true}, "comparison": true}'
    max-zoom="10"
    min-zoom="0.1"
    image-type="image/jpeg"
    file-name="my-image.jpg"
    
    <!-- Event listeners -->
    onimageload="handleImageLoad(event)"
    onzoomchange="handleZoomChange(event)"
    onpanchange="handlePanChange(event)"
    onannotationadd="handleAnnotationAdd(event)"
    onannotationremove="handleAnnotationRemove(event)"
    ontoolchange="handleToolChange(event)"
    oncomparisonchange="handleComparisonChange(event)">
</canvas-lens>

<script type="module">
// Import logger utility for production-safe logging
import { log } from './utils/logger.js';

// Event handler functions
function handleImageLoad(event) {
    const { naturalSize, fileName, type } = event.detail;
    log('Image loaded:', { fileName, type, width: naturalSize.width, height: naturalSize.height });
}

function handleZoomChange(event) {
    log('Zoom level:', event.detail);
}

function handlePanChange(event) {
    log('Pan offset:', event.detail);
}

function handleAnnotationAdd(event) {
    log('Annotation added:', event.detail);
}

function handleAnnotationRemove(event) {
    log('Annotation removed:', event.detail);
}

function handleToolChange(event) {
    log('Active tool:', event.detail);
}

function handleComparisonChange(event) {
    log('Comparison position:', event.detail);
}

// Alternative: Using addEventListener
const viewer = document.querySelector('canvas-lens');
viewer.addEventListener('imageload', (event) => {
    log('Image loaded via addEventListener:', event.detail);
});
</script>
```

### Framework Integration

#### Vue 3
```vue
<template>
  <div class="canvas-container">
    <canvas-lens 
      :src="imageSrc"
      width="800px" 
      height="600px"
      :tools="toolsJson"
      background-color="#f8f9fa"
      @imageload="onImageLoad"
      @zoomchange="onZoomChange"
      @annotationadd="onAnnotationAdd">
    </canvas-lens>
    
    <div class="controls">
      <button @click="loadNewImage">Load New Image</button>
      <button @click="toggleComparison">Toggle Comparison</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { CanvasLens } from '@koniz-dev/canvaslens';

const imageSrc = ref('https://picsum.photos/800/600');
const tools = ref({
  zoom: true,
  pan: true,
  annotation: { 
    rect: true, 
    arrow: true, 
    text: true, 
    circle: true, 
    line: true 
  },
  comparison: true
});

// Convert tools object to JSON string for the custom element
const toolsJson = computed(() => JSON.stringify(tools.value));

const onImageLoad = (e) => {
  console.log('Image loaded:', e.detail);
};

const onZoomChange = (e) => {
  console.log('Zoom level:', e.detail);
};

const onAnnotationAdd = (e) => {
  console.log('Annotation added:', e.detail);
};

const loadNewImage = () => {
  imageSrc.value = `https://picsum.photos/800/600?random=${Math.random()}`;
};

const toggleComparison = () => {
  const canvasLens = document.querySelector('canvas-lens');
  if (canvasLens && typeof canvasLens.toggleComparisonMode === 'function') {
    canvasLens.toggleComparisonMode();
  }
};
</script>
```

#### React
```jsx
import React, { useRef, useState, useCallback } from 'react';
import { CanvasLens } from '@koniz-dev/canvaslens';

const CanvasLensViewer = ({ src }) => {
  const viewerRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(src);
  
  const toolConfig = {
    zoom: true,
    pan: true,
    annotation: { 
      rect: true, 
      arrow: true, 
      text: true, 
      circle: true, 
      line: true 
    },
    comparison: true
  };

  const handleImageLoad = useCallback((e) => {
    console.log('Image loaded:', e.detail);
  }, []);

  const handleZoomChange = useCallback((e) => {
    console.log('Zoom level:', e.detail);
  }, []);

  const loadNewImage = () => {
    const newSrc = `https://picsum.photos/800/600?random=${Math.random()}`;
    setImageSrc(newSrc);
  };

  const toggleComparison = () => {
    const canvasLens = document.querySelector('canvas-lens');
    if (canvasLens && typeof canvasLens.toggleComparisonMode === 'function') {
      canvasLens.toggleComparisonMode();
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <canvas-lens 
        ref={viewerRef}
        src={imageSrc}
        width="800px" 
        height="600px"
        background-color="#f8f9fa"
        tools={JSON.stringify(toolConfig)}
        onimageload={handleImageLoad}
        onzoomchange={handleZoomChange}>
      </canvas-lens>
      
      <div style={{ marginTop: '10px' }}>
        <button onClick={loadNewImage} style={{ marginRight: '10px' }}>
          Load New Image
        </button>
        <button onClick={toggleComparison}>
          Toggle Comparison
        </button>
      </div>
    </div>
  );
};

export default CanvasLensViewer;
```

### Advanced Usage

```html
<canvas-lens
    src="https://example.com/image.jpg"
    width="800px"
    height="600px"
    background-color="#f0f0f0"
    tools='{"zoom": true, "pan": true, "annotation": {"rect": true, "arrow": true, "text": true, "circle": true, "line": true}, "comparison": true}'
    max-zoom="10"
    min-zoom="0.1">
</canvas-lens>

<script type="module">
const viewer = document.querySelector('canvas-lens');

// Import logger utility for production-safe logging
import { log } from './utils/logger.js';

// Set event handlers
viewer.addEventListener('imageload', (e) => {
    log('Image loaded:', e.detail);
});

viewer.addEventListener('zoomchange', (e) => {
    log('Zoom level:', e.detail);
});

viewer.addEventListener('panchange', (e) => {
    log('Pan offset:', e.detail);
});

viewer.addEventListener('annotationadd', (e) => {
    log('Annotation added:', e.detail);
});

viewer.addEventListener('annotationremove', (e) => {
    log('Annotation removed:', e.detail);
});

viewer.addEventListener('comparisonchange', (e) => {
    log('Comparison position:', e.detail);
});

// Load image from URL
await viewer.loadImage('https://picsum.photos/1200/800');

// Zoom controls
viewer.zoomIn(1.2);           // Zoom in by 20%
viewer.zoomOut(1.2);          // Zoom out by 20%
viewer.zoomTo(2.5);           // Zoom to 250%
viewer.fitToView();           // Fit image to view
viewer.resetView();           // Reset zoom and pan

// Tool controls
viewer.activateTool('rect');  // Rectangle tool
viewer.activateTool('arrow'); // Arrow tool
viewer.activateTool('text');  // Text tool
viewer.activateTool('circle'); // Circle tool
viewer.activateTool('line');  // Line tool
viewer.deactivateTool();      // Deactivate current tool

// Annotation controls
viewer.addAnnotation(annotation);
viewer.removeAnnotation(annotationId);
viewer.clearAnnotations();
const annotations = viewer.getAnnotations();

// Overlay editor
viewer.openOverlay();
viewer.closeOverlay();
</script>
```

## 📚 API Reference

### Web Component Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `src` | string | - | Image source URL |
| `width` | string/number | "800" | Width in px, %, or number |
| `height` | string/number | "600" | Height in px, %, or number |
| `background-color` | string | "#f0f0f0" | Background color |
| `tools` | JSON string | Minimal (no tools) | Tool configuration |
| `max-zoom` | number | "10" | Maximum zoom level |
| `min-zoom` | number | "0.1" | Minimum zoom level |
| `image-type` | string | - | Image MIME type |
| `file-name` | string | - | File name for display |

### Tool Configuration

The `tools` attribute accepts a JSON string:

```json
{
  "zoom": true,
  "pan": true,
  "annotation": {
    "rect": true,
    "arrow": true,
    "text": true,
    "circle": true,
    "line": true
  },
  "comparison": true
}
```


#### HTML Examples:

```html
<!-- Minimal configuration (default) - no tools -->
<canvas-lens src="image.jpg"></canvas-lens>

<!-- All tools enabled -->
<canvas-lens tools='{"zoom": true, "pan": true, "annotation": {"rect": true, "arrow": true, "text": true, "circle": true, "line": true}, "comparison": true}'></canvas-lens>

<!-- Zoom and pan only -->
<canvas-lens tools='{"zoom": true, "pan": true, "annotation": {"rect": false, "arrow": false, "text": false, "circle": false, "line": false}, "comparison": false}'></canvas-lens>

<!-- Annotation tools only -->
<canvas-lens tools='{"zoom": false, "pan": false, "annotation": {"rect": true, "arrow": true, "text": true, "circle": true, "line": true}, "comparison": false}'></canvas-lens>

<!-- Custom configuration -->
<canvas-lens tools='{"zoom": true, "pan": false, "annotation": {"rect": true, "arrow": false, "text": true, "circle": false, "line": false}, "comparison": true}'></canvas-lens>
```

### JavaScript API Methods

```javascript
const viewer = document.querySelector('canvas-lens');

// Image loading
await viewer.loadImage('https://example.com/image.jpg', 'image/jpeg', 'my-image.jpg');
viewer.loadImageFromFile(file);

// Resize
viewer.resize(800, 600);

// Zoom controls
viewer.zoomIn(1.2);           // Zoom in by 20%
viewer.zoomOut(1.2);          // Zoom out by 20%
viewer.zoomTo(2.0);           // Zoom to 200%
viewer.fitToView();           // Fit image to view
viewer.resetView();           // Reset zoom and pan

// Tool controls
viewer.activateTool('rect');  // Rectangle tool
viewer.activateTool('arrow'); // Arrow tool
viewer.activateTool('text');  // Text tool
viewer.activateTool('circle'); // Circle tool
viewer.activateTool('line');  // Line tool
viewer.deactivateTool();      // Deactivate current tool
viewer.getActiveTool();       // Get current active tool
viewer.updateTools(toolConfig); // Update tool configuration

// Annotation controls
viewer.addAnnotation(annotation);
viewer.removeAnnotation(annotationId);
viewer.clearAnnotations();
const annotations = viewer.getAnnotations();

// Comparison mode controls
viewer.toggleComparisonMode();
viewer.setComparisonMode(true);
viewer.isComparisonMode();

// Overlay editor
viewer.openOverlay();
viewer.closeOverlay();
viewer.isOverlayOpen();

// State queries
viewer.isImageLoaded();
viewer.getImageData();
viewer.getZoomLevel();
viewer.getPanOffset();
```

### Events

| Event | Detail | Description |
|-------|--------|-------------|
| `imageload` | `{naturalSize, fileName, type}` | Fired when image is loaded |
| `zoomchange` | `number` | Fired when zoom level changes |
| `panchange` | `{x, y}` | Fired when pan offset changes |
| `annotationadd` | `Annotation` | Fired when annotation is added |
| `annotationremove` | `string` | Fired when annotation is removed |
| `toolchange` | `string \| null` | Fired when active tool changes |
| `comparisonchange` | `number` | Fired when comparison position changes |

```javascript
// Event handling
viewer.addEventListener('imageload', (event) => {
    const { naturalSize, fileName, type } = event.detail;
    // Use logger utility for production-safe logging
    import('./utils/logger.js').then(({ log }) => {
        log(`Loaded ${fileName}: ${naturalSize.width}x${naturalSize.height}`);
    });
});

// HTML attribute binding
<canvas-lens onimageload="handleImageLoad(event)"></canvas-lens>
```

### Available Exports

The library exports the main Web Component, supporting types, and utilities:

```typescript
// Web Component
import { CanvasLens } from '@koniz-dev/canvaslens';

// Types (for TypeScript support)
import type { 
  CanvasLensOptions, 
  EventHandlers, 
  Size, 
  ToolConfig, 
  Annotation, 
  AnnotationStyle, 
  Point, 
  Rectangle, 
  ViewState, 
  ImageData, 
  Tool,
  AnnotationManager,
  ImageViewer
} from '@koniz-dev/canvaslens';

// Utilities (optional imports for advanced usage)
import { 
  ErrorHandler, 
  ErrorType,
  safeAsync,
  log,
  warn,
  error
} from '@koniz-dev/canvaslens';
```

## 🎮 Controls

### Mouse Controls
- **Mouse Wheel**: Zoom in/out (zooms to cursor position)
- **Left Click + Drag**: Pan around the image
- **Double Click**: Reset view to initial state

### Keyboard Shortcuts
- **Alt+R**: Toggle rectangle tool (activate/deactivate)
- **Alt+A**: Toggle arrow tool (activate/deactivate)
- **Alt+T**: Toggle text tool (activate/deactivate)
- **Alt+C**: Toggle circle tool (activate/deactivate)
- **Alt+L**: Toggle line tool (activate/deactivate)
- **Escape**: Deactivate current tool
- **Delete/Backspace**: Delete selected annotation

### Annotation Controls
- **Tool Selection**: Click tool buttons or use keyboard shortcuts to toggle tools
- **Drawing**: Click and drag to draw annotations
- **Text**: Click to place text, type content, press Enter to confirm
- **Selection**: Click on existing annotations to select them
- **Deletion**: Select annotation and press Delete/Backspace key

### Comparison Controls
- **Slider Drag**: Click and drag the white slider to reveal before/after
- **Slider Buttons**: Use ←/→ buttons to move slider incrementally
- **Reset Slider**: Center button to reset slider to 50%
- **Zoom/Pan**: Mouse wheel to zoom, drag to pan (synchronized for both images)

### Overlay Mode Controls
- **Open Overlay**: Use `viewer.openOverlay()` to open full-screen editor
- **Tool Panel**: Use the top toolbar to switch between Zoom/Pan, Annotation, and Comparison tools
- **Save Changes**: Click Save button to apply changes and close overlay
- **Close**: Click Close button to exit without saving changes

## 🌐 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🔧 Troubleshooting

### Common Issues

**Image not loading:**
- Ensure the image URL is accessible and CORS-enabled
- Check browser console for network errors
- Try using a different image source

**Canvas not rendering:**
- Verify the container element exists and has dimensions
- Check if the browser supports HTML5 Canvas
- Ensure the library is properly built and imported

**Annotations not working:**
- Make sure annotation tools are enabled in the `tools` configuration
- Check if annotation tools are properly selected
- Verify event handlers are correctly set up

**Performance issues:**
- Reduce image size for better performance
- Consider using `fitToView()` for large images
- Check zoom limits if experiencing lag during zoom

### Browser Compatibility

If you encounter issues in specific browsers:
- **Safari**: Ensure you're using Safari 12+ for full feature support
- **Mobile browsers**: Touch support may vary; consider testing on actual devices
- **IE**: Internet Explorer is not supported; use Edge or modern browsers

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🧪 Playground & Testing

CanvasLens includes comprehensive playground examples to test framework compatibility and features:

### Available Playgrounds

- **React Playground** (`playground/react/`) - Test CanvasLens with React
- **Vue Playground** (`playground/vue/`) - Test CanvasLens with Vue 3

### Running Playgrounds

1. **Build the library first:**
   ```bash
   npm run build
   ```

2. **Test with React:**
   ```bash
   cd playground/react
   npm install
   npm run dev
   ```

3. **Test with Vue:**
   ```bash
   cd playground/vue
   npm install
   npm run dev
   ```

### Playground Features

- Framework integration testing
- Real-time feature demonstration
- Interactive controls for testing all functionality
- Live image loading and comparison mode testing
- Event handling examples

## 🗺️ Roadmap

### ✅ Completed
- [x] Module 1: Basic Image Viewer
- [x] Module 2: Zoom & Pan functionality  
- [x] Module 3: Annotation tools (rectangle, arrow, text, circle, line)
- [x] Module 4: Image comparison with interactive slider
- [x] Full TypeScript support with strict mode
- [x] Modular architecture with clean separation of concerns
- [x] Comprehensive event system
- [x] Interactive demos and examples
- [x] Framework playgrounds (React, Vue)
- [x] Production-ready build system
- [x] Keyboard shortcuts and accessibility features

### 🚧 Planned (Future Versions)
- [ ] Performance optimizations for large images
- [ ] Touch support for mobile devices
- [ ] Undo/Redo functionality
- [ ] Collaborative annotations
- [ ] Plugin system for custom tools
- [ ] Export comparison as video/GIF
- [ ] Multiple comparison modes (side-by-side, overlay)
- [ ] Folder tree organization for image collections
- [ ] Advanced annotation features (freehand drawing, shapes)
- [ ] Image filters and effects
- [ ] Batch processing capabilities

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes.

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/koniz-dev/canvaslens/issues)
- **Documentation**: [GitHub Wiki](https://github.com/koniz-dev/canvaslens/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/koniz-dev/canvaslens/discussions)
- **Playground**: Test CanvasLens with React and Vue in the `playground/` directory
- **NPM Package**: [@koniz-dev/canvaslens](https://www.npmjs.com/package/@koniz-dev/canvaslens)

## 🆕 Latest Updates

- **v0.1.0**: Initial release with comprehensive image viewing and annotation capabilities
- **Production Ready**: Optimized build system with production-safe logging
- **Framework Support**: Tested compatibility with React, Vue, and vanilla JavaScript
- **TypeScript**: Full type safety with comprehensive type definitions
- **Accessibility**: Keyboard shortcuts and responsive design
- **Performance**: Optimized rendering and memory management
