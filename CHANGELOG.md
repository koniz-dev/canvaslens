## [2.0.0](https://github.com/koniz-dev/canvaslens/compare/v1.3.0...v2.0.0) (2026-05-29)

### ⚠ BREAKING CHANGES

Full architecture rewrite (v1 → v2). Internal module layout, event bus,
store, and tool plugin system are all new. The Web Component surface
(`<canvas-lens>` attributes + methods) is preserved where practical,
but anything that reached into private internals will break. See
`docs/migration.md` for details.

### Features

* **core:** introduce Store, EventBus, RenderScheduler foundation (Phase 1)
* **core:** flatten Core/Engine/ImageViewer into single `App` (Phase 2)
* **modules:** wire modules via `ModuleContext`, fix `bind(this)` listener leak (Phase 3)
* **tools:** ToolPlugin / ToolRegistry plugin system — built-ins + user-registered tools (Phase 4)
* **ui:** extract context menu, error placeholder, overlay shell into `ui/` (Phase 5)
* **input:** centralise pointer + keyboard input, drop EventManager (Phase 6)
* **overlay:** seed overlay with host image, tools, and annotations; isolate host interactions while overlay is open; in-overlay toolbar
* **canvas:** optional transparent background (`backgroundColor: 'transparent'`)
* **playground:** new full-feature vanilla demo

### Bug Fixes

* **annotations:** drag clamp uses geometric center, not points[0] — line/arrow can now reach both image edges symmetrically
* **annotations:** drag continues off-canvas in all 8 directions (document-level pointer move/up)
* **annotations:** circle stays inside image bounds when drawing, resizing, and dragging
* **annotations:** resize handles per shape; drag clamp; cursor switching during hover/resize
* **annotations:** export/import via `<canvas-lens>` API; JSON size cap raised to 1 MB
* **text:** input mounts to `document.body` with synchronous focus — survives shadow-DOM races, mouse-button quirks, and tool switches
* **tools:** accept secondary mouse button (`button=2`) for tool actions (Mac trackpad)
* **tools:** activating a tool auto-exits comparison mode
* **events:** Esc fires `toolChange` correctly; full input event audit
* **style:** `updateTools(style)` synchronously propagates to the store and subsequent draws

## [1.3.0](https://github.com/koniz-dev/canvaslens/compare/v1.2.2...v1.3.0) (2025-11-08)

### Features

* **security:** add security enhancements and CI workflow ([144a414](https://github.com/koniz-dev/canvaslens/commit/144a41447a810b796115887ed544dc9a3d83d158))

## [1.2.2](https://github.com/koniz-dev/canvaslens/compare/v1.2.1...v1.2.2) (2025-11-02)

### Performance Improvements

* optimize package size by excluding build artifacts ([d75c522](https://github.com/koniz-dev/canvaslens/commit/d75c5221cbe1b494e93260872acd2cd44dd34503))

## [1.2.1](https://github.com/koniz-dev/canvaslens/compare/v1.2.0...v1.2.1) (2025-11-01)

## [1.2.0](https://github.com/koniz-dev/canvaslens/compare/v1.1.0...v1.2.0) (2025-10-29)

### Features

* enhance CanvasLens with improved performance, testing, and tooling ([9ddb39f](https://github.com/koniz-dev/canvaslens/commit/9ddb39f13f5ecb2115ed50f0f56b4f3a0c9faeac))
* enhance ESLint configuration and improve type safety across the codebase ([8e8b407](https://github.com/koniz-dev/canvaslens/commit/8e8b4078c8fe8d90e004c23a144eb5011d958d58))
* update annotation system and documentation ([bd81d6d](https://github.com/koniz-dev/canvaslens/commit/bd81d6d90d9c09a483f060866d72478f687b554f))

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
