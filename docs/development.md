# CanvasLens Development Guide

## Getting Started

### Prerequisites

- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (or yarn/pnpm)
- **TypeScript**: Version 5.0 or higher
- **Git**: For version control

### Development Environment Setup

1. **Clone the repository**
```bash
git clone https://github.com/koniz-dev/canvaslens.git
cd canvaslens
```

2. **Install dependencies**
```bash
npm install
```

3. **Build the project**
```bash
npm run build
```

4. **Run tests**
```bash
npm test
```

5. **Start development server**
```bash
npm run dev
```

## Project Structure

```
canvaslens/
├── src/                    # Source code
│   ├── CanvasLens.ts      # Main Web Component
│   ├── index.ts           # Main exports
│   ├── components/        # Component modules
│   │   ├── CanvasLensCore.ts
│   │   ├── AttributeParser.ts
│   │   ├── EventManager.ts
│   │   ├── OverlayManager.ts
│   │   └── index.ts
│   ├── core/              # Core engine
│   │   ├── Engine.ts
│   │   ├── Renderer.ts
│   │   └── index.ts
│   ├── modules/           # Feature modules
│   │   ├── annotation/    # Annotation system
│   │   │   ├── Manager.ts
│   │   │   ├── Renderer.ts
│   │   │   ├── tools/
│   │   │   └── index.ts
│   │   ├── comparison/    # Comparison mode
│   │   ├── image-viewer/  # Image viewing
│   │   ├── zoom-pan/      # Zoom and pan
│   │   └── index.ts
│   ├── types/             # TypeScript type definitions
│   │   ├── annotation.ts
│   │   ├── config.ts
│   │   ├── geometry.ts
│   │   ├── image.ts
│   │   ├── errors.ts
│   │   └── index.ts
│   ├── utils/             # Utility functions
│   │   ├── core/          # Core utilities
│   │   ├── performance/   # Performance tools
│   │   ├── image/         # Image utilities
│   │   ├── geometry/      # Geometry utilities
│   │   └── index.ts
│   ├── constants/         # Application constants
│   │   ├── config.ts
│   │   ├── events.ts
│   │   ├── tools.ts
│   │   └── index.ts
│   └── __tests__/         # Test files
│       ├── unit/
│       ├── integration/
│       ├── performance/
│       ├── visual/
│       └── api/
├── docs/                  # Documentation
├── playground/            # Framework examples
├── dist/                  # Built files
├── package.json
├── tsconfig.json
├── rollup.config.js
├── jest.config.js
├── eslint.config.js
└── commitlint.config.js
```

## Development Workflow

### 1. Feature Development

#### Creating a New Feature

1. **Create the module**
```bash
# Create new module file
touch src/modules/NewFeature.ts
```

2. **Define types**
```typescript
// src/types/NewFeature.ts
export interface NewFeatureOptions {
  enabled: boolean;
  config: any;
}

export interface NewFeatureState {
  isActive: boolean;
  data: any;
}
```

3. **Implement the module**
```typescript
// src/modules/NewFeature.ts
import { NewFeatureOptions, NewFeatureState } from '../types';

export class NewFeature {
  private options: NewFeatureOptions;
  private state: NewFeatureState;
  
  constructor(options: NewFeatureOptions) {
    this.options = options;
    this.state = { isActive: false, data: null };
  }
  
  // Implementation
}
```

4. **Add to Engine**
```typescript
// src/core/Engine.ts
import { NewFeature } from '../modules';

export class Engine {
  private newFeature: NewFeature;
  
  constructor(options: CanvasLensOptions) {
    // Initialize new feature
    this.newFeature = new NewFeature(options.newFeature || {});
  }
}
```

5. **Add tests**
```typescript
// src/__tests__/modules/NewFeature.test.ts
import { NewFeature } from '../../modules';

describe('NewFeature', () => {
  it('should initialize correctly', () => {
    const feature = new NewFeature({ enabled: true });
    expect(feature).toBeDefined();
  });
});
```

### 2. Testing

#### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:performance
npm run test:visual
npm run test:api
```

#### Linting and Code Quality

```bash
# Run ESLint
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Clean build artifacts
npm run clean
```

#### Writing Tests

##### Unit Tests
```typescript
// src/__tests__/utils/logger.test.ts
import { log, warn, error, info } from '../../utils/core/logger';

describe('Logger', () => {
  beforeEach(() => {
    // Clear console mocks
    jest.clearAllMocks();
  });

  it('should log in development mode', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    log('Test message');
    expect(consoleSpy).toHaveBeenCalledWith('Test message');
  });
});
```

##### Integration Tests
```typescript
// src/__tests__/integration/CanvasLens.test.ts
import { CanvasLens } from '../../CanvasLens';

describe('CanvasLens Integration', () => {
  let container: HTMLElement;
  let canvasLens: CanvasLens;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    canvasLens = new CanvasLens();
    container.appendChild(canvasLens);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should load image successfully', async () => {
    const imageSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
    
    await canvasLens.loadImage(imageSrc);
    
    expect(canvasLens.getZoom()).toBe(1);
  });
});
```

##### Performance Tests
```typescript
// src/__tests__/performance/rendering.test.ts
describe('Rendering Performance', () => {
  it('should render large image within acceptable time', async () => {
    const startTime = performance.now();
    
    // Load and render large image
    await canvasLens.loadImage('large-image.jpg');
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    expect(renderTime).toBeLessThan(1000); // Should render within 1 second
  });
});
```

### 3. Building

#### Development Build
```bash
npm run build
```

#### Production Build
```bash
npm run build:prod
```

#### Build Configuration

The build process uses Rollup with the following plugins:

- **@rollup/plugin-typescript**: TypeScript compilation
- **@rollup/plugin-node-resolve**: Node module resolution
- **@rollup/plugin-commonjs**: CommonJS module support
- **@rollup/plugin-terser**: Code minification (production only)

#### Build Scripts

```bash
# Development build (with linting)
npm run build

# Production build (optimized)
npm run build:prod

# Clean build artifacts
npm run clean

# Prepare for publishing
npm run prepublishOnly
```

### 4. Code Quality

#### Linting

```bash
# Run ESLint (if configured)
npm run lint

# Fix linting issues
npm run lint:fix
```

#### Type Checking

```bash
# Run TypeScript compiler
npx tsc --noEmit
```

#### Code Formatting

```bash
# Format code with Prettier (if configured)
npm run format
```

## Coding Standards

### 1. TypeScript Guidelines

#### Type Definitions
```typescript
// Use interfaces for object shapes
interface UserConfig {
  name: string;
  age: number;
  isActive: boolean;
}

// Use type aliases for unions and primitives
type Status = 'loading' | 'success' | 'error';
type ID = string | number;
```

#### Function Signatures
```typescript
// Use explicit return types for public APIs
public loadImage(src: string): Promise<void> {
  // Implementation
}

// Use type guards for runtime type checking
function isString(value: unknown): value is string {
  return typeof value === 'string';
}
```

#### Error Handling
```typescript
// Use custom error classes
class ImageLoadError extends Error {
  constructor(message: string, public src: string) {
    super(message);
    this.name = 'ImageLoadError';
  }
}

// Use Result pattern for operations that can fail
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };
```

### 2. Naming Conventions

#### Files and Directories
- **Files**: PascalCase for classes, camelCase for utilities
- **Directories**: kebab-case
- **Tests**: `*.test.ts` or `*.spec.ts`

#### Variables and Functions
```typescript
// Use camelCase for variables and functions
const imageViewer = new ImageViewer();
const loadImage = async (src: string) => {};

// Use PascalCase for classes and interfaces
class ImageViewer {}
interface ImageViewerOptions {}

// Use UPPER_SNAKE_CASE for constants
const MAX_ZOOM_LEVEL = 10;
const DEFAULT_BACKGROUND_COLOR = '#f0f0f0';
```

#### Events
```typescript
// Use kebab-case for event names
viewer.addEventListener('image-load', handler);
viewer.addEventListener('zoom-change', handler);
```

### 3. Documentation

#### JSDoc Comments
```typescript
/**
 * Loads an image from the specified URL
 * @param src - Image source URL or data URI
 * @returns Promise that resolves when image is loaded
 * @throws {ImageLoadError} When image fails to load
 * @example
 * ```typescript
 * await viewer.loadImage('https://example.com/image.jpg');
 * ```
 */
public async loadImage(src: string): Promise<void> {
  // Implementation
}
```

#### README Updates
- Update README.md for new features
- Add examples for new APIs
- Update installation instructions if needed

### 4. Performance Guidelines

#### Memory Management
```typescript
// Clean up resources
class ImageViewer {
  private image: HTMLImageElement | null = null;
  
  destroy(): void {
    this.image = null;
    this.canvas = null;
    this.ctx = null;
  }
}
```

#### Event Handling
```typescript
// Use event delegation for better performance
class EventManager {
  private handleMouseMove = (event: MouseEvent) => {
    // Handle mouse move
  };
  
  attachEvents(): void {
    this.container.addEventListener('mousemove', this.handleMouseMove);
  }
  
  detachEvents(): void {
    this.container.removeEventListener('mousemove', this.handleMouseMove);
  }
}
```

#### Canvas Optimization
```typescript
// Minimize canvas operations
class CanvasRenderer {
  private needsRedraw = false;
  
  markDirty(): void {
    this.needsRedraw = true;
  }
  
  render(): void {
    if (!this.needsRedraw) return;
    
    // Perform actual rendering
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // ... rendering logic
    
    this.needsRedraw = false;
  }
}
```

## Debugging

### 1. Development Tools

#### Browser DevTools
- **Canvas Inspector**: Use browser dev tools to inspect canvas elements
- **Performance Profiler**: Profile rendering performance
- **Memory Inspector**: Check for memory leaks

#### Console Logging
```typescript
import { log, warn, error, info } from '@koniz-dev/canvaslens';

// Use appropriate log levels
log('Debug information'); // Only in development
warn('Warning message');  // Only in development
error('Error occurred');  // Always shown
info('Important info');   // Always shown
```

### 2. Common Issues

#### Canvas Not Rendering
```typescript
// Check canvas context
const ctx = canvas.getContext('2d');
if (!ctx) {
  throw new Error('Canvas 2D context not available');
}
```

#### Image Loading Issues
```typescript
// Handle CORS issues
const img = new Image();
img.crossOrigin = 'anonymous';
img.onerror = () => {
  throw new ImageLoadError('Failed to load image', src);
};
```

#### Event Handling Problems
```typescript
// Ensure proper event cleanup
class Component {
  private boundHandler = this.handleEvent.bind(this);
  
  attachEvents(): void {
    this.element.addEventListener('click', this.boundHandler);
  }
  
  detachEvents(): void {
    this.element.removeEventListener('click', this.boundHandler);
  }
}
```

## Release Process

### 1. Version Management

#### Semantic Versioning
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

#### Version Bumping
```bash
# Patch version (bug fixes)
npm version patch

# Minor version (new features)
npm version minor

# Major version (breaking changes)
npm version major
```

### 2. Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped
- [ ] Build successful
- [ ] Playground examples tested
- [ ] Cross-browser testing completed
- [ ] Linting passes
- [ ] Type checking passes

### 3. Publishing

```bash
# Build production version
npm run build:prod

# Run tests
npm test

# Run linting
npm run lint

# Publish to npm
npm publish
```

### 4. Automated Release

The project uses semantic-release for automated versioning and publishing:

```bash
# Trigger automated release
npm run release
```

This will:
- Analyze commits for semantic versioning
- Update CHANGELOG.md
- Create git tags
- Publish to npm

## Contributing

### 1. Pull Request Process

1. **Fork the repository**
2. **Create a feature branch**
```bash
git checkout -b feature/new-feature
```

3. **Make your changes**
4. **Add tests**
5. **Update documentation**
6. **Submit pull request**

### 2. Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### 3. Code Review Process

#### Review Criteria
- **Functionality**: Does the code work as intended?
- **Performance**: Are there any performance implications?
- **Security**: Are there any security concerns?
- **Maintainability**: Is the code easy to understand and maintain?
- **Testing**: Are there adequate tests?

#### Review Process
1. **Automated checks** (CI/CD)
2. **Code review** by maintainers
3. **Testing** in playground
4. **Approval** and merge

## Troubleshooting

### 1. Common Development Issues

#### Build Failures
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear TypeScript cache
npx tsc --build --clean

# Clear build artifacts
npm run clean

# Check for TypeScript errors
npx tsc --noEmit
```

#### Test Failures
```bash
# Run tests with verbose output
npm test -- --verbose

# Run specific test file
npm test -- src/__tests__/specific.test.ts

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

#### Type Errors
```bash
# Check TypeScript configuration
npx tsc --showConfig

# Run type checking only
npx tsc --noEmit

# Run linting to check for type issues
npm run lint
```

### 2. Getting Help

- **GitHub Issues**: Report bugs and request features
- **Discussions**: Ask questions and share ideas
- **Documentation**: Check existing docs first
- **Code Examples**: Look at playground examples

## Best Practices

### 1. Development

- **Write tests first** (TDD approach)
- **Keep functions small** and focused
- **Use meaningful names** for variables and functions
- **Handle errors gracefully** with proper error types
- **Document public APIs** with JSDoc comments
- **Follow TypeScript best practices**
- **Use proper type definitions**

### 2. Performance

- **Profile before optimizing**
- **Use requestAnimationFrame** for animations
- **Minimize DOM operations**
- **Cache expensive calculations**
- **Use efficient data structures**
- **Leverage built-in performance tools** (PerformanceMonitor, RenderOptimizer)
- **Use viewport culling** for large datasets
- **Optimize canvas rendering**

### 3. Security

- **Validate all inputs** using ValidationHelper
- **Sanitize user content** properly
- **Handle CORS properly**
- **Avoid eval() and similar functions**
- **Keep dependencies updated**
- **Use proper error handling** without exposing sensitive data
- **Validate image sources** and file types

### 4. Accessibility

- **Provide keyboard navigation**
- **Use semantic HTML**
- **Include ARIA attributes**
- **Test with screen readers**
- **Ensure color contrast**
- **Support touch interactions**
- **Provide alternative text** for images
- **Use proper focus management**

This development guide provides a comprehensive overview of how to contribute to CanvasLens effectively. Follow these guidelines to ensure high-quality, maintainable code that benefits the entire community.
