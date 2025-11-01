# Annotation Styles Guide

CanvasLens provides comprehensive styling options for annotations, allowing you to customize the appearance of all annotation types (rectangle, arrow, text, circle, and line) with colors, line styles, shadows, and fonts.

## Overview

Annotation styles can be configured in two ways:

1. **Default Style** (Recommended): Configure a default style for all annotations when setting up tools
2. **Per-Annotation Style**: Override the default style for individual annotations programmatically

## Style Configuration

### Basic Style Properties

All annotation styles must include these required properties:

```typescript
{
  strokeColor: string;  // Required: Border color
  strokeWidth: number;  // Required: Border width in pixels
}
```

### Complete Style Object

```typescript
interface AnnotationStyle {
  // Required properties
  strokeColor: string;        // Border color (hex, rgb, or named color)
  strokeWidth: number;        // Border width in pixels
  
  // Optional properties
  lineStyle?: 'solid' | 'dashed' | 'dotted'; // Line style
  fillColor?: string;         // Fill color with transparency
  shadowColor?: string;       // Shadow color
  shadowBlur?: number;       // Shadow blur radius in pixels
  shadowOffsetX?: number;    // Shadow horizontal offset
  shadowOffsetY?: number;    // Shadow vertical offset
  fontSize?: number;         // Font size for text annotations
  fontFamily?: string;       // Font family for text annotations
}
```

## Setting Default Styles

### HTML Attribute (Web Component)

Configure default styles via the `tools` attribute:

```html
<canvas-lens 
    src="https://example.com/image.jpg"
    width="800px" 
    height="600px"
    tools='{
        "annotation": {
            "rect": true,
            "arrow": true,
            "style": {
                "strokeColor": "#0096ff",
                "strokeWidth": 3,
                "lineStyle": "dashed",
                "fillColor": "rgba(0, 150, 255, 0.3)"
            }
        }
    }'>
</canvas-lens>
```

### JavaScript API

```javascript
const viewer = document.querySelector('canvas-lens');

viewer.updateTools({
  annotation: {
    rect: true,
    arrow: true,
    style: {
      strokeColor: '#0096ff',
      strokeWidth: 3,
      lineStyle: 'dashed',
      fillColor: 'rgba(0, 150, 255, 0.3)',
      shadowColor: 'rgba(0, 0, 0, 0.3)',
      shadowBlur: 10
    }
  }
});
```

### Programmatic Initialization

```javascript
import { CanvasLens } from '@koniz-dev/canvaslens';

const container = document.getElementById('canvas-container');

const viewer = new CanvasLens(container, {
  width: 800,
  height: 600,
  tools: {
    annotation: {
      rect: true,
      style: {
        strokeColor: '#ff0000',
        strokeWidth: 2,
        lineStyle: 'solid',
        fillColor: 'rgba(255, 0, 0, 0.2)'
      }
    }
  }
});
```

## Style Properties

### strokeColor

The border/stroke color of the annotation.

**Type:** `string`  
**Required:** Yes  
**Values:** Any valid CSS color (hex, rgb, rgba, named colors)

**Examples:**
```javascript
strokeColor: '#ff0000'           // Red (hex)
strokeColor: 'rgb(255, 0, 0)'     // Red (rgb)
strokeColor: 'rgba(255, 0, 0, 1)' // Red with alpha (rgba)
strokeColor: 'red'                // Named color
```

### strokeWidth

The width of the annotation border in pixels.

**Type:** `number`  
**Required:** Yes  
**Values:** Positive number (typically 1-10)

**Note:** Stroke width is automatically scaled based on zoom level to maintain consistent appearance.

**Examples:**
```javascript
strokeWidth: 1  // Thin border
strokeWidth: 2  // Default
strokeWidth: 5  // Thick border
```

### lineStyle

The style of the annotation border line.

**Type:** `'solid' | 'dashed' | 'dotted'`  
**Required:** No  
**Default:** `'solid'`

**Examples:**
```javascript
lineStyle: 'solid'   // Continuous line (default)
lineStyle: 'dashed'  // Dashed line pattern
lineStyle: 'dotted'  // Dotted line pattern
```

### fillColor

The fill color for filled annotations (rectangles, circles). Use rgba with transparency for semi-transparent fills.

**Type:** `string`  
**Required:** No  
**Values:** Any valid CSS color, preferably rgba for transparency

**Examples:**
```javascript
fillColor: 'rgba(255, 0, 0, 0.3)'  // Red with 30% opacity
fillColor: 'rgba(0, 150, 255, 0.2)' // Blue with 20% opacity
fillColor: 'transparent'            // No fill (equivalent to omitting property)
```

**Note:** Only applies to shapes that support filling (rectangles, circles). Lines, arrows, and text are not filled.

### Shadow Properties

Add depth and dimension to annotations with shadow effects.

#### shadowColor

The color of the shadow.

**Type:** `string`  
**Required:** No  
**Values:** Any valid CSS color, preferably rgba for transparency

```javascript
shadowColor: 'rgba(0, 0, 0, 0.5)'  // Black shadow with 50% opacity
shadowColor: 'rgba(255, 0, 0, 0.3)' // Red shadow
```

#### shadowBlur

The blur radius of the shadow in pixels.

**Type:** `number`  
**Required:** No  
**Default:** `0`

**Note:** Shadow blur is automatically scaled based on zoom level.

```javascript
shadowBlur: 0   // Sharp shadow (no blur)
shadowBlur: 5   // Subtle blur
shadowBlur: 10  // Medium blur
shadowBlur: 20  // Heavy blur
```

#### shadowOffsetX & shadowOffsetY

The horizontal and vertical offset of the shadow in pixels.

**Type:** `number`  
**Required:** No  
**Default:** `0`

**Note:** Shadow offsets are automatically scaled based on zoom level.

```javascript
shadowOffsetX: 5   // Shadow shifted 5px to the right
shadowOffsetY: 5   // Shadow shifted 5px down
shadowOffsetX: -3  // Shadow shifted 3px to the left
```

**Complete Shadow Example:**
```javascript
style: {
  strokeColor: '#000',
  strokeWidth: 2,
  fillColor: 'rgba(255, 0, 0, 0.5)',
  shadowColor: 'rgba(0, 0, 0, 0.5)',
  shadowBlur: 10,
  shadowOffsetX: 5,
  shadowOffsetY: 5
}
```

### Text-Specific Properties

These properties only apply to text annotations.

#### fontSize

The font size in pixels for text annotations.

**Type:** `number`  
**Required:** No  
**Default:** `16`

**Note:** Font size is automatically scaled based on zoom level.

```javascript
fontSize: 12  // Small text
fontSize: 16  // Default
fontSize: 24  // Large text
fontSize: 32  // Very large text
```

#### fontFamily

The font family for text annotations.

**Type:** `string`  
**Required:** No  
**Default:** `'Arial, sans-serif'`

**Examples:**
```javascript
fontFamily: 'Arial, sans-serif'
fontFamily: 'Georgia, serif'
fontFamily: 'Courier New, monospace'
fontFamily: 'Times New Roman, serif'
```

**Note:** Font family should follow CSS font-family syntax with fallbacks.

## Examples

### Example 1: Dashed Rectangle with Blue Fill

```html
<canvas-lens 
    src="image.jpg"
    width="800px" 
    height="600px"
    tools='{
        "annotation": {
            "rect": true,
            "style": {
                "strokeColor": "#0096ff",
                "strokeWidth": 3,
                "lineStyle": "dashed",
                "fillColor": "rgba(0, 150, 255, 0.3)"
            }
        }
    }'>
</canvas-lens>
```

### Example 2: Red Circle with Shadow

```javascript
viewer.updateTools({
  annotation: {
    circle: true,
    style: {
      strokeColor: '#ff0000',
      strokeWidth: 4,
      fillColor: 'rgba(255, 0, 0, 0.2)',
      shadowColor: 'rgba(0, 0, 0, 0.5)',
      shadowBlur: 15,
      shadowOffsetX: 5,
      shadowOffsetY: 5
    }
  }
});
```

### Example 3: Custom Text Styling

```javascript
viewer.updateTools({
  annotation: {
    text: true,
    style: {
      strokeColor: '#333333',
      strokeWidth: 1,
      fontSize: 20,
      fontFamily: 'Georgia, serif'
    }
  }
});
```

### Example 4: Dotted Arrow

```javascript
viewer.updateTools({
  annotation: {
    arrow: true,
    style: {
      strokeColor: '#00ff00',
      strokeWidth: 3,
      lineStyle: 'dotted'
    }
  }
});
```

### Example 5: Professional Annotation Theme

```javascript
const professionalTheme = {
  annotation: {
    rect: true,
    arrow: true,
    circle: true,
    style: {
      strokeColor: '#2c3e50',
      strokeWidth: 2,
      lineStyle: 'solid',
      fillColor: 'rgba(52, 152, 219, 0.15)',
      shadowColor: 'rgba(0, 0, 0, 0.2)',
      shadowBlur: 8,
      shadowOffsetX: 2,
      shadowOffsetY: 2
    }
  }
};

viewer.updateTools(professionalTheme);
```

## Per-Annotation Style Override

While default styles apply to all annotations, you can override styles for individual annotations programmatically:

```javascript
// Add annotation with custom style
const customAnnotation = {
  id: 'custom-1',
  type: 'rect',
  points: [
    { x: 100, y: 100 },
    { x: 300, y: 250 }
  ],
  style: {
    strokeColor: '#ff00ff',  // Different from default
    strokeWidth: 5,           // Thicker than default
    lineStyle: 'dashed',
    fillColor: 'rgba(255, 0, 255, 0.4)'
  }
};

viewer.addAnnotation(customAnnotation);
```

## Style Merging

When you provide a style configuration:

1. **Default styles** are defined in `AnnotationManager` with internal defaults
2. **User-provided styles** in `ToolConfig.annotation.style` override defaults
3. **Per-annotation styles** override both defaults and user config

**Merge Order:**
```
Internal Defaults → User Config → Per-Annotation Style
```

**Example:**
```javascript
// Default config (user)
{
  annotation: {
    style: {
      strokeColor: '#000',
      strokeWidth: 2,
      lineStyle: 'solid'
    }
  }
}

// Per-annotation (overrides default)
{
  style: {
    strokeColor: '#ff0000',  // Overrides default '#000'
    strokeWidth: 2,            // Uses default 2
    lineStyle: 'dashed'        // Overrides default 'solid'
  }
}
```

## Best Practices

### 1. Use Transparency for Fill Colors

Always use `rgba()` for fill colors to maintain readability:

```javascript
// ✅ Good
fillColor: 'rgba(255, 0, 0, 0.3)'

// ❌ Avoid (opaque fills may obscure content)
fillColor: 'rgb(255, 0, 0)'
```

### 2. Choose Contrasting Colors

Ensure stroke colors contrast well with your image:

```javascript
// ✅ Good - high contrast
strokeColor: '#ffffff'  // White on dark images
strokeColor: '#000000'  // Black on light images

// ❌ Poor - low contrast
strokeColor: '#cccccc'  // Gray may blend in
```

### 3. Scale-Aware Design

Remember that `strokeWidth`, `shadowBlur`, `shadowOffsetX/Y`, and `fontSize` are automatically scaled based on zoom level. Design your styles with this in mind.

### 4. Consistent Theme

Use a consistent style across all annotation types for a professional appearance:

```javascript
const theme = {
  strokeColor: '#2c3e50',
  strokeWidth: 2,
  lineStyle: 'solid',
  fillColor: 'rgba(52, 152, 219, 0.15)',
  shadowColor: 'rgba(0, 0, 0, 0.2)',
  shadowBlur: 8
};
```

### 5. Performance Considerations

- Avoid excessive shadow blur values (> 20px) as they can impact performance
- Use simple colors (avoid complex gradients or patterns)
- Limit the number of styled annotations for optimal performance

## Browser Compatibility

All style properties are supported in:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Troubleshooting

### Styles Not Applying

1. **Check JSON syntax**: Ensure `tools` attribute is valid JSON
2. **Verify property names**: Use camelCase (e.g., `strokeColor`, not `stroke-color`)
3. **Check type values**: `lineStyle` must be exactly `'solid'`, `'dashed'`, or `'dotted'`

### Shadows Not Showing

1. **Requires fillColor**: Shadows only apply to filled shapes (rectangles/circles with `fillColor`)
2. **Check shadowColor**: Must provide `shadowColor` for shadow to render
3. **Zoom level**: Very small zoom levels may make shadows barely visible

### Text Styles Not Working

1. **Text annotation only**: `fontSize` and `fontFamily` only apply to text annotations
2. **Font availability**: Ensure the specified font family is available on the system
3. **Font size scaling**: Font size is scaled with zoom - very small zoom may make text tiny

## Related Documentation

- [API Reference](./api.md) - Complete API documentation
- [Examples](./examples.md) - More usage examples
- [TypeScript Types](../src/types/annotation.ts) - Type definitions

