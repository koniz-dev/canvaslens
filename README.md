# CanvasLens

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/koniz-dev/canvaslens)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://www.npmjs.com/package/@koniz-dev/canvaslens)

A powerful HTML5 Canvas-based image viewing and annotation library built with TypeScript. CanvasLens provides a unified component for image viewing, zooming, panning, annotation, and before/after image comparison with optional overlay mode for professional editing.

## ✨ Features

### 🖼️ **Module 1: Basic Image Viewer**
- Load images from URL or file input
- Automatic aspect ratio preservation
- Responsive design with device pixel ratio support
- High-quality rendering with proper canvas context management

### 🔍 **Module 2: Zoom & Pan**
- Mouse wheel zoom with cursor-centered zooming
- Drag to pan with smooth interactions
- Configurable zoom limits and speed controls
- Fit to view and reset functionality
- Real-time zoom/pan state tracking

### ✏️ **Module 3: Annotations**
- Rectangle, arrow, and text annotation tools
- Interactive drawing with mouse controls
- Customizable styles (colors, stroke width, fonts)
- Selection, deletion, and management
- Export/import functionality as JSON
- Real-time preview while drawing
- Keyboard shortcuts (R/A/T keys)

### 🔄 **Module 4: Image Comparison**
- Interactive slider-based before/after comparison
- Drag slider to reveal differences
- Synchronized zoom and pan for both images
- Customizable slider appearance
- Real-time comparison state tracking

### 🖼️ **Overlay Mode**
- Full-screen professional editing interface
- All tools available in overlay mode
- Save functionality for applying changes
- Professional UI with top toolbar
- Three main tools always accessible: Zoom/Pan, Annotation, Comparison

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

### Basic Usage (Web Component)

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
    <!-- Simple HTML element usage -->
    <canvas-lens 
        src="https://picsum.photos/800/600"
        width="800px" 
        height="600px"
        tools='{"zoom": true, "pan": true, "annotation": {"rect": true, "arrow": true, "text": true, "circle": true, "line": true}, "comparison": true}'
        background-color="#f0f0f0">
    </canvas-lens>
    
    <script type="module">
        import { CanvasLens } from '@koniz-dev/canvaslens';
        
        // Get the element
        const viewer = document.querySelector('canvas-lens');
        
        // Listen for events
        viewer.addEventListener('imageload', (e) => {
            console.log('Image loaded:', e.detail);
        });
        
        // Use JavaScript API
        viewer.addEventListener('click', () => {
            viewer.openOverlay(); // Open full-screen editor
        });
    </script>
</body>
</html>
```

### Programmatic Usage

```javascript
import { CanvasLens } from '@koniz-dev/canvaslens';

// Get the element
const viewer = document.querySelector('canvas-lens');

// Load image programmatically
await viewer.loadImage('https://picsum.photos/800/600');

// Load from file input
const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', (e) => {
    viewer.loadImageFromFile(e.target.files[0]);
});

// Zoom controls
viewer.zoomIn(1.2);
viewer.zoomOut(1.2);
viewer.zoomTo(2.0);
viewer.fitToView();
viewer.resetView();

// Tool controls
viewer.activateTool('rect');  // Rectangle tool
viewer.activateTool('arrow'); // Arrow tool
viewer.activateTool('text');  // Text tool
viewer.activateTool('circle'); // Circle tool
viewer.activateTool('line');  // Line tool
viewer.deactivateTool();

// Annotation controls
viewer.addAnnotation(annotation);
viewer.removeAnnotation(annotationId);
viewer.clearAnnotations();
const annotations = viewer.getAnnotations();

// Overlay editor
viewer.openOverlay();
viewer.closeOverlay();
        
        // Open overlay mode
        instance.openOverlay();
    </script>
</body>
</html>
```

### Framework Integration

CanvasLens works seamlessly with any framework since it's a standard Web Component:

#### Vue 3
```vue
<template>
  <div>
    <canvas-lens 
      :src="imageSrc"
      width="800px" 
      height="600px"
      :enable-annotations="true"
      @imageload="onImageLoad">
    </canvas-lens>
    <button @click="setTool('rect')">Rectangle Tool</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { CanvasLens } from '@koniz-dev/canvaslens';

const imageSrc = ref('https://example.com/image.jpg');

const onImageLoad = (e) => {
  console.log('Image loaded:', e.detail);
};

const setTool = (toolType) => {
  const viewer = document.querySelector('canvas-lens');
  viewer.activateTool(toolType);
};
</script>
```

#### React
```jsx
import React, { useEffect, useRef } from 'react';
import { CanvasLens } from '@koniz-dev/canvaslens';

const CanvasLensViewer = ({ src }) => {
  const viewerRef = useRef(null);

  useEffect(() => {
    if (viewerRef.current) {
      viewerRef.current.addEventListener('imageload', (e) => {
        console.log('Image loaded:', e.detail);
      });
    }
  }, []);

  return (
    <canvas-lens 
      ref={viewerRef}
      src={src}
      width="800px" 
      height="600px"
      enable-annotations="true">
    </canvas-lens>
  );
};
```

### Advanced Usage with All Features

```html
<canvas-lens
    src="https://example.com/image.jpg"
    width="800px"
    height="600px"
    background-color="#f0f0f0"
    enable-zoom="true"
    enable-pan="true"
    enable-annotations="true"
    enable-comparison="true"
    max-zoom="10"
    min-zoom="0.1"
    active-tool="rect">
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
```

### Image Comparison

```typescript
import { ImageComparisonManager } from '@koniz-dev/canvaslens';

const comparisonManager = new ImageComparisonManager(container, size, eventHandlers, {
    sliderPosition: 50,
    sliderColor: '#ffffff',
    sliderWidth: 4
});

// Load before/after images
await comparisonManager.loadImages('before.jpg', 'after.jpg');

// Control slider
comparisonManager.setSliderPosition(75);  // 75% reveal
comparisonManager.showMoreBefore();
comparisonManager.showMoreAfter();
comparisonManager.resetSlider();
```

## 📚 API Reference

### Web Component Attributes

The `<canvas-lens>` element supports the following attributes:

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `src` | string | - | Image source URL |
| `width` | string/number | "800" | Width in px, %, or number |
| `height` | string/number | "600" | Height in px, %, or number |
| `background-color` | string | "#f0f0f0" | Background color |
| `tools` | JSON string | All enabled | Tool configuration object |
| `max-zoom` | number | "10" | Maximum zoom level |
| `min-zoom` | number | "0.1" | Minimum zoom level |
| `image-type` | string | - | Image MIME type |
| `file-name` | string | - | File name for display |

### Tool Configuration

The `tools` attribute accepts a JSON string with the following structure:

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

#### **Predefined Configurations (Browser):**

```javascript
// Available globally in browser
viewer.setAttribute('tools', JSON.stringify(window.CanvasLensToolConfig.all));
viewer.setAttribute('tools', JSON.stringify(window.CanvasLensToolConfig.viewer));
viewer.setAttribute('tools', JSON.stringify(window.CanvasLensToolConfig.editor));
viewer.setAttribute('tools', JSON.stringify(window.CanvasLensToolConfig.basic));
viewer.setAttribute('tools', JSON.stringify(window.CanvasLensToolConfig.advanced));
viewer.setAttribute('tools', JSON.stringify(window.CanvasLensToolConfig.minimal));
```

#### **Custom Configuration (Browser):**

```javascript
// Create custom configuration
const customConfig = window.CanvasLensToolConfig.create({
  zoom: true,
  pan: false,
  annotation: {
    rect: true,
    arrow: false,
    text: true,
    circle: false,
    line: false
  },
  comparison: true
});

viewer.setAttribute('tools', JSON.stringify(customConfig));
```

#### **Available Predefined Configurations:**

- `window.CanvasLensToolConfig.all` - All tools enabled (default)
- `window.CanvasLensToolConfig.viewer` - Zoom and pan only
- `window.CanvasLensToolConfig.editor` - Annotation tools only
- `window.CanvasLensToolConfig.basic` - Basic annotation tools
- `window.CanvasLensToolConfig.advanced` - Advanced annotation tools
- `window.CanvasLensToolConfig.minimal` - Minimal configuration

#### **HTML Examples:**

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

```typescript
// Get the element
const viewer = document.querySelector('canvas-lens');

// Image loading
await viewer.loadImage(src: string, type?: string, fileName?: string): Promise<void>
viewer.loadImageFromFile(file: File): void

// Resize
viewer.resize(width: number, height: number): void

// Zoom controls
viewer.zoomIn(factor?: number): void
viewer.zoomOut(factor?: number): void
viewer.zoomTo(scale: number): void
viewer.fitToView(): void
viewer.resetView(): void

// Tool controls
viewer.activateTool(toolType: string): boolean
viewer.deactivateTool(): boolean
viewer.getActiveTool(): string | null

// Annotation controls
viewer.addAnnotation(annotation: Annotation): void
viewer.removeAnnotation(annotationId: string): void
viewer.clearAnnotations(): void
viewer.getAnnotations(): Annotation[]

// Overlay editor
viewer.openOverlay(): void
viewer.closeOverlay(): void
viewer.isOverlayOpen(): boolean

// State queries
viewer.isImageLoaded(): boolean
viewer.getImageData(): ImageData | null
viewer.getZoomLevel(): number
viewer.getPanOffset(): Point
```

### Events

The component dispatches the following custom events:

| Event | Detail | Description |
|-------|--------|-------------|
| `imageload` | ImageData | Fired when image is loaded |
| `zoomchange` | number | Fired when zoom level changes |
| `panchange` | Point | Fired when pan offset changes |
| `annotationadd` | Annotation | Fired when annotation is added |
| `annotationremove` | string | Fired when annotation is removed |
| `toolchange` | string \| null | Fired when active tool changes |
| `comparisonchange` | number | Fired when comparison position changes |

### Available Exports

The library exports only the main Web Component:

```typescript
// Web Component
import { CanvasLens } from '@koniz-dev/canvaslens';
```

### Web Component Methods

#### Image Loading
- `loadImage(url: string, type?: string, fileName?: string): Promise<void>` - Load image from URL
- `loadImageFromFile(file: File): void` - Load image from file

#### View Controls
- `resize(width: number, height: number): void` - Resize the viewer
- `fitToView(): void` - Fit image to view
- `resetView(): void` - Reset zoom and pan to initial state

#### Zoom Controls
- `zoomIn(factor?: number): void` - Zoom in by factor (default: 1.2)
- `zoomOut(factor?: number): void` - Zoom out by factor (default: 1.2)
- `zoomTo(scale: number): void` - Zoom to specific level
- `getZoomLevel(): number` - Get current zoom level

#### Pan Controls
- `getPanOffset(): Point` - Get current pan offset

#### Tool Controls
- `activateTool(toolType: string): boolean` - Activate annotation tool
- `deactivateTool(): boolean` - Deactivate current tool
- `getActiveTool(): string | null` - Get active tool type

#### Annotation Controls
- `addAnnotation(annotation: Annotation): void` - Add annotation
- `removeAnnotation(annotationId: string): void` - Remove annotation
- `clearAnnotations(): void` - Clear all annotations
- `getAnnotations(): Annotation[]` - Get all annotations

#### Overlay Editor
- `openOverlay(): void` - Open full-screen editor
- `closeOverlay(): void` - Close overlay editor
- `isOverlayOpen(): boolean` - Check if overlay is open

#### State Queries
- `isImageLoaded(): boolean` - Check if image is loaded
- `getImageData(): ImageData | null` - Get current image data

## 🎮 Controls

### Mouse Controls

- **Mouse Wheel**: Zoom in/out (zooms to cursor position)
- **Left Click + Drag**: Pan around the image (when no annotation tool is active)
- **Double Click**: Reset view to initial state

### Annotation Controls

- **Tool Selection**: Use `activateTool()` method or UI buttons
- **Drawing**: Click and drag to draw annotations
- **Text**: Click to place text, type content, press Enter to confirm
- **Selection**: Click on existing annotations to select them
- **Deletion**: Select annotation and press Delete/Backspace key
- **Escape**: Cancel current drawing or clear selection

### Keyboard Shortcuts

- **R**: Activate rectangle tool
- **A**: Activate arrow tool  
- **T**: Activate text tool
- **C**: Activate circle tool
- **L**: Activate line tool
- **Escape**: Deactivate current tool
- **Delete/Backspace**: Delete selected annotation
- **Image Integration**: Annotations are drawn directly on the image and move/scale with zoom/pan
- **Bounded Drawing**: Annotations are restricted to image boundaries, cannot draw outside the image

### Comparison Controls

- **Slider Drag**: Click and drag the white slider to reveal before/after
- **Slider Buttons**: Use ←/→ buttons to move slider incrementally
- **Reset Slider**: Center button to reset slider to 50%
- **Zoom/Pan**: Mouse wheel to zoom, drag to pan (synchronized for both images)

### Overlay Mode Controls

- **Open Overlay**: Use `instance.openOverlay()` to open full-screen editor
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
