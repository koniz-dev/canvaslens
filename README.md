# CanvasLens

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![npm](https://img.shields.io/npm/v/@koniz-dev/canvaslens.svg)](https://www.npmjs.com/package/@koniz-dev/canvaslens)

A powerful HTML5 Canvas-based image viewing and annotation library built with TypeScript. CanvasLens provides a unified Web Component for image viewing, zooming, panning, annotation, and before/after image comparison.

## ✨ Features

- 🖼️ **Image Viewer**: Load images with automatic aspect ratio preservation
- 🔍 **Zoom & Pan**: Mouse wheel zoom with cursor-centered zooming, drag to pan
- ✏️ **Annotations**: Rectangle, arrow, text, circle, and line annotation tools
- 🔄 **Image Comparison**: Interactive slider-based before/after comparison
- 🖼️ **Overlay Mode**: Full-screen professional editing interface
- 🎯 **Web Component**: Standard HTML element that works with any framework
- 🎨 **TypeScript Support**: Full type safety and IntelliSense
- 🧪 **Framework Agnostic**: Works with React, Vue, Angular, and vanilla JavaScript

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

// Tools & Annotations
viewer.activateTool('rect');
viewer.clearAnnotations();

// Overlay
viewer.openOverlay();
```

### Events
| Event | Detail | Description |
|-------|--------|-------------|
| `imageload` | `{naturalSize, fileName, type}` | Image loaded |
| `zoomchange` | `number` | Zoom level changed |
| `annotationadd` | `Annotation` | Annotation added |
| `toolchange` | `string \| null` | Active tool changed |

## 🎮 Controls

- **Mouse Wheel**: Zoom in/out
- **Left Click + Drag**: Pan around the image
- **Double Click**: Reset view
- **Alt+R/A/T/C/L**: Toggle annotation tools
- **Escape**: Deactivate current tool
- **Delete/Backspace**: Delete selected annotation

## 🌐 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

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
