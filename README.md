# CanvasLens

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/koniz-dev/canvaslens)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://www.npmjs.com/package/@koniz-dev/canvaslens)

A powerful HTML5 Canvas-based image viewing and annotation library built with TypeScript. CanvasLens provides a comprehensive solution for image viewing, zooming, panning, annotation, and before/after image comparison.

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
        #viewer {
            border: 1px solid #ccc;
            margin: 20px;
        }
    </style>
</head>
<body>
    <div id="viewer" style="width: 800px; height: 600px;"></div>
    
    <script type="module">
        import { CanvasLens } from '@koniz-dev/canvaslens';
        
        const viewer = new CanvasLens({
            container: document.getElementById('viewer'),
            width: 800,
            height: 600
        });
        
        // Load an image
        await viewer.loadImage('https://picsum.photos/800/600');
    </script>
</body>
</html>
```

### Advanced Usage with All Features

```typescript
import { CanvasLens } from '@koniz-dev/canvaslens';

const viewer = new CanvasLens({
    container: document.getElementById('viewer'),
    width: 800,
    height: 600,
    backgroundColor: '#f0f0f0',
    enableZoom: true,
    enablePan: true,
    enableAnnotations: true,
    maxZoom: 10,
    minZoom: 0.1
});

// Set event handlers
viewer.setEventHandlers({
    onImageLoad: (imageData) => {
        console.log('Image loaded:', imageData.naturalSize);
    },
    onZoomChange: (scale) => {
        console.log('Zoom level:', scale);
    },
    onPanChange: (offset) => {
        console.log('Pan offset:', offset);
    },
    onAnnotationAdd: (annotation) => {
        console.log('Annotation added:', annotation);
    },
    onAnnotationRemove: (annotationId) => {
        console.log('Annotation removed:', annotationId);
    }
});

// Load image from URL
await viewer.loadImage('https://picsum.photos/1200/800');

// Zoom controls
viewer.zoomIn(1.2);           // Zoom in by 20%
viewer.zoomOut(1.2);          // Zoom out by 20%
viewer.zoomTo(2.5);           // Zoom to 250%
viewer.fitToView();           // Fit image to view
viewer.resetView();           // Reset zoom and pan

// Annotation controls
const annotationManager = viewer.getAnnotationManager();
if (annotationManager) {
    // Select annotation tool
    const toolManager = annotationManager.getToolManager();
    toolManager.selectTool('rect');  // 'rect', 'arrow', 'text'
    
    // Update annotation style
    annotationManager.updateStyle({
        strokeColor: '#ff0000',
        strokeWidth: 3,
        fillColor: '#ff0000',
        fontSize: 18
    });
    
    // Export/import annotations
    const jsonData = annotationManager.exportAnnotations();
    annotationManager.importAnnotations(jsonData);
    
    // Clear all annotations
    annotationManager.clearAll();
}
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

### Available Exports

The library exports the following main classes and utilities:

```typescript
// Main class
import { CanvasLens } from '@koniz-dev/canvaslens';

// Individual modules (for advanced usage)
import { ImageViewer } from '@koniz-dev/canvaslens';
import { ZoomPanHandler } from '@koniz-dev/canvaslens';
import { AnnotationManager } from '@koniz-dev/canvaslens';
import { ImageComparisonManager } from '@koniz-dev/canvaslens';

// Types
import type { CanvasLensOptions, EventHandlers, Annotation, Point } from '@koniz-dev/canvaslens';
```

### CanvasLens Constructor

```typescript
interface CanvasLensOptions {
    container: HTMLElement;        // Container element
    width?: number;               // Canvas width (default: 800)
    height?: number;              // Canvas height (default: 600)
    backgroundColor?: string;     // Background color (default: '#f0f0f0')
    enableZoom?: boolean;         // Enable zoom (default: true)
    enablePan?: boolean;          // Enable pan (default: true)
    enableAnnotations?: boolean;  // Enable annotations (default: false)
    maxZoom?: number;             // Maximum zoom level (default: 10)
    minZoom?: number;             // Minimum zoom level (default: 0.1)
}
```

### Core Methods

#### Image Loading
- `loadImage(url: string): Promise<void>` - Load and display an image from URL
- `loadImageElement(image: HTMLImageElement): void` - Load and display an image from HTMLImageElement

#### View Controls
- `resize(width: number, height: number): void` - Resize the viewer
- `fitToView(): void` - Fit image to view
- `resetView(): void` - Reset zoom and pan to initial state

#### Zoom Controls
- `zoomIn(factor: number = 1.2): void` - Zoom in by factor
- `zoomOut(factor: number = 1.2): void` - Zoom out by factor
- `zoomTo(scale: number): void` - Zoom to specific level
- `getZoomLevel(): number` - Get current zoom level

#### Pan Controls
- `getPanOffset(): Point` - Get current pan offset

#### Annotation Controls
- `getAnnotationManager(): AnnotationManager | null` - Get annotation manager instance

#### State Management
- `setEventHandlers(handlers: EventHandlers): void` - Set event handlers
- `isImageLoaded(): boolean` - Check if an image is currently loaded
- `getOptions(): CanvasLensOptions` - Get current options
- `updateOptions(newOptions: Partial<CanvasLensOptions>): void` - Update viewer options

### Event Handlers

```typescript
interface EventHandlers {
    onImageLoad?: (imageData: ImageData) => void;
    onZoomChange?: (scale: number) => void;
    onPanChange?: (offset: Point) => void;
    onAnnotationAdd?: (annotation: Annotation) => void;
    onAnnotationRemove?: (annotationId: string) => void;
    onToolChange?: (tool: Tool) => void;
}
```

## 🎮 Controls

### Mouse Controls

- **Mouse Wheel**: Zoom in/out (zooms to cursor position)
- **Left Click + Drag**: Pan around the image (when no annotation tool is active)
- **Double Click**: Reset view to initial state

### Annotation Controls

- **Tool Selection**: Use Alt+R (Rectangle), Alt+A (Arrow), Alt+T (Text) keys or UI buttons
- **Drawing (UI buttons)**: Click tool button → Ctrl+Click to draw
- **Drawing (Keyboard)**: Alt+R/A/T → just click to draw
- **Text**: Click to place text, type content, press Enter to confirm
- **Selection**: Click on existing annotations to select them
- **Deletion**: Select annotation and press Delete/Backspace key
- **Escape**: Cancel current drawing or clear selection
- **Image Integration**: Annotations are drawn directly on the image and move/scale with zoom/pan
- **Bounded Drawing**: Annotations are restricted to image boundaries, cannot draw outside the image

### Comparison Controls

- **Slider Drag**: Click and drag the white slider to reveal before/after
- **Slider Buttons**: Use ←/→ buttons to move slider incrementally
- **Reset Slider**: Center button to reset slider to 50%
- **Zoom/Pan**: Mouse wheel to zoom, drag to pan (synchronized for both images)

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
- Make sure `enableAnnotations: true` is set in options
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
- **Examples**: Check the `examples/` directory for interactive demos
  - `basic-image-viewer.html` - Basic image loading and display
  - `zoom-pan-demo.html` - Zoom and pan functionality
  - `annotation-demo.html` - Annotation tools and features
  - `comparison-demo.html` - Before/after image comparison
