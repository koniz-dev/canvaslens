# CanvasLens

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![npm](https://img.shields.io/npm/v/@koniz-dev/canvaslens.svg)](https://www.npmjs.com/package/@koniz-dev/canvaslens)

A powerful HTML5 Canvas-based image viewing and annotation library built with TypeScript. CanvasLens provides a unified Web Component for image viewing, zooming, panning, annotation, and before/after image comparison.

## ✨ Features

- 🖼️ **Image Viewer**: Load images with automatic aspect ratio preservation
- 🔍 **Zoom & Pan**: Mouse wheel zoom with cursor-centered zooming, smooth drag to pan
- ✏️ **Annotations**: Rectangle, arrow, text, circle, and line annotation tools
- 🔄 **Image Comparison**: Interactive slider-based before/after comparison
- 🖼️ **Overlay Mode**: Full-screen professional editing interface
- 🎯 **Web Component**: Standard HTML element that works with any framework
- 🎨 **TypeScript Support**: Full type safety and IntelliSense
- ⚡ **Performance**: Optimized rendering and memory management

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
| `src` | string | - | Image source URL or data URI |
| `width` | string/number | "800" | Width in px, %, or number |
| `height` | string/number | "600" | Height in px, %, or number |
| `background-color` | string | "#f0f0f0" | Background color (CSS color value) |
| `tools` | JSON string | "{}" | Tool configuration as JSON string |
| `max-zoom` | number | 10 | Maximum zoom level |
| `min-zoom` | number | 0.1 | Minimum zoom level |
| `image-type` | string | - | Image MIME type (e.g., "image/jpeg") |
| `file-name` | string | - | File name for display purposes |

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

// Annotations
viewer.activateTool('rect');
viewer.addAnnotation(annotation);
viewer.clearAnnotations();

// Comparison Mode
viewer.toggleComparisonMode();
```

### Events
| Event | Detail | Description |
|-------|--------|-------------|
| `imageload` | `CustomImageData` | Image loaded successfully |
| `imageloaderror` | `Error` | Image loading failed |
| `zoomchange` | `number` | Zoom level changed |
| `panchange` | `{x, y}` | Pan position changed |
| `annotationadd` | `Annotation` | Annotation added |
| `annotationremove` | `string` | Annotation removed (ID) |
| `toolchange` | `string \| null` | Active tool changed |
| `comparisonchange` | `number` | Comparison slider position changed |
| `error` | `CanvasLensError` | Error occurred |

## 🎮 Controls

- **Mouse Wheel**: Zoom in/out (cursor-centered)
- **Left Click + Drag**: Pan around the image
- **Double Click**: Reset view to initial state
- **Alt + R/A/T/C/L**: Toggle annotation tools
- **Escape**: Deactivate current tool
- **Ctrl/Cmd + 0**: Fit image to view

## 🌐 Browser Support

Chrome 60+, Firefox 55+, Safari 12+, Edge 79+

## 📚 Documentation

- **[Complete API Reference](https://github.com/koniz-dev/canvaslens/blob/main/docs/api.md)**
- **[Examples & Use Cases](https://github.com/koniz-dev/canvaslens/blob/main/docs/examples.md)**
- **[Framework Integration](https://github.com/koniz-dev/canvaslens/blob/main/docs/examples.md#framework-integration)**

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/koniz-dev/canvaslens/issues)
- **NPM Package**: [@koniz-dev/canvaslens](https://www.npmjs.com/package/@koniz-dev/canvaslens)