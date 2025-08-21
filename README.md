# CanvasLens

[![npm version](https://badge.fury.io/js/canvaslens.svg)](https://badge.fury.io/js/canvaslens)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/koniz-dev/canvaslens)

A powerful HTML5 Canvas-based image viewing and annotation library built with TypeScript.

## Features

- **Module 1: Basic Image Viewer**
  - Load images from URL or file
  - Automatic aspect ratio preservation
  - Responsive design
  - High-quality rendering with device pixel ratio support

- **Module 2: Zoom & Pan**
  - Mouse wheel zoom with cursor-centered zooming
  - Drag to pan with smooth interactions
  - Zoom limits and speed controls
  - Fit to view and reset functionality
  - Real-time zoom/pan state tracking

- **Module 3: Annotations**
  - Rectangle, arrow, and text annotation tools
  - Interactive drawing with mouse controls
  - Customizable styles (colors, stroke width, fonts)
  - Selection, deletion, and management
  - Export/import functionality
  - Real-time preview while drawing

- **Module 4: Image Comparison**
  - Interactive slider-based before/after comparison
  - Drag slider to reveal differences
  - Synchronized zoom and pan for both images
  - Customizable slider appearance
  - Real-time comparison state tracking

## Installation

```bash
npm install canvaslens
```

## Quick Start

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
        import { CanvasLens } from 'canvaslens';
        
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
import { CanvasLens } from 'canvaslens';

const viewer = new CanvasLens({
    container: document.getElementById('viewer'),
    width: 800,
    height: 600,
    backgroundColor: '#f0f0f0',
    enableZoom: true,
    enablePan: true,
    enableAnnotations: true,  // Enable annotations
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
        fillColor: '#ff000040',
        fontSize: 18
    });
    
    // Export/import annotations
    const jsonData = annotationManager.exportAnnotations();
    annotationManager.importAnnotations(jsonData);
    
    // Clear all annotations
    annotationManager.clearAll();
}

// Image comparison (using ComparisonViewer directly)
import { ComparisonViewer } from 'canvaslens';

const comparisonViewer = new ComparisonViewer(container, size, eventHandlers, {
    sliderPosition: 50,
    sliderColor: '#ffffff',
    sliderWidth: 4
});

// Load before/after images
await comparisonViewer.loadImages('before.jpg', 'after.jpg');

// Control slider
comparisonViewer.setSliderPosition(75);  // 75% reveal
comparisonViewer.showMoreBefore();
comparisonViewer.showMoreAfter();
comparisonViewer.resetSlider();

// Get current state
const zoomLevel = viewer.getZoomLevel();    // Current zoom level
const panOffset = viewer.getPanOffset();    // Current pan offset
```

## API Reference

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

### Methods

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

#### Comparison Controls
- `ComparisonViewer` - Standalone comparison viewer class
- `loadImages(beforeUrl, afterUrl)` - Load before/after images
- `setSliderPosition(position)` - Set slider position (0-100)
- `showMoreBefore()/showMoreAfter()` - Move slider
- `resetSlider()` - Reset to center position

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

### Mouse Controls

- **Mouse Wheel**: Zoom in/out (zooms to cursor position)
- **Left Click + Drag**: Pan around the image (when no annotation tool is active)
- **Double Click**: Reset view to initial state

### Annotation Controls

- **Tool Selection**: Use R (Rectangle), A (Arrow), T (Text) keys or UI buttons
- **Drawing**: Click and drag to create rectangle/arrow annotations
- **Text**: Click to place text, type content, press Enter to confirm
- **Selection**: Click on existing annotations to select them
- **Deletion**: Select annotation and press Delete/Backspace key
- **Escape**: Cancel current drawing or clear selection

### Comparison Controls

- **Slider Drag**: Click and drag the white slider to reveal before/after
- **Slider Buttons**: Use ←/→ buttons to move slider incrementally
- **Reset Slider**: Center button to reset slider to 50%
- **Zoom/Pan**: Mouse wheel to zoom, drag to pan (synchronized for both images)

## Development

### Building

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Watch mode for development
npm run dev
```

### Running Examples

1. Build the library: `npm run build`
2. Open examples in a web browser:
   - `examples/basic-image-viewer.html` - Basic image display
   - `examples/zoom-pan-demo.html` - Interactive zoom and pan demo
   - `examples/annotation-demo.html` - Full annotation system demo
   - `examples/comparison-demo.html` - Before/after image comparison demo
3. Try uploading an image or loading from URL

### Project Structure

```
src/
├── core/              # Core canvas functionality
│   └── Canvas.ts
├── modules/           # Feature modules
│   ├── image-viewer/  # Module 1: Basic image display
│   ├── zoom-pan/      # Module 2: Zoom and pan
│   ├── annotation/    # Module 3: Annotations
│   └── comparison/    # Module 4: Image comparison
├── types/             # TypeScript type definitions
│   └── index.ts
├── utils/             # Utility functions
│   ├── coordinate.ts
│   └── image.ts
└── index.ts           # Main entry point
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Troubleshooting

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

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Roadmap

- [x] Module 1: Basic Image Viewer
- [x] Module 2: Zoom & Pan functionality  
- [x] Module 3: Annotation tools
- [x] Module 4: Image comparison
- [ ] Performance optimizations
- [ ] Touch support for mobile devices
- [ ] Advanced annotation features (circle, line tools)
- [ ] Undo/Redo functionality
- [ ] Collaborative annotations
- [ ] Plugin system
- [ ] Export comparison as video/GIF
- [ ] Multiple comparison modes (side-by-side, overlay)
