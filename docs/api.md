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

##### `loadImage(src: string, type?: string, fileName?: string): Promise<void>`

Loads an image from the specified URL.

**Parameters:**
- `src` (string): Image source URL or data URI
- `type` (string, optional): Image MIME type (e.g., "image/jpeg")
- `fileName` (string, optional): File name for display purposes

**Returns:** Promise that resolves when image is loaded

**Example:**
```javascript
const viewer = document.querySelector('canvas-lens');
await viewer.loadImage('https://example.com/new-image.jpg', 'image/jpeg', 'photo.jpg');
```

##### `loadImageFromFile(file: File): void`

Loads an image from a File object (e.g., from file input).

**Parameters:**
- `file` (File): File object from file input

**Example:**
```javascript
const fileInput = document.getElementById('file-input');
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    viewer.loadImageFromFile(file);
  }
});
```

#### View Control

##### `zoomIn(factor?: number): void`

Zooms in by the specified factor.

**Parameters:**
- `factor` (number, optional): Zoom factor (default: 1.2)

**Example:**
```javascript
viewer.zoomIn(); // Zoom in by 1.2x
viewer.zoomIn(1.5); // Zoom in by 1.5x
```

##### `zoomOut(factor?: number): void`

Zooms out by the specified factor.

**Parameters:**
- `factor` (number, optional): Zoom factor (default: 1.2)

**Example:**
```javascript
viewer.zoomOut(); // Zoom out by 1.2x
viewer.zoomOut(1.5); // Zoom out by 1.5x
```

##### `zoomTo(scale: number): void`

Sets the zoom level to the specified value.

**Parameters:**
- `scale` (number): Zoom scale (1.0 = 100%, 2.0 = 200%, etc.)

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

##### `resize(width: number, height: number): void`

Resizes the canvas to the specified dimensions.

**Parameters:**
- `width` (number): New width in pixels
- `height` (number): New height in pixels

**Example:**
```javascript
viewer.resize(1200, 800);
```

##### `getZoomLevel(): number`

Returns the current zoom level.

**Returns:** Current zoom level as number

**Example:**
```javascript
const currentZoom = viewer.getZoomLevel();
console.log(`Current zoom: ${currentZoom * 100}%`);
```

##### `getPanOffset(): {x: number, y: number}`

Returns the current pan offset.

**Returns:** Object with x and y pan coordinates

**Example:**
```javascript
const pan = viewer.getPanOffset();
console.log(`Pan offset: x=${pan.x}, y=${pan.y}`);
```

#### Tool Management

##### `activateTool(toolType: string): boolean`

Activates the specified annotation tool.

**Parameters:**
- `toolType` (string): Tool type ("rect", "arrow", "text", "circle", "line")

**Returns:** true if tool was activated successfully, false if tool type is invalid or unavailable

**Example:**
```javascript
const success = viewer.activateTool('rect'); // Activate rectangle tool
if (success) {
  console.log('Rectangle tool activated');
}
```

##### `deactivateTool(): boolean`

Deactivates the currently active tool.

**Returns:** true if tool was deactivated successfully

**Example:**
```javascript
const success = viewer.deactivateTool();
if (success) {
  console.log('Tool deactivated');
}
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

##### `setComparisonMode(enabled: boolean): void`

Sets the comparison mode state.

**Parameters:**
- `enabled` (boolean): true to enable comparison mode, false to disable

**Example:**
```javascript
viewer.setComparisonMode(true); // Enable comparison mode
viewer.setComparisonMode(false); // Disable comparison mode
```

##### `isComparisonMode(): boolean`

Checks if comparison mode is currently enabled.

**Returns:** true if comparison mode is enabled

**Example:**
```javascript
if (viewer.isComparisonMode()) {
  console.log('Comparison mode is active');
}
```

**Note:** The actual comparison image loading and position control methods are handled internally by the comparison manager module.

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

#### Image Information

##### `isImageLoaded(): boolean`

Checks if an image is currently loaded.

**Returns:** true if image is loaded

**Example:**
```javascript
if (viewer.isImageLoaded()) {
  console.log('Image is ready for viewing');
}
```

##### `getImageData(): CustomImageData | null`

Returns the current image data.

**Returns:** Image data object or null if no image is loaded

**Example:**
```javascript
const imageData = viewer.getImageData();
if (imageData) {
  console.log(`Image size: ${imageData.naturalSize.width}x${imageData.naturalSize.height}`);
  console.log(`File name: ${imageData.fileName}`);
}
```

#### State Management

##### `hasChanges(): boolean`

Checks if there are unsaved changes (annotations, view state, etc.).

**Returns:** true if there are changes

**Example:**
```javascript
if (viewer.hasChanges()) {
  console.log('There are unsaved changes');
  // Show save prompt or auto-save
}
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

#### `error`

Fired when an error occurs.

**Event Detail:** `CanvasLensError` object

**Example:**
```javascript
viewer.addEventListener('error', (event) => {
  console.error('CanvasLens error:', event.detail);
  // Handle error appropriately
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
  /** Unique identifier for the annotation */
  id: string;
  /** Type of annotation */
  type: 'rect' | 'arrow' | 'text' | 'circle' | 'line';
  /** Array of points defining the annotation */
  points: Point[];
  /** Styling properties for the annotation */
  style: AnnotationStyle;
  /** Additional data associated with the annotation */
  data?: Record<string, unknown>;
}
```

### AnnotationStyle

```typescript
interface AnnotationStyle {
  /** Stroke color (hex, rgb, or named color) */
  strokeColor: string;
  /** Fill color (optional) */
  fillColor?: string;
  /** Stroke width in pixels */
  strokeWidth: number;
  /** Line style for strokes */
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  /** Font size for text annotations */
  fontSize?: number;
  /** Font family for text annotations */
  fontFamily?: string;
}
```

### Tool

```typescript
interface Tool {
  /** Display name of the tool */
  name: string;
  /** Type of annotation this tool creates */
  type: Annotation['type'];
  /** Optional icon for the tool */
  icon?: string;
}
```

### Point

```typescript
interface Point {
  /** X coordinate */
  x: number;
  /** Y coordinate */
  y: number;
}
```

### Size

```typescript
interface Size {
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
}
```

### Rectangle

```typescript
interface Rectangle extends Point, Size {}
```

### ViewState

```typescript
interface ViewState {
  /** Zoom scale factor (1.0 = 100%) */
  scale: number;
  /** Horizontal pan offset in pixels */
  offsetX: number;
  /** Vertical pan offset in pixels */
  offsetY: number;
}
```

### CustomImageData

```typescript
interface CustomImageData {
  /** Natural dimensions of the image */
  naturalSize: { width: number; height: number };
  /** File name of the image */
  fileName: string;
  /** MIME type of the image */
  type: string;
}
```

### CanvasLensOptions

```typescript
interface CanvasLensOptions {
  /** Container element where CanvasLens will be rendered */
  container: HTMLElement;
  /** Initial width in pixels (default: 800) */
  width?: number;
  /** Initial height in pixels (default: 600) */
  height?: number;
  /** Background color (default: '#f0f0f0') */
  backgroundColor?: string;
  /** Tool configuration */
  tools?: ToolConfig;
  /** Maximum zoom level (default: 10) */
  maxZoom?: number;
  /** Minimum zoom level (default: 0.1) */
  minZoom?: number;
}
```

### CanvasLensError

```typescript
interface CanvasLensError {
  /** Error type */
  type: ErrorType;
  /** Error message */
  message: string;
  /** Additional error details */
  details?: Record<string, unknown>;
}
```

### ErrorType

```typescript
enum ErrorType {
  INITIALIZATION = 'INITIALIZATION',
  IMAGE_LOAD = 'IMAGE_LOAD',
  INVALID_TOOL = 'INVALID_TOOL',
  ANNOTATION_ERROR = 'ANNOTATION_ERROR',
  VIEW_ERROR = 'VIEW_ERROR',
  RENDER_ERROR = 'RENDER_ERROR'
}
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt + R` | Activate rectangle tool |
| `Alt + A` | Activate arrow tool |
| `Alt + T` | Activate text tool |
| `Alt + C` | Activate circle tool |
| `Alt + L` | Activate line tool |
| `Escape` | Deactivate current tool |
| `Delete` / `Backspace` | Delete selected annotation |
| `Double Click` | Reset view to initial state |
| `Mouse Wheel` | Zoom in/out (cursor-centered) |
| `Left Click + Drag` | Pan around the image |
| `Right Click + Drag` | Pan around the image (alternative) |
| `Space + Drag` | Pan mode (when no tool active) |
| `Ctrl/Cmd + 0` | Fit image to view |
| `Ctrl/Cmd + +` | Zoom in |
| `Ctrl/Cmd + -` | Zoom out |

## Error Handling

CanvasLens provides comprehensive error handling with the following error types:

- `INITIALIZATION`: Component initialization errors
- `IMAGE_LOAD`: Image loading failures
- `INVALID_TOOL`: Invalid tool configuration or usage
- `ANNOTATION_ERROR`: Annotation-related errors
- `VIEW_ERROR`: View manipulation errors
- `RENDER_ERROR`: Canvas rendering errors

**Example:**
```javascript
viewer.addEventListener('error', (event) => {
  const error = event.detail;
  console.error('CanvasLens error:', error.message);
  
  switch (error.type) {
    case 'IMAGE_LOAD':
      console.error('Failed to load image:', error.details?.src);
      break;
    case 'INVALID_TOOL':
      console.error('Invalid tool:', error.details?.toolType);
      break;
    default:
      console.error('Unknown error:', error);
  }
});
```

### Error Recovery

CanvasLens automatically handles many errors gracefully:

- **Image Load Failures**: Shows error state and allows retry
- **Invalid Tool Usage**: Falls back to default tool or pan mode
- **Rendering Errors**: Attempts to recover and re-render
- **Initialization Errors**: Provides fallback configuration

### Custom Error Handling

You can implement custom error handling by listening to the `error` event:

```javascript
viewer.addEventListener('error', (event) => {
  // Custom error handling logic
  if (error.type === 'IMAGE_LOAD') {
    // Show user-friendly message
    showNotification('Failed to load image. Please try again.');
  }
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
