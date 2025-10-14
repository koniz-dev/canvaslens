# Logging in CanvasLens

## Overview

CanvasLens uses a smart logging system to ensure that debug messages don't appear in production environments while keeping important error messages for debugging purposes.

## Logging Structure

### 1. Logger Utility (`src/utils/logger.ts`)

The library provides the following logging functions:

- `log(...args)`: Console.log only in development mode
- `warn(...args)`: Console.warn only in development mode  
- `error(...args)`: Console.error always displayed (important for debugging)
- `info(...args)`: Console.info always displayed (important information)

### 2. Environment Detection

The logger automatically detects the environment through:
- `process.env.NODE_ENV === 'development'`
- `window.__DEV__ === true` (for browser)

## Usage in Code

```typescript
import { log, warn, error, info } from './utils/logger';

// Only displayed in development
log('Debug information');
warn('Warning message');

// Always displayed (important)
error('Critical error occurred');
info('Important information');
```

## Build Process

### Development Build
```bash
npm run build
```
- Keeps all console statements
- Generates source maps
- Suitable for development and debugging

### Production Build
```bash
npm run build:prod
```
- **Automatically removes console.log statements** via Rollup + Terser
- **Removes console.warn and console.info** in production
- **Keeps console.error** for critical errors
- **Minifies code** for optimal performance

## Rollup Configuration

The production build uses Rollup with Terser plugin to automatically:

```javascript
// rollup.config.js
terser({
  compress: {
    drop_console: true,        // Remove console.log
    drop_debugger: true,       // Remove debugger statements
    pure_funcs: [              // Remove specific console methods
      'console.log', 
      'console.info', 
      'console.debug', 
      'console.warn'
    ]
  }
})
```

**Note**: `console.error` is preserved for critical error reporting.

## Best Practices

### ✅ Do's
- Use `log()` for debug information
- Use `warn()` for warnings
- Use `error()` for important errors
- Use `info()` for important information

### ❌ Don'ts
- Use `console.log()` directly in production code
- Remove console.error() for important errors
- Log sensitive information

## Migration

To migrate existing code:

1. Import logger utility:
```typescript
import { log, warn, error, info } from './utils/logger';
```

2. Replace console statements:
```typescript
// Instead of
console.log('Debug info');

// Use
log('Debug info');
```

3. Run production build:
```bash
npm run build:prod
```

## Verification

After running `npm run build:prod`, you can check the `dist/` folder to ensure:
- No console.log, console.warn, console.info statements
- console.error is preserved for critical errors
- Code is minified and optimized
- Logger utility works correctly in production

## Development vs Production

| Environment | Console.log | Console.warn | Console.info | Console.error |
|-------------|-------------|--------------|--------------|---------------|
| Development | ✅ Kept | ✅ Kept | ✅ Kept | ✅ Kept |
| Production | ❌ Removed | ❌ Removed | ❌ Removed | ✅ Kept |
