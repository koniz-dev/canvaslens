# CanvasLens

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![npm](https://img.shields.io/npm/v/@koniz-dev/canvaslens.svg)](https://www.npmjs.com/package/@koniz-dev/canvaslens)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/koniz-dev/canvaslens)
[![Coverage](https://img.shields.io/badge/coverage-90%25-brightgreen.svg)](https://github.com/koniz-dev/canvaslens)

A powerful HTML5 Canvas-based image viewing and annotation library built with TypeScript. CanvasLens provides a unified Web Component for image viewing, zooming, panning, annotation, and before/after image comparison with professional-grade performance and extensibility.

## ✨ Features

- 🖼️ **Image Viewer**: Load images with automatic aspect ratio preservation and smart fitting
- 🔍 **Zoom & Pan**: Mouse wheel zoom with cursor-centered zooming, smooth drag to pan
- ✏️ **Annotations**: Rectangle, arrow, text, circle, and line annotation tools with custom styling
- 🔄 **Image Comparison**: Interactive slider-based before/after comparison with synchronized controls
- 🖼️ **Overlay Mode**: Full-screen professional editing interface with keyboard shortcuts
- 🎯 **Web Component**: Standard HTML element that works with any framework
- 🎨 **TypeScript Support**: Full type safety, IntelliSense, and comprehensive type definitions
- 🧪 **Framework Agnostic**: Works with React, Vue, Angular, and vanilla JavaScript
- ⚡ **Performance**: Optimized rendering, memory management, and viewport culling
- 🛠️ **Extensible**: Plugin system and custom tool support
- 📱 **Responsive**: Touch support and mobile-optimized interactions
- 🔧 **Developer Tools**: Built-in logging, error handling, and performance monitoring

## 🚀 Installation

```bash
npm install @koniz-dev/canvaslens
```

### CDN
```html
<script type="module">
  import { CanvasLens } from 'https://unpkg.com/@koniz-dev/canvaslens@latest/dist/index.js';
</script>
```

## 📖 Quick Start

```html
<canvas-lens 
    src="https://picsum.photos/800/600"
    width="800px" 
    height="600px"
    tools='{"zoom": true, "pan": true, "annotation": {"rect": true, "arrow": true, "text": true}, "comparison": true}'>
</canvas-lens>

<script type="module">
    import { CanvasLens } from '@koniz-dev/canvaslens';
    
    const viewer = document.querySelector('canvas-lens');
    viewer.addEventListener('imageload', (e) => console.log('Image loaded:', e.detail));
</script>
```

### React Example
```jsx
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
      tools={JSON.stringify(toolConfig)}>
    </canvas-lens>
  );
};
```

## 📚 API Reference

### Attributes
| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `src` | string | - | Image source URL |
| `width` | string/number | "800" | Width in px, %, or number |
| `height` | string/number | "600" | Height in px, %, or number |
| `background-color` | string | "#f0f0f0" | Background color |
| `tools` | JSON string | - | Tool configuration |
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

### Methods
```javascript
const viewer = document.querySelector('canvas-lens');

// Image & View
await viewer.loadImage('https://example.com/image.jpg');
viewer.zoomTo(2.0);
viewer.fitToView();
viewer.resetView();
const zoom = viewer.getZoom();
const pan = viewer.getPan();

// Tools & Annotations
viewer.activateTool('rect');
viewer.deactivateTool();
viewer.addAnnotation(annotation);
viewer.removeAnnotation('annotation-id');
viewer.clearAnnotations();
const annotations = viewer.getAnnotations();

// Comparison Mode
viewer.toggleComparisonMode();
await viewer.setComparisonImage('https://example.com/after.jpg');
viewer.setComparisonPosition(0.5);

// Overlay
viewer.openOverlay();
viewer.closeOverlay();
const isOverlayOpen = viewer.isOverlayOpen();

// Configuration
viewer.updateTools(newToolConfig);
const currentTools = viewer.getTools();
```

### Events
| Event | Detail | Description |
|-------|--------|-------------|
| `imageload` | `{naturalSize, fileName, type}` | Image loaded successfully |
| `zoomchange` | `number` | Zoom level changed |
| `panchange` | `{x, y}` | Pan position changed |
| `annotationadd` | `Annotation` | Annotation added |
| `annotationremove` | `string` | Annotation removed (ID) |
| `toolchange` | `string \| null` | Active tool changed |
| `comparisonchange` | `number` | Comparison slider position changed |
| `overlayopen` | `void` | Overlay opened |
| `overlayclose` | `void` | Overlay closed |
| `error` | `CanvasLensError` | Error occurred |

## 🎮 Controls

### Mouse & Touch
- **Mouse Wheel**: Zoom in/out (cursor-centered)
- **Left Click + Drag**: Pan around the image
- **Right Click + Drag**: Pan around the image (alternative)
- **Double Click**: Reset view to initial state
- **Pinch/Zoom**: Touch zoom on mobile devices
- **Two-finger drag**: Touch pan on mobile devices

### Keyboard Shortcuts
- **Alt + R**: Toggle rectangle tool
- **Alt + A**: Toggle arrow tool
- **Alt + T**: Toggle text tool
- **Alt + C**: Toggle circle tool
- **Alt + L**: Toggle line tool
- **Escape**: Deactivate current tool
- **Delete/Backspace**: Delete selected annotation
- **Space + Drag**: Pan mode (when no tool active)
- **Ctrl/Cmd + 0**: Fit image to view
- **Ctrl/Cmd + +**: Zoom in
- **Ctrl/Cmd + -**: Zoom out

## 🌐 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📚 Documentation

### Comprehensive Guides
- **[API Reference](docs/api.md)** - Complete API documentation with examples
- **[Architecture Guide](docs/architecture.md)** - System architecture and design patterns
- **[Examples & Use Cases](docs/examples.md)** - Real-world examples and integrations
- **[Development Guide](docs/development.md)** - Contributing and development setup
- **[Testing Guide](docs/testing.md)** - Testing strategies and best practices
- **[Performance Guide](docs/performance.md)** - Optimization and performance tuning
- **[Troubleshooting](docs/troubleshooting.md)** - Common issues and solutions
- **[Migration Guide](docs/migration.md)** - Version migration instructions
- **[Logging Guide](docs/logging.md)** - Debugging and logging system

### Quick Links
- **[Getting Started](#-quick-start)** - Basic setup and usage
- **[Framework Integration](docs/examples.md#framework-integration)** - React, Vue, Angular examples
- **[Advanced Features](docs/examples.md#advanced-features)** - Custom tools and extensions
- **[Performance Tips](docs/performance.md#best-practices)** - Optimization recommendations

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes.

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/koniz-dev/canvaslens/issues)
- **Documentation**: [GitHub Wiki](https://github.com/koniz-dev/canvaslens/wiki)
- **NPM Package**: [@koniz-dev/canvaslens](https://www.npmjs.com/package/@koniz-dev/canvaslens)
