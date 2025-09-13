# CanvasLens

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/koniz-dev/canvaslens)
[![Version](https://img.shields.io/badge/version-0.0.8-blue.svg)](https://www.npmjs.com/package/@koniz-dev/canvaslens)

A powerful HTML5 Canvas-based image viewing and annotation library built with TypeScript. CanvasLens provides a unified Web Component for image viewing, zooming, panning, annotation, and before/after image comparison with optional overlay mode for professional editing.

## ✨ Features

- 🖼️ **Image Viewer**: Load images from URL or file input with automatic aspect ratio preservation
- 🔍 **Zoom & Pan**: Mouse wheel zoom with cursor-centered zooming, drag to pan
- ✏️ **Annotations**: Rectangle, arrow, text, circle, and line annotation tools
- 🔄 **Image Comparison**: Interactive slider-based before/after comparison
- 🖼️ **Overlay Mode**: Full-screen professional editing interface
- 🎯 **Web Component**: Standard HTML element that works with any framework
- ⚙️ **Declarative Configuration**: JSON-based tool configuration
- 🎨 **TypeScript Support**: Full type safety and IntelliSense

## 🚀 Installation

```bash
npm install @koniz-dev/canvaslens
```

**Note**: This package is published to GitHub Packages. If you encounter any issues, you may need to configure npm to use the GitHub Packages registry:

```bash
# Add to your .npmrc file
@koniz-dev:registry=https://npm.pkg.github.com
```

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
        }
    </style>
</head>
<body>
    <canvas-lens 
        src="https://picsum.photos/800/600"
        width="800px" 
        height="600px"
        tools='{"zoom": true, "pan": true, "annotation": {"rect": true, "arrow": true, "text": true}, "comparison": true}'>
    </canvas-lens>
    
    <script type="module">
        import { CanvasLens } from '@koniz-dev/canvaslens';
        
        const viewer = document.querySelector('canvas-lens');
        
        viewer.addEventListener('imageload', (e) => {
            console.log('Image loaded:', e.detail);
        });
        
        viewer.addEventListener('click', () => {
            viewer.openOverlay(); // Open full-screen editor
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

<script>
// Event handler functions
function handleImageLoad(event) {
    const { naturalSize, fileName, type } = event.detail;
    console.log('Image loaded:', { fileName, type, width: naturalSize.width, height: naturalSize.height });
}

function handleZoomChange(event) {
    console.log('Zoom level:', event.detail);
}

function handlePanChange(event) {
    console.log('Pan offset:', event.detail);
}

function handleAnnotationAdd(event) {
    console.log('Annotation added:', event.detail);
}

function handleAnnotationRemove(event) {
    console.log('Annotation removed:', event.detail);
}

function handleToolChange(event) {
    console.log('Active tool:', event.detail);
}

function handleComparisonChange(event) {
    console.log('Comparison position:', event.detail);
}

// Alternative: Using addEventListener
const viewer = document.querySelector('canvas-lens');
viewer.addEventListener('imageload', (event) => {
    console.log('Image loaded via addEventListener:', event.detail);
});
</script>
```

### Framework Integration

#### Vue 3
```vue
<template>
  <canvas-lens 
    :src="imageSrc"
    width="800px" 
    height="600px"
    :tools="toolConfig"
    @imageload="onImageLoad">
  </canvas-lens>
</template>

<script setup>
import { ref } from 'vue';
import { CanvasLens } from '@koniz-dev/canvaslens';

const imageSrc = ref('https://example.com/image.jpg');
const toolConfig = ref({
  zoom: true,
  pan: true,
  annotation: { rect: true, arrow: true, text: true },
  comparison: false
});

const onImageLoad = (e) => {
  console.log('Image loaded:', e.detail);
};
</script>
```

#### React
```jsx
import React, { useRef } from 'react';
import { CanvasLens } from '@koniz-dev/canvaslens';

const CanvasLensViewer = ({ src }) => {
  const viewerRef = useRef(null);
  const toolConfig = {
    zoom: true,
    pan: true,
    annotation: { rect: true, arrow: true, text: true },
    comparison: false
  };

  return (
    <canvas-lens 
      ref={viewerRef}
      src={src}
      width="800px" 
      height="600px"
      tools={JSON.stringify(toolConfig)}>
    </canvas-lens>
  );
};
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

<script>
const viewer = document.querySelector('canvas-lens');

// Set event handlers
viewer.addEventListener('imageload', (e) => {
    console.log('Image loaded:', e.detail);
});

viewer.addEventListener('zoomchange', (e) => {
    console.log('Zoom level:', e.detail);
});

viewer.addEventListener('panchange', (e) => {
    console.log('Pan offset:', e.detail);
});

viewer.addEventListener('annotationadd', (e) => {
    console.log('Annotation added:', e.detail);
});

viewer.addEventListener('annotationremove', (e) => {
    console.log('Annotation removed:', e.detail);
});

viewer.addEventListener('comparisonchange', (e) => {
    console.log('Comparison position:', e.detail);
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
| `tools` | JSON string | All enabled | Tool configuration |
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

#### Predefined Configurations

```javascript
// Available globally in browser
viewer.setAttribute('tools', JSON.stringify(window.CanvasLensToolConfig.all));
viewer.setAttribute('tools', JSON.stringify(window.CanvasLensToolConfig.viewer));
viewer.setAttribute('tools', JSON.stringify(window.CanvasLensToolConfig.editor));
viewer.setAttribute('tools', JSON.stringify(window.CanvasLensToolConfig.basic));
viewer.setAttribute('tools', JSON.stringify(window.CanvasLensToolConfig.advanced));
viewer.setAttribute('tools', JSON.stringify(window.CanvasLensToolConfig.minimal));
```

#### Available Predefined Configurations:

- `window.CanvasLensToolConfig.all` - All tools enabled (default)
- `window.CanvasLensToolConfig.viewer` - Zoom and pan only
- `window.CanvasLensToolConfig.editor` - Annotation tools only
- `window.CanvasLensToolConfig.basic` - Basic annotation tools
- `window.CanvasLensToolConfig.advanced` - Advanced annotation tools
- `window.CanvasLensToolConfig.minimal` - Minimal configuration

#### HTML Examples:

```html
<!-- All tools enabled (default) -->
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
await viewer.loadImage('https://example.com/image.jpg');
viewer.loadImageFromFile(file);

// Zoom controls
viewer.zoomIn(1.2);
viewer.zoomOut(1.2);
viewer.zoomTo(2.0);
viewer.fitToView();
viewer.resetView();

// Tool controls
viewer.activateTool('rect');
viewer.activateTool('arrow');
viewer.activateTool('text');
viewer.deactivateTool();

// Annotation controls
viewer.addAnnotation(annotation);
viewer.removeAnnotation(annotationId);
viewer.clearAnnotations();
const annotations = viewer.getAnnotations();

// Overlay editor
viewer.openOverlay();
viewer.closeOverlay();

// State queries
viewer.isImageLoaded();
viewer.getZoomLevel();
viewer.getPanOffset();
viewer.getActiveTool();
viewer.isOverlayOpen();
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
    console.log(`Loaded ${fileName}: ${naturalSize.width}x${naturalSize.height}`);
});

// HTML attribute binding
<canvas-lens onimageload="handleImageLoad(event)"></canvas-lens>
```

### Available Exports

The library exports only the main Web Component and supporting types:

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
  Tool 
} from '@koniz-dev/canvaslens';
```

## 🎮 Controls

### Mouse Controls
- **Mouse Wheel**: Zoom in/out (zooms to cursor position)
- **Left Click + Drag**: Pan around the image
- **Double Click**: Reset view to initial state

### Keyboard Shortcuts
- **R**: Activate rectangle tool
- **A**: Activate arrow tool  
- **T**: Activate text tool
- **C**: Activate circle tool
- **L**: Activate line tool
- **Escape**: Deactivate current tool
- **Delete/Backspace**: Delete selected annotation

### Annotation Controls
- **Tool Selection**: Use `activateTool()` method or keyboard shortcuts
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

## 🗺️ Roadmap

### ✅ Completed
- [x] Module 1: Basic Image Viewer
- [x] Module 2: Zoom & Pan functionality  
- [x] Module 3: Annotation tools
- [x] Module 4: Image comparison
- [x] Full TypeScript support with strict mode
- [x] Modular architecture
- [x] Comprehensive event system
- [x] Interactive demos and examples

### 🚧 Planned (Future Versions)
- [ ] Performance optimizations
- [ ] Touch support for mobile devices
- [ ] Advanced annotation features (circle, line tools)
- [ ] Undo/Redo functionality
- [ ] Collaborative annotations
- [ ] Plugin system
- [ ] Export comparison as video/GIF
- [ ] Multiple comparison modes (side-by-side, overlay)
- [ ] Folder tree organization for image collections

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes.

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/koniz-dev/canvaslens/issues)
- **Documentation**: [GitHub Wiki](https://github.com/koniz-dev/canvaslens/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/koniz-dev/canvaslens/discussions)
- **Demo**: Check `index.html` for interactive demo with all features
