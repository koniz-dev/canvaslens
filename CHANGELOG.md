# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- Interactive HTML demos for each module
- Usage examples and code snippets
- Project structure documentation

### Build System
- TypeScript compilation with source maps
- NPM package configuration
- Development and production builds
- Clean build process

## [Unreleased]

### Planned
- Performance optimizations
- Touch support for mobile devices
- Advanced annotation features (circle, line tools)
- Undo/Redo functionality
- Collaborative annotations
- Plugin system
- Export comparison as video/GIF
- Multiple comparison modes (side-by-side, overlay)
