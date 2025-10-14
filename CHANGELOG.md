## [1.1.0](https://github.com/koniz-dev/canvaslens/compare/v1.0.1...v1.1.0) (2025-10-14)

### Features

* update zoom-pan handler and package dependencies ([b1523e2](https://github.com/koniz-dev/canvaslens/commit/b1523e251d5ad3dd30ec9cd2b84a8b85bb044c8a))

## [1.0.1](https://github.com/koniz-dev/canvaslens/compare/v1.0.0...v1.0.1) (2025-10-10)

### Bug Fixes

* set CI=true in release script to avoid dry-run mode ([0ba8dda](https://github.com/koniz-dev/canvaslens/commit/0ba8ddab4c0ddcc3b2615ce90b29ce432535b8c2))

## 1.0.0 (2025-10-10)

### Features

* add build scripts and fix gitignore ([6496886](https://github.com/koniz-dev/canvaslens/commit/6496886a583cb1a0e2a91450e4d192a5edb20112))
* add configuration files for semantic release and conventional changelog ([24ec2b4](https://github.com/koniz-dev/canvaslens/commit/24ec2b4b512b99483948b1c203c01ed9d48d792c))
* add package publishing to release workflow ([3ffcb04](https://github.com/koniz-dev/canvaslens/commit/3ffcb0400aabdb95a2909b191689366f7c4ea293))
* enhance server file handling and improve demo UI ([1c990a3](https://github.com/koniz-dev/canvaslens/commit/1c990a3dd907591baca6238e0e2927ad686e0738))
* enhance testing suite with new test categories and setup ([37503c4](https://github.com/koniz-dev/canvaslens/commit/37503c48f31deb590335838fd4705acd99ac8e24))
* implement comparison mode functionality in CanvasLens ([655b400](https://github.com/koniz-dev/canvaslens/commit/655b40064dc4c3d8519fe2eb561bcfb789bf17ae))

### Bug Fixes

* update release name in workflow to use ref_name instead of ref ([9a26ae8](https://github.com/koniz-dev/canvaslens/commit/9a26ae835a34517eff6fbcf511091e36dd643a6d))

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-10-10

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
