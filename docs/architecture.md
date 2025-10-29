# CanvasLens Architecture Guide

## Overview

CanvasLens is built with a modular, layered architecture that separates concerns and provides a clean, maintainable codebase. The library is designed to be framework-agnostic while providing a rich set of features for image viewing, annotation, and comparison.

## Architecture Principles

### 1. Separation of Concerns
- **Web Component Layer**: Handles DOM integration and attribute management
- **Core Engine**: Manages the main application logic and coordination
- **Module Layer**: Provides specific functionality (image viewing, annotations, comparison)
- **Utility Layer**: Common utilities and helpers

### 2. Event-Driven Architecture
- Components communicate through well-defined events
- Loose coupling between modules
- Extensible event system for custom functionality

### 3. Type Safety
- Full TypeScript support throughout the codebase
- Comprehensive type definitions for all public APIs
- Runtime type checking for critical operations

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Web Component Layer                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   CanvasLens    │  │ AttributeParser │  │ EventManager │ │
│  │   (HTMLElement) │  │                 │  │              │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                      Core Engine Layer                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │     Engine      │  │  CanvasLensCore │  │OverlayManager│ │
│  │                 │  │                 │  │              │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                      Module Layer                           │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────┐ │
│  │ ImageViewer  │ │ Annotation   │ │ Comparison   │ │Zoom │ │
│  │              │ │ Manager      │ │ Manager      │ │Pan  │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └─────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                     Utility Layer                           │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────┐ │
│  │   Logger     │ │ ErrorHandler │ │ Performance  │ │ ... │ │
│  │              │ │              │ │ Monitor      │ │     │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └─────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Web Component Layer

#### CanvasLens (HTMLElement)
- **Purpose**: Main Web Component that users interact with
- **Responsibilities**:
  - DOM integration and shadow DOM management
  - Attribute parsing and validation
  - Event delegation to core engine
  - Public API exposure

```typescript
class CanvasLens extends HTMLElement {
  private core: CanvasLensCore | null = null;
  
  static get observedAttributes() {
    return ['src', 'width', 'height', 'tools', ...];
  }
  
  // Attribute change handling
  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    // Handle attribute changes
  }
}
```

#### AttributeParser
- **Purpose**: Parses and validates Web Component attributes
- **Responsibilities**:
  - JSON parsing for complex attributes (tools, etc.)
  - Type conversion and validation
  - Default value application

#### EventManager
- **Purpose**: Manages event communication between components
- **Responsibilities**:
  - Event registration and cleanup
  - Event delegation and bubbling
  - Custom event creation

### 2. Core Engine Layer

#### Engine
- **Purpose**: Main application coordinator
- **Responsibilities**:
  - Module initialization and coordination
  - State management
  - Public API implementation
  - Event handling coordination

```typescript
class Engine {
  private imageViewer: ImageViewer;
  private annotationManager: AnnotationManager;
  private comparisonManager: ComparisonManager;
  
  constructor(options: CanvasLensOptions) {
    this.initializeModules(options);
  }
}
```

#### CanvasLensCore
- **Purpose**: Bridge between Web Component and Engine
- **Responsibilities**:
  - Engine lifecycle management
  - Error handling and recovery
  - Overlay management coordination

#### OverlayManager
- **Purpose**: Manages full-screen overlay functionality
- **Responsibilities**:
  - Overlay creation and destruction
  - Full-screen mode management
  - Overlay-specific event handling

### 3. Module Layer

#### ImageViewer Module
- **Purpose**: Core image viewing functionality
- **Responsibilities**:
  - Image loading and rendering
  - Canvas management
  - View state management
  - Image data handling

```typescript
class ImageViewer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private image: HTMLImageElement | null = null;
  private viewState: ViewState;
  
  async loadImage(src: string): Promise<void> {
    // Image loading logic
  }
  
  render(): void {
    // Canvas rendering logic
  }
}
```

#### Annotation Module
- **Purpose**: Handles all annotation functionality
- **Components**:
  - `Manager`: Annotation lifecycle management
  - `Renderer`: Annotation rendering logic
  - `tools/`: Individual tool implementations
- **Responsibilities**:
  - Annotation creation and editing
  - Tool management
  - Annotation rendering
  - Selection and interaction

#### Comparison Module
- **Purpose**: Manages before/after image comparison
- **Responsibilities**:
  - Comparison mode toggling
  - Slider management
  - Synchronized view control
  - Comparison rendering

#### Zoom-Pan Module
- **Purpose**: Handles zoom and pan operations
- **Responsibilities**:
  - Zoom level management
  - Pan offset calculations
  - View transformation
  - Mouse/touch event handling

### 4. Utility Layer

#### Core Utilities (`utils/core/`)
- **Logger**: Centralized logging system
  - Environment-aware logging
  - Production-safe log removal
  - Multiple log levels (log, warn, error, info)
- **ErrorHandler**: Centralized error handling
  - Error categorization and recovery
  - User-friendly error messages
  - Safe async operation handling
- **MemoryManager**: Memory management and cleanup
- **ValidationHelper**: Input validation and sanitization

#### Performance Utilities (`utils/performance/`)
- **PerformanceMonitor**: Performance metrics collection
- **RenderOptimizer**: Canvas rendering optimization
- **ViewportCulling**: Viewport-based rendering optimization

#### Image Utilities (`utils/image/`)
- **ImageLoader**: Advanced image loading with caching
- **Image Utils**: Image processing and manipulation helpers

#### Geometry Utilities (`utils/geometry/`)
- **Coordinate Utils**: Coordinate transformation functions
- **Geometry Helpers**: Mathematical calculations for shapes and positions

## Data Flow

### 1. Initialization Flow

```
User creates <canvas-lens> element
    ↓
CanvasLens constructor called
    ↓
Shadow DOM attached
    ↓
connectedCallback() triggered
    ↓
CanvasLensCore created and initialized
    ↓
Engine initialized with options
    ↓
Modules (ImageViewer, Annotation, Comparison, ZoomPan) created
    ↓
Event listeners attached
    ↓
Attribute parsing and validation
    ↓
Ready for user interaction
```

### 2. Image Loading Flow

```
User sets 'src' attribute or calls loadImage()
    ↓
attributeChangedCallback triggered (if via attribute)
    ↓
AttributeParser validates and parses
    ↓
CanvasLensCore.loadImage() called
    ↓
Engine coordinates image loading
    ↓
ImageViewer module loads image
    ↓
ImageLoader utility handles loading
    ↓
Image processed and validated
    ↓
Canvas rendered with new image
    ↓
'imageload' event fired with image data
```

### 3. Annotation Flow

```
User activates annotation tool (via API or keyboard)
    ↓
Tool activation event triggered
    ↓
Annotation Manager.activateTool() called
    ↓
Tool state updated in Engine
    ↓
Mouse/touch events captured by EventManager
    ↓
Tool-specific event handlers process input
    ↓
Annotation created with validation
    ↓
Annotation added to collection
    ↓
Canvas re-rendered with new annotation
    ↓
'annotationadd' event fired with annotation data
```

## State Management

### View State
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

### Image State
```typescript
interface ImageState {
  /** Whether an image is currently loaded */
  isLoaded: boolean;
  /** Current image data */
  imageData: CustomImageData | null;
  /** Image dimensions */
  dimensions: Size | null;
}
```

### Tool State
```typescript
interface ToolState {
  /** Currently active tool type */
  activeTool: string | null;
  /** Tool configuration */
  toolConfig: ToolConfig;
  /** Whether user is currently drawing */
  isDrawing: boolean;
  /** Current annotation being created */
  currentAnnotation: Annotation | null;
}
```

### Comparison State
```typescript
interface ComparisonState {
  /** Whether comparison mode is enabled */
  isComparisonMode: boolean;
  /** Comparison image data */
  comparisonImage: CustomImageData | null;
  /** Slider position (0-1) */
  sliderPosition: number;
  /** Whether views are synchronized */
  isSynchronized: boolean;
}
```

### Annotation State
```typescript
interface AnnotationState {
  /** All annotations on the canvas */
  annotations: Annotation[];
  /** Currently selected annotation */
  selectedAnnotation: string | null;
  /** Whether annotations have been modified */
  hasChanges: boolean;
}
```

## Event System

### Event Types

#### Internal Events
- Module-to-module communication
- State change notifications
- Error propagation
- Performance monitoring events

#### External Events
- `imageload`: Image loaded successfully
- `zoomchange`: Zoom level changed
- `panchange`: Pan position changed
- `annotationadd`: Annotation added
- `annotationremove`: Annotation removed
- `toolchange`: Active tool changed
- `comparisonchange`: Comparison slider position changed
- `error`: Error occurred

#### Web Component Lifecycle Events
- `connectedCallback`: Component connected to DOM
- `disconnectedCallback`: Component disconnected from DOM
- `attributeChangedCallback`: Attribute value changed

### Event Flow
```
User Action → Web Component → Core Engine → Module → State Update → Event Emission → UI Update
```

## Error Handling Strategy

### 1. Error Categories

#### Fatal Errors
- Image loading failures
- Canvas initialization failures
- Critical module failures

#### Recoverable Errors
- Invalid tool configurations
- Annotation validation errors
- View state errors

#### Warning Errors
- Performance warnings
- Deprecated API usage
- Non-critical validation failures

### 2. Error Recovery

#### Automatic Recovery
- Fallback to default configurations
- Graceful degradation of features
- State reset mechanisms

#### User Recovery
- Error event emission
- User-friendly error messages
- Manual retry mechanisms

## Performance Considerations

### 1. Rendering Optimization

#### Canvas Optimization
- Efficient canvas clearing and redraw operations
- Hardware acceleration utilization
- Viewport culling for off-screen elements
- Render optimization with dirty region tracking

#### Memory Management
- Image resource cleanup and disposal
- Event listener cleanup on component destruction
- Canvas context management and optimization
- Memory leak prevention with proper cleanup

### 2. Event Optimization

#### Event Debouncing
- Mouse move events (16ms for 60fps)
- Resize events (100ms debounce)
- Scroll events (16ms for smooth scrolling)

#### Event Delegation
- Efficient event handling with delegation
- Reduced memory usage through shared handlers
- Better performance with fewer event listeners

### 3. Performance Monitoring

#### Built-in Performance Tools
- `PerformanceMonitor`: Real-time performance metrics
- `RenderOptimizer`: Automatic rendering optimizations
- `ViewportCulling`: Only render visible elements
- Memory usage tracking and cleanup

#### Performance Metrics
- Frame rate monitoring
- Memory usage tracking
- Rendering time measurement
- User interaction latency

## Extensibility

### 1. Modular Architecture

The current architecture supports extensibility through:

#### Module System
- Each major feature is a separate module
- Modules can be extended or replaced
- Clear interfaces between modules
- Dependency injection for testability

#### Utility System
- Comprehensive utility functions
- Performance monitoring tools
- Error handling utilities
- Memory management helpers

### 2. Custom Tools (Current)

#### Tool Implementation
```typescript
interface CustomTool {
  name: string;
  type: string;
  icon?: string;
  activate(): boolean;
  deactivate(): boolean;
  onMouseDown(event: MouseEvent): void;
  onMouseMove(event: MouseEvent): void;
  onMouseUp(event: MouseEvent): void;
}
```

#### Tool Registration
```typescript
// Tools are registered through the annotation module
annotationManager.registerTool(customTool);
```

### 3. Future Extensibility Plans

#### Plugin System (Planned)
```typescript
interface CanvasLensPlugin {
  name: string;
  version: string;
  initialize(engine: Engine): void;
  destroy(): void;
}
```

#### Custom Renderers (Planned)
```typescript
interface CustomRenderer {
  render(ctx: CanvasRenderingContext2D, data: any): void;
  update(data: any): void;
}
```

#### Event System Extensions
- Custom event types
- Event middleware
- Event transformation

## Security Considerations

### 1. Input Validation

#### Image Sources
- URL validation and sanitization
- CORS handling and configuration
- Content type verification
- File size and dimension limits

#### User Input
- Tool configuration validation
- Annotation data validation and sanitization
- Attribute value sanitization
- File upload validation

### 2. XSS Prevention

#### Content Sanitization
- Text annotation sanitization
- Attribute value escaping
- Event handler validation
- HTML content filtering

### 3. Security Utilities

#### ValidationHelper
- Input validation functions
- Data sanitization methods
- Type checking utilities
- Security-focused validation

#### Error Handling
- Secure error messages
- No sensitive data exposure
- Proper error logging
- User-friendly error display

## Testing Strategy

### 1. Unit Testing

#### Component Testing
- Individual module testing (Engine, ImageViewer, Annotation, etc.)
- Utility function testing (Logger, ErrorHandler, PerformanceMonitor)
- Type validation testing
- Error handling testing

#### Mocking Strategy
- Canvas API mocking with jsdom
- Event system mocking
- Image loading mocking
- Performance monitoring mocking

### 2. Integration Testing

#### Module Integration
- Cross-module communication testing
- Event flow testing
- State synchronization testing
- API integration testing

#### Browser Testing
- Cross-browser compatibility testing
- Performance testing
- Visual regression testing
- Touch and mobile testing

### 3. End-to-End Testing

#### User Scenarios
- Complete user workflows
- Error handling scenarios
- Performance scenarios
- Framework integration testing

### 4. Test Structure

#### Test Organization
```
src/__tests__/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── performance/    # Performance tests
├── visual/         # Visual regression tests
└── api/           # API tests
```

#### Test Types
- **Unit Tests**: Individual function and class testing
- **Integration Tests**: Module interaction testing
- **Performance Tests**: Rendering and interaction performance
- **Visual Tests**: Canvas output verification
- **API Tests**: Public API functionality

## Build System

### 1. Development Build

#### Features
- Source maps for debugging
- Development logging enabled
- TypeScript compilation
- Hot reloading support

#### Configuration
```javascript
// rollup.config.js (development)
export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'es',
    sourcemap: true
  },
  plugins: [
    typescript(),
    nodeResolve(),
    commonjs(),
    // No minification for development
  ]
};
```

### 2. Production Build

#### Features
- Code minification with Terser
- Development log removal
- Tree shaking for smaller bundles
- Bundle optimization
- TypeScript declaration files

#### Configuration
```javascript
// rollup.config.js (production)
export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'es',
    sourcemap: false
  },
  plugins: [
    typescript(),
    nodeResolve(),
    commonjs(),
    terser({
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    })
  ]
};
```

### 3. Build Scripts

#### Available Scripts
- `npm run build`: Development build with linting
- `npm run build:prod`: Production build with optimization
- `npm run clean`: Clean build artifacts
- `npm run lint`: ESLint code checking
- `npm run test`: Run test suite

## Future Architecture Considerations

### 1. Micro-Frontend Architecture
- Module federation for independent deployment
- Shared component library
- Plugin system for extensibility

### 2. WebAssembly Integration
- Performance-critical operations
- Image processing and manipulation
- Complex mathematical calculations
- Canvas rendering optimization

### 3. Service Worker Integration
- Offline functionality
- Image caching and preloading
- Background processing
- Progressive loading

### 4. WebGL Rendering
- Hardware acceleration for complex operations
- Advanced visual effects
- 3D transformations
- Shader-based rendering

### 5. Advanced Features
- Real-time collaboration
- Version control for annotations
- Advanced image filters
- Machine learning integration
