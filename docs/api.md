# CanvasLens API Reference

## Overview

CanvasLens is a powerful HTML5 Canvas-based image viewing and annotation library that provides a unified Web Component for image viewing, zooming, panning, annotation, and before/after image comparison.

## Web Component

### `<canvas-lens>`

The main Web Component that provides all CanvasLens functionality.

#### Attributes

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

#### Example

```html
<canvas-lens 
  src="https://example.com/image.jpg"
  width="800px" 
  height="600px"
  background-color="#ffffff"
  tools='{"zoom": true, "pan": true, "annotation": {"rect": true, "arrow": true}}'
  max-zoom="5"
  min-zoom="0.5">
</canvas-lens>
```

## JavaScript API

### Methods

#### Image Loading

##### `loadImage(src: string): Promise<void>`

Loads an image from the specified URL.

**Parameters:**
- `src` (string): Image source URL or data URI

**Returns:** Promise that resolves when image is loaded

**Example:**
```javascript
const viewer = document.querySelector('canvas-lens');
await viewer.loadImage('https://example.com/new-image.jpg');
```

#### View Control

##### `zoomTo(level: number): void`

Sets the zoom level to the specified value.

**Parameters:**
- `level` (number): Zoom level (1.0 = 100%, 2.0 = 200%, etc.)

**Example:**
```javascript
viewer.zoomTo(2.5); // Zoom to 250%
```

##### `fitToView(): void`

Fits the image to the current viewport while maintaining aspect ratio.

**Example:**
```javascript
viewer.fitToView();
```

##### `resetView(): void`

Resets the view to the initial state (zoom level 1.0, centered).

**Example:**
```javascript
viewer.resetView();
```

##### `getZoom(): number`

Returns the current zoom level.

**Returns:** Current zoom level as number

**Example:**
```javascript
const currentZoom = viewer.getZoom();
console.log(`Current zoom: ${currentZoom * 100}%`);
```

##### `getPan(): {x: number, y: number}`

Returns the current pan offset.

**Returns:** Object with x and y pan coordinates

**Example:**
```javascript
const pan = viewer.getPan();
console.log(`Pan offset: x=${pan.x}, y=${pan.y}`);
```

#### Tool Management

##### `activateTool(tool: string): void`

Activates the specified annotation tool.

**Parameters:**
- `tool` (string): Tool name ("rect", "arrow", "text", "circle", "line")

**Example:**
```javascript
viewer.activateTool('rect'); // Activate rectangle tool
```

##### `deactivateTool(): void`

Deactivates the currently active tool.

**Example:**
```javascript
viewer.deactivateTool();
```

##### `getActiveTool(): string | null`

Returns the currently active tool name.

**Returns:** Active tool name or null if no tool is active

**Example:**
```javascript
const activeTool = viewer.getActiveTool();
console.log(`Active tool: ${activeTool || 'none'}`);
```

#### Annotation Management

##### `addAnnotation(annotation: Annotation): void`

Adds an annotation to the canvas.

**Parameters:**
- `annotation` (Annotation): Annotation object

**Example:**
```javascript
const annotation = {
  id: 'rect-1',
  type: 'rect',
  x: 100,
  y: 100,
  width: 200,
  height: 150,
  style: {
    strokeColor: '#ff0000',
    strokeWidth: 2,
    fillColor: 'rgba(255, 0, 0, 0.1)'
  }
};
viewer.addAnnotation(annotation);
```

##### `removeAnnotation(id: string): void`

Removes an annotation by its ID.

**Parameters:**
- `id` (string): Annotation ID

**Example:**
```javascript
viewer.removeAnnotation('rect-1');
```

##### `clearAnnotations(): void`

Removes all annotations from the canvas.

**Example:**
```javascript
viewer.clearAnnotations();
```

##### `getAnnotations(): Annotation[]`

Returns all annotations on the canvas.

**Returns:** Array of annotation objects

**Example:**
```javascript
const annotations = viewer.getAnnotations();
console.log(`Found ${annotations.length} annotations`);
```

##### `selectAnnotation(id: string): void`

Selects an annotation by its ID.

**Parameters:**
- `id` (string): Annotation ID

**Example:**
```javascript
viewer.selectAnnotation('rect-1');
```

##### `deselectAnnotation(): void`

Deselects the currently selected annotation.

**Example:**
```javascript
viewer.deselectAnnotation();
```

#### Comparison Mode

##### `toggleComparisonMode(): void`

Toggles between normal view and comparison mode.

**Example:**
```javascript
viewer.toggleComparisonMode();
```

##### `setComparisonImage(src: string): Promise<void>`

Sets the comparison image for before/after comparison.

**Parameters:**
- `src` (string): Comparison image source URL

**Returns:** Promise that resolves when image is loaded

**Example:**
```javascript
await viewer.setComparisonImage('https://example.com/after-image.jpg');
```

##### `setComparisonPosition(position: number): void`

Sets the comparison slider position.

**Parameters:**
- `position` (number): Position between 0 and 1 (0 = show before, 1 = show after)

**Example:**
```javascript
viewer.setComparisonPosition(0.7); // Show 70% after image
```

##### `getComparisonPosition(): number`

Returns the current comparison slider position.

**Returns:** Position between 0 and 1

**Example:**
```javascript
const position = viewer.getComparisonPosition();
console.log(`Comparison position: ${position * 100}%`);
```

#### Overlay Mode

##### `openOverlay(): void`

Opens the full-screen overlay editor.

**Example:**
```javascript
viewer.openOverlay();
```

##### `closeOverlay(): void`

Closes the overlay editor.

**Example:**
```javascript
viewer.closeOverlay();
```

##### `isOverlayOpen(): boolean`

Returns whether the overlay is currently open.

**Returns:** Boolean indicating overlay state

**Example:**
```javascript
if (viewer.isOverlayOpen()) {
  console.log('Overlay is open');
}
```

#### Configuration

##### `updateTools(tools: ToolConfig): void`

Updates the tool configuration.

**Parameters:**
- `tools` (ToolConfig): New tool configuration

**Example:**
```javascript
const newTools = {
  zoom: true,
  pan: true,
  annotation: {
    rect: true,
    arrow: false,
    text: true
  }
};
viewer.updateTools(newTools);
```

##### `getTools(): ToolConfig`

Returns the current tool configuration.

**Returns:** Current tool configuration object

**Example:**
```javascript
const tools = viewer.getTools();
console.log('Current tools:', tools);
```

## Events

### Event Types

#### `imageload`

Fired when an image is successfully loaded.

**Event Detail:**
```typescript
{
  naturalSize: { width: number, height: number },
  fileName: string,
  type: string
}
```

**Example:**
```javascript
viewer.addEventListener('imageload', (event) => {
  console.log('Image loaded:', event.detail);
  console.log(`Size: ${event.detail.naturalSize.width}x${event.detail.naturalSize.height}`);
});
```

#### `zoomchange`

Fired when the zoom level changes.

**Event Detail:** `number` (new zoom level)

**Example:**
```javascript
viewer.addEventListener('zoomchange', (event) => {
  console.log(`Zoom changed to: ${event.detail * 100}%`);
});
```

#### `panchange`

Fired when the pan offset changes.

**Event Detail:**
```typescript
{ x: number, y: number }
```

**Example:**
```javascript
viewer.addEventListener('panchange', (event) => {
  console.log(`Pan changed to: x=${event.detail.x}, y=${event.detail.y}`);
});
```

#### `annotationadd`

Fired when an annotation is added.

**Event Detail:** `Annotation` object

**Example:**
```javascript
viewer.addEventListener('annotationadd', (event) => {
  console.log('Annotation added:', event.detail);
});
```

#### `annotationremove`

Fired when an annotation is removed.

**Event Detail:** `string` (annotation ID)

**Example:**
```javascript
viewer.addEventListener('annotationremove', (event) => {
  console.log('Annotation removed:', event.detail);
});
```

#### `toolchange`

Fired when the active tool changes.

**Event Detail:** `string | null` (tool name or null if no tool active)

**Example:**
```javascript
viewer.addEventListener('toolchange', (event) => {
  console.log('Tool changed to:', event.detail || 'none');
});
```

#### `comparisonchange`

Fired when the comparison slider position changes.

**Event Detail:** `number` (position between 0 and 1)

**Example:**
```javascript
viewer.addEventListener('comparisonchange', (event) => {
  console.log(`Comparison position: ${event.detail * 100}%`);
});
```

#### `overlayopen`

Fired when the overlay is opened.

**Event Detail:** None

**Example:**
```javascript
viewer.addEventListener('overlayopen', () => {
  console.log('Overlay opened');
});
```

#### `overlayclose`

Fired when the overlay is closed.

**Event Detail:** None

**Example:**
```javascript
viewer.addEventListener('overlayclose', () => {
  console.log('Overlay closed');
});
```

## Type Definitions

### ToolConfig

```typescript
interface ToolConfig {
  zoom?: boolean;
  pan?: boolean;
  annotation?: {
    rect?: boolean;
    arrow?: boolean;
    text?: boolean;
    circle?: boolean;
    line?: boolean;
  };
  comparison?: boolean;
}
```

### Annotation

```typescript
interface Annotation {
  id: string;
  type: 'rect' | 'arrow' | 'text' | 'circle' | 'line';
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  style?: AnnotationStyle;
}
```

### AnnotationStyle

```typescript
interface AnnotationStyle {
  strokeColor?: string;
  strokeWidth?: number;
  fillColor?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
}
```

### Point

```typescript
interface Point {
  x: number;
  y: number;
}
```

### ImageData

```typescript
interface ImageData {
  naturalSize: { width: number; height: number };
  fileName: string;
  type: string;
}
```

### CanvasLensOptions

```typescript
interface CanvasLensOptions {
  container: HTMLElement;
  width?: string | number;
  height?: string | number;
  backgroundColor?: string;
  tools?: ToolConfig;
  maxZoom?: number;
  minZoom?: number;
  imageType?: string;
  fileName?: string;
}
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt + R` | Toggle rectangle tool |
| `Alt + A` | Toggle arrow tool |
| `Alt + T` | Toggle text tool |
| `Alt + C` | Toggle circle tool |
| `Alt + L` | Toggle line tool |
| `Escape` | Deactivate current tool |
| `Delete` / `Backspace` | Delete selected annotation |
| `Double Click` | Reset view to initial state |

## Error Handling

CanvasLens provides comprehensive error handling with the following error types:

- `ImageLoadError`: Failed to load image
- `InvalidToolError`: Invalid tool configuration
- `AnnotationError`: Annotation-related errors
- `ViewError`: View manipulation errors

**Example:**
```javascript
viewer.addEventListener('error', (event) => {
  console.error('CanvasLens error:', event.detail);
});
```

## Browser Compatibility

CanvasLens supports the following browsers:

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Feature Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Basic Image Viewing | ✅ | ✅ | ✅ | ✅ |
| Zoom & Pan | ✅ | ✅ | ✅ | ✅ |
| Annotations | ✅ | ✅ | ✅ | ✅ |
| Image Comparison | ✅ | ✅ | ✅ | ✅ |
| Overlay Mode | ✅ | ✅ | ✅ | ✅ |
| Touch Support | ✅ | ✅ | ⚠️ | ✅ |

⚠️ = Limited support

## Performance Considerations

### Large Images

For large images (>10MB), consider:

1. **Preprocessing**: Resize images on the server
2. **Lazy Loading**: Load images only when needed
3. **Progressive Loading**: Use progressive JPEG format

### Memory Management

CanvasLens automatically manages memory by:

1. **Canvas Cleanup**: Properly disposing of canvas contexts
2. **Event Cleanup**: Removing event listeners on destroy
3. **Image Disposal**: Releasing image resources

### Best Practices

1. **Single Instance**: Use one CanvasLens instance per container
2. **Proper Cleanup**: Call destroy methods when removing components
3. **Event Management**: Remove event listeners to prevent memory leaks
4. **Image Optimization**: Use appropriate image formats and sizes
