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
│  │ ImageViewer  │ │ Annotation   │ │ Comparison   │ │ ... │ │
│  │              │ │ Manager      │ │ Manager      │ │     │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └─────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                     Utility Layer                           │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────┐ │
│  │   Logger     │ │ ErrorHandler │ │   Helpers    │ │ ... │ │
│  │              │ │              │ │              │ │     │ │
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

#### ImageViewer
- **Purpose**: Core image viewing functionality
- **Responsibilities**:
  - Image loading and rendering
  - Zoom and pan operations
  - Canvas management
  - View state management

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

#### AnnotationManager
- **Purpose**: Handles all annotation functionality
- **Responsibilities**:
  - Annotation creation and editing
  - Tool management
  - Annotation rendering
  - Selection and interaction

#### ComparisonManager
- **Purpose**: Manages before/after image comparison
- **Responsibilities**:
  - Comparison mode toggling
  - Slider management
  - Synchronized view control
  - Comparison rendering

### 4. Utility Layer

#### Logger
- **Purpose**: Centralized logging system
- **Features**:
  - Environment-aware logging
  - Production-safe log removal
  - Multiple log levels

#### ErrorHandler
- **Purpose**: Centralized error handling
- **Features**:
  - Error categorization
  - Recovery mechanisms
  - User-friendly error messages

## Data Flow

### 1. Initialization Flow

```
User creates <canvas-lens> element
    ↓
CanvasLens constructor called
    ↓
CanvasLensCore created
    ↓
Engine initialized with options
    ↓
Modules (ImageViewer, AnnotationManager, etc.) created
    ↓
Event listeners attached
    ↓
Ready for user interaction
```

### 2. Image Loading Flow

```
User sets 'src' attribute
    ↓
attributeChangedCallback triggered
    ↓
AttributeParser validates and parses
    ↓
CanvasLensCore.loadImage() called
    ↓
Engine.loadImage() called
    ↓
ImageViewer.loadImage() called
    ↓
Image loaded and rendered
    ↓
'imageload' event fired
```

### 3. Annotation Flow

```
User activates annotation tool
    ↓
Tool activation event
    ↓
AnnotationManager.activateTool() called
    ↓
Mouse/touch events captured
    ↓
Annotation created
    ↓
Annotation rendered
    ↓
'annotationadd' event fired
```

## State Management

### View State
```typescript
interface ViewState {
  zoom: number;
  panX: number;
  panY: number;
  imageLoaded: boolean;
  imageData: ImageData | null;
}
```

### Tool State
```typescript
interface ToolState {
  activeTool: string | null;
  toolConfig: ToolConfig;
  isDrawing: boolean;
  currentAnnotation: Annotation | null;
}
```

### Comparison State
```typescript
interface ComparisonState {
  isComparisonMode: boolean;
  comparisonImage: HTMLImageElement | null;
  sliderPosition: number;
  isSynchronized: boolean;
}
```

## Event System

### Event Types

#### Internal Events
- Module-to-module communication
- State change notifications
- Error propagation

#### External Events
- User interaction events
- Public API events
- Web Component lifecycle events

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
- Efficient canvas clearing
- Minimal redraw operations
- Hardware acceleration utilization

#### Memory Management
- Image resource cleanup
- Event listener cleanup
- Canvas context management

### 2. Event Optimization

#### Event Debouncing
- Mouse move events
- Resize events
- Scroll events

#### Event Delegation
- Efficient event handling
- Reduced memory usage
- Better performance

## Extensibility

### 1. Plugin System (Planned)

#### Plugin Interface
```typescript
interface CanvasLensPlugin {
  name: string;
  version: string;
  initialize(engine: Engine): void;
  destroy(): void;
}
```

#### Plugin Registration
```typescript
CanvasLens.registerPlugin(plugin: CanvasLensPlugin): void;
```

### 2. Custom Tools

#### Tool Interface
```typescript
interface CustomTool {
  name: string;
  icon: string;
  activate(): void;
  deactivate(): void;
  onMouseDown(event: MouseEvent): void;
  onMouseMove(event: MouseEvent): void;
  onMouseUp(event: MouseEvent): void;
}
```

### 3. Custom Renderers

#### Renderer Interface
```typescript
interface CustomRenderer {
  render(ctx: CanvasRenderingContext2D, data: any): void;
  update(data: any): void;
}
```

## Security Considerations

### 1. Input Validation

#### Image Sources
- URL validation
- CORS handling
- Content type verification

#### User Input
- Tool configuration validation
- Annotation data validation
- Attribute value sanitization

### 2. XSS Prevention

#### Content Sanitization
- Text annotation sanitization
- Attribute value escaping
- Event handler validation

## Testing Strategy

### 1. Unit Testing

#### Component Testing
- Individual module testing
- Utility function testing
- Type validation testing

#### Mocking Strategy
- Canvas API mocking
- Event system mocking
- Image loading mocking

### 2. Integration Testing

#### Module Integration
- Cross-module communication
- Event flow testing
- State synchronization testing

#### Browser Testing
- Cross-browser compatibility
- Performance testing
- Visual regression testing

### 3. End-to-End Testing

#### User Scenarios
- Complete user workflows
- Error handling scenarios
- Performance scenarios

## Build System

### 1. Development Build

#### Features
- Source maps
- Development logging
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
    // No minification
  ]
};
```

### 2. Production Build

#### Features
- Code minification
- Log removal
- Tree shaking
- Bundle optimization

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
    terser({
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    })
  ]
};
```

## Future Architecture Considerations

### 1. Micro-Frontend Architecture
- Module federation
- Independent deployment
- Shared component library

### 2. WebAssembly Integration
- Performance-critical operations
- Image processing
- Complex calculations

### 3. Service Worker Integration
- Offline functionality
- Image caching
- Background processing

### 4. WebGL Rendering
- Hardware acceleration
- Complex visual effects
- 3D transformations
