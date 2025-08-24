# Navigation Module

Navigation bar management module for CanvasLens demo pages.

## Usage

### 1. Include the script

```html
<script src="assets/js/navigation.js"></script>
```

### 2. Auto-create navigation (Recommended)

```html
<!-- Navigation will be automatically inserted here -->
<script>
  // Automatically detect current page and create navigation
  Navigation.autoCreate();
</script>
```

### 3. Manual navigation creation

```html
<script>
  // Create navigation for specific page
  Navigation.create('basic');
  
  // Or use Navigation class
  const nav = new Navigation('basic');
  nav.mount();
</script>
```

## API

### Navigation.autoCreate()
Automatically detects the current page based on URL and creates navigation bar.

### Navigation.create(currentPage)
Creates navigation bar for the specified page.

**Parameters:**
- `currentPage` (string): ID of current page ('home', 'basic', 'zoom', 'annotation', 'comparison', 'editor')

### Navigation class

**Constructor:**
- `currentPage` (string): ID of current page

**Methods:**
- `render()`: Returns HTML of navigation bar
- `init()`: Initialize event listeners
- `mount()`: Insert navigation into page and initialize

## Page Structure

Navigation module will automatically insert navigation bar at the beginning of `<body>`. You just need to add a comment to mark the position:

```html
<body>
  <!-- Navigation will be inserted here -->
  
  <!-- Page content -->
  <div class="container">
    <!-- Your content -->
  </div>
</body>
```

## Features

- ✅ Responsive design
- ✅ Mobile menu with hamburger button
- ✅ Auto-highlight current page
- ✅ Smooth animations
- ✅ Compatible with all demo pages
