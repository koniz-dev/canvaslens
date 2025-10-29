# CanvasLens Troubleshooting Guide

## Table of Contents

- [Common Issues](#common-issues)
- [Browser Compatibility](#browser-compatibility)
- [Performance Issues](#performance-issues)
- [Image Loading Problems](#image-loading-problems)
- [Annotation Issues](#annotation-issues)
- [Framework Integration Issues](#framework-integration-issues)
- [Build and Development Issues](#build-and-development-issues)
- [FAQ](#faq)
- [Getting Help](#getting-help)

## Common Issues

### 1. CanvasLens Not Rendering

**Symptoms:**
- Empty container where CanvasLens should appear
- No error messages in console
- Component appears to load but shows nothing

**Possible Causes & Solutions:**

#### Missing Import
```javascript
// ❌ Wrong - missing import
const viewer = document.querySelector('canvas-lens');

// ✅ Correct - import the component
import { CanvasLens } from '@koniz-dev/canvaslens';
```

#### Incorrect HTML Structure
```html
<!-- ❌ Wrong - missing closing tag -->
<canvas-lens src="image.jpg" width="800px" height="600px">

<!-- ✅ Correct - properly closed -->
<canvas-lens src="image.jpg" width="800px" height="600px"></canvas-lens>
```

#### CSS Issues
```css
/* ❌ Wrong - container has no dimensions */
.canvas-container {
  /* No width/height specified */
}

/* ✅ Correct - specify dimensions */
.canvas-container {
  width: 800px;
  height: 600px;
}
```

### 2. Images Not Loading

**Symptoms:**
- Blank canvas
- Console errors about image loading
- "Image load failed" messages

**Solutions:**

#### CORS Issues
```javascript
// For local development, serve images from a local server
// ❌ This will fail due to CORS
const viewer = document.querySelector('canvas-lens');
viewer.src = 'file:///path/to/image.jpg';

// ✅ Use a local server or CDN
viewer.src = 'http://localhost:3000/images/image.jpg';
```

#### Invalid Image URLs
```javascript
// ❌ Wrong - invalid URL
viewer.src = 'not-a-valid-url';

// ✅ Correct - valid URL
viewer.src = 'https://example.com/image.jpg';

// ✅ Also correct - data URI
viewer.src = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...';
```

#### Image Format Issues
```javascript
// Check if image format is supported
const supportedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

function validateImageFormat(src) {
  // For URLs, you might need to check the Content-Type header
  // For data URIs, check the format
  if (src.startsWith('data:')) {
    const format = src.split(';')[0].split(':')[1];
    return supportedFormats.includes(format);
  }
  return true; // Assume valid for URLs
}

// Use the built-in image loading with error handling
viewer.addEventListener('error', (event) => {
  console.error('CanvasLens error:', event.detail);
  if (event.detail.type === 'IMAGE_LOAD') {
    console.error('Image loading failed:', event.detail.message);
  }
});
```

### 3. Tools Not Working

**Symptoms:**
- Annotation tools don't respond to clicks
- Zoom/pan not working
- Keyboard shortcuts not functioning

**Solutions:**

#### Tool Configuration Issues
```javascript
// ❌ Wrong - invalid JSON
viewer.tools = '{"zoom": true, "pan": true}'; // Missing quotes around boolean

// ✅ Correct - valid JSON
viewer.tools = '{"zoom": true, "pan": true}';

// ✅ Also correct - using object directly
viewer.updateTools({
  zoom: true,
  pan: true,
  annotation: {
    rect: true,
    arrow: true
  }
});

// Check if tool activation was successful
const success = viewer.activateTool('rect');
if (!success) {
  console.error('Failed to activate tool. Check if tool is enabled in configuration.');
}
```

#### Event Handler Issues
```javascript
// ❌ Wrong - event not properly attached
viewer.onclick = function() { /* handler */ };

// ✅ Correct - using addEventListener
viewer.addEventListener('click', function(event) {
  // handler
});
```

### 4. Styling Issues

**Symptoms:**
- CanvasLens doesn't fit container
- Styling not applied correctly
- Layout issues

**Solutions:**

#### Container Sizing
```css
/* ❌ Wrong - no explicit dimensions */
.canvas-container {
  /* No width/height */
}

/* ✅ Correct - explicit dimensions */
.canvas-container {
  width: 800px;
  height: 600px;
  position: relative;
}

/* ✅ Also correct - responsive sizing */
.canvas-container {
  width: 100%;
  height: 500px;
  max-width: 1200px;
}
```

#### CSS Conflicts
```css
/* ❌ Wrong - conflicting styles */
canvas-lens {
  width: 800px !important;
  height: 600px !important;
  border: 1px solid red;
}

/* ✅ Correct - use CSS custom properties */
canvas-lens {
  --canvas-width: 800px;
  --canvas-height: 600px;
  border: 1px solid #ddd;
  border-radius: 8px;
}
```

### 5. Current Common Issues

#### Performance Monitoring Not Working

**Symptoms:**
- Performance metrics not showing
- Console errors about performance monitoring
- No performance data available

**Solutions:**
```javascript
// ✅ Enable performance monitoring
import { performanceMonitor } from '@koniz-dev/canvaslens';

// Enable monitoring
performanceMonitor.enable();

// Check if monitoring is working
const metrics = performanceMonitor.getMetrics();
console.log('Performance metrics:', metrics);

// Handle performance events
viewer.addEventListener('performance', (event) => {
  console.log('Performance update:', event.detail);
});
```

#### Memory Management Issues

**Symptoms:**
- Memory usage keeps growing
- Browser becomes slow over time
- Memory warnings in console

**Solutions:**
```javascript
// ✅ Use built-in memory management
import { MemoryManager } from '@koniz-dev/canvaslens';

const memoryManager = new MemoryManager();

// Enable monitoring
memoryManager.enableMonitoring();

// Set thresholds
memoryManager.setThresholds({
  warning: 50 * 1024 * 1024, // 50MB
  critical: 100 * 1024 * 1024 // 100MB
});

// Handle memory events
memoryManager.on('warning', (usage) => {
  console.warn('Memory usage high:', usage);
  // Trigger cleanup
  memoryManager.cleanup();
});

// Clean up when done
viewer.addEventListener('destroy', () => {
  memoryManager.disposeAll();
});
```

#### Tool Activation Failures

**Symptoms:**
- Tools don't activate when clicked
- Console errors about tool activation
- Tools appear disabled

**Solutions:**
```javascript
// ✅ Check tool configuration and activation
// Note: getTools() method is not available in current implementation
// Use updateTools() to configure tools instead

// Check if tool is enabled
if (toolConfig.annotation?.rect) {
  const success = viewer.activateTool('rect');
  if (!success) {
    console.error('Failed to activate rect tool');
  }
} else {
  console.error('Rect tool not enabled in configuration');
}

// Listen for tool change events
viewer.addEventListener('toolchange', (event) => {
  console.log('Tool changed to:', event.detail.tool);
});
```

#### Image Loading with Error Handling

**Symptoms:**
- Images fail to load silently
- No error messages shown
- Blank canvas with no feedback

**Solutions:**
```javascript
// ✅ Proper error handling for image loading
viewer.addEventListener('error', (event) => {
  const error = event.detail;
  console.error('CanvasLens error:', error);
  
  switch (error.type) {
    case 'IMAGE_LOAD':
      console.error('Image loading failed:', error.message);
      // Show user-friendly error message
      showErrorMessage('Failed to load image. Please check the URL and try again.');
      break;
    case 'INITIALIZATION':
      console.error('Initialization failed:', error.message);
      break;
    case 'RENDER_ERROR':
      console.error('Rendering error:', error.message);
      break;
  }
});

// Use the loadImage method with proper error handling
try {
  await viewer.loadImage('image.jpg', 'image/jpeg', 'my-image.jpg');
  console.log('Image loaded successfully');
} catch (error) {
  console.error('Image loading failed:', error);
}
```

## Browser Compatibility

### 1. Internet Explorer Issues

**Problem:** CanvasLens doesn't work in Internet Explorer

**Solution:** Internet Explorer is not supported. Use modern browsers:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### 2. Safari-Specific Issues

**Problem:** Touch events not working properly on Safari

**Solution:**
```javascript
// Add touch event support for Safari
if ('ontouchstart' in window) {
  viewer.addEventListener('touchstart', handleTouchStart);
  viewer.addEventListener('touchmove', handleTouchMove);
  viewer.addEventListener('touchend', handleTouchEnd);
}
```

### 3. Firefox Canvas Issues

**Problem:** Canvas rendering appears blurry in Firefox

**Solution:**
```css
canvas-lens {
  image-rendering: -moz-crisp-edges;
  image-rendering: pixelated;
}
```

### 4. Chrome DevTools Issues

**Problem:** CanvasLens not visible in Chrome DevTools

**Solution:**
```javascript
// Enable canvas inspection in Chrome DevTools
// 1. Open DevTools (F12)
// 2. Go to Settings (gear icon)
// 3. Enable "Show user agent shadow DOM"
// 4. Refresh the page
```

## Performance Issues

### 1. Slow Rendering

**Symptoms:**
- Laggy zoom/pan operations
- Slow annotation rendering
- High CPU usage

**Solutions:**

#### Large Image Optimization
```javascript
// ❌ Wrong - loading very large images directly
viewer.src = 'https://example.com/50mb-image.jpg';

// ✅ Correct - use appropriate image sizes
// Resize images on server or use multiple resolutions
viewer.src = 'https://example.com/optimized-image-800x600.jpg';
```

#### Canvas Optimization
```javascript
// Optimize canvas rendering
const canvas = viewer.canvas;
const ctx = canvas.getContext('2d');

// Enable hardware acceleration
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = 'high';

// Use requestAnimationFrame for smooth animations
function smoothZoom(targetZoom) {
  const currentZoom = viewer.getZoomLevel();
  const step = (targetZoom - currentZoom) / 10;
  
  function animate() {
    const newZoom = viewer.getZoomLevel() + step;
    if (Math.abs(newZoom - targetZoom) < 0.01) {
      viewer.zoomTo(targetZoom);
    } else {
      viewer.zoomTo(newZoom);
      requestAnimationFrame(animate);
    }
  }
  
  animate();
}
```

### 2. Memory Leaks

**Symptoms:**
- Browser becomes slow over time
- High memory usage
- Crashes after extended use

**Solutions:**

#### Proper Cleanup
```javascript
// ❌ Wrong - not cleaning up event listeners
const viewer = document.querySelector('canvas-lens');
viewer.addEventListener('imageload', handleImageLoad);

// ✅ Correct - proper cleanup
class ImageViewerManager {
  constructor() {
    this.viewer = document.querySelector('canvas-lens');
    this.boundHandler = this.handleImageLoad.bind(this);
    this.viewer.addEventListener('imageload', this.boundHandler);
  }
  
  destroy() {
    this.viewer.removeEventListener('imageload', this.boundHandler);
    this.viewer = null;
  }
}
```

#### Image Resource Management
```javascript
// Clear image cache periodically
function clearImageCache() {
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (img.src.startsWith('blob:')) {
      URL.revokeObjectURL(img.src);
    }
  });
}

// Call periodically or when memory usage is high
setInterval(clearImageCache, 300000); // Every 5 minutes
```

### 3. Slow Annotation Operations

**Symptoms:**
- Delayed annotation creation
- Slow annotation rendering
- UI freezing during annotation operations

**Solutions:**

#### Debounce Annotation Updates
```javascript
// Debounce annotation rendering
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const debouncedRender = debounce(() => {
  viewer.render();
}, 16); // ~60fps

viewer.addEventListener('annotationadd', debouncedRender);
```

#### Optimize Annotation Rendering
```javascript
// Only render visible annotations
function renderVisibleAnnotations() {
  const zoom = viewer.getZoomLevel();
  const pan = viewer.getPanOffset();
  const canvas = viewer.canvas;
  
  const viewport = {
    x: -pan.x / zoom,
    y: -pan.y / zoom,
    width: canvas.width / zoom,
    height: canvas.height / zoom
  };
  
  const annotations = viewer.getAnnotations();
  const visibleAnnotations = annotations.filter(annotation => 
    isAnnotationVisible(annotation, viewport)
  );
  
  // Render only visible annotations
  visibleAnnotations.forEach(annotation => {
    renderAnnotation(annotation);
  });
}
```

## Image Loading Problems

### 1. CORS Errors

**Error:** `Access to image at '...' from origin '...' has been blocked by CORS policy`

**Solutions:**

#### Server Configuration
```javascript
// Configure server to allow CORS
// For Express.js:
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
```

#### Proxy Solution
```javascript
// Use a proxy for development
const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
const imageUrl = 'https://example.com/image.jpg';
viewer.src = proxyUrl + imageUrl;
```

### 2. Image Format Issues

**Problem:** Unsupported image format

**Solutions:**

#### Format Detection
```javascript
function detectImageFormat(src) {
  if (src.startsWith('data:')) {
    return src.split(';')[0].split(':')[1];
  }
  
  const extension = src.split('.').pop().toLowerCase();
  const formatMap = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml'
  };
  
  return formatMap[extension] || 'image/jpeg';
}
```

#### Format Conversion
```javascript
// Convert image to supported format
function convertImageFormat(file, targetFormat = 'image/jpeg') {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const dataUrl = canvas.toDataURL(targetFormat, 0.9);
      resolve(dataUrl);
    };
    
    img.src = URL.createObjectURL(file);
  });
}
```

### 3. Large Image Handling

**Problem:** Very large images cause performance issues

**Solutions:**

#### Image Resizing
```javascript
function resizeImage(src, maxWidth = 1920, maxHeight = 1080) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calculate new dimensions
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.src = src;
  });
}
```

#### Progressive Loading
```javascript
// Load low-resolution version first, then high-resolution
async function progressiveLoad(lowResSrc, highResSrc) {
  // Load low-resolution first
  await viewer.loadImage(lowResSrc);
  
  // Then load high-resolution in background
  const highResImg = new Image();
  highResImg.onload = () => {
    viewer.loadImage(highResSrc);
  };
  highResImg.src = highResSrc;
}
```

## Annotation Issues

### 1. Annotations Not Saving

**Problem:** Annotations disappear after page refresh

**Solutions:**

#### Local Storage
```javascript
// Save annotations to localStorage
function saveAnnotations() {
  const annotations = viewer.getAnnotations();
  localStorage.setItem('canvaslens-annotations', JSON.stringify(annotations));
}

// Load annotations from localStorage
function loadAnnotations() {
  const saved = localStorage.getItem('canvaslens-annotations');
  if (saved) {
    const annotations = JSON.parse(saved);
    annotations.forEach(annotation => {
      viewer.addAnnotation(annotation);
    });
  }
}

// Auto-save on annotation changes
viewer.addEventListener('annotationadd', saveAnnotations);
viewer.addEventListener('annotationremove', saveAnnotations);
```

#### Server Persistence
```javascript
// Save to server
async function saveAnnotationsToServer() {
  const annotations = viewer.getAnnotations();
  try {
    await fetch('/api/annotations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageId: viewer.src,
        annotations: annotations
      })
    });
  } catch (error) {
    console.error('Failed to save annotations:', error);
  }
}
```

### 2. Annotation Selection Issues

**Problem:** Can't select or edit annotations

**Solutions:**

#### Selection Handling
```javascript
// Enable annotation selection
// Note: selectAnnotation() method is not available in current implementation
// Annotation selection is handled internally by the annotation system
viewer.addEventListener('click', (event) => {
  // Selection is handled automatically by the annotation system
  // No manual selection API is currently available
});

function getAnnotationAtPoint(x, y) {
  const annotations = viewer.getAnnotations();
  return annotations.find(annotation => {
    return x >= annotation.x && x <= annotation.x + annotation.width &&
           y >= annotation.y && y <= annotation.y + annotation.height;
  });
}
```

### 3. Annotation Rendering Issues

**Problem:** Annotations not visible or incorrectly positioned

**Solutions:**

#### Coordinate System Issues
```javascript
// Ensure proper coordinate transformation
function transformCoordinates(clientX, clientY) {
  const rect = viewer.canvas.getBoundingClientRect();
  const zoom = viewer.getZoomLevel();
  const pan = viewer.getPanOffset();
  
  return {
    x: (clientX - rect.left - pan.x) / zoom,
    y: (clientY - rect.top - pan.y) / zoom
  };
}
```

#### Annotation Clipping
```javascript
// Clip annotations to canvas bounds
function clipAnnotationToCanvas(annotation) {
  const canvas = viewer.canvas;
  
  return {
    ...annotation,
    x: Math.max(0, Math.min(annotation.x, canvas.width - annotation.width)),
    y: Math.max(0, Math.min(annotation.y, canvas.height - annotation.height)),
    width: Math.min(annotation.width, canvas.width - annotation.x),
    height: Math.min(annotation.height, canvas.height - annotation.y)
  };
}
```

## Framework Integration Issues

### 1. React Integration Problems

**Problem:** CanvasLens not updating when props change

**Solution:**
```jsx
import { useEffect, useRef } from 'react';

const CanvasLensComponent = ({ src, width, height }) => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && !viewerRef.current) {
      viewerRef.current = new CanvasLens();
      containerRef.current.appendChild(viewerRef.current);
    }
  }, []);

  useEffect(() => {
    if (viewerRef.current) {
      viewerRef.current.src = src;
      viewerRef.current.width = width;
      viewerRef.current.height = height;
    }
  }, [src, width, height]);

  return <div ref={containerRef} />;
};
```

### 2. Vue Integration Problems

**Problem:** CanvasLens not reactive to data changes

**Solution:**
```vue
<template>
  <div ref="container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { CanvasLens } from '@koniz-dev/canvaslens';

const props = defineProps(['src', 'width', 'height']);
const container = ref(null);
const viewer = ref(null);

onMounted(() => {
  if (container.value) {
    viewer.value = new CanvasLens();
    container.value.appendChild(viewer.value);
  }
});

onUnmounted(() => {
  if (viewer.value && viewer.value.parentNode) {
    viewer.value.parentNode.removeChild(viewer.value);
  }
});

// Watch for prop changes
watch(() => props.src, (newSrc) => {
  if (viewer.value) {
    viewer.value.src = newSrc;
  }
});

watch(() => [props.width, props.height], ([newWidth, newHeight]) => {
  if (viewer.value) {
    viewer.value.width = newWidth;
    viewer.value.height = newHeight;
  }
});
</script>
```

### 3. Angular Integration Problems

**Problem:** CanvasLens not initializing in Angular

**Solution:**
```typescript
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CanvasLens } from '@koniz-dev/canvaslens';

@Component({
  selector: 'app-canvas-lens',
  template: '<div #container></div>'
})
export class CanvasLensComponent implements OnInit, OnDestroy {
  @ViewChild('container', { static: true }) container!: ElementRef;
  @Input() src: string = '';
  @Input() width: string = '800px';
  @Input() height: string = '600px';

  private viewer: CanvasLens | null = null;

  ngOnInit() {
    if (this.container.nativeElement) {
      this.viewer = new CanvasLens();
      this.viewer.src = this.src;
      this.viewer.width = this.width;
      this.viewer.height = this.height;
      this.container.nativeElement.appendChild(this.viewer);
    }
  }

  ngOnDestroy() {
    if (this.viewer && this.viewer.parentNode) {
      this.viewer.parentNode.removeChild(this.viewer);
    }
  }
}
```

## Build and Development Issues

### 1. TypeScript Compilation Errors

**Problem:** TypeScript errors during build

**Solutions:**

#### Missing Type Definitions
```typescript
// Add missing type definitions
declare module '@koniz-dev/canvaslens' {
  export class CanvasLens extends HTMLElement {
    src: string;
    width: string | number;
    height: string | number;
    tools: string;
    // ... other properties
  }
}
```

#### Import Issues
```typescript
// ❌ Wrong - incorrect import
import CanvasLens from '@koniz-dev/canvaslens';

// ✅ Correct - named import
import { CanvasLens } from '@koniz-dev/canvaslens';
```

### 2. Build Configuration Issues

**Problem:** Build fails or produces incorrect output

**Solutions:**

#### Rollup Configuration
```javascript
// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'es',
    sourcemap: true
  },
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json'
    })
  ],
  external: [] // Add external dependencies if needed
};
```

### 3. Development Server Issues

**Problem:** Development server not serving CanvasLens correctly

**Solutions:**

#### Webpack Configuration
```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
};
```

## FAQ

### Q: Why is my image not loading?

**A:** Check the following:
1. Image URL is valid and accessible
2. CORS policy allows loading the image
3. Image format is supported (JPEG, PNG, GIF, WebP, SVG)
4. Network connection is working

### Q: Can I use CanvasLens with server-side rendering (SSR)?

**A:** CanvasLens is a client-side library that requires DOM and Canvas API. For SSR:
1. Use dynamic imports to load CanvasLens only on the client
2. Implement proper hydration
3. Handle the case where CanvasLens is not available during SSR

### Q: How do I handle multiple CanvasLens instances on the same page?

**A:** Each instance is independent:
```javascript
const viewer1 = document.querySelector('#viewer1');
const viewer2 = document.querySelector('#viewer2');

// Each can have different configurations
viewer1.tools = '{"zoom": true, "pan": true}';
viewer2.tools = '{"annotation": {"rect": true}}';
```

### Q: Can I customize the appearance of CanvasLens?

**A:** Yes, you can customize:
1. Container styling with CSS
2. Annotation styles through the API
3. Tool configurations
4. Event handling for custom interactions

### Q: Is CanvasLens accessible?

**A:** CanvasLens provides:
1. Keyboard navigation support
2. ARIA attributes for screen readers
3. Focus management
4. High contrast support

### Q: How do I handle touch events on mobile?

**A:** CanvasLens includes basic touch support, but for advanced mobile features:
1. Use touch event listeners
2. Implement gesture recognition
3. Handle viewport scaling
4. Optimize for mobile performance

### Q: Can I export annotations?

**A:** Yes, you can export annotations:
```javascript
const annotations = viewer.getAnnotations();
const data = JSON.stringify(annotations, null, 2);
// Save to file or send to server
```

### Q: How do I handle very large images?

**A:** For large images:
1. Use image preprocessing to resize
2. Implement progressive loading
3. Use image tiling for very large images
4. Consider using WebGL for better performance

### Q: How do I use the built-in performance monitoring?

**A:** CanvasLens includes built-in performance monitoring:
```javascript
import { performanceMonitor } from '@koniz-dev/canvaslens';

// Enable monitoring
performanceMonitor.enable();

// Get current metrics
const metrics = performanceMonitor.getMetrics();
console.log('FPS:', metrics.fps);
console.log('Memory usage:', metrics.memoryUsage);

// Start profiling
performanceMonitor.startProfiling('my-operation');
// ... do work ...
performanceMonitor.stopProfiling('my-operation');
```

### Q: How do I handle memory leaks?

**A:** Use the built-in memory management:
```javascript
import { MemoryManager } from '@koniz-dev/canvaslens';

const memoryManager = new MemoryManager();
memoryManager.enableMonitoring();

// Set up cleanup
viewer.addEventListener('destroy', () => {
  memoryManager.disposeAll();
});
```

### Q: How do I debug tool activation issues?

**A:** Check tool configuration and activation:
```javascript
// Check current tool configuration
// Note: getTools() method is not available in current implementation
// Tool configuration is set via updateTools() method

// Check if tool activation was successful
const success = viewer.activateTool('rect');
if (!success) {
  console.error('Tool activation failed');
}

// Listen for tool changes
viewer.addEventListener('toolchange', (event) => {
  console.log('Active tool:', event.detail.tool);
});
```

## Getting Help

### 1. Documentation
- Check the [API Reference](API.md)
- Review [Examples](EXAMPLES.md)
- Read the [Architecture Guide](ARCHITECTURE.md)

### 2. Community Support
- **GitHub Issues**: Report bugs and request features
- **GitHub Discussions**: Ask questions and share ideas
- **Stack Overflow**: Tag questions with `canvaslens`

### 3. Debugging Tips
1. **Enable Console Logging**: Check browser console for errors
2. **Use Browser DevTools**: Inspect canvas elements and events
3. **Test in Different Browsers**: Verify cross-browser compatibility
4. **Check Network Tab**: Verify image loading and CORS issues
5. **Profile Performance**: Use browser profiling tools for performance issues

### 4. Reporting Issues
When reporting issues, include:
1. **Browser and version**
2. **CanvasLens version**
3. **Steps to reproduce**
4. **Expected vs actual behavior**
5. **Console errors**
6. **Code example** (if applicable)

### 5. Contributing
- Fork the repository
- Create a feature branch
- Make your changes
- Add tests
- Submit a pull request

This troubleshooting guide should help you resolve most common issues with CanvasLens. If you encounter problems not covered here, please open an issue on GitHub with detailed information about your specific case.
