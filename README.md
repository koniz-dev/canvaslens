# CanvasLens

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![npm](https://img.shields.io/npm/v/@koniz-dev/canvaslens.svg)](https://www.npmjs.com/package/@koniz-dev/canvaslens)

A powerful HTML5 Canvas-based image viewing and annotation library built with TypeScript. CanvasLens provides a unified Web Component for image viewing, zooming, panning, annotation, and before/after image comparison.

## Features

- 🖼️ **Image Viewer** - Load images with automatic aspect ratio preservation
- 🔍 **Zoom & Pan** - Mouse wheel zoom with cursor-centered zooming, smooth drag to pan
- ✏️ **Annotations** - Rectangle, arrow, text, circle, and line annotation tools
- 🎨 **Custom Styles** - Fully customizable annotation styles (colors, line styles, shadows, fonts)
- 🔄 **Image Comparison** - Interactive slider-based before/after comparison
- 🖼️ **Overlay Mode** - Full-screen professional editing interface
- 🎯 **Web Component** - Standard HTML element that works with any framework
- 🎨 **TypeScript Support** - Full type safety and IntelliSense
- ⚡ **Performance** - Optimized rendering and memory management

## Installation

```bash
npm install @koniz-dev/canvaslens
```

### CDN

```html
<script type="module">
  import { CanvasLens } from 'https://unpkg.com/@koniz-dev/canvaslens@latest/dist/index.js';
</script>
```

## Quick Start

```html
<canvas-lens 
  src="https://picsum.photos/800/600"
  width="800px" 
  height="600px"
  tools='{"zoom": true, "pan": true, "annotation": {"rect": true, "arrow": true}}'>
</canvas-lens>

<script type="module">
  import { CanvasLens } from '@koniz-dev/canvaslens';
</script>
```

## API Reference

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `src` | `string` | - | Image source URL or data URI |
| `width` | `string \| number` | `"800"` | Width in px, %, or number |
| `height` | `string \| number` | `"600"` | Height in px, %, or number |
| `background-color` | `string` | `"#f0f0f0"` | Background color (CSS color value) |
| `tools` | `string` (JSON) | `"{}"` | Tool configuration as JSON string |
| `max-zoom` | `number` | `10` | Maximum zoom level |
| `min-zoom` | `number` | `0.1` | Minimum zoom level |
| `image-type` | `string` | - | Image MIME type (e.g., "image/jpeg") |
| `file-name` | `string` | - | File name for display purposes |

### Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `loadImage(src, type?, fileName?)` | `string, string?, string?` | `Promise<void>` | Load image from URL |
| `loadImageFromFile(file)` | `File` | `void` | Load image from File object |
| `resize(width, height)` | `number, number` | `void` | Resize the canvas |
| `zoomIn(factor?)` | `number?` | `void` | Zoom in by factor (default: 1.2) |
| `zoomOut(factor?)` | `number?` | `void` | Zoom out by factor (default: 1.2) |
| `zoomTo(scale)` | `number` | `void` | Set zoom level to specific scale |
| `fitToView()` | - | `void` | Fit image to view |
| `resetView()` | - | `void` | Reset view to original state |
| `activateTool(toolType)` | `string` | `boolean` | Activate annotation tool ('rect', 'arrow', 'text', 'circle', 'line') |
| `deactivateTool()` | - | `boolean` | Deactivate current tool |
| `updateTools(toolConfig)` | `ToolConfig` | `void` | Update tools configuration |
| `getActiveTool()` | - | `string \| null` | Get currently active tool |
| `addAnnotation(annotation)` | `Annotation` | `void` | Add annotation to canvas |
| `removeAnnotation(id)` | `string` | `void` | Remove annotation by ID |
| `clearAnnotations()` | - | `void` | Clear all annotations |
| `getAnnotations()` | - | `Annotation[]` | Get all annotations |
| `toggleComparisonMode()` | - | `void` | Toggle comparison mode |
| `setComparisonMode(enabled)` | `boolean` | `void` | Set comparison mode state |
| `isComparisonMode()` | - | `boolean` | Check if comparison mode is enabled |
| `openOverlay()` | - | `void` | Open full-screen overlay editor |
| `closeOverlay()` | - | `void` | Close overlay editor |
| `isOverlayOpen()` | - | `boolean` | Check if overlay is open |
| `isImageLoaded()` | - | `boolean` | Check if image is loaded |
| `getImageData()` | - | `CustomImageData \| null` | Get current image data |
| `getZoomLevel()` | - | `number` | Get current zoom level |
| `getPanOffset()` | - | `{x: number, y: number}` | Get current pan offset |
| `hasChanges()` | - | `boolean` | Check if there are unsaved changes |

### Tool Configuration

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `zoom` | `boolean` | `false` | Enable zoom functionality |
| `pan` | `boolean` | `false` | Enable pan functionality |
| `annotation` | `object` | `undefined` | Annotation tools configuration |
| `annotation.rect` | `boolean` | `false` | Enable rectangle annotation tool |
| `annotation.arrow` | `boolean` | `false` | Enable arrow annotation tool |
| `annotation.text` | `boolean` | `false` | Enable text annotation tool |
| `annotation.circle` | `boolean` | `false` | Enable circle annotation tool |
| `annotation.line` | `boolean` | `false` | Enable line annotation tool |
| `annotation.style` | `AnnotationStyle` | `undefined` | Default annotation style |
| `comparison` | `boolean` | `false` | Enable image comparison functionality |

#### Annotation Style Configuration

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `strokeColor` | `string` | Yes | Border color (hex, rgb, or named color) |
| `strokeWidth` | `number` | Yes | Border width in pixels |
| `lineStyle` | `'solid' \| 'dashed' \| 'dotted'` | No | Line style (default: 'solid') |
| `fillColor` | `string` | No | Fill color with transparency (use rgba) |
| `shadowColor` | `string` | No | Shadow color (use rgba for transparency) |
| `shadowBlur` | `number` | No | Shadow blur radius in pixels |
| `shadowOffsetX` | `number` | No | Shadow horizontal offset in pixels |
| `shadowOffsetY` | `number` | No | Shadow vertical offset in pixels |
| `fontSize` | `number` | No | Font size for text annotations |
| `fontFamily` | `string` | No | Font family for text annotations |

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

## Examples

### Basic Usage

```html
<canvas-lens 
  src="https://example.com/image.jpg"
  width="800px" 
  height="600px"
  tools='{"zoom": true, "pan": true}'>
</canvas-lens>
```

### With Annotation Tools

```html
<canvas-lens 
  src="https://example.com/image.jpg"
  width="800px" 
  height="600px"
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
```

### With Custom Annotation Styles

```html
<canvas-lens 
  src="https://example.com/image.jpg"
  width="800px" 
  height="600px"
  tools='{
    "annotation": {
      "rect": true,
      "style": {
        "strokeColor": "#0096ff",
        "strokeWidth": 3,
        "lineStyle": "dashed",
        "fillColor": "rgba(0, 150, 255, 0.3)"
      }
    }
  }'>
</canvas-lens>
```

### JavaScript API

```javascript
import { CanvasLens } from '@koniz-dev/canvaslens';

const viewer = document.querySelector('canvas-lens');

// Load image
await viewer.loadImage('https://example.com/image.jpg');

// Zoom and pan
viewer.zoomTo(2.0);
viewer.fitToView();

// Annotations
viewer.activateTool('rect');
viewer.addAnnotation({
  id: 'rect-1',
  type: 'rect',
  points: [{ x: 100, y: 100 }, { x: 300, y: 250 }],
  style: {
    strokeColor: '#ff0000',
    strokeWidth: 2,
    fillColor: 'rgba(255, 0, 0, 0.2)'
  }
});

// Events
viewer.addEventListener('annotationadd', (e) => {
  console.log('Annotation added:', e.detail);
});
```

### React Example

```jsx
import { CanvasLens } from '@koniz-dev/canvaslens';

function ImageViewer({ src }) {
  const toolConfig = {
    zoom: true,
    pan: true,
    annotation: {
      rect: true,
      arrow: true,
      style: {
        strokeColor: '#0096ff',
        strokeWidth: 3,
        lineStyle: 'dashed'
      }
    }
  };

  return (
    <canvas-lens 
      src={src}
      width="800px" 
      height="600px"
      tools={JSON.stringify(toolConfig)}
    />
  );
}
```

## Controls

- **Mouse Wheel**: Zoom in/out (cursor-centered)
- **Left Click + Drag**: Pan around the image
- **Double Click**: Reset view to initial state
- **Alt + R/A/T/C/L**: Toggle annotation tools
- **Escape**: Deactivate current tool
- **Ctrl/Cmd + 0**: Fit image to view

## Browser Support

Chrome 60+, Firefox 55+, Safari 12+, Edge 79+

## Documentation

- **[Complete API Reference](docs/api.md)**
- **[Annotation Styles Guide](docs/annotation-styles.md)** - Customize annotation appearance
- **[Examples & Use Cases](docs/examples.md)**
- **[Framework Integration](docs/examples.md#framework-integration)**

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/koniz-dev/canvaslens/issues)
- **NPM Package**: [@koniz-dev/canvaslens](https://www.npmjs.com/package/@koniz-dev/canvaslens)
