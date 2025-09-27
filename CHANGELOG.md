# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.1] - 2025-09-27

### Added
- **Core Image Viewer**: HTML5 Canvas-based image viewing with automatic aspect ratio preservation
- **Zoom & Pan**: Mouse wheel zoom with cursor-centered zooming and drag-to-pan functionality
- **Annotation Tools**: Rectangle, arrow, text, circle, and line annotation tools with keyboard shortcuts
- **Image Comparison**: Interactive slider-based before/after comparison feature
- **Overlay Mode**: Full-screen professional editing interface
- **Web Component**: Standard HTML element that works with any framework
- **TypeScript Support**: Full type safety and IntelliSense with comprehensive type definitions
- **Logger Utility**: Production-safe logging system (`src/utils/logger.ts`)
- **Production Build**: Automated build process that removes console.log statements

### Changed
- **Component Architecture**: Unified single component structure for better integration
- **Tool Interaction**: Simplified tool toggle functionality - click same button to activate/deactivate
- **Documentation**: Converted all documentation to English for better accessibility
- **Build Process**: Enhanced build system with production optimizations

### Removed
- **Photo Editor Module**: Removed photo-editor functionality to focus on core image viewing
- **Legacy Components**: Cleaned up old component structure and unused exports
- **Development Console Logs**: Removed unnecessary console.log statements for production

### Fixed
- **TypeScript Errors**: Resolved all type conflicts and naming issues
- **Build Process**: Ensured clean build with no errors
- **Import Structure**: Fixed circular imports and dependency issues

