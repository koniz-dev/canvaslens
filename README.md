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


### Framework Integration

#### Vue 3
```vue
<template>
  <canvas-lens 
    :src="imageSrc"
    width="800px" 
    height="600px"
    :tools="toolsJson"
    @imageload="onImageLoad">
  </canvas-lens>
</template>

<script setup>
import { ref, computed } from 'vue';
import { CanvasLens } from '@koniz-dev/canvaslens';

const imageSrc = ref('https://picsum.photos/800/600');
const tools = ref({
  zoom: true,
  pan: true,
  annotation: { rect: true, arrow: true, text: true },
  comparison: true
});

const toolsJson = computed(() => JSON.stringify(tools.value));
const onImageLoad = (e) => console.log('Image loaded:', e.detail);
</script>
```

#### React
```jsx
import React from 'react';
import { CanvasLens } from '@koniz-dev/canvaslens';

const CanvasLensViewer = ({ src }) => {
  const toolConfig = {
    zoom: true,
    pan: true,
    annotation: { rect: true, arrow: true, text: true },
    comparison: true
  };

  return (
    <canvas-lens 
      src={src}
      width="800px" 
      height="600px"
      tools={JSON.stringify(toolConfig)}
      onimageload={(e) => console.log('Image loaded:', e.detail)}>
    </canvas-lens>
  );
};
```

### Advanced Usage

```javascript
const viewer = document.querySelector('canvas-lens');

// Event handling
viewer.addEventListener('imageload', (e) => console.log('Image loaded:', e.detail));
viewer.addEventListener('zoomchange', (e) => console.log('Zoom:', e.detail));

// API methods
await viewer.loadImage('https://example.com/image.jpg');
viewer.zoomTo(2.0);
viewer.activateTool('rect');
viewer.openOverlay();
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

### JavaScript API Methods

```javascript
const viewer = document.querySelector('canvas-lens');

// Image & View
await viewer.loadImage('https://example.com/image.jpg');
viewer.zoomTo(2.0);
viewer.fitToView();
viewer.resetView();

// Tools & Annotations
viewer.activateTool('rect');
viewer.addAnnotation(annotation);
viewer.clearAnnotations();

// Comparison & Overlay
viewer.toggleComparisonMode();
viewer.openOverlay();
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
    console.log('Image loaded:', event.detail);
});
```

### Available Exports

```typescript
// Web Component
import { CanvasLens } from '@koniz-dev/canvaslens';

// Types
import type { 
  ToolConfig, 
  Annotation, 
  Point, 
  ImageData 
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

## 🧪 Playground

Test CanvasLens with React and Vue in the `playground/` directory:

```bash
npm run build
cd playground/react && npm install && npm run dev
cd playground/vue && npm install && npm run dev
```

## 🗺️ Roadmap

### ✅ Completed
- [x] Image viewer with zoom & pan
- [x] Annotation tools (rectangle, arrow, text, circle, line)
- [x] Image comparison with interactive slider
- [x] TypeScript support & framework playgrounds
- [x] Production-ready build system

### 🚧 Planned
- [ ] Touch support for mobile
- [ ] Undo/Redo functionality
- [ ] Plugin system
- [ ] Export comparison as video/GIF

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes.

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/koniz-dev/canvaslens/issues)
- **Documentation**: [GitHub Wiki](https://github.com/koniz-dev/canvaslens/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/koniz-dev/canvaslens/discussions)
- **Playground**: Test CanvasLens with React and Vue in the `playground/` directory
- **NPM Package**: [@koniz-dev/canvaslens](https://www.npmjs.com/package/@koniz-dev/canvaslens)

## 🆕 Latest Updates

- **v0.1.0**: Initial release with image viewing, annotation, and comparison features
- **Production Ready**: Optimized build with TypeScript support
- **Framework Support**: Works with React, Vue, and vanilla JavaScript
