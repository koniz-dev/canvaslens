# CSS Architecture

## Overview

CanvasLens CSS has been reorganized with a modular architecture for better maintainability and scalability. All styles are organized into separate modules and imported through the `main.css` file.

## Directory Structure

```
assets/css/
├── main.css                 # Main entry point - imports all modules
├── base/                    # Base styles and variables
│   ├── variables.css        # CSS variables and theme
│   └── reset.css           # CSS reset and typography
├── layout/                  # Layout and grid system
│   ├── grid.css            # Grid system and containers
│   ├── navigation.css      # Navigation bar styles
│   ├── header.css          # Header and title styles
│   ├── footer.css          # Footer styles
│   └── panels.css          # Info panels and containers
├── components/              # Reusable components
│   ├── buttons.css         # Button styles
│   ├── forms.css           # Form elements
│   ├── modals.css          # Modal and dialog styles
│   ├── tooltips.css        # Tooltip styles
│   └── sliders.css         # Slider and range input styles
├── pages/                   # Page-specific styles
│   ├── home.css            # Home page styles
│   ├── basic.css           # Basic viewer page
│   ├── zoom.css            # Zoom/pan demo page
│   ├── annotation.css      # Annotation demo page
│   ├── comparison.css      # Comparison demo page
│   └── editor.css          # Photo editor demo page
└── utilities/               # Utility classes
    ├── spacing.css         # Margin and padding utilities
    ├── typography.css      # Text utilities
    ├── colors.css          # Color utilities
    └── responsive.css      # Responsive utilities
```

## CSS Variables

All colors, spacing, typography, and other values are defined in `variables.css`:

```css
:root {
  /* Colors */
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 3rem;
  
  /* Typography */
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-size-base: 1rem;
  --line-height-base: 1.5;
}
```

## Usage

### Basic Usage

Just import the `main.css` file in your HTML:

```html
<link rel="stylesheet" href="assets/css/main.css">
```

### Using CSS Variables

You can use the defined variables in your custom CSS:

```css
.my-component {
  color: var(--primary-color);
  padding: var(--spacing-md);
  font-family: var(--font-family);
}
```

### Adding New Styles

1. **Base styles**: Add to `base/` if they are global styles
2. **Layout**: Add to `layout/` if related to layout
3. **Components**: Add to `components/` if they are reusable components
4. **Page-specific**: Add to `pages/` if specific to one page

## Benefits of New Structure

1. **No duplication**: Completely eliminates duplicate classes
2. **Better organization**: Clear separation of concerns
3. **Easier maintenance**: Changes are localized to specific modules
4. **Scalability**: Easy to add new components or pages
5. **Performance**: Only load what you need
6. **Consistency**: Centralized variables ensure design consistency

## Best Practices

1. **Use variables**: Always use CSS variables for colors, spacing, and typography
2. **Follow naming**: Use BEM methodology for class naming
3. **Keep it modular**: Each file should have a single responsibility
4. **Document changes**: Update this README when adding new modules
5. **Test responsiveness**: Ensure all components work on different screen sizes
