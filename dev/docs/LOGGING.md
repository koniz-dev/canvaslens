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

## Build Scripts

### Development Build
```bash
npm run build
```
- Keeps all console statements
- Suitable for development and debugging

### Production Build
```bash
npm run build:prod
```
- Automatically removes console.log statements
- Keeps console.error and console.warn
- Uses logger utility for conditional logging

## Available Scripts

### `clean-logs.js`
Script that automatically removes console.log statements from files:
- `src/` directory
- `scripts/` directory  
- `server.js`

**Note**: This script only removes `console.log()` but keeps `console.error()` and `console.warn()`.

## Best Practices

### ✅ Do's
- Use `log()` for debug information
- Use `warn()` for warnings
- Use `error()` for important errors
- Use `info()` for important information

### ❌ Don'ts
- Use `console.log()` directly
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
- No console.log statements
- console.error and console.warn are preserved
- Logger utility works correctly in production
