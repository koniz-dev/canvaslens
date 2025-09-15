# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Circle Tool**: New annotation tool for drawing circles with Alt+C keyboard shortcut
- **Line Tool**: New annotation tool for drawing lines with Alt+L keyboard shortcut
- **Line Style Options**: Choose between solid, dashed, and dotted line styles for annotations
- **Tool Toggle Functionality**: Click same tool button or use same keyboard shortcut to toggle tool on/off
- **Unified CanvasLens Component**: Single component export for easier integration
- **Overlay Mode**: Full-screen professional editing interface with save functionality
- **Enhanced Tool Integration**: All 3 main tools (Zoom/Pan, Annotation, Comparison) always available
- **Improved Component API**: Cleaner interface with better TypeScript support

### Changed
- **UI Simplification**: Removed "Deactivate Tool" button - now click same tool button to toggle
- **Tool Interaction**: All tool buttons now toggle on/off when clicked repeatedly
- **Component Structure**: Refactored from multiple components to single unified component
- **File Organization**: Moved main component to `src/CanvasLens.ts` for better naming
- **Export Structure**: Simplified exports to focus on main component
- **Documentation**: Updated all documentation to reflect new unified approach

### Removed
- **Photo Editor Module**: Completely removed photo-editor functionality and related exports
- **Multiple Examples**: Removed separate example files, now only single demo in `index.html`
- **Old Component Structure**: Removed `src/components/` directory and old component files
- **Photo Editor References**: Cleaned up all photo-editor related types, exports, and documentation

### Fixed
- **TypeScript Errors**: Resolved all type conflicts and naming issues
- **Build Process**: Ensured clean build with no errors
- **Import Structure**: Fixed circular imports and dependency issues

## [0.0.8] - 2024-12-19

### Added
- Logger utility (`src/utils/logger.ts`) for production-safe logging
- Production build script (`npm run build:prod`) that automatically removes console.log statements
- Console log removal script (`scripts/remove-console-logs.js`)
- Documentation for logging system (`docs/LOGGING.md`)

### Changed
- Replaced direct console.log usage with logger utility functions
- Updated build process to support production builds
- Modified prepublishOnly script to use production build
- **Internationalization**: Converted all documentation to English for better accessibility

### Fixed
- Removed unnecessary console.log statements for production environment
- Maintained important console.error and console.warn statements for debugging

## [0.0.7] - 2024-12-18

### Added
- Image comparison module for before/after comparison
- Enhanced annotation tools with more drawing options
- Zoom and pan functionality with smooth interactions
- Event handling system for better integration

### Changed
- Improved TypeScript type definitions
- Enhanced error handling throughout the library
- Better performance optimizations for large images

### Fixed
- Memory leaks in annotation rendering
- Zoom behavior on different screen sizes
- Image loading issues with certain formats

## [1.0.0] - 2024-12-19

### Added
- **Module 1: Basic Image Viewer**
  - Load images from URL or file
  - Automatic aspect ratio preservation
  - Responsive design with device pixel ratio support
  - Clean Canvas abstraction with proper context management

- **Module 2: Zoom & Pan**
  - Mouse wheel zoom with cursor-centered zooming
  - Drag to pan with smooth interactions
  - Configurable zoom limits and speed controls
  - Fit to view and reset functionality
  - Real-time zoom/pan state tracking

- **Module 3: Annotations**
  - Rectangle annotation tool with click & drag
  - Arrow annotation tool with automatic arrowhead
  - Text annotation tool with interactive input
  - Annotation selection and deletion
  - Export/import annotations as JSON
  - Customizable styles (colors, stroke width, fonts)
  - Real-time preview while drawing
  - Keyboard shortcuts (R/A/T keys)

- **Module 4: Image Comparison**
  - Interactive slider-based before/after comparison
  - Drag slider to reveal differences
  - Synchronized zoom and pan for both images
  - Customizable slider appearance (color, width)
  - Real-time comparison state tracking

### Technical Features
- Full TypeScript support with strict mode
- Modular architecture for easy extension
- Comprehensive event system
- Proper coordinate transformation utilities
- Clean API design with consistent naming
- Memory management and cleanup methods

### Documentation & Examples
- Complete API documentation
- Interactive HTML demo
- Usage examples and code snippets
- Project structure documentation
