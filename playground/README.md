# CanvasLens Playground

This playground contains test applications for different frameworks to ensure CanvasLens library compatibility.

## Structure

- `react/` - React test application
- `vue/` - Vue test application

## Usage

1. Build the library first:
   ```bash
   npm run build
   ```

2. Test with React:
   ```bash
   cd playground/react
   npm install
   npm run dev
   ```

3. Test with Vue:
   ```bash
   cd playground/vue
   npm install
   npm run dev
   ```

## Import Method

Both playgrounds import CanvasLens directly from the built dist files:
```javascript
import { CanvasLens } from '../../../dist/index.js';
```

This ensures we test the actual built library, not a development version.
