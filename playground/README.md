# CanvasLens Playground

This playground contains a full feature demo plus framework smoke tests.

## Structure

- `vanilla/` — **Full feature demo** (no framework). Drive every public
  feature of `<canvas-lens>` from a single page. Recommended starting
  point.
- `react/` — minimal React integration smoke test
- `vue/` — minimal Vue integration smoke test

## Usage

1. Build the library first:
   ```bash
   npm run build
   ```

2. Run the full vanilla demo:
   ```bash
   cd playground/vanilla
   npm install
   npm run dev
   ```
   Opens at <http://localhost:3001/>.

3. (Optional) Smoke tests with React:
   ```bash
   cd playground/react
   npm install
   npm run dev
   ```
   Runs on <http://localhost:3003/>.

4. (Optional) Smoke tests with Vue:
   ```bash
   cd playground/vue
   npm install
   npm run dev
   ```
   Runs on <http://localhost:3002/>.

## What the vanilla demo covers

- Image loading: URL, random Picsum, file picker
- All 5 annotation tools (Rectangle, Arrow, Text, Circle, Line) with
  toggle-on-second-click + an explicit Off button
- Live style editor: strokeColor, strokeWidth, lineStyle, fillColor
  (applied to subsequent annotations via `updateTools`)
- View controls: zoom in/out, zoom to a specific scale, fit, reset
- Comparison-mode toggle with status indicator
- Overlay open/close
- Annotation list with per-item delete buttons
- Clear all / export JSON / import JSON
- Live event log surfacing every DOM CustomEvent the component
  dispatches: `imageLoad`, `zoomChange`, `panChange`, `toolChange`,
  `annotationAdd`, `annotationRemove`, `comparisonChange`,
  `comparisonModeChange`, `imageLoadError`.

## Import method

All playgrounds import CanvasLens directly from the built dist:
```javascript
import { CanvasLens } from '../../dist/index.js';
```

This ensures we exercise the actual built library, not the TypeScript
source.
